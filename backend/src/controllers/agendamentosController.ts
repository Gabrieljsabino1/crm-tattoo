import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

const includeAgendamento = {
  cliente: true,
  tatuador: {
    select: { id: true, nome: true, especialidade: true },
  },
  imagens: {
    orderBy: { createdAt: 'asc' as const },
  },
};

export const listAgendamentos = async (req: AuthRequest, res: Response) => {
  try {
    const { status, dataInicio, dataFim, busca, estilo, localCorpo, clienteId, apenasConcluidos } = req.query;

    const where: Record<string, unknown> = {};

    if (apenasConcluidos === 'true') {
      where.status = 'CONCLUIDO';
    } else if (status && status !== 'TODOS') {
      where.status = String(status);
    }

    if (clienteId) {
      where.clienteId = String(clienteId);
    }

    if (dataInicio || dataFim) {
      const range: Record<string, Date> = {};
      if (dataInicio) range.gte = new Date(String(dataInicio));
      if (dataFim) range.lte = new Date(String(dataFim));
      where.dataHora = range;
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: includeAgendamento,
      orderBy: apenasConcluidos === 'true' ? { dataHora: 'desc' } : { dataHora: 'asc' },
    });

    let result = agendamentos;

    if (estilo && estilo !== 'TODOS') {
      const est = String(estilo).toLowerCase();
      result = result.filter((a) => a.estilo.toLowerCase() === est);
    }

    if (localCorpo && localCorpo !== 'TODOS') {
      const loc = String(localCorpo).toLowerCase();
      result = result.filter((a) => a.localCorpo.toLowerCase().includes(loc));
    }

    if (busca) {
      const term = String(busca).trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.titulo.toLowerCase().includes(term) ||
          (a.descricao || '').toLowerCase().includes(term) ||
          a.localCorpo.toLowerCase().includes(term) ||
          a.estilo.toLowerCase().includes(term) ||
          a.cliente.nome.toLowerCase().includes(term) ||
          a.cliente.telefone.toLowerCase().includes(term) ||
          (a.cliente.instagram || '').toLowerCase().includes(term)
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao carregar agenda.' });
  }
};

export const getAgendamentoById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: includeAgendamento,
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do agendamento.' });
  }
};

export const createAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clienteId,
      tatuadorId,
      titulo,
      descricao,
      dataHora,
      duracaoMinutos,
      localCorpo,
      estilo,
      tamanhoCm,
      valorTotal,
      valorSinal,
      sinalPago,
      formaPagamento,
      status,
      observacoesSessao,
    } = req.body;

    if (!clienteId || !titulo || !dataHora || !localCorpo) {
      return res.status(400).json({
        error: 'Cliente, título da tattoo, data/horário e local no corpo são obrigatórios.',
      });
    }

    const last = await prisma.agendamento.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    const nextCodigo = (last?.codigo || 100) + 1;

    const parsedDate = new Date(dataHora);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Data e horário inválidos.' });
    }

    const finalStatus = status || 'CONFIRMADO';

    const agendamento = await prisma.agendamento.create({
      data: {
        codigo: nextCodigo,
        clienteId,
        tatuadorId: tatuadorId || req.user?.id || null,
        titulo: String(titulo).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        dataHora: parsedDate,
        duracaoMinutos: Number(duracaoMinutos) || 120,
        localCorpo: String(localCorpo).trim(),
        estilo: estilo ? String(estilo).trim() : 'Blackwork',
        tamanhoCm: tamanhoCm ? String(tamanhoCm).trim() : null,
        valorTotal: Number(valorTotal) || 0,
        valorSinal: Number(valorSinal) || 0,
        sinalPago: Boolean(sinalPago),
        formaPagamento: formaPagamento || null,
        status: finalStatus,
        observacoesSessao: observacoesSessao ? String(observacoesSessao).trim() : null,
        concluidoEm: finalStatus === 'CONCLUIDO' ? new Date() : null,
      },
      include: includeAgendamento,
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao salvar agendamento.' });
  }
};

export const updateAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.agendamento.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const {
      clienteId,
      tatuadorId,
      titulo,
      descricao,
      dataHora,
      duracaoMinutos,
      localCorpo,
      estilo,
      tamanhoCm,
      valorTotal,
      valorSinal,
      sinalPago,
      formaPagamento,
      status,
      observacoesSessao,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (clienteId !== undefined) data.clienteId = clienteId;
    if (tatuadorId !== undefined) data.tatuadorId = tatuadorId || null;
    if (titulo !== undefined) data.titulo = String(titulo).trim();
    if (descricao !== undefined) data.descricao = descricao ? String(descricao).trim() : null;
    if (dataHora !== undefined) {
      const parsed = new Date(dataHora);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Data/horário inválido.' });
      }
      data.dataHora = parsed;
    }
    if (duracaoMinutos !== undefined) data.duracaoMinutos = Number(duracaoMinutos) || 120;
    if (localCorpo !== undefined) data.localCorpo = String(localCorpo).trim();
    if (estilo !== undefined) data.estilo = String(estilo).trim();
    if (tamanhoCm !== undefined) data.tamanhoCm = tamanhoCm ? String(tamanhoCm).trim() : null;
    if (valorTotal !== undefined) data.valorTotal = Number(valorTotal) || 0;
    if (valorSinal !== undefined) data.valorSinal = Number(valorSinal) || 0;
    if (sinalPago !== undefined) data.sinalPago = Boolean(sinalPago);
    if (formaPagamento !== undefined) data.formaPagamento = formaPagamento || null;
    if (observacoesSessao !== undefined) {
      data.observacoesSessao = observacoesSessao ? String(observacoesSessao).trim() : null;
    }
    if (status !== undefined) {
      data.status = status;
      if (status === 'CONCLUIDO' && !existing.concluidoEm) {
        data.concluidoEm = new Date();
      } else if (status !== 'CONCLUIDO') {
        data.concluidoEm = null;
      }
    }

    const updated = await prisma.agendamento.update({
      where: { id },
      data,
      include: includeAgendamento,
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
};

export const deleteAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.agendamento.findUnique({
      where: { id },
      include: { imagens: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    // Remove uploaded image files on disk if they are local uploads
    for (const img of existing.imagens) {
      if (img.url.startsWith('/uploads/') && !img.url.includes('sample-')) {
        const filePath = path.join(__dirname, '../../', img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.agendamento.delete({ where: { id } });
    res.json({ message: 'Agendamento removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro ao remover agendamento.' });
  }
};

export const uploadImagensAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tipo = String(req.body.tipo || 'REFERENCIA').toUpperCase();
    const legenda = req.body.legenda ? String(req.body.legenda).trim() : null;

    const existing = await prisma.agendamento.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    if (!files.length) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const validTipo = ['REFERENCIA', 'ESBOCO', 'RESULTADO'].includes(tipo) ? tipo : 'REFERENCIA';

    const created = await Promise.all(
      files.map((file) =>
        prisma.imagemAgendamento.create({
          data: {
            agendamentoId: id,
            tipo: validTipo,
            url: `/uploads/${file.filename}`,
            legenda,
          },
        })
      )
    );

    const updated = await prisma.agendamento.findUnique({
      where: { id },
      include: includeAgendamento,
    });

    res.status(201).json({ imagensAdicionadas: created, agendamento: updated });
  } catch (error) {
    console.error('Erro ao enviar imagens:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens do agendamento.' });
  }
};

export const deleteImagemAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id, imagemId } = req.params;

    const imagem = await prisma.imagemAgendamento.findFirst({
      where: { id: imagemId, agendamentoId: id },
    });

    if (!imagem) {
      return res.status(404).json({ error: 'Imagem não encontrada.' });
    }

    if (imagem.url.startsWith('/uploads/') && !imagem.url.includes('sample-')) {
      const filePath = path.join(__dirname, '../../', imagem.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.imagemAgendamento.delete({ where: { id: imagemId } });

    const updated = await prisma.agendamento.findUnique({
      where: { id },
      include: includeAgendamento,
    });

    res.json({ message: 'Imagem removida.', agendamento: updated });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({ error: 'Erro ao remover imagem.' });
  }
};

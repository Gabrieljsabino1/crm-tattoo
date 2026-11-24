import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export const listOrcamentos = async (_req: AuthRequest, res: Response) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { cliente: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao carregar orçamentos.' });
  }
};

export const createOrcamento = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, clienteId, descricao, localCorpo, estilo, tamanhoCm, valorEstimado, status } = req.body;

    if (!titulo || !clienteId) {
      return res.status(400).json({ error: 'Título e cliente são obrigatórios.' });
    }

    const file = req.file;
    const imagemReferenciaUrl = file ? `/uploads/${file.filename}` : null;

    const orcamento = await prisma.orcamento.create({
      data: {
        titulo: String(titulo).trim(),
        clienteId,
        descricao: descricao ? String(descricao).trim() : null,
        localCorpo: localCorpo ? String(localCorpo).trim() : null,
        estilo: estilo ? String(estilo).trim() : null,
        tamanhoCm: tamanhoCm ? String(tamanhoCm).trim() : null,
        valorEstimado: Number(valorEstimado) || 0,
        status: status || 'NOVO_PEDIDO',
        imagemReferenciaUrl,
      },
      include: { cliente: true },
    });

    res.status(201).json(orcamento);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar pedido de orçamento.' });
  }
};

export const updateOrcamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, clienteId, descricao, localCorpo, estilo, tamanhoCm, valorEstimado, status } = req.body;

    const data: Record<string, unknown> = {};
    if (titulo !== undefined) data.titulo = String(titulo).trim();
    if (clienteId !== undefined) data.clienteId = clienteId;
    if (descricao !== undefined) data.descricao = descricao ? String(descricao).trim() : null;
    if (localCorpo !== undefined) data.localCorpo = localCorpo ? String(localCorpo).trim() : null;
    if (estilo !== undefined) data.estilo = estilo ? String(estilo).trim() : null;
    if (tamanhoCm !== undefined) data.tamanhoCm = tamanhoCm ? String(tamanhoCm).trim() : null;
    if (valorEstimado !== undefined) data.valorEstimado = Number(valorEstimado) || 0;
    if (status !== undefined) data.status = status;

    const updated = await prisma.orcamento.update({
      where: { id },
      data,
      include: { cliente: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento.' });
  }
};

export const deleteOrcamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.orcamento.delete({ where: { id } });
    res.json({ message: 'Orçamento removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({ error: 'Erro ao excluir orçamento.' });
  }
};

export const converterOrcamentoEmAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dataHora, duracaoMinutos, valorSinal, sinalPago } = req.body;

    const orcamento = await prisma.orcamento.findUnique({ where: { id } });
    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    const parsedDate = dataHora ? new Date(dataHora) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const last = await prisma.agendamento.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    const nextCodigo = (last?.codigo || 100) + 1;

    const agendamento = await prisma.agendamento.create({
      data: {
        codigo: nextCodigo,
        clienteId: orcamento.clienteId,
        tatuadorId: req.user?.id || null,
        titulo: orcamento.titulo,
        descricao: orcamento.descricao,
        dataHora: parsedDate,
        duracaoMinutos: Number(duracaoMinutos) || 120,
        localCorpo: orcamento.localCorpo || 'Antebraço',
        estilo: orcamento.estilo || 'Blackwork',
        tamanhoCm: orcamento.tamanhoCm,
        valorTotal: orcamento.valorEstimado,
        valorSinal: Number(valorSinal) || 0,
        sinalPago: Boolean(sinalPago),
        status: sinalPago ? 'CONFIRMADO' : 'PENDENTE',
        imagens: orcamento.imagemReferenciaUrl
          ? {
              create: {
                tipo: 'REFERENCIA',
                url: orcamento.imagemReferenciaUrl,
                legenda: 'Referência do orçamento',
              },
            }
          : undefined,
      },
      include: {
        cliente: true,
        imagens: true,
      },
    });

    await prisma.orcamento.update({
      where: { id },
      data: { status: 'AGENDADO' },
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao converter orçamento:', error);
    res.status(500).json({ error: 'Erro ao converter orçamento em agendamento.' });
  }
};

import { NextResponse } from 'next/server';
import prisma from '../../../lib/server/prisma';
import { requireAuth } from '../../../lib/server/auth';
import { generateReservaCode, generateReservaToken } from '../../../lib/server/reserva';

export const dynamic = 'force-dynamic';

const includeAgendamento = {
  cliente: true,
  tatuador: { select: { id: true, nome: true, especialidade: true } },
  imagens: { orderBy: { createdAt: 'asc' } },
};

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const busca = searchParams.get('busca');
    const estilo = searchParams.get('estilo');
    const localCorpo = searchParams.get('localCorpo');
    const clienteId = searchParams.get('clienteId');
    const apenasConcluidos = searchParams.get('apenasConcluidos');

    const where = {};
    if (apenasConcluidos === 'true') {
      where.status = 'CONCLUIDO';
    } else if (status && status !== 'TODOS') {
      where.status = status;
    }

    if (clienteId) where.clienteId = clienteId;

    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) where.dataHora.gte = new Date(dataInicio);
      if (dataFim) where.dataHora.lte = new Date(dataFim);
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: includeAgendamento,
      orderBy: apenasConcluidos === 'true' ? { dataHora: 'desc' } : { dataHora: 'asc' },
    });

    let result = agendamentos;

    if (estilo && estilo !== 'TODOS') {
      const est = estilo.toLowerCase();
      result = result.filter((a) => a.estilo.toLowerCase() === est);
    }

    if (localCorpo && localCorpo !== 'TODOS') {
      const loc = localCorpo.toLowerCase();
      result = result.filter((a) => a.localCorpo.toLowerCase().includes(loc));
    }

    if (busca) {
      const term = busca.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.titulo.toLowerCase().includes(term) ||
          (a.descricao || '').toLowerCase().includes(term) ||
          a.localCorpo.toLowerCase().includes(term) ||
          a.estilo.toLowerCase().includes(term) ||
          (a.codigoReserva || '').toLowerCase().includes(term) ||
          a.cliente.nome.toLowerCase().includes(term) ||
          a.cliente.telefone.toLowerCase().includes(term) ||
          (a.cliente.instagram || '').toLowerCase().includes(term)
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    return NextResponse.json({ error: 'Erro ao carregar agenda.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, error } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
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
    } = body;

    if (!clienteId || !titulo || !dataHora || !localCorpo) {
      return NextResponse.json(
        { error: 'Cliente, título da tattoo, data/horário e local no corpo são obrigatórios.' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(dataHora);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Data e horário inválidos.' }, { status: 400 });
    }

    const last = await prisma.agendamento.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    const nextCodigo = (last?.codigo || 100) + 1;
    const finalStatus = status || 'CONFIRMADO';

    const agendamento = await prisma.agendamento.create({
      data: {
        codigo: nextCodigo,
        codigoReserva: generateReservaCode(),
        tokenReserva: generateReservaToken(),
        origem: 'MANUAL',
        clienteId,
        tatuadorId: tatuadorId || user?.id || null,
        titulo: String(titulo).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        dataHora: parsedDate,
        duracaoMinutos: Number(duracaoMinutos) || 120,
        localCorpo: String(localCorpo).trim(),
        estilo: estilo ? String(estilo).trim() : 'Lettering',
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

    return NextResponse.json(agendamento, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao salvar agendamento.' }, { status: 500 });
  }
}

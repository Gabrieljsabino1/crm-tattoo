import { NextResponse } from 'next/server';
import prisma from '../../../../lib/server/prisma';
import { requireAuth } from '../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

const includeAgendamento = {
  cliente: true,
  tatuador: { select: { id: true, nome: true, especialidade: true } },
  imagens: { orderBy: { createdAt: 'asc' } },
};

export async function GET(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: params.id },
      include: includeAgendamento,
    });
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(agendamento);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao carregar agendamento.' }, { status: 500 });
  }
}

async function handleUpdate(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const existing = await prisma.agendamento.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

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

    const data = {};
    if (clienteId !== undefined) data.clienteId = clienteId;
    if (tatuadorId !== undefined) data.tatuadorId = tatuadorId || null;
    if (titulo !== undefined) data.titulo = String(titulo).trim();
    if (descricao !== undefined) data.descricao = descricao ? String(descricao).trim() : null;
    if (dataHora !== undefined) {
      const parsed = new Date(dataHora);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Data/horário inválido.' }, { status: 400 });
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
      where: { id: params.id },
      data,
      include: includeAgendamento,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento.' }, { status: 500 });
  }
}

export async function PUT(request, ctx) {
  return handleUpdate(request, ctx);
}

export async function PATCH(request, ctx) {
  return handleUpdate(request, ctx);
}

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    await prisma.agendamento.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Agendamento removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir agendamento:', err);
    return NextResponse.json({ error: 'Erro ao remover agendamento.' }, { status: 500 });
  }
}

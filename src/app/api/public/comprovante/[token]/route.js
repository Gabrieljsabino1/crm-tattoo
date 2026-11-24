import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/server/prisma';
import { serializeComprovante } from '../../../../../lib/server/reserva';

export const dynamic = 'force-dynamic';

const includeComprovante = {
  cliente: true,
  tatuador: { select: { id: true, nome: true, especialidade: true } },
  imagens: { orderBy: { createdAt: 'asc' } },
};

async function findByTokenOrCode(token) {
  const clean = String(token || '').trim();
  if (!clean) return null;

  return prisma.agendamento.findFirst({
    where: {
      OR: [{ tokenReserva: clean }, { codigoReserva: clean.toUpperCase() }],
    },
    include: includeComprovante,
  });
}

export async function GET(_request, { params }) {
  try {
    const agendamento = await findByTokenOrCode(params.token);
    if (!agendamento) {
      return NextResponse.json(
        { error: 'Comprovante de reserva não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeComprovante(agendamento));
  } catch (err) {
    console.error('Erro ao buscar comprovante:', err);
    return NextResponse.json({ error: 'Erro ao carregar comprovante.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json().catch(() => ({}));
    const agendamento = await findByTokenOrCode(params.token);

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Comprovante de reserva não encontrado.' },
        { status: 404 }
      );
    }

    if (agendamento.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Este agendamento foi cancelado e não pode ser confirmado.' },
        { status: 400 }
      );
    }

    if (body?.acao === 'CONFIRMAR') {
      const updated = await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: {
          confirmadoPeloCliente: true,
          confirmadoPeloClienteEm: agendamento.confirmadoPeloClienteEm || new Date(),
          status: agendamento.status === 'PENDENTE' ? 'CONFIRMADO' : agendamento.status,
        },
        include: includeComprovante,
      });

      return NextResponse.json(serializeComprovante(updated));
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (err) {
    console.error('Erro ao confirmar comprovante:', err);
    return NextResponse.json({ error: 'Erro ao confirmar reserva.' }, { status: 500 });
  }
}

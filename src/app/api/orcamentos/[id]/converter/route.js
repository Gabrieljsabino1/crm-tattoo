import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/server/prisma';
import { requireAuth } from '../../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const { user, error } = requireAuth(request);
  if (error) return error;

  try {
    const { dataHora, duracaoMinutos, valorSinal, sinalPago } = await request.json();

    const orcamento = await prisma.orcamento.findUnique({ where: { id: params.id } });
    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
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
        tatuadorId: user?.id || null,
        titulo: orcamento.titulo,
        descricao: orcamento.descricao,
        dataHora: parsedDate,
        duracaoMinutos: Number(duracaoMinutos) || 120,
        localCorpo: orcamento.localCorpo || 'Antebraço (parte externa)',
        estilo: orcamento.estilo || 'Lettering',
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
      include: { cliente: true, imagens: true },
    });

    await prisma.orcamento.update({
      where: { id: params.id },
      data: { status: 'AGENDADO' },
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (err) {
    console.error('Erro ao converter orçamento:', err);
    return NextResponse.json({ error: 'Erro ao converter orçamento em agendamento.' }, { status: 500 });
  }
}

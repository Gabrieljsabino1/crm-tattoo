import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/server/prisma';
import { requireAuth } from '../../../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const imagem = await prisma.imagemAgendamento.findFirst({
      where: { id: params.imagemId, agendamentoId: params.id },
    });

    if (!imagem) {
      return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 });
    }

    await prisma.imagemAgendamento.delete({ where: { id: params.imagemId } });

    const updated = await prisma.agendamento.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        tatuador: { select: { id: true, nome: true, especialidade: true } },
        imagens: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ message: 'Imagem removida.', agendamento: updated });
  } catch (err) {
    console.error('Erro ao remover imagem:', err);
    return NextResponse.json({ error: 'Erro ao remover imagem.' }, { status: 500 });
  }
}

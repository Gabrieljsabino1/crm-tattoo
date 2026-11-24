import { NextResponse } from 'next/server';
import prisma from '../../../../lib/server/prisma';
import { requireAuth } from '../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          include: {
            imagens: true,
            tatuador: { select: { id: true, nome: true, especialidade: true } },
          },
        },
        orcamentos: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(cliente);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do cliente.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const { nome, telefone, email, instagram, cidade, dataNascimento, observacoes } =
      await request.json();

    const updated = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nome: nome ? String(nome).trim() : undefined,
        telefone: telefone ? String(telefone).trim() : undefined,
        email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
        instagram: instagram !== undefined ? (instagram ? String(instagram).trim() : null) : undefined,
        cidade: cidade !== undefined ? (cidade ? String(cidade).trim() : null) : undefined,
        dataNascimento:
          dataNascimento !== undefined
            ? dataNascimento
              ? String(dataNascimento).trim()
              : null
            : undefined,
        observacoes:
          observacoes !== undefined ? (observacoes ? String(observacoes).trim() : null) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    return NextResponse.json({ error: 'Erro ao atualizar dados do cliente.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    await prisma.cliente.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Cliente removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir cliente:', err);
    return NextResponse.json({ error: 'Erro ao remover cliente.' }, { status: 500 });
  }
}

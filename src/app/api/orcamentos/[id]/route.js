import { NextResponse } from 'next/server';
import prisma from '../../../../lib/server/prisma';
import { requireAuth } from '../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

async function handleUpdate(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { titulo, clienteId, descricao, localCorpo, estilo, tamanhoCm, valorEstimado, status } = body;

    const data = {};
    if (titulo !== undefined) data.titulo = String(titulo).trim();
    if (clienteId !== undefined) data.clienteId = clienteId;
    if (descricao !== undefined) data.descricao = descricao ? String(descricao).trim() : null;
    if (localCorpo !== undefined) data.localCorpo = localCorpo ? String(localCorpo).trim() : null;
    if (estilo !== undefined) data.estilo = estilo ? String(estilo).trim() : null;
    if (tamanhoCm !== undefined) data.tamanhoCm = tamanhoCm ? String(tamanhoCm).trim() : null;
    if (valorEstimado !== undefined) data.valorEstimado = Number(valorEstimado) || 0;
    if (status !== undefined) data.status = status;

    const updated = await prisma.orcamento.update({
      where: { id: params.id },
      data,
      include: { cliente: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar orçamento:', err);
    return NextResponse.json({ error: 'Erro ao atualizar orçamento.' }, { status: 500 });
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
    await prisma.orcamento.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Orçamento removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir orçamento:', err);
    return NextResponse.json({ error: 'Erro ao excluir orçamento.' }, { status: 500 });
  }
}

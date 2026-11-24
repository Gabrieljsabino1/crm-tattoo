import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/server/prisma';
import { requireAdmin } from '../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;

  try {
    const { id } = params;
    const { nome, email, senha, role, especialidade } = await request.json();

    const data = {};
    if (nome) data.nome = String(nome).trim();
    if (email) data.email = String(email).trim().toLowerCase();
    if (role) data.role = role;
    if (especialidade !== undefined) data.especialidade = especialidade || null;
    if (senha && String(senha).trim().length >= 4) {
      data.senha = await bcrypt.hash(String(senha), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return NextResponse.json({ error: 'Erro ao atualizar integrante.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = requireAdmin(request);
  if (error) return error;

  try {
    const { id } = params;
    if (user.id === id) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Integrante removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    return NextResponse.json({ error: 'Erro ao remover integrante.' }, { status: 500 });
  }
}

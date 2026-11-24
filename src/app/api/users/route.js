import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/server/prisma';
import { requireAuth, requireAdmin } from '../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
        _count: { select: { agendamentos: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error('Erro ao listar equipe:', err);
    return NextResponse.json({ error: 'Erro ao listar equipe.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = requireAdmin(request);
  if (error) return error;

  try {
    const { nome, email, senha, role, especialidade } = await request.json();
    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const created = await prisma.user.create({
      data: {
        nome: String(nome).trim(),
        email: normalizedEmail,
        senha: hashedPassword,
        role: role || 'TATUADOR',
        especialidade: especialidade ? String(especialidade).trim() : null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return NextResponse.json({ error: 'Erro ao criar integrante.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminExists) {
      return NextResponse.json({ error: 'Um administrador já existe no sistema.' }, { status: 400 });
    }

    const { nome, email, senha, especialidade } = await request.json();
    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newAdmin = await prisma.user.create({
      data: {
        nome,
        email: String(email).trim().toLowerCase(),
        senha: hashedPassword,
        role: 'ADMIN',
        especialidade: especialidade || 'Lettering & Preto e Cinza',
      },
    });

    return NextResponse.json(
      { message: 'Admin criado com sucesso!', adminId: newAdmin.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return NextResponse.json({ error: 'Erro ao criar administrador.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/server/prisma';
import { generateToken } from '../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        especialidade: user.especialidade,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

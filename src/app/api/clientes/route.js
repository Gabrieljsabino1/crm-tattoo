import { NextResponse } from 'next/server';
import prisma from '../../../lib/server/prisma';
import { requireAuth } from '../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const busca = (searchParams.get('busca') || '').trim();

    const clientes = await prisma.cliente.findMany({
      include: {
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          include: { imagens: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = busca
      ? clientes.filter((c) => {
          const term = busca.toLowerCase();
          return (
            c.nome.toLowerCase().includes(term) ||
            c.telefone.toLowerCase().includes(term) ||
            (c.instagram || '').toLowerCase().includes(term) ||
            (c.cidade || '').toLowerCase().includes(term)
          );
        })
      : clientes;

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    return NextResponse.json({ error: 'Erro ao carregar lista de clientes.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const { nome, telefone, email, instagram, cidade, dataNascimento, observacoes } =
      await request.json();

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone/WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: String(nome).trim(),
        telefone: String(telefone).trim(),
        email: email ? String(email).trim() : null,
        instagram: instagram ? String(instagram).trim() : null,
        cidade: cidade ? String(cidade).trim() : 'Curitiba',
        dataNascimento: dataNascimento ? String(dataNascimento).trim() : null,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    return NextResponse.json({ error: 'Erro ao cadastrar cliente.' }, { status: 500 });
  }
}

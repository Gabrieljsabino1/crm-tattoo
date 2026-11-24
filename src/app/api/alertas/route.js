import { NextResponse } from 'next/server';
import prisma from '../../../lib/server/prisma';
import { requireAuth } from '../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const in48Hours = new Date(startOfToday.getTime() + 48 * 60 * 60 * 1000);

    const proximos = await prisma.agendamento.findMany({
      where: {
        status: { in: ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'] },
        dataHora: { gte: startOfToday, lte: in48Hours },
      },
      include: { cliente: true, imagens: true },
      orderBy: { dataHora: 'asc' },
    });

    const sessoesProximas = proximos.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      dataHora: a.dataHora,
      localCorpo: a.localCorpo,
      clienteNome: a.cliente.nome,
      status: a.status,
      temEsboco: a.imagens.some((img) => img.tipo === 'ESBOCO'),
      sinalPago: a.sinalPago,
    }));

    const semEsboco = sessoesProximas.filter((s) => !s.temEsboco);
    const sinaisPendentes = proximos
      .filter((a) => a.valorSinal > 0 && !a.sinalPago)
      .map((a) => ({
        id: a.id,
        titulo: a.titulo,
        clienteNome: a.cliente.nome,
        valorSinal: a.valorSinal,
        dataHora: a.dataHora,
      }));

    return NextResponse.json({
      sessoesProximas,
      semEsboco,
      sinaisPendentes,
      totalAlertas: sessoesProximas.length + sinaisPendentes.length,
    });
  } catch (err) {
    console.error('Erro ao buscar alertas:', err);
    return NextResponse.json({ error: 'Erro ao carregar alertas.' }, { status: 500 });
  }
}

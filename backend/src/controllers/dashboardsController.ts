import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardResumo = async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      todosAgendamentos,
      totalClientes,
      orcamentosAbertos,
    ] = await Promise.all([
      prisma.agendamento.findMany({
        include: {
          cliente: true,
          imagens: true,
          tatuador: { select: { id: true, nome: true } },
        },
        orderBy: { dataHora: 'asc' },
      }),
      prisma.cliente.count(),
      prisma.orcamento.count({
        where: { status: { not: 'AGENDADO' } },
      }),
    ]);

    const agendamentosHoje = todosAgendamentos.filter(
      (a) => a.status !== 'CANCELADO' && a.dataHora >= startOfToday && a.dataHora <= endOfToday
    );

    const agendamentosSemana = todosAgendamentos.filter(
      (a) => a.status !== 'CANCELADO' && a.dataHora >= startOfWeek && a.dataHora <= endOfWeek
    );

    const concluidosMes = todosAgendamentos.filter(
      (a) => a.status === 'CONCLUIDO' && a.dataHora >= startOfMonth && a.dataHora <= endOfMonth
    );

    const concluidosTotal = todosAgendamentos.filter((a) => a.status === 'CONCLUIDO');

    const faturamentoMes = concluidosMes.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const sinaisRecebidosMes = todosAgendamentos
      .filter(
        (a) =>
          a.status !== 'CONCLUIDO' &&
          a.status !== 'CANCELADO' &&
          a.sinalPago &&
          a.dataHora >= startOfMonth &&
          a.dataHora <= endOfMonth
      )
      .reduce((acc, a) => acc + (a.valorSinal || 0), 0);

    const proximasSessoes = todosAgendamentos
      .filter((a) => a.status !== 'CANCELADO' && a.status !== 'CONCLUIDO' && a.dataHora >= startOfToday)
      .slice(0, 8);

    const ultimosConcluidos = [...concluidosTotal]
      .sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime())
      .slice(0, 6);

    const semEsbocoCount = proximasSessoes.filter(
      (a) => !a.imagens.some((img) => img.tipo === 'ESBOCO')
    ).length;

    const sinaisPendentesCount = proximasSessoes.filter(
      (a) => a.valorSinal > 0 && !a.sinalPago
    ).length;

    res.json({
      resumo: {
        sessoesHoje: agendamentosHoje.length,
        sessoesSemana: agendamentosSemana.length,
        faturamentoMes,
        sinaisRecebidosMes,
        tattoosConcluidasMes: concluidosMes.length,
        tattoosConcluidasTotal: concluidosTotal.length,
        totalClientes,
        orcamentosAbertos,
        semEsbocoCount,
        sinaisPendentesCount,
      },
      proximasSessoes,
      ultimosConcluidos,
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({ error: 'Erro ao carregar resumo do estúdio.' });
  }
};

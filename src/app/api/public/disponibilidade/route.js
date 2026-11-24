import { NextResponse } from 'next/server';
import prisma from '../../../../lib/server/prisma';
import {
  HORARIOS_ESTUDIO,
  STUDIO_INFO,
  getBrazilDayBounds,
  parseBrazilDateTime,
  intervalsOverlap,
} from '../../../../lib/server/reserva';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data'); // YYYY-MM-DD
    const mesParam = searchParams.get('mes'); // YYYY-MM
    const duracaoMinutos = Math.min(360, Math.max(30, Number(searchParams.get('duracao')) || 120));

    // Modo 1: Resumo de um mês (para indicar dias com movimento no calendário público, sem expor dados)
    if (mesParam && /^\d{4}-\d{2}$/.test(mesParam) && !dataParam) {
      const [yearStr, monthStr] = mesParam.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      const lastDay = new Date(year, month, 0).getDate();
      const start = new Date(`${mesParam}-01T00:00:00-03:00`);
      const end = new Date(`${mesParam}-${String(lastDay).padStart(2, '0')}T23:59:59.999-03:00`);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          status: { not: 'CANCELADO' },
          dataHora: { gte: start, lte: end },
        },
        select: {
          dataHora: true,
          duracaoMinutos: true,
        },
      });

      // Conta quantos horários estão ocupados por dia (em fuso -03:00)
      const diasOcupados = {};
      for (const ag of agendamentos) {
        const brDate = new Date(ag.dataHora.getTime() - 3 * 60 * 60 * 1000);
        const key = brDate.toISOString().slice(0, 10);
        diasOcupados[key] = (diasOcupados[key] || 0) + 1;
      }

      return NextResponse.json({
        mes: mesParam,
        studio: STUDIO_INFO,
        horariosPadrao: HORARIOS_ESTUDIO,
        diasOcupados,
      });
    }

    // Modo 2: Slots disponíveis em uma data específica
    if (!dataParam) {
      return NextResponse.json(
        { error: 'Informe o parâmetro ?data=YYYY-MM-DD ou ?mes=YYYY-MM.' },
        { status: 400 }
      );
    }

    const bounds = getBrazilDayBounds(dataParam);
    if (!bounds) {
      return NextResponse.json({ error: 'Formato de data inválido. Use YYYY-MM-DD.' }, { status: 400 });
    }

    // Busca agendamentos que podem sobrepor o dia selecionado (janela segura +-1 dia)
    const searchStart = new Date(bounds.start.getTime() - 6 * 60 * 60 * 1000);
    const searchEnd = new Date(bounds.end.getTime() + 6 * 60 * 60 * 1000);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        status: { not: 'CANCELADO' },
        dataHora: { gte: searchStart, lte: searchEnd },
      },
      select: {
        dataHora: true,
        duracaoMinutos: true,
      },
    });

    const now = new Date();
    const minLeadTimeMs = 30 * 60 * 1000; // 30 min de antecedência mínima

    const slots = HORARIOS_ESTUDIO.map((hora) => {
      const slotStart = parseBrazilDateTime(dataParam, hora);
      const slotEnd = new Date(slotStart.getTime() + duracaoMinutos * 60 * 1000);

      if (slotStart.getTime() < now.getTime() + minLeadTimeMs) {
        return { hora, disponivel: false, motivo: 'PASSADO' };
      }

      const conflito = agendamentos.some((ag) => {
        const agStart = new Date(ag.dataHora);
        const agEnd = new Date(agStart.getTime() + (ag.duracaoMinutos || 120) * 60 * 1000);
        return intervalsOverlap(slotStart, slotEnd, agStart, agEnd);
      });

      if (conflito) {
        return { hora, disponivel: false, motivo: 'OCUPADO' };
      }

      return { hora, disponivel: true, motivo: null };
    });

    return NextResponse.json({
      data: dataParam,
      duracaoMinutos,
      studio: STUDIO_INFO,
      slots,
    });
  } catch (err) {
    console.error('Erro ao consultar disponibilidade pública:', err);
    return NextResponse.json({ error: 'Erro ao consultar horários disponíveis.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/server/prisma';
import {
  generateReservaCode,
  generateReservaToken,
  parseBrazilDateTime,
  intervalsOverlap,
  normalizePhoneDigits,
  normalizeInstagram,
  serializeComprovante,
} from '../../../../lib/server/reserva';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      nome,
      telefone,
      instagram,
      email,
      cidade,
      dataNascimento,
      observacoesCliente,
      data,
      hora,
      duracaoMinutos,
      titulo,
      localCorpo,
      estilo,
      tamanhoCm,
      descricao,
      valorTotal,
      valorSinal,
      aceitouTermo,
      imagensReferencia,
    } = body;

    // Validações obrigatórias
    if (!nome || String(nome).trim().length < 2) {
      return NextResponse.json({ error: 'Informe seu nome completo.' }, { status: 400 });
    }

    const phoneDigits = normalizePhoneDigits(telefone);
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: 'Informe um número de WhatsApp válido com DDD.' },
        { status: 400 }
      );
    }

    if (!data || !hora) {
      return NextResponse.json(
        { error: 'Selecione a data e o horário desejados para a sessão.' },
        { status: 400 }
      );
    }

    if (!titulo || String(titulo).trim().length < 2) {
      return NextResponse.json(
        { error: 'Informe a ideia ou título da tatuagem.' },
        { status: 400 }
      );
    }

    if (!localCorpo || String(localCorpo).trim().length < 2) {
      return NextResponse.json({ error: 'Selecione o local do corpo.' }, { status: 400 });
    }

    if (!aceitouTermo) {
      return NextResponse.json(
        { error: 'Confirme o termo de reserva e presença para finalizar.' },
        { status: 400 }
      );
    }

    const slotStart = parseBrazilDateTime(data, hora);
    if (!slotStart) {
      return NextResponse.json({ error: 'Data ou horário inválidos.' }, { status: 400 });
    }

    if (slotStart.getTime() < Date.now() - 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Não é possível reservar um horário no passado. Escolha uma data futura.' },
        { status: 400 }
      );
    }

    const duracao = Math.min(360, Math.max(30, Number(duracaoMinutos) || 120));
    const slotEnd = new Date(slotStart.getTime() + duracao * 60 * 1000);

    // Verifica conflito de horário em tempo real
    const windowStart = new Date(slotStart.getTime() - 8 * 60 * 60 * 1000);
    const windowEnd = new Date(slotEnd.getTime() + 8 * 60 * 60 * 1000);

    const existingAgendamentos = await prisma.agendamento.findMany({
      where: {
        status: { not: 'CANCELADO' },
        dataHora: { gte: windowStart, lte: windowEnd },
      },
      select: {
        id: true,
        dataHora: true,
        duracaoMinutos: true,
      },
    });

    const hasConflict = existingAgendamentos.some((ag) => {
      const agStart = new Date(ag.dataHora);
      const agEnd = new Date(agStart.getTime() + (ag.duracaoMinutos || 120) * 60 * 1000);
      return intervalsOverlap(slotStart, slotEnd, agStart, agEnd);
    });

    if (hasConflict) {
      return NextResponse.json(
        {
          error:
            'Este horário acabou de ser reservado. Por favor, selecione outro horário disponível.',
        },
        { status: 409 }
      );
    }

    // Localiza cliente existente pelo telefone (mesmos últimos 10/11 dígitos) ou cria novo cadastro
    const allClients = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        instagram: true,
        cidade: true,
        dataNascimento: true,
        observacoes: true,
      },
    });

    const cleanInsta = normalizeInstagram(instagram);
    const existingClient = allClients.find((c) => {
      const cDigits = normalizePhoneDigits(c.telefone);
      return cDigits && (cDigits === phoneDigits || cDigits.endsWith(phoneDigits.slice(-10)));
    });

    let cliente;
    if (existingClient) {
      cliente = await prisma.cliente.update({
        where: { id: existingClient.id },
        data: {
          nome: String(nome).trim(),
          telefone: String(telefone).trim(),
          instagram: cleanInsta || existingClient.instagram,
          email: email ? String(email).trim() : existingClient.email,
          cidade: cidade ? String(cidade).trim() : existingClient.cidade || 'Curitiba',
          dataNascimento: dataNascimento
            ? String(dataNascimento).trim()
            : existingClient.dataNascimento,
          observacoes: observacoesCliente
            ? String(observacoesCliente).trim()
            : existingClient.observacoes,
        },
      });
    } else {
      cliente = await prisma.cliente.create({
        data: {
          nome: String(nome).trim(),
          telefone: String(telefone).trim(),
          instagram: cleanInsta,
          email: email ? String(email).trim() : null,
          cidade: cidade ? String(cidade).trim() : 'Curitiba',
          dataNascimento: dataNascimento ? String(dataNascimento).trim() : null,
          observacoes: observacoesCliente ? String(observacoesCliente).trim() : null,
        },
      });
    }

    // Encontra o tatuador principal do estúdio
    const tatuadorPrincipal =
      (await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } })) ||
      (await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }));

    // Gera próximo código sequencial + código e token de comprovante
    const last = await prisma.agendamento.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });
    const nextCodigo = (last?.codigo || 100) + 1;

    const tokenReserva = generateReservaToken();
    const codigoReserva = generateReservaCode();

    // Valida imagens de referência opcionais (máximo 3, formato data:image/*)
    const validImages = [];
    if (Array.isArray(imagensReferencia)) {
      for (const img of imagensReferencia.slice(0, 3)) {
        const url = typeof img === 'string' ? img : img?.url;
        const legenda = typeof img === 'object' && img?.legenda ? String(img.legenda).trim() : 'Enviada no pré-cadastro';
        if (typeof url === 'string' && url.startsWith('data:image/') && url.length <= 2_500_000) {
          validImages.push({ tipo: 'REFERENCIA', url, legenda });
        }
      }
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        codigo: nextCodigo,
        codigoReserva,
        tokenReserva,
        origem: 'LINK_PUBLICO',
        confirmadoPeloCliente: true,
        confirmadoPeloClienteEm: new Date(),
        clienteId: cliente.id,
        tatuadorId: tatuadorPrincipal?.id || null,
        titulo: String(titulo).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        dataHora: slotStart,
        duracaoMinutos: duracao,
        localCorpo: String(localCorpo).trim(),
        estilo: estilo ? String(estilo).trim() : 'Lettering',
        tamanhoCm: tamanhoCm ? String(tamanhoCm).trim() : null,
        valorTotal: Number(valorTotal) > 0 ? Number(valorTotal) : 0,
        valorSinal: Number(valorSinal) > 0 ? Number(valorSinal) : 0,
        sinalPago: false,
        status: 'CONFIRMADO',
        observacoesSessao: 'Pré-cadastro e confirmação realizados pelo cliente via link da agenda.',
        ...(validImages.length > 0
          ? {
              imagens: {
                create: validImages,
              },
            }
          : {}),
      },
      include: {
        cliente: true,
        tatuador: { select: { id: true, nome: true, especialidade: true } },
        imagens: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(
      {
        message: 'Horário reservado e confirmado com sucesso!',
        tokenReserva: agendamento.tokenReserva,
        codigoReserva: agendamento.codigoReserva,
        comprovantePath: `/comprovante/${agendamento.tokenReserva}`,
        comprovante: serializeComprovante(agendamento),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro ao realizar reserva pública:', err);
    return NextResponse.json(
      { error: 'Não foi possível concluir sua reserva agora. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}

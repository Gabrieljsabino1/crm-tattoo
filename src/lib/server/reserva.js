import crypto from 'crypto';

// Horários padrão do estúdio (fuso de Brasília -03:00)
export const HORARIOS_ESTUDIO = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export const STUDIO_INFO = {
  nome: 'Gullart Lettering',
  subtitulo: 'Preto e cinza 🇧🇷',
  cidade: 'Curitiba - PR',
  timezoneOffset: '-03:00',
};

export function generateReservaToken() {
  return crypto.randomBytes(12).toString('hex');
}

export function generateReservaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `GUL-${suffix}`;
}

/**
 * Converte data YYYY-MM-DD + hora HH:mm no horário de Brasília (-03:00) para Date UTC.
 */
export function parseBrazilDateTime(dateStr, timeStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return null;
  if (!/^\d{2}:\d{2}$/.test(String(timeStr || ''))) return null;
  const d = new Date(`${dateStr}T${timeStr}:00-03:00`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Retorna os limites UTC (início e fim) de um dia no horário de Brasília (-03:00).
 */
export function getBrazilDayBounds(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return null;
  const start = new Date(`${dateStr}T00:00:00-03:00`);
  const end = new Date(`${dateStr}T23:59:59.999-03:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return { start, end };
}

/**
 * Verifica se dois intervalos [startA, endA) e [startB, endB) se sobrepõem.
 */
export function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function normalizePhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function normalizeInstagram(insta) {
  const clean = String(insta || '').trim().replace(/^@+/, '');
  return clean ? `@${clean}` : null;
}

/**
 * Formata o objeto público seguro do comprovante (sem vazar dados internos do estúdio).
 */
export function serializeComprovante(agendamento) {
  if (!agendamento) return null;
  return {
    id: agendamento.id,
    codigo: agendamento.codigo,
    codigoReserva: agendamento.codigoReserva || `GUL-${agendamento.codigo}`,
    tokenReserva: agendamento.tokenReserva,
    origem: agendamento.origem,
    status: agendamento.status,
    confirmadoPeloCliente: agendamento.confirmadoPeloCliente,
    confirmadoPeloClienteEm: agendamento.confirmadoPeloClienteEm,
    titulo: agendamento.titulo,
    descricao: agendamento.descricao,
    dataHora: agendamento.dataHora,
    duracaoMinutos: agendamento.duracaoMinutos,
    localCorpo: agendamento.localCorpo,
    estilo: agendamento.estilo,
    tamanhoCm: agendamento.tamanhoCm,
    valorTotal: agendamento.valorTotal,
    valorSinal: agendamento.valorSinal,
    sinalPago: agendamento.sinalPago,
    createdAt: agendamento.createdAt,
    tatuador: agendamento.tatuador
      ? {
          nome: agendamento.tatuador.nome,
          especialidade: agendamento.tatuador.especialidade,
        }
      : { nome: 'Gullart', especialidade: 'Lettering • Preto e cinza' },
    cliente: agendamento.cliente
      ? {
          nome: agendamento.cliente.nome,
          telefone: agendamento.cliente.telefone,
          instagram: agendamento.cliente.instagram,
          email: agendamento.cliente.email,
          cidade: agendamento.cliente.cidade,
        }
      : null,
    imagens: (agendamento.imagens || [])
      .filter((img) => img.tipo === 'REFERENCIA' || img.tipo === 'ESBOCO')
      .map((img) => ({
        id: img.id,
        tipo: img.tipo,
        url: img.url,
        legenda: img.legenda,
      })),
    studio: STUDIO_INFO,
  };
}

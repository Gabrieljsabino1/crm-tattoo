export const ESTILOS_TATTOO = [
  'Lettering',
  'Preto e Cinza',
  'Blackwork',
  'Fine Line',
  'Realismo',
  'Old School',
  'Neo Tradicional',
  'Oriental',
  'Minimalista',
  'Geométrico',
  'Pontilhismo',
  'Aquarela',
  'Cobertura',
  'Outro',
];

export const LOCAIS_CORPO = [
  'Antebraço (parte externa)',
  'Antebraço (parte interna)',
  'Braço / Bíceps',
  'Braço inteiro (Fechamento)',
  'Ombro',
  'Mão / Dedos',
  'Pulso',
  'Costas (Superior)',
  'Costas (Inteira)',
  'Peito / Tórax',
  'Costela',
  'Pescoço / Nuca',
  'Coxa',
  'Panturrilha',
  'Perna inteira',
  'Tornozelo / Pé',
  'Outro',
];

export const DURACOES_SESSAO = [
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '1h 30min', value: 90 },
  { label: '2 horas', value: 120 },
  { label: '2h 30min', value: 150 },
  { label: '3 horas', value: 180 },
  { label: '4 horas', value: 240 },
  { label: '5 horas', value: 300 },
  { label: '6 horas (Sessão longa)', value: 360 },
];

export const FORMAS_PAGAMENTO = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Misto'];

export const STATUS_AGENDAMENTO = {
  PENDENTE: {
    label: 'Pendente',
    badgeClass: 'bg-ios-amber/15 text-ios-amber border border-ios-amber/30',
    dotClass: 'bg-ios-amber',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    badgeClass: 'bg-apple-blue/15 text-apple-blue border border-apple-blue/30',
    dotClass: 'bg-apple-blue',
  },
  EM_ANDAMENTO: {
    label: 'Em Sessão',
    badgeClass: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    dotClass: 'bg-purple-400',
  },
  CONCLUIDO: {
    label: 'Concluído',
    badgeClass: 'bg-ios-green/15 text-ios-green border border-ios-green/30',
    dotClass: 'bg-ios-green',
  },
  CANCELADO: {
    label: 'Cancelado',
    badgeClass: 'bg-ios-red/15 text-ios-red border border-ios-red/30',
    dotClass: 'bg-ios-red',
  },
};

export const TIPO_IMAGEM_LABEL = {
  REFERENCIA: 'Referência',
  ESBOCO: 'Esboço / Decalque',
  RESULTADO: 'Tattoo Pronta',
};

export function formatMoney(val) {
  return Number(val || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDateTimeBR(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return (
    d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function formatTimeBR(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateBR(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuracao(minutos) {
  const m = Number(minutos) || 60;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}min`;
  if (rem === 0) return `${h}h`;
  return `${h}h${rem}m`;
}

export function toLocalDateTimeInput(isoDate) {
  const d = isoDate ? new Date(isoDate) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateKey(dateObj) {
  const d = new Date(dateObj);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

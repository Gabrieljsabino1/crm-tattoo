"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  AtSign,
  Mail,
  MapPin,
  Sparkles,
  Ruler,
  Upload,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { API_URL } from '../../services/api';
import { compressImageFile } from '../../lib/compressImage';
import {
  ESTILOS_TATTOO,
  LOCAIS_CORPO,
  formatDuracao,
  formatMoney,
  toDateKey,
} from '../../lib/tattooConstants';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatPhoneMask(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ReservarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parâmetros opcionais enviados pelo tatuador no link personalizado
  const paramData = searchParams?.get('data') || '';
  const paramHora = searchParams?.get('hora') || '';
  const paramDuracao = Number(searchParams?.get('duracao')) || 120;
  const paramTitulo = searchParams?.get('titulo') || '';
  const paramEstilo = searchParams?.get('estilo') || '';
  const paramLocal = searchParams?.get('local') || '';
  const paramValor = Number(searchParams?.get('valor')) || 0;
  const paramSinal = Number(searchParams?.get('sinal')) || 0;

  const isCustomSlotLink = Boolean(paramData && /^\d{4}-\d{2}-\d{2}$/.test(paramData));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const initialDateKey = isCustomSlotLink ? paramData : todayKey;
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (isCustomSlotLink) {
      const [y, m] = paramData.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(initialDateKey);
  const [selectedHora, setSelectedHora] = useState(paramHora || '');
  const [duracaoMinutos] = useState(paramDuracao);
  const [diasOcupados, setDiasOcupados] = useState({});
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Dados do pré-cadastro do cliente
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cidade, setCidade] = useState('Curitiba');
  const [observacoesCliente, setObservacoesCliente] = useState('');

  // Detalhes da tatuagem
  const [titulo, setTitulo] = useState(paramTitulo);
  const [localCorpo, setLocalCorpo] = useState(paramLocal || 'Antebraço (parte externa)');
  const [estilo, setEstilo] = useState(paramEstilo || 'Lettering');
  const [tamanhoCm, setTamanhoCm] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagensRef, setImagensRef] = useState([]); // [{ url, name }]
  const [compressingImgs, setCompressingImgs] = useState(false);

  // Confirmação e envio
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Carrega resumo do mês no calendário
  useEffect(() => {
    const mesStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    let active = true;
    axios
      .get(`${API_URL}/public/disponibilidade`, { params: { mes: mesStr } })
      .then((res) => {
        if (active) setDiasOcupados(res.data?.diasOcupados || {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentMonth]);

  // Carrega horários disponíveis do dia selecionado
  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    setLoadingSlots(true);
    axios
      .get(`${API_URL}/public/disponibilidade`, {
        params: { data: selectedDate, duracao: duracaoMinutos },
      })
      .then((res) => {
        if (!active) return;
        const list = res.data?.slots || [];
        setSlots(list);
        // Se o horário previamente selecionado não estiver disponível nesse dia, limpa
        setSelectedHora((prev) => {
          if (!prev) return '';
          const match = list.find((s) => s.hora === prev && s.disponivel);
          return match ? prev : '';
        });
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate, duracaoMinutos]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = toDateKey(d);
      const isPast = d < today;
      cells.push({
        day,
        key,
        isPast,
        isToday: key === todayKey,
      });
    }
    return cells;
  }, [currentMonth, today, todayKey]);

  const selectedDateHuman = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const remaining = Math.max(0, 3 - imagensRef.length);
    const chosen = files.slice(0, remaining);
    if (!chosen.length) return;

    setCompressingImgs(true);
    try {
      const processed = [];
      for (const f of chosen) {
        if (!f.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(f, 1100, 0.78);
        const url = await fileToDataUrl(compressed);
        processed.push({ url, name: f.name });
      }
      setImagensRef((prev) => [...prev, ...processed].slice(0, 3));
    } catch {
      setError('Não foi possível processar uma das imagens. Tente outro arquivo.');
    } finally {
      setCompressingImgs(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (!selectedDate || !selectedHora) {
      setError('Escolha uma data e um horário disponível na agenda antes de confirmar.');
      return;
    }
    if (!nome.trim() || nome.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (telefone.replace(/\D/g, '').length < 10) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }
    if (!titulo.trim()) {
      setError('Descreva brevemente a ideia ou título da sua tatuagem.');
      return;
    }
    if (!aceitouTermo) {
      setError('Marque a caixa de confirmação de reserva e presença para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/public/reservar`, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        instagram: instagram.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        dataNascimento: dataNascimento.trim(),
        observacoesCliente: observacoesCliente.trim(),
        data: selectedDate,
        hora: selectedHora,
        duracaoMinutos,
        titulo: titulo.trim(),
        localCorpo,
        estilo,
        tamanhoCm: tamanhoCm.trim(),
        descricao: descricao.trim(),
        valorTotal: paramValor,
        valorSinal: paramSinal,
        aceitouTermo: true,
        imagensReferencia: imagensRef.map((img) => ({
          url: img.url,
          legenda: 'Referência enviada no pré-cadastro',
        })),
      });

      const path = res.data?.comprovantePath || `/comprovante/${res.data?.tokenReserva}`;
      router.push(path);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Erro ao finalizar sua reserva. Verifique os dados e tente novamente.'
      );
      // Recarrega horários caso tenha dado conflito 409
      if (err.response?.status === 409) {
        axios
          .get(`${API_URL}/public/disponibilidade`, {
            params: { data: selectedDate, duracao: duracaoMinutos },
          })
          .then((r) => setSlots(r.data?.slots || []))
          .catch(() => {});
        setSelectedHora('');
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07060A] text-text-primary relative overflow-x-hidden">
      {/* Luz ambiente roxa sutil */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[650px] h-[340px] bg-apple-blue/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 relative z-10 space-y-6">
        {/* Cabeçalho da Marca */}
        <header className="text-center space-y-2.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-b from-[#191426] to-[#0D0A14] border border-apple-blue/60 flex items-center justify-center shadow-apple">
            <span className="font-gothic text-3xl leading-none text-white">G</span>
          </div>
          <div>
            <h1 className="font-gothic text-4xl sm:text-5xl text-white leading-tight">
              Gullart Lettering
            </h1>
            <p className="font-gothic text-lg text-apple-blue mt-0.5">
              Preto e cinza 🇧🇷
            </p>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto pt-1">
            Faça seu pré-cadastro, reserve seu horário diretamente na agenda do estúdio e receba seu{' '}
            <span className="text-white font-medium">Comprovante Oficial de Reserva</span>.
          </p>
        </header>

        {/* Banner se veio de um link personalizado com horário/valor */}
        {(isCustomSlotLink || paramValor > 0 || paramTitulo) && (
          <div className="rounded-2xl bg-apple-blue/10 border border-apple-blue/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-apple-blue/20 border border-apple-blue/40 flex items-center justify-center text-apple-blue shrink-0">
                <FileCheck2 size={18} />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-white">Convite de Agendamento Pré-configurado</p>
                <p className="text-text-secondary">
                  {paramData && paramHora
                    ? `Horário sugerido: ${paramData.split('-').reverse().join('/')} às ${paramHora} (${formatDuracao(duracaoMinutos)})`
                    : 'Preencha seus dados abaixo para confirmar sua sessão.'}
                  {paramTitulo ? ` • ${paramTitulo}` : ''}
                </p>
              </div>
            </div>
            {paramValor > 0 && (
              <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                <span className="text-xs font-bold text-white block">
                  {formatMoney(paramValor)}
                </span>
                {paramSinal > 0 && (
                  <span className="text-[11px] text-apple-blue block">
                    Sinal combinado: {formatMoney(paramSinal)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO 1: ESCOLHA DATA & HORÁRIO */}
          <section className="card-apple p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Escolha a Data e o Horário
                  </h2>
                  <p className="text-[11px] text-text-muted">
                    Horários sincronizados em tempo real com a agenda do tatuador
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1C1728] border border-border text-text-secondary hidden sm:inline-flex items-center gap-1">
                <Clock size={12} className="text-apple-blue" /> {formatDuracao(duracaoMinutos)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Calendário */}
              <div className="md:col-span-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">
                    {MESES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                        )
                      }
                      className="p-1.5 rounded-lg bg-[#1C1728] hover:bg-[#261F36] text-text-secondary hover:text-white transition-colors"
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                        )
                      }
                      className="p-1.5 rounded-lg bg-[#1C1728] hover:bg-[#261F36] text-text-secondary hover:text-white transition-colors"
                      aria-label="Próximo mês"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {DIAS_SEMANA.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-semibold text-text-muted uppercase py-1"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, idx) => {
                    if (!cell) return <div key={`e-${idx}`} className="h-10" />;
                    const isSelected = selectedDate === cell.key;
                    const busyCount = diasOcupados[cell.key] || 0;

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={cell.isPast}
                        onClick={() => setSelectedDate(cell.key)}
                        className={`h-10 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                          cell.isPast
                            ? 'text-text-muted/30 cursor-not-allowed'
                            : isSelected
                            ? 'bg-apple-blue text-white font-bold shadow-apple'
                            : cell.isToday
                            ? 'bg-[#1C1728] text-apple-blue border border-apple-blue/50 font-semibold'
                            : 'text-text-primary hover:bg-[#1C1728]'
                        }`}
                      >
                        <span>{cell.day}</span>
                        {!cell.isPast && busyCount > 0 && (
                          <span
                            className={`w-1 h-1 rounded-full mt-0.5 ${
                              isSelected ? 'bg-white' : 'bg-apple-blue/80'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grade de Horários do Dia */}
              <div className="md:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="mb-3">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Horários disponíveis para
                    </span>
                    <span className="text-sm font-bold text-white capitalize">
                      {selectedDateHuman}
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="py-10 flex items-center justify-center gap-2 text-xs text-text-muted">
                      <Loader2 size={16} className="animate-spin text-apple-blue" />
                      Verificando agenda...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted bg-[#0D0B12] rounded-xl border border-border">
                      Nenhum horário carregado para esta data.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.map((slot) => {
                        const isPicked = selectedHora === slot.hora && slot.disponivel;
                        return (
                          <button
                            key={slot.hora}
                            type="button"
                            disabled={!slot.disponivel}
                            onClick={() => setSelectedHora(slot.hora)}
                            className={`h-11 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                              !slot.disponivel
                                ? 'bg-[#0D0B12] border-border-subtle text-text-muted/40 line-through cursor-not-allowed'
                                : isPicked
                                ? 'bg-apple-blue border-apple-blue text-white shadow-apple'
                                : 'bg-[#0D0B12] border-border text-text-primary hover:border-apple-blue hover:bg-[#1C1728]'
                            }`}
                          >
                            <span>{slot.hora}</span>
                            {!slot.disponivel && slot.motivo === 'OCUPADO' && (
                              <span className="text-[9px] no-underline text-text-muted/60 font-normal">
                                Ocupado
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedHora ? (
                  <div className="mt-4 p-3 rounded-xl bg-ios-green/10 border border-ios-green/30 flex items-center gap-2 text-xs text-ios-green">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>
                      Selecionado: <strong className="text-white">{selectedDate.split('-').reverse().join('/')}</strong> às{' '}
                      <strong className="text-white">{selectedHora}</strong>
                    </span>
                  </div>
                ) : (
                  <p className="mt-4 text-[11px] text-text-muted">
                    Toque em um horário livre acima para reservá-lo.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: PRÉ-CADASTRO DO CLIENTE */}
          <section className="card-apple p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
              <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">Seu Pré-Cadastro</h2>
                <p className="text-[11px] text-text-muted">
                  Seus dados ficam vinculados ao comprovante e à ficha do estúdio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Lucas Almeida"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  WhatsApp (com DDD) *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhoneMask(e.target.value))}
                    placeholder="(41) 99999-9999"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Instagram
                </label>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seu_instagram"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  E-mail (opcional)
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">
                    Data de Nasc.
                  </label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Curitiba"
                    className="input"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Observações / Alergias / Cuidados (opcional)
                </label>
                <input
                  type="text"
                  value={observacoesCliente}
                  onChange={(e) => setObservacoesCliente(e.target.value)}
                  placeholder="Ex: Primeira tattoo, pele sensível, alergia a látex..."
                  className="input"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: DETALHES DA TATTOO & REFERÊNCIAS */}
          <section className="card-apple p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
              <span className="w-6 h-6 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Sobre a sua Tattoo
                </h2>
                <p className="text-[11px] text-text-muted">
                  Ajuda o tatuador a preparar seu projeto e decalque com antecedência
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Ideia / Título da Tattoo *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Lettering Gótico 'Fé' ou Fechamento Preto e Cinza"
                  className="input"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5 flex items-center gap-1">
                  <MapPin size={12} className="text-ios-amber" /> Local no Corpo *
                </label>
                <select
                  value={localCorpo}
                  onChange={(e) => setLocalCorpo(e.target.value)}
                  className="select"
                >
                  {LOCAIS_CORPO.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} className="text-apple-blue" /> Estilo
                </label>
                <select
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  className="select"
                >
                  {ESTILOS_TATTOO.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5 flex items-center gap-1">
                  <Ruler size={12} className="text-purple-400" /> Tamanho Aproximado (opcional)
                </label>
                <input
                  type="text"
                  value={tamanhoCm}
                  onChange={(e) => setTamanhoCm(e.target.value)}
                  placeholder="Ex: 15cm x 8cm"
                  className="input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Detalhes / Frase / Referências escritas (opcional)
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Escreva a frase exata, estilo de letra, sombreamento desejado ou observações..."
                  className="input py-2.5 resize-none"
                />
              </div>

              {/* Upload de até 3 fotos de referência */}
              <div className="sm:col-span-2 space-y-2.5">
                <label className="text-xs font-medium text-text-secondary block">
                  Fotos de Referência (opcional — até 3 imagens)
                </label>

                {imagensRef.length < 3 && (
                  <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-dashed border-border hover:border-apple-blue bg-[#0D0B12] cursor-pointer transition-colors text-center">
                    {compressingImgs ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-apple-blue" />
                        <span className="text-xs text-text-secondary">Otimizando imagens...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-apple-blue" />
                        <span className="text-xs font-medium text-white">
                          Toque para anexar fotos da sua ideia ou referência
                        </span>
                        <span className="text-[11px] text-text-muted">
                          JPG, PNG ou WEBP • enviadas direto para o tatuador
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}

                {imagensRef.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {imagensRef.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border bg-[#0D0B12]"
                      >
                        <img
                          src={img.url}
                          alt={`Referência ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImagensRef((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-ios-red transition-colors"
                          aria-label="Remover imagem"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: TERMO DE CONFIRMAÇÃO & ENVIO */}
          <section className="card-apple p-5 sm:p-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aceitouTermo}
                onChange={(e) => setAceitouTermo(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-[#7C3AED] shrink-0"
              />
              <span className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-white block mb-0.5">
                  Confirmação de Reserva e Presença
                </strong>
                Confirmo meu pré-cadastro e a reserva deste horário com{' '}
                <span className="text-white font-medium">Gullart Lettering</span>. Estou ciente de
                que este registro serve como comprovante oficial do agendamento e que eventuais
                reagendamentos devem ser comunicados com antecedência pelo WhatsApp.
              </span>
            </label>

            {error && (
              <div className="p-3.5 rounded-xl bg-ios-red/10 border border-ios-red/30 text-ios-red text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || compressingImgs}
              className="btn-primary w-full h-12 text-sm font-bold shadow-apple"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Confirmando e gerando comprovante...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Confirmar Horário & Gerar Comprovante</span>
                </>
              )}
            </button>
          </section>
        </form>

        <footer className="text-center text-[11px] text-text-muted pb-6">
          <span className="font-gothic text-sm text-text-secondary">Gullart Lettering</span> ©{' '}
          {new Date().getFullYear()} —{' '}
          <span className="font-gothic text-sm text-text-secondary">Preto e cinza</span> 🇧🇷
        </footer>
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07060A] flex items-center justify-center text-xs text-text-muted">
          Carregando agenda de reservas...
        </div>
      }
    >
      <ReservarContent />
    </Suspense>
  );
}

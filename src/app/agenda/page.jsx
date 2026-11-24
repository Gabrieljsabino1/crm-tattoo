"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  MapPin,
  FileImage,
  Palette,
  Camera,
  Phone,
  CheckCircle2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { api, resolveImageUrl } from '../../services/api';
import AgendamentoDetailModal from '../../components/UI/AgendamentoDetailModal';
import AgendamentoFormModal from '../../components/UI/AgendamentoFormModal';
import {
  ESTILOS_TATTOO,
  STATUS_AGENDAMENTO,
  formatDateBR,
  formatTimeBR,
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

function AgendaContent() {
  const searchParams = useSearchParams();
  const initialBusca = searchParams?.get('busca') || '';

  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(initialBusca);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [estiloFilter, setEstiloFilter] = useState('TODOS');

  // Calendário mensal
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDayKey, setSelectedDayKey] = useState(initialBusca ? '' : toDateKey(today));

  // Modais
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/agendamentos');
      setAgendamentos(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    const q = searchParams?.get('busca');
    if (q !== null && q !== undefined) {
      setBusca(q);
      if (q) setSelectedDayKey('');
    }
  }, [searchParams]);

  // Agrupamento por dia (YYYY-MM-DD) para exibir bolinhas no calendário
  const byDayMap = useMemo(() => {
    const map = {};
    for (const ag of agendamentos) {
      if (ag.status === 'CANCELADO') continue;
      const key = toDateKey(ag.dataHora);
      if (!map[key]) map[key] = [];
      map[key].push(ag);
    }
    return map;
  }, [agendamentos]);

  // Dias do mês atual para montar grade 7xN
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({
        day,
        date: d,
        key: toDateKey(d),
        isToday: toDateKey(d) === toDateKey(today),
      });
    }
    return cells;
  }, [currentMonth, today]);

  // Lista filtrada
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter((a) => {
      if (selectedDayKey && toDateKey(a.dataHora) !== selectedDayKey) return false;
      if (statusFilter !== 'TODOS' && a.status !== statusFilter) return false;
      if (estiloFilter !== 'TODOS' && a.estilo !== estiloFilter) return false;
      if (busca.trim()) {
        const t = busca.trim().toLowerCase();
        const match =
          a.titulo.toLowerCase().includes(t) ||
          (a.descricao || '').toLowerCase().includes(t) ||
          a.localCorpo.toLowerCase().includes(t) ||
          a.estilo.toLowerCase().includes(t) ||
          (a.cliente?.nome || '').toLowerCase().includes(t) ||
          (a.cliente?.telefone || '').toLowerCase().includes(t);
        if (!match) return false;
      }
      return true;
    });
  }, [agendamentos, selectedDayKey, statusFilter, estiloFilter, busca]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDayKey) return 'Todos os Agendamentos';
    const [y, m, d] = selectedDayKey.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }, [selectedDayKey]);

  const defaultFormDate = useMemo(() => {
    if (!selectedDayKey) return null;
    const [y, m, d] = selectedDayKey.split('-').map(Number);
    return new Date(y, m - 1, d, 14, 0, 0);
  }, [selectedDayKey]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-gothic text-3xl text-white flex items-center gap-2.5 leading-none">
            <CalendarDays size={20} className="text-apple-blue" />
            <span>Agenda & Sessões</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Visualize os horários marcados, referências, esboços, descrições e locais no corpo
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAgendamento(null);
            setFormModalOpen(true);
          }}
          className="btn-primary h-9 px-4 text-xs font-semibold shrink-0"
        >
          <Plus size={15} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Layout Principal: Calendário (esquerda) + Horários do Dia / Lista (direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Calendário Mensal */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-apple">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">
                {MESES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const now = new Date();
                    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedDayKey(toDateKey(now));
                  }}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md bg-[#1C1728] text-text-secondary hover:text-white transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                    )
                  }
                  className="p-1.5 rounded-md hover:bg-[#1C1728] text-text-secondary hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                    )
                  }
                  className="p-1.5 rounded-md hover:bg-[#1C1728] text-text-secondary hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {DIAS_SEMANA.map((dia) => (
                <span key={dia} className="text-[10px] font-semibold text-text-muted uppercase py-1">
                  {dia}
                </span>
              ))}
            </div>

            {/* Grade do Mês */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="h-10" />;
                const dayItems = byDayMap[cell.key] || [];
                const isSelected = selectedDayKey === cell.key;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDayKey(isSelected ? '' : cell.key)}
                    className={`h-11 rounded-lg flex flex-col items-center justify-center relative transition-all text-xs font-medium ${
                      isSelected
                        ? 'bg-apple-blue text-white font-bold shadow-sm'
                        : cell.isToday
                        ? 'bg-[#1C1728] text-apple-blue border border-apple-blue/50 font-bold'
                        : 'text-text-primary hover:bg-[#1C1728]'
                    }`}
                  >
                    <span>{cell.day}</span>
                    {dayItems.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {dayItems.slice(0, 3).map((it) => {
                          const dot =
                            STATUS_AGENDAMENTO[it.status]?.dotClass || 'bg-apple-blue';
                          return (
                            <span
                              key={it.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : dot
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDayKey('')}
                className={`text-xs font-medium transition-colors ${
                  !selectedDayKey ? 'text-apple-blue font-semibold' : 'text-text-muted hover:text-white'
                }`}
              >
                Ver todos os dias ({agendamentos.length})
              </button>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" /> Confirmado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ios-green" /> Feito
                </span>
              </div>
            </div>
          </div>

          {/* Filtros Rápidos */}
          <div className="card-apple space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Filtros</h3>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente, tattoo, local..."
                className="input pl-9 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select h-9 text-xs"
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em Sessão</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">
                  Estilo
                </label>
                <select
                  value={estiloFilter}
                  onChange={(e) => setEstiloFilter(e.target.value)}
                  className="select h-9 text-xs"
                >
                  <option value="TODOS">Todos</option>
                  {ESTILOS_TATTOO.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Lista de Horários do Dia / Filtrados */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-white capitalize">{selectedDateLabel}</h2>
              <p className="text-xs text-text-muted">
                {filteredAgendamentos.length} agendamento(s) encontrado(s)
              </p>
            </div>
            {selectedDayKey && (
              <button
                onClick={() => {
                  setEditingAgendamento(null);
                  setFormModalOpen(true);
                }}
                className="btn-secondary h-8 px-3 text-xs font-semibold"
              >
                <Plus size={14} /> Marcar neste dia
              </button>
            )}
          </div>

          {loading ? (
            <div className="card-apple py-14 text-center text-xs text-text-muted">
              Carregando horários...
            </div>
          ) : filteredAgendamentos.length === 0 ? (
            <div className="card-apple py-14 text-center space-y-3">
              <CalendarDays size={32} className="mx-auto text-text-muted opacity-50" />
              <p className="text-sm font-medium text-text-secondary">
                Nenhum horário marcado para este filtro.
              </p>
              <div className="flex items-center justify-center gap-2">
                {selectedDayKey && (
                  <button
                    onClick={() => setSelectedDayKey('')}
                    className="btn-secondary h-8 px-3 text-xs"
                  >
                    Ver todos os dias
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingAgendamento(null);
                    setFormModalOpen(true);
                  }}
                  className="btn-primary h-8 px-4 text-xs"
                >
                  <Plus size={14} /> Novo Agendamento
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredAgendamentos.map((ag) => {
                const st = STATUS_AGENDAMENTO[ag.status] || STATUS_AGENDAMENTO.CONFIRMADO;
                const imgs = ag.imagens || [];
                const refCount = imgs.filter((i) => i.tipo === 'REFERENCIA').length;
                const esbocoCount = imgs.filter((i) => i.tipo === 'ESBOCO').length;
                const resCount = imgs.filter((i) => i.tipo === 'RESULTADO').length;
                const whatsappClean = (ag.cliente?.telefone || '').replace(/\D/g, '');

                return (
                  <div
                    key={ag.id}
                    onClick={() => setSelectedAgendamento(ag)}
                    className="card-apple p-4 hover:border-apple-blue/60 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Bloco de Horário */}
                      <div className="sm:w-28 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center p-3 rounded-xl bg-[#0D0B12] border border-border text-left">
                        <div>
                          <span className="text-lg font-bold text-white leading-none block">
                            {formatTimeBR(ag.dataHora)}
                          </span>
                          <span className="text-[11px] text-text-muted mt-1 block">
                            {formatDateBR(ag.dataHora)}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-apple-blue flex items-center gap-1 sm:mt-2">
                          <Clock size={11} /> {formatDuracao(ag.duracaoMinutos)}
                        </span>
                      </div>

                      {/* Informações da Tattoo & Cliente */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{ag.titulo}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badgeClass}`}>
                                {st.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-1">
                              <span className="font-semibold text-text-primary">{ag.cliente?.nome}</span>
                              <span className="flex items-center gap-1 text-ios-amber">
                                <MapPin size={12} /> {ag.localCorpo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles size={12} className="text-apple-blue" /> {ag.estilo}
                                {ag.tamanhoCm ? ` • ${ag.tamanhoCm}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-white block">
                              {formatMoney(ag.valorTotal)}
                            </span>
                            {ag.valorSinal > 0 && (
                              <span
                                className={`text-[10px] font-semibold ${
                                  ag.sinalPago ? 'text-ios-green' : 'text-ios-amber'
                                }`}
                              >
                                Sinal {formatMoney(ag.valorSinal)} {ag.sinalPago ? 'pago' : 'pendente'}
                              </span>
                            )}
                          </div>
                        </div>

                        {ag.descricao && (
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {ag.descricao}
                          </p>
                        )}

                        {/* Miniaturas de Referência / Esboço / Resultado */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle">
                          <div className="flex items-center gap-2">
                            {imgs.slice(0, 3).map((img) => (
                              <img
                                key={img.id}
                                src={resolveImageUrl(img.url)}
                                alt={img.tipo}
                                className="w-10 h-10 rounded-lg object-cover border border-border bg-[#0D0B12]"
                              />
                            ))}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted ml-1">
                              <span className="flex items-center gap-1">
                                <FileImage size={12} className="text-apple-blue" /> {refCount} ref
                              </span>
                              <span
                                className={`flex items-center gap-1 ${
                                  esbocoCount > 0 ? 'text-ios-green' : 'text-ios-amber'
                                }`}
                              >
                                <Palette size={12} /> {esbocoCount} esboço
                              </span>
                              {resCount > 0 && (
                                <span className="flex items-center gap-1 text-ios-green">
                                  <Camera size={12} /> {resCount} pronta
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {whatsappClean && (
                              <a
                                href={`https://wa.me/55${whatsappClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-ios-green/10 text-ios-green border border-ios-green/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-ios-green/20 transition-colors"
                              >
                                <Phone size={11} /> WhatsApp
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedAgendamento(ag)}
                              className="px-2.5 py-1 rounded-lg bg-[#1C1728] text-text-primary border border-border text-[11px] font-semibold flex items-center gap-1 hover:border-apple-blue transition-colors"
                            >
                              <Eye size={12} /> Ver Fotos & Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <AgendamentoDetailModal
        agendamento={selectedAgendamento}
        onClose={() => setSelectedAgendamento(null)}
        onEdit={(ag) => {
          setSelectedAgendamento(null);
          setEditingAgendamento(ag);
          setFormModalOpen(true);
        }}
        onUpdated={(updated) => {
          setSelectedAgendamento(updated);
          setAgendamentos((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
        onDeleted={(id) => {
          setAgendamentos((prev) => prev.filter((a) => a.id !== id));
        }}
      />

      <AgendamentoFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editingAgendamento={editingAgendamento}
        defaultDate={defaultFormDate}
        onSaved={() => fetchAgendamentos()}
      />
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-xs text-text-muted">Carregando agenda...</div>
      }
    >
      <AgendaContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  FileImage,
  Palette,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { api, resolveImageUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AgendamentoDetailModal from '../../components/UI/AgendamentoDetailModal';
import AgendamentoFormModal from '../../components/UI/AgendamentoFormModal';
import {
  STATUS_AGENDAMENTO,
  formatDateTimeBR,
  formatDuracao,
  formatMoney,
  formatDateBR,
} from '../../lib/tattooConstants';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/dashboards/resumo');
      setData(res.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const resumo = data?.resumo || {
    sessoesHoje: 0,
    sessoesSemana: 0,
    faturamentoMes: 0,
    sinaisRecebidosMes: 0,
    tattoosConcluidasMes: 0,
    tattoosConcluidasTotal: 0,
    totalClientes: 0,
    orcamentosAbertos: 0,
    semEsbocoCount: 0,
    sinaisPendentesCount: 0,
  };

  function getThumbnail(item) {
    const imgs = item?.imagens || [];
    const preferred =
      imgs.find((i) => i.tipo === 'RESULTADO') ||
      imgs.find((i) => i.tipo === 'ESBOCO') ||
      imgs.find((i) => i.tipo === 'REFERENCIA');
    return preferred ? resolveImageUrl(preferred.url) : null;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="font-gothic text-3xl text-white leading-none">
              Gullart Lettering
            </h1>
            <span className="font-gothic text-base text-apple-blue">
              Preto e cinza 🇧🇷
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1.5">
            Bem-vindo, <strong className="text-white">{user?.nome || 'Tatuador'}</strong> — controle de horários, esboços, referências e tattoos concluídas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/agenda" className="btn-secondary h-9 px-3.5 text-xs font-semibold">
            <CalendarDays size={15} />
            <span>Ver Agenda</span>
          </Link>
          <button
            onClick={() => {
              setEditingAgendamento(null);
              setFormModalOpen(true);
            }}
            className="btn-primary h-9 px-4 text-xs font-semibold"
          >
            <Plus size={15} />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* 4 Cards KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sessões Hoje</span>
            <div className="p-2 rounded-lg bg-apple-blue/10 text-apple-blue">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {loading ? '—' : resumo.sessoesHoje}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border-subtle text-xs text-text-muted">
            <strong className="text-white">{resumo.sessoesSemana}</strong> sessão(ões) nesta semana
          </div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Faturamento Mês</span>
            <div className="p-2 rounded-lg bg-ios-green/10 text-ios-green">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {loading ? '—' : formatMoney(resumo.faturamentoMes)}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border-subtle text-xs text-text-muted">
            + <strong className="text-ios-green">{formatMoney(resumo.sinaisRecebidosMes)}</strong> em sinais recebidos
          </div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Serviços Feitos</span>
            <div className="p-2 rounded-lg bg-ios-amber/10 text-ios-amber">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {loading ? '—' : resumo.tattoosConcluidasTotal}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border-subtle text-xs text-text-muted">
            <strong className="text-white">{resumo.tattoosConcluidasMes}</strong> concluída(s) este mês
          </div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Base de Clientes</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {loading ? '—' : resumo.totalClientes}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border-subtle text-xs text-text-muted">
            <strong className="text-white">{resumo.orcamentosAbertos}</strong> orçamento(s) em andamento
          </div>
        </div>
      </div>

      {/* Seção Principal: Próximas Sessões (2 cols) + Painel Lateral (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-apple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div>
                <h2 className="font-gothic text-2xl text-white leading-tight">
                  Próximas Sessões na Agenda
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Clique em qualquer horário para ver foto da tattoo, esboço, local no corpo e detalhes
                </p>
              </div>
              <Link
                href="/agenda"
                className="text-xs text-apple-blue hover:underline flex items-center gap-1 font-medium shrink-0"
              >
                Abrir agenda <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">Carregando agenda...</div>
            ) : !data?.proximasSessoes?.length ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-text-muted">Nenhuma sessão agendada para os próximos dias.</p>
                <button
                  onClick={() => {
                    setEditingAgendamento(null);
                    setFormModalOpen(true);
                  }}
                  className="btn-primary h-8 px-4 text-xs inline-flex"
                >
                  <Plus size={14} /> Agendar primeira sessão
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {data.proximasSessoes.map((item) => {
                  const thumb = getThumbnail(item);
                  const st = STATUS_AGENDAMENTO[item.status] || STATUS_AGENDAMENTO.CONFIRMADO;
                  const refCount = (item.imagens || []).filter((i) => i.tipo === 'REFERENCIA').length;
                  const esbocoCount = (item.imagens || []).filter((i) => i.tipo === 'ESBOCO').length;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAgendamento(item)}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1C1728]/60 px-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={item.titulo}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 bg-[#0D0B12]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#191426] border border-[#3D3157] flex items-center justify-center text-apple-blue shrink-0">
                            <Sparkles size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">
                              {item.titulo}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          </div>
                          <div className="text-xs text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-text-primary font-medium">{item.cliente?.nome}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-apple-blue" />
                              {formatDateTimeBR(item.dataHora)} ({formatDuracao(item.duracaoMinutos)})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-ios-amber" />
                              {item.localCorpo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                        <div className="text-sm font-bold text-white">
                          {formatMoney(item.valorTotal)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-text-secondary flex items-center gap-1">
                            <FileImage size={11} className="text-apple-blue" /> {refCount} ref
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              esbocoCount > 0 ? 'text-ios-green' : 'text-ios-amber'
                            }`}
                          >
                            <Palette size={11} /> {esbocoCount > 0 ? `${esbocoCount} esboço` : 'Sem esboço'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="card-apple flex flex-col justify-between">
          <div>
            <h2 className="font-gothic text-2xl text-white pb-3 border-b border-border leading-tight">
              Preparo das Sessões
            </h2>
            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-apple-blue/15 text-apple-blue mt-0.5">
                  <Palette size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Esboços & Decalques ({resumo.semEsbocoCount} pendente{resumo.semEsbocoCount === 1 ? '' : 's'})
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Anexe o esboço aprovado direto no card da sessão para ter tudo à mão na bancada.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-ios-amber/15 text-ios-amber mt-0.5">
                  <Wallet size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Sinais de Reserva ({resumo.sinaisPendentesCount} aguardando)
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Acompanhe quem já pagou o sinal e veja o valor restante a receber no dia da tattoo.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-ios-green/15 text-ios-green mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Portfólio de Serviços Feitos</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Ao concluir a sessão, adicione a foto final para manter o histórico completo por cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
            <button
              onClick={() => {
                setEditingAgendamento(null);
                setFormModalOpen(true);
              }}
              className="btn-primary w-full h-9 text-xs font-semibold"
            >
              <Plus size={14} />
              <span>Agendar Nova Tattoo</span>
            </button>
            <Link href="/servicos" className="btn-secondary w-full h-9 text-xs font-semibold">
              <span>Ver Serviços Concluídos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Últimos Trabalhos Concluídos */}
      {data?.ultimosConcluidos?.length > 0 && (
        <div className="card-apple">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div>
              <h2 className="font-gothic text-2xl text-white leading-tight">
                Últimos Serviços Realizados
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Histórico recente de tatuagens finalizadas na Gullart Lettering
              </p>
            </div>
            <Link
              href="/servicos"
              className="text-xs text-apple-blue hover:underline flex items-center gap-1 font-medium"
            >
              Ver portfólio completo <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.ultimosConcluidos.map((item) => {
              const thumb = getThumbnail(item);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAgendamento(item)}
                  className="group rounded-xl bg-[#0D0B12] border border-border hover:border-apple-blue/60 overflow-hidden cursor-pointer transition-all flex items-center gap-3 p-3"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.titulo}
                      className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#191426] border border-border flex items-center justify-center text-ios-green shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-apple-blue transition-colors">
                      {item.titulo}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate">{item.cliente?.nome}</p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-text-muted">
                      <span>{item.localCorpo}</span>
                      <span className="font-semibold text-ios-green">{formatMoney(item.valorTotal)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5">{formatDateBR(item.dataHora)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          fetchDashboard();
        }}
        onDeleted={() => fetchDashboard()}
      />

      <AgendamentoFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editingAgendamento={editingAgendamento}
        onSaved={() => fetchDashboard()}
      />
    </div>
  );
}

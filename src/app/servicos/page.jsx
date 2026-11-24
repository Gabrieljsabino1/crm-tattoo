"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
  Calendar,
  Camera,
  TrendingUp,
  Plus,
  Eye,
} from 'lucide-react';
import { api, resolveImageUrl } from '../../services/api';
import AgendamentoDetailModal from '../../components/UI/AgendamentoDetailModal';
import AgendamentoFormModal from '../../components/UI/AgendamentoFormModal';
import {
  ESTILOS_TATTOO,
  formatDateBR,
  formatDuracao,
  formatMoney,
} from '../../lib/tattooConstants';

export default function ServicosRealizadosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [estiloFilter, setEstiloFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState('grid');

  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchServicos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/agendamentos?apenasConcluidos=true');
      setServicos(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços realizados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  const filtered = useMemo(() => {
    return servicos.filter((s) => {
      if (estiloFilter !== 'TODOS' && s.estilo !== estiloFilter) return false;
      if (busca.trim()) {
        const t = busca.trim().toLowerCase();
        const match =
          s.titulo.toLowerCase().includes(t) ||
          (s.descricao || '').toLowerCase().includes(t) ||
          s.localCorpo.toLowerCase().includes(t) ||
          s.estilo.toLowerCase().includes(t) ||
          (s.cliente?.nome || '').toLowerCase().includes(t);
        if (!match) return false;
      }
      return true;
    });
  }, [servicos, busca, estiloFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const faturamento = filtered.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
    const ticketMedio = total > 0 ? faturamento / total : 0;

    const styleCounts = {};
    filtered.forEach((s) => {
      styleCounts[s.estilo] = (styleCounts[s.estilo] || 0) + 1;
    });
    const topStyle =
      Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    return { total, faturamento, ticketMedio, topStyle };
  }, [filtered]);

  function getCoverImage(item) {
    const imgs = item.imagens || [];
    const pick =
      imgs.find((i) => i.tipo === 'RESULTADO') ||
      imgs.find((i) => i.tipo === 'ESBOCO') ||
      imgs.find((i) => i.tipo === 'REFERENCIA');
    return pick ? resolveImageUrl(pick.url) : null;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-gothic text-3xl text-white flex items-center gap-2.5 leading-none">
            <CheckCircle2 size={20} className="text-ios-green" />
            <span>Serviços Já Realizados</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Histórico completo e portfólio de tatuagens finalizadas, valores faturados e fotos
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-primary h-9 px-4 text-xs font-semibold shrink-0"
        >
          <Plus size={15} />
          <span>Registrar Tattoo Feita</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tattoos Feitas</span>
            <CheckCircle2 size={16} className="text-ios-green" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Faturado</span>
            <TrendingUp size={16} className="text-apple-blue" />
          </div>
          <div className="text-2xl font-bold text-white">{formatMoney(stats.faturamento)}</div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Ticket Médio</span>
            <Sparkles size={16} className="text-ios-amber" />
          </div>
          <div className="text-2xl font-bold text-white">{formatMoney(stats.ticketMedio)}</div>
        </div>

        <div className="card-apple">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Estilo Destaque</span>
            <Camera size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white truncate">{stats.topStyle}</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card-apple p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, tatuagem, local no corpo..."
              className="input pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={estiloFilter}
            onChange={(e) => setEstiloFilter(e.target.value)}
            className="select h-9 text-xs sm:w-44"
          >
            <option value="TODOS">Todos os Estilos</option>
            {ESTILOS_TATTOO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#0D0B12] p-1 rounded-lg border border-border self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-apple-blue text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <LayoutGrid size={14} /> Portfólio
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-apple-blue text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <List size={14} /> Lista
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="card-apple py-14 text-center text-xs text-text-muted">
          Carregando serviços realizados...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-apple py-14 text-center text-xs text-text-muted">
          Nenhum serviço concluído encontrado. Conclua uma sessão na Agenda para vê-la aqui!
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const cover = getCoverImage(item);
            const totalFotos = (item.imagens || []).length;

            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-surface border border-border hover:border-apple-blue/60 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-52 bg-[#0D0B12] overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={item.titulo}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
                      <Camera size={28} className="opacity-40" />
                      <span className="text-[11px]">Clique para anexar foto final</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {item.estilo}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ios-green/90 text-[#07060A]">
                      {formatMoney(item.valorTotal)}
                    </span>
                  </div>

                  {totalFotos > 0 && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white flex items-center gap-1">
                      <Camera size={11} /> {totalFotos} foto(s)
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-apple-blue transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">{item.cliente?.nome}</p>
                    {item.descricao && (
                      <p className="text-[11px] text-text-muted line-clamp-2 mt-2">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                    <span className="flex items-center gap-1 text-ios-amber truncate">
                      <MapPin size={11} /> {item.localCorpo}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar size={11} /> {formatDateBR(item.dataHora)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-apple p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#0D0B12] text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tattoo</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Local no Corpo</th>
                  <th className="py-3.5 px-4">Estilo / Duração</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-right">Fotos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {filtered.map((item) => {
                  const cover = getCoverImage(item);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="hover:bg-[#1C1728]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cover ? (
                            <img
                              src={cover}
                              alt={item.titulo}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#191426] border border-border flex items-center justify-center text-ios-green shrink-0">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white">{item.titulo}</div>
                            <div className="text-[11px] text-text-muted">#{item.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-text-primary">
                        {item.cliente?.nome}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">{item.localCorpo}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1C1728] text-text-secondary border border-border">
                          {item.estilo}
                        </span>
                        <span className="text-[11px] text-text-muted ml-2">
                          {formatDuracao(item.duracaoMinutos)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        {formatDateBR(item.dataHora)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-ios-green">
                        {formatMoney(item.valorTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-apple-blue font-semibold">
                          <Eye size={13} /> {(item.imagens || []).length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AgendamentoDetailModal
        agendamento={selected}
        onClose={() => setSelected(null)}
        onEdit={(ag) => {
          setSelected(null);
          setEditing(ag);
          setFormOpen(true);
        }}
        onUpdated={(updated) => {
          setSelected(updated);
          fetchServicos();
        }}
        onDeleted={() => fetchServicos()}
      />

      <AgendamentoFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        editingAgendamento={editing}
        defaultStatus="CONCLUIDO"
        onSaved={() => fetchServicos()}
      />
    </div>
  );
}

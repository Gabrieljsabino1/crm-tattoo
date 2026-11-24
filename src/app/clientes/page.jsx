"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  AtSign,
  Edit3,
  Trash2,
  X,
  CalendarDays,
  MapPin,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast';
import AgendamentoDetailModal from '../../components/UI/AgendamentoDetailModal';
import AgendamentoFormModal from '../../components/UI/AgendamentoFormModal';
import {
  STATUS_AGENDAMENTO,
  formatDateTimeBR,
  formatMoney,
} from '../../lib/tattooConstants';

export default function ClientesPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Modal Cadastro/Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    instagram: '',
    cidade: 'Curitiba',
    observacoes: '',
  });

  // Histórico do Cliente
  const [historyClient, setHistoryClient] = useState(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [newAgendamentoModal, setNewAgendamentoModal] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/clientes');
      setClientes(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const filtered = clientes.filter((c) => {
    if (!busca.trim()) return true;
    const t = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(t) ||
      c.telefone.toLowerCase().includes(t) ||
      (c.instagram || '').toLowerCase().includes(t) ||
      (c.cidade || '').toLowerCase().includes(t)
    );
  });

  function openNewModal() {
    setEditingId(null);
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      instagram: '',
      cidade: 'Curitiba',
      observacoes: '',
    });
    setModalOpen(true);
  }

  function openEditModal(c) {
    setEditingId(c.id);
    setFormData({
      nome: c.nome || '',
      telefone: c.telefone || '',
      email: c.email || '',
      instagram: c.instagram || '',
      cidade: c.cidade || 'Curitiba',
      observacoes: c.observacoes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, formData);
        toast('Cliente atualizado!', 'success');
      } else {
        await api.post('/clientes', formData);
        toast('Cliente cadastrado!', 'success');
      }
      setModalOpen(false);
      fetchClientes();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao salvar cliente.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id, nome) {
    if (!confirm(`Deseja remover o cliente ${nome} e todos os seus agendamentos?`)) return;
    try {
      await api.delete(`/clientes/${id}`);
      toast('Cliente removido.', 'success');
      fetchClientes();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao excluir cliente.', 'error');
    }
  }

  async function openHistory(clientId) {
    try {
      const res = await api.get(`/clientes/${clientId}`);
      setHistoryClient(res.data);
    } catch {
      toast('Erro ao carregar histórico do cliente.', 'error');
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-gothic text-3xl text-white flex items-center gap-2.5 leading-none">
            <Users size={20} className="text-apple-blue" />
            <span>Base de Clientes</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Contatos, Instagram, observações de pele/anamnese e histórico de tattoos de cada cliente
          </p>
        </div>

        <button onClick={openNewModal} className="btn-primary h-9 px-4 text-xs font-semibold">
          <Plus size={15} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Busca */}
      <div className="card-apple p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, WhatsApp, @instagram ou cidade..."
            className="input pl-9 h-9 text-xs"
          />
        </div>
        <span className="text-xs text-text-muted hidden sm:block">
          {filtered.length} cliente(s)
        </span>
      </div>

      {/* Tabela (mesmo estilo do imports-curitiba-crm) */}
      <div className="card-apple p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#0D0B12] text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4">Instagram</th>
                <th className="py-3.5 px-4">Cidade</th>
                <th className="py-3.5 px-4 text-center">Sessões / Tattoos</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-text-muted">
                    Carregando clientes...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-text-muted">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const totalAg = c.agendamentos?.length || 0;
                  const concluidas =
                    c.agendamentos?.filter((a) => a.status === 'CONCLUIDO').length || 0;

                  return (
                    <tr key={c.id} className="hover:bg-[#1C1728]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => openHistory(c.id)}
                          className="text-left group"
                        >
                          <div className="font-bold text-white group-hover:text-apple-blue transition-colors">
                            {c.nome}
                          </div>
                          {c.observacoes && (
                            <div className="text-[11px] text-ios-amber flex items-center gap-1 mt-0.5 max-w-xs truncate">
                              <AlertCircle size={11} className="shrink-0" />
                              <span className="truncate">{c.observacoes}</span>
                            </div>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.telefone ? (
                          <a
                            href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ios-green font-medium flex items-center gap-1.5 hover:underline"
                          >
                            <Phone size={13} />
                            <span>{c.telefone}</span>
                          </a>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-purple-400">
                        {c.instagram ? (
                          <a
                            href={`https://instagram.com/${c.instagram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            <AtSign size={13} />
                            {c.instagram.replace(/^@/, '')}
                          </a>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary">{c.cidade || 'Curitiba'}</td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openHistory(c.id)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-apple-blue/15 text-apple-blue hover:bg-apple-blue/25 transition-colors"
                        >
                          {totalAg} sessão(ões) • {concluidas} feita(s)
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openHistory(c.id)}
                            className="p-1.5 text-text-muted hover:text-white hover:bg-[#1C1728] rounded-md transition-colors"
                            title="Ver histórico de tattoos"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-text-muted hover:text-apple-blue hover:bg-[#1C1728] rounded-md transition-colors"
                            title="Editar cliente"
                          >
                            <Edit3 size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(c.id, c.nome)}
                              className="p-1.5 text-text-muted hover:text-ios-red hover:bg-[#1C1728] rounded-md transition-colors"
                              title="Remover cliente"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro / Edição */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onMouseDown={() => setModalOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-modal p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-apple-blue" />
                <span>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Lucas Ferreira"
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="Ex: 41999998888"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="Ex: @lucas.ink"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Ex: Curitiba"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Observações / Anamnese (Alergias, pele, preferências)
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Pele sensível, prefere traço fino 3RL, sem alergia a pigmento vermelho..."
                  className="textarea"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary h-9 px-4 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary h-9 px-5 text-xs font-semibold"
                >
                  {formSubmitting ? 'Salvando...' : editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico de Tattoos do Cliente */}
      {historyClient && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onMouseDown={() => setHistoryClient(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-modal flex flex-col overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border bg-[#0D0B12] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">{historyClient.nome}</h2>
                <p className="text-xs text-text-muted">
                  {historyClient.telefone}{' '}
                  {historyClient.instagram ? `• ${historyClient.instagram}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewAgendamentoModal(true)}
                  className="btn-primary h-8 px-3 text-xs"
                >
                  <CalendarDays size={13} /> Agendar Sessão
                </button>
                <button
                  onClick={() => setHistoryClient(null)}
                  className="text-text-muted hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {historyClient.observacoes && (
                <div className="p-3 rounded-xl bg-ios-amber/10 border border-ios-amber/30 text-xs text-ios-amber flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{historyClient.observacoes}</span>
                </div>
              )}

              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Histórico de Sessões e Tatuagens ({historyClient.agendamentos?.length || 0})
              </h3>

              {!historyClient.agendamentos?.length ? (
                <p className="text-xs text-text-muted py-6 text-center">
                  Este cliente ainda não possui sessões registradas.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {historyClient.agendamentos.map((ag) => {
                    const st = STATUS_AGENDAMENTO[ag.status] || STATUS_AGENDAMENTO.CONFIRMADO;
                    return (
                      <div
                        key={ag.id}
                        onClick={() =>
                          setSelectedAgendamento({ ...ag, cliente: historyClient })
                        }
                        className="p-3.5 rounded-xl bg-[#0D0B12] border border-border hover:border-apple-blue cursor-pointer transition-all flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{ag.titulo}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-3 mt-1">
                            <span>{formatDateTimeBR(ag.dataHora)}</span>
                            <span className="flex items-center gap-1 text-ios-amber">
                              <MapPin size={11} /> {ag.localCorpo}
                            </span>
                            <span>{ag.estilo}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-white">
                            {formatMoney(ag.valorTotal)}
                          </div>
                          <div className="text-[10px] text-apple-blue">
                            {(ag.imagens || []).length} foto(s)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AgendamentoDetailModal
        agendamento={selectedAgendamento}
        onClose={() => setSelectedAgendamento(null)}
        onUpdated={(updated) => {
          setSelectedAgendamento(updated);
          if (historyClient) openHistory(historyClient.id);
          fetchClientes();
        }}
        onDeleted={() => {
          if (historyClient) openHistory(historyClient.id);
          fetchClientes();
        }}
      />

      <AgendamentoFormModal
        isOpen={newAgendamentoModal}
        onClose={() => setNewAgendamentoModal(false)}
        defaultClienteId={historyClient?.id || ''}
        onSaved={() => {
          if (historyClient) openHistory(historyClient.id);
          fetchClientes();
        }}
      />
    </div>
  );
}

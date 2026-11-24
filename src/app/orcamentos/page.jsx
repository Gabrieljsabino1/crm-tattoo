"use client";

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ClipboardList,
  Plus,
  MapPin,
  Sparkles,
  Phone,
  CalendarPlus,
  Trash2,
  X,
} from 'lucide-react';
import { api, resolveImageUrl } from '../../services/api';
import { useToast } from '../../components/UI/Toast';
import {
  ESTILOS_TATTOO,
  LOCAIS_CORPO,
  formatMoney,
  toLocalDateTimeInput,
} from '../../lib/tattooConstants';

const COLUMNS = [
  { id: 'NOVO_PEDIDO', title: 'Novo Pedido', accent: 'text-apple-blue', dot: 'bg-apple-blue' },
  { id: 'ORCAMENTO_ENVIADO', title: 'Orçamento Enviado', accent: 'text-purple-400', dot: 'bg-purple-400' },
  { id: 'AGUARDANDO_SINAL', title: 'Aguardando Sinal', accent: 'text-ios-amber', dot: 'bg-ios-amber' },
  { id: 'AGENDADO', title: 'Agendado', accent: 'text-ios-green', dot: 'bg-ios-green' },
];

export default function OrcamentosPage() {
  const toast = useToast();
  const [orcamentos, setOrcamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    clienteId: '',
    localCorpo: 'Antebraço (parte externa)',
    estilo: 'Blackwork',
    tamanhoCm: '',
    valorEstimado: '',
    descricao: '',
    status: 'NOVO_PEDIDO',
  });
  const [refFile, setRefFile] = useState(null);

  // Modal de conversão para Agendamento
  const [convertTarget, setConvertTarget] = useState(null);
  const [convertForm, setConvertForm] = useState({
    dataHora: toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    duracaoMinutos: 120,
    valorSinal: '',
    sinalPago: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [orcRes, cliRes] = await Promise.all([api.get('/orcamentos'), api.get('/clientes')]);
      setOrcamentos(orcRes.data || []);
      setClientes(cliRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function onDragEnd(result) {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    setOrcamentos((prev) =>
      prev.map((o) => (o.id === draggableId ? { ...o, status: newStatus } : o))
    );

    try {
      await api.patch(`/orcamentos/${draggableId}`, { status: newStatus });
    } catch {
      toast('Erro ao mover orçamento.', 'error');
      fetchData();
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (refFile) fd.append('imagem', refFile);

      await api.post('/orcamentos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast('Pedido de orçamento criado!', 'success');
      setModalOpen(false);
      setRefFile(null);
      setForm({
        titulo: '',
        clienteId: '',
        localCorpo: 'Antebraço (parte externa)',
        estilo: 'Blackwork',
        tamanhoCm: '',
        valorEstimado: '',
        descricao: '',
        status: 'NOVO_PEDIDO',
      });
      fetchData();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao criar orçamento.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este pedido de orçamento?')) return;
    try {
      await api.delete(`/orcamentos/${id}`);
      setOrcamentos((prev) => prev.filter((o) => o.id !== id));
      toast('Orçamento removido.', 'success');
    } catch {
      toast('Erro ao remover orçamento.', 'error');
    }
  }

  async function handleConvert(e) {
    e.preventDefault();
    if (!convertTarget) return;
    try {
      await api.post(`/orcamentos/${convertTarget.id}/converter`, {
        dataHora: new Date(convertForm.dataHora).toISOString(),
        duracaoMinutos: Number(convertForm.duracaoMinutos) || 120,
        valorSinal: Number(convertForm.valorSinal) || 0,
        sinalPago: Boolean(convertForm.sinalPago),
      });
      toast('Orçamento convertido em sessão na Agenda!', 'success');
      setConvertTarget(null);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao agendar orçamento.', 'error');
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-gothic text-3xl text-white flex items-center gap-2.5 leading-none">
            <ClipboardList size={20} className="text-apple-blue" />
            <span>Funil de Orçamentos</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize pedidos vindos do WhatsApp e Instagram até o pagamento do sinal e agendamento
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary h-9 px-4 text-xs font-semibold shrink-0"
        >
          <Plus size={15} />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="card-apple py-14 text-center text-xs text-text-muted">
          Carregando funil...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const items = orcamentos.filter((o) => o.status === col.id);
              const totalCol = items.reduce((acc, o) => acc + Number(o.valorEstimado || 0), 0);

              return (
                <div
                  key={col.id}
                  className="bg-[#0D0B12] border border-border rounded-2xl p-3 flex flex-col min-h-[360px]"
                >
                  <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                        {col.title}
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-bold text-text-secondary">
                      {items.length}
                    </span>
                  </div>
                  <div className="px-1 mb-3 text-[11px] text-text-muted">
                    Estimado: <strong className="text-white">{formatMoney(totalCol)}</strong>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2.5 rounded-xl transition-colors min-h-[120px] ${
                          snapshot.isDraggingOver ? 'bg-apple-blue/5' : ''
                        }`}
                      >
                        {items.map((item, idx) => (
                          <Draggable key={item.id} draggableId={item.id} index={idx}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="bg-surface border border-border hover:border-border-hover rounded-xl p-3.5 space-y-2.5 shadow-card"
                              >
                                {item.imagemReferenciaUrl && (
                                  <img
                                    src={resolveImageUrl(item.imagemReferenciaUrl)}
                                    alt={item.titulo}
                                    className="w-full h-28 object-cover rounded-lg border border-border"
                                  />
                                )}
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-xs font-bold text-white leading-snug">
                                    {item.titulo}
                                  </h3>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-text-muted hover:text-ios-red p-0.5"
                                    title="Remover"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                <p className="text-[11px] font-medium text-text-secondary">
                                  {item.cliente?.nome}
                                </p>

                                {item.descricao && (
                                  <p className="text-[11px] text-text-muted line-clamp-2">
                                    {item.descricao}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                                  {item.localCorpo && (
                                    <span className="flex items-center gap-1 text-ios-amber">
                                      <MapPin size={10} /> {item.localCorpo}
                                    </span>
                                  )}
                                  {item.estilo && (
                                    <span className="flex items-center gap-1">
                                      <Sparkles size={10} className="text-apple-blue" /> {item.estilo}
                                    </span>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-white">
                                    {formatMoney(item.valorEstimado)}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    {item.cliente?.telefone && (
                                      <a
                                        href={`https://wa.me/55${item.cliente.telefone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-ios-green/10 text-ios-green hover:bg-ios-green/20"
                                        title="Abrir WhatsApp"
                                      >
                                        <Phone size={12} />
                                      </a>
                                    )}
                                    {item.status !== 'AGENDADO' && (
                                      <button
                                        onClick={() => {
                                          setConvertTarget(item);
                                          setConvertForm({
                                            dataHora: toLocalDateTimeInput(
                                              new Date(Date.now() + 24 * 60 * 60 * 1000)
                                            ),
                                            duracaoMinutos: 120,
                                            valorSinal: Math.round((item.valorEstimado || 0) * 0.25) || '',
                                            sinalPago: true,
                                          });
                                        }}
                                        className="px-2 py-1 rounded-lg bg-apple-blue/15 text-apple-blue hover:bg-apple-blue hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                      >
                                        <CalendarPlus size={11} /> Agendar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Modal Novo Orçamento */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setModalOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-modal p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList size={18} className="text-apple-blue" />
                <span>Novo Pedido de Orçamento</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Cliente *</label>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className="select"
                  required
                >
                  <option value="">Selecione o cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.telefone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Ideia da Tattoo *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Fênix nas Costas, Cobertura no Braço..."
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Local no Corpo
                  </label>
                  <select
                    value={form.localCorpo}
                    onChange={(e) => setForm({ ...form, localCorpo: e.target.value })}
                    className="select"
                  >
                    {LOCAIS_CORPO.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Estilo</label>
                  <select
                    value={form.estilo}
                    onChange={(e) => setForm({ ...form, estilo: e.target.value })}
                    className="select"
                  >
                    {ESTILOS_TATTOO.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Tamanho Aprox.
                  </label>
                  <input
                    type="text"
                    value={form.tamanhoCm}
                    onChange={(e) => setForm({ ...form, tamanhoCm: e.target.value })}
                    placeholder="Ex: 20 cm"
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorEstimado}
                    onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })}
                    placeholder="900"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Descrição / Observações
                </label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="O que o cliente mandou no WhatsApp/Direct..."
                  className="textarea"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Foto de Referência (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefFile(e.target.files?.[0] || null)}
                  className="input pt-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary h-9">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary h-9">
                  {submitting ? 'Salvando...' : 'Criar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Converter em Agendamento */}
      {convertTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setConvertTarget(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-modal p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarPlus size={18} className="text-ios-green" />
                <span>Agendar Orçamento</span>
              </h2>
              <button onClick={() => setConvertTarget(null)} className="text-text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Convertendo <strong className="text-white">{convertTarget.titulo}</strong> de{' '}
              <strong className="text-white">{convertTarget.cliente?.nome}</strong> em horário na agenda.
            </p>

            <form onSubmit={handleConvert} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Data e Horário da Sessão *
                </label>
                <input
                  type="datetime-local"
                  value={convertForm.dataHora}
                  onChange={(e) => setConvertForm({ ...convertForm, dataHora: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    step="30"
                    value={convertForm.duracaoMinutos}
                    onChange={(e) => setConvertForm({ ...convertForm, duracaoMinutos: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Valor do Sinal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={convertForm.valorSinal}
                    onChange={(e) => setConvertForm({ ...convertForm, valorSinal: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={convertForm.sinalPago}
                  onChange={(e) => setConvertForm({ ...convertForm, sinalPago: e.target.checked })}
                  className="w-4 h-4 accent-apple-blue"
                />
                <span>Sinal já pago (confirmar horário)</span>
              </label>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConvertTarget(null)}
                  className="btn-secondary h-9"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary h-9">
                  Confirmar na Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { X, CalendarDays, UserPlus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from './Toast';
import ImageDropzone from './ImageDropzone';
import {
  ESTILOS_TATTOO,
  LOCAIS_CORPO,
  DURACOES_SESSAO,
  FORMAS_PAGAMENTO,
  toLocalDateTimeInput,
} from '../../lib/tattooConstants';

export default function AgendamentoFormModal({
  isOpen,
  onClose,
  onSaved,
  editingAgendamento = null,
  defaultDate = null,
  defaultClienteId = '',
  defaultStatus = 'CONFIRMADO',
}) {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [tatuadores, setTatuadores] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Quick inline client creation
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClient, setQuickClient] = useState({ nome: '', telefone: '', instagram: '' });
  const [creatingClient, setCreatingClient] = useState(false);

  // Pending images to upload right after creating/updating
  const [refFiles, setRefFiles] = useState([]);
  const [esbocoFiles, setEsbocoFiles] = useState([]);
  const [resultadoFiles, setResultadoFiles] = useState([]);

  const [form, setForm] = useState({
    clienteId: '',
    tatuadorId: '',
    titulo: '',
    descricao: '',
    dataHora: '',
    duracaoMinutos: 120,
    localCorpo: 'Antebraço (parte externa)',
    localCorpoCustom: '',
    estilo: 'Lettering',
    tamanhoCm: '',
    valorTotal: '',
    valorSinal: '',
    sinalPago: false,
    formaPagamento: 'PIX',
    status: 'CONFIRMADO',
    observacoesSessao: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    async function loadOptions() {
      try {
        const [cliRes, usrRes] = await Promise.all([api.get('/clientes'), api.get('/users')]);
        if (!active) return;
        setClientes(cliRes.data || []);
        setTatuadores(usrRes.data || []);
      } catch {
        // Silencioso
      }
    }
    loadOptions();

    setRefFiles([]);
    setEsbocoFiles([]);
    setResultadoFiles([]);
    setQuickClientOpen(false);

    if (editingAgendamento) {
      const isKnownLocation = LOCAIS_CORPO.includes(editingAgendamento.localCorpo);
      setForm({
        clienteId: editingAgendamento.clienteId || '',
        tatuadorId: editingAgendamento.tatuadorId || '',
        titulo: editingAgendamento.titulo || '',
        descricao: editingAgendamento.descricao || '',
        dataHora: toLocalDateTimeInput(editingAgendamento.dataHora),
        duracaoMinutos: editingAgendamento.duracaoMinutos || 120,
        localCorpo: isKnownLocation ? editingAgendamento.localCorpo : 'Outro',
        localCorpoCustom: isKnownLocation ? '' : editingAgendamento.localCorpo || '',
        estilo: editingAgendamento.estilo || 'Blackwork',
        tamanhoCm: editingAgendamento.tamanhoCm || '',
        valorTotal: editingAgendamento.valorTotal ?? '',
        valorSinal: editingAgendamento.valorSinal ?? '',
        sinalPago: Boolean(editingAgendamento.sinalPago),
        formaPagamento: editingAgendamento.formaPagamento || 'PIX',
        status: editingAgendamento.status || 'CONFIRMADO',
        observacoesSessao: editingAgendamento.observacoesSessao || '',
      });
    } else {
      const base = defaultDate ? new Date(defaultDate) : new Date();
      if (!defaultDate && defaultStatus !== 'CONCLUIDO') {
        base.setHours(base.getHours() + 1, 0, 0, 0);
      } else if (defaultDate) {
        base.setHours(14, 0, 0, 0);
      }
      setForm({
        clienteId: defaultClienteId || '',
        tatuadorId: '',
        titulo: '',
        descricao: '',
        dataHora: toLocalDateTimeInput(base),
        duracaoMinutos: 120,
        localCorpo: 'Antebraço (parte externa)',
        localCorpoCustom: '',
        estilo: 'Lettering',
        tamanhoCm: '',
        valorTotal: '',
        valorSinal: '',
        sinalPago: defaultStatus === 'CONCLUIDO',
        formaPagamento: 'PIX',
        status: defaultStatus || 'CONFIRMADO',
        observacoesSessao: '',
      });
    }

    return () => {
      active = false;
    };
  }, [isOpen, editingAgendamento, defaultDate, defaultClienteId, defaultStatus]);

  if (!isOpen) return null;

  async function handleCreateQuickClient() {
    if (!quickClient.nome.trim() || !quickClient.telefone.trim()) {
      toast('Informe nome e WhatsApp do cliente.', 'warning');
      return;
    }
    setCreatingClient(true);
    try {
      const res = await api.post('/clientes', quickClient);
      const created = res.data;
      setClientes((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, clienteId: created.id }));
      setQuickClient({ nome: '', telefone: '', instagram: '' });
      setQuickClientOpen(false);
      toast(`Cliente ${created.nome} cadastrado!`, 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao cadastrar cliente.', 'error');
    } finally {
      setCreatingClient(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clienteId) {
      toast('Selecione ou cadastre um cliente.', 'warning');
      return;
    }

    const finalLocal =
      form.localCorpo === 'Outro'
        ? form.localCorpoCustom.trim() || 'Outro local'
        : form.localCorpo;

    setSubmitting(true);
    try {
      const payload = {
        clienteId: form.clienteId,
        tatuadorId: form.tatuadorId || undefined,
        titulo: form.titulo,
        descricao: form.descricao,
        dataHora: new Date(form.dataHora).toISOString(),
        duracaoMinutos: Number(form.duracaoMinutos) || 120,
        localCorpo: finalLocal,
        estilo: form.estilo,
        tamanhoCm: form.tamanhoCm,
        valorTotal: Number(form.valorTotal) || 0,
        valorSinal: Number(form.valorSinal) || 0,
        sinalPago: Boolean(form.sinalPago),
        formaPagamento: form.formaPagamento,
        status: form.status,
        observacoesSessao: form.observacoesSessao,
      };

      let saved;
      if (editingAgendamento) {
        const res = await api.put(`/agendamentos/${editingAgendamento.id}`, payload);
        saved = res.data;
      } else {
        const res = await api.post('/agendamentos', payload);
        saved = res.data;
      }

      const uploadBatch = async (files, tipo) => {
        if (!files.length) return;
        const fd = new FormData();
        fd.append('tipo', tipo);
        files.forEach((f) => fd.append('imagens', f));
        const imgRes = await api.post(`/agendamentos/${saved.id}/imagens`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        saved = imgRes.data.agendamento;
      };

      await uploadBatch(refFiles, 'REFERENCIA');
      await uploadBatch(esbocoFiles, 'ESBOCO');
      await uploadBatch(resultadoFiles, 'RESULTADO');

      toast(
        editingAgendamento
          ? 'Agendamento atualizado!'
          : form.status === 'CONCLUIDO'
          ? 'Serviço realizado registrado!'
          : 'Sessão agendada com sucesso!',
        'success'
      );
      onSaved?.(saved);
      onClose();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao salvar agendamento.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] shadow-modal flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border bg-[#0D0B12] flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-apple-blue" />
            <span>
              {editingAgendamento
                ? 'Editar Agendamento'
                : defaultStatus === 'CONCLUIDO'
                ? 'Registrar Serviço Já Realizado'
                : 'Novo Agendamento de Tattoo'}
            </span>
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Cliente + Cadastro Rápido */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary">Cliente *</label>
              <button
                type="button"
                onClick={() => setQuickClientOpen((v) => !v)}
                className="text-[11px] font-semibold text-apple-blue hover:underline flex items-center gap-1"
              >
                <UserPlus size={12} />
                {quickClientOpen ? 'Fechar cadastro rápido' : '+ Cadastrar cliente rápido'}
              </button>
            </div>

            {!quickClientOpen ? (
              <select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                className="select"
                required
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.telefone} {c.instagram ? `(${c.instagram})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-apple-blue/40 space-y-3">
                <p className="text-[11px] font-semibold text-apple-blue uppercase tracking-wider">
                  Novo Cliente Rápido
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nome completo *"
                    value={quickClient.nome}
                    onChange={(e) => setQuickClient({ ...quickClient, nome: e.target.value })}
                    className="input h-9"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp *"
                    value={quickClient.telefone}
                    onChange={(e) => setQuickClient({ ...quickClient, telefone: e.target.value })}
                    className="input h-9"
                  />
                  <input
                    type="text"
                    placeholder="@instagram"
                    value={quickClient.instagram}
                    onChange={(e) => setQuickClient({ ...quickClient, instagram: e.target.value })}
                    className="input h-9"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={creatingClient}
                    onClick={handleCreateQuickClient}
                    className="btn-primary h-8 px-3 text-xs"
                  >
                    {creatingClient ? 'Salvando...' : 'Salvar e Selecionar Cliente'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Título e Estilo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-text-secondary block mb-1">
                O que vai tatuar? (Título) *
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Leão Geométrico, Rosa Fine Line, Dragão Oriental..."
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Estilo</label>
              <select
                value={form.estilo}
                onChange={(e) => setForm({ ...form, estilo: e.target.value })}
                className="select"
              >
                {ESTILOS_TATTOO.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data/Hora, Duração e Tatuador */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Data e Horário *
              </label>
              <input
                type="datetime-local"
                value={form.dataHora}
                onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Duração</label>
              <select
                value={form.duracaoMinutos}
                onChange={(e) => setForm({ ...form, duracaoMinutos: Number(e.target.value) })}
                className="select"
              >
                {DURACOES_SESSAO.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Tatuador</label>
              <select
                value={form.tatuadorId}
                onChange={(e) => setForm({ ...form, tatuadorId: e.target.value })}
                className="select"
              >
                <option value="">Padrão (Logado)</option>
                {tatuadores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Local no Corpo & Tamanho */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={form.localCorpo === 'Outro' ? 'sm:col-span-1' : 'sm:col-span-2'}>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Local no Corpo *
              </label>
              <select
                value={form.localCorpo}
                onChange={(e) => setForm({ ...form, localCorpo: e.target.value })}
                className="select"
              >
                {LOCAIS_CORPO.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {form.localCorpo === 'Outro' && (
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Qual local? *
                </label>
                <input
                  type="text"
                  value={form.localCorpoCustom}
                  onChange={(e) => setForm({ ...form, localCorpoCustom: e.target.value })}
                  placeholder="Ex: Clavícula esquerda"
                  className="input"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Tamanho Aprox.
              </label>
              <input
                type="text"
                value={form.tamanhoCm}
                onChange={(e) => setForm({ ...form, tamanhoCm: e.target.value })}
                placeholder="Ex: 15 cm"
                className="input"
              />
            </div>
          </div>

          {/* Descrição da Ideia */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Descrição / Detalhes da Tattoo
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Detalhes da ideia, cores, tipo de sombreado, se é cobertura, referências do cliente..."
              className="textarea"
            />
          </div>

          {/* Financeiro & Status */}
          <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-border space-y-3">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Valores, Sinal & Status
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorTotal}
                  onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                  placeholder="800"
                  className="input h-9"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Valor Sinal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorSinal}
                  onChange={(e) => setForm({ ...form, valorSinal: e.target.value })}
                  placeholder="200"
                  className="input h-9"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Pagamento</label>
                <select
                  value={form.formaPagamento}
                  onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
                  className="select h-9"
                >
                  {FORMAS_PAGAMENTO.map((fp) => (
                    <option key={fp} value={fp}>
                      {fp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-text-secondary block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="select h-9"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em Sessão</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.sinalPago}
                onChange={(e) => setForm({ ...form, sinalPago: e.target.checked })}
                className="w-4 h-4 rounded accent-apple-blue"
              />
              <span>Sinal já foi pago pelo cliente</span>
            </label>
          </div>

          {/* Anexar Fotos */}
          <div className={`grid grid-cols-1 ${form.status === 'CONCLUIDO' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
            <div className="space-y-2">
              <ImageDropzone
                compact
                label="Fotos de Referência"
                hint="Anexar referências"
                onFilesSelected={(files) => setRefFiles((prev) => [...prev, ...files])}
                onError={(m) => toast(m, 'error')}
              />
              {refFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {refFiles.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1C1728] text-[11px] text-text-primary border border-border"
                    >
                      <span className="truncate max-w-[110px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setRefFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-text-muted hover:text-ios-red"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <ImageDropzone
                compact
                label="Esboço / Decalque"
                hint="Anexar esboço"
                onFilesSelected={(files) => setEsbocoFiles((prev) => [...prev, ...files])}
                onError={(m) => toast(m, 'error')}
              />
              {esbocoFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {esbocoFiles.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1C1728] text-[11px] text-text-primary border border-border"
                    >
                      <span className="truncate max-w-[110px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setEsbocoFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-text-muted hover:text-ios-red"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {form.status === 'CONCLUIDO' && (
              <div className="space-y-2">
                <ImageDropzone
                  compact
                  label="Foto da Tattoo Pronta"
                  hint="Anexar resultado"
                  onFilesSelected={(files) => setResultadoFiles((prev) => [...prev, ...files])}
                  onError={(m) => toast(m, 'error')}
                />
                {resultadoFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {resultadoFiles.map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1C1728] text-[11px] text-text-primary border border-border"
                      >
                        <span className="truncate max-w-[110px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setResultadoFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-text-muted hover:text-ios-red"
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notas Técnicas */}
          {(editingAgendamento || form.status === 'CONCLUIDO') && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Notas Técnicas / Pós-Sessão (Agulhas, Tintas, Retoque)
              </label>
              <textarea
                value={form.observacoesSessao}
                onChange={(e) => setForm({ ...form, observacoesSessao: e.target.value })}
                placeholder="Ex: 3RL + 7RL, Dynamic Black. Retoque opcional em 40 dias."
                className="textarea min-h-[64px]"
              />
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary h-9 px-4 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary h-9 px-5 text-xs font-semibold"
            >
              {submitting
                ? 'Salvando...'
                : editingAgendamento
                ? 'Atualizar Agendamento'
                : form.status === 'CONCLUIDO'
                ? 'Salvar Serviço Feito'
                : 'Agendar Sessão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

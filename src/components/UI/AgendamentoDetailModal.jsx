"use client";

import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ruler,
  Phone,
  AtSign,
  CheckCircle2,
  Edit3,
  Trash2,
  ZoomIn,
  FileImage,
  Palette,
  Camera,
  Wallet,
  Play,
  AlertCircle,
  ShieldCheck,
  Copy,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { api, resolveImageUrl } from '../../services/api';
import { useToast } from './Toast';
import ImageDropzone from './ImageDropzone';
import ImageLightbox from './ImageLightbox';
import {
  STATUS_AGENDAMENTO,
  formatDateTimeBR,
  formatDuracao,
  formatMoney,
} from '../../lib/tattooConstants';

const IMAGE_TABS = [
  { key: 'REFERENCIA', label: 'Referências', icon: FileImage, hint: 'Adicionar foto de referência (clique, arraste ou Ctrl+V)' },
  { key: 'ESBOCO', label: 'Esboço / Decalque', icon: Palette, hint: 'Adicionar esboço ou arte final (clique, arraste ou Ctrl+V)' },
  { key: 'RESULTADO', label: 'Tattoo Pronta', icon: Camera, hint: 'Adicionar foto da tatuagem concluída / cicatrizada' },
];

export default function AgendamentoDetailModal({
  agendamento,
  onClose,
  onEdit,
  onUpdated,
  onDeleted,
}) {
  const toast = useToast();
  const [activeImgTab, setActiveImgTab] = useState(() => {
    if (agendamento?.status === 'CONCLUIDO') return 'RESULTADO';
    return 'REFERENCIA';
  });
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [legenda, setLegenda] = useState('');

  if (!agendamento) return null;

  const statusMeta = STATUS_AGENDAMENTO[agendamento.status] || STATUS_AGENDAMENTO.CONFIRMADO;
  const imagens = agendamento.imagens || [];
  const filteredImages = imagens.filter((img) => img.tipo === activeImgTab);

  const restante = Math.max(
    0,
    Number(agendamento.valorTotal || 0) - (agendamento.sinalPago ? Number(agendamento.valorSinal || 0) : 0)
  );

  const countByType = (tipo) => imagens.filter((i) => i.tipo === tipo).length;

  async function handleUploadFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('tipo', activeImgTab);
      if (legenda.trim()) formData.append('legenda', legenda.trim());
      files.forEach((f) => formData.append('imagens', f));

      const res = await api.post(`/agendamentos/${agendamento.id}/imagens`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLegenda('');
      toast('Imagem anexada com sucesso!', 'success');
      onUpdated?.(res.data.agendamento);
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao enviar imagem.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(imgId, e) {
    e.stopPropagation();
    if (!confirm('Remover esta imagem do agendamento?')) return;
    try {
      const res = await api.delete(`/agendamentos/${agendamento.id}/imagens/${imgId}`);
      toast('Imagem removida.', 'success');
      onUpdated?.(res.data.agendamento);
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao remover imagem.', 'error');
    }
  }

  async function handleQuickPatch(payload, successMsg) {
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/agendamentos/${agendamento.id}`, payload);
      toast(successMsg, 'success');
      onUpdated?.(res.data);
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao atualizar sessão.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o agendamento "${agendamento.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await api.delete(`/agendamentos/${agendamento.id}`);
      toast('Agendamento excluído.', 'success');
      onDeleted?.(agendamento.id);
      onClose();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao excluir agendamento.', 'error');
    }
  }

  const activeTabMeta = IMAGE_TABS.find((t) => t.key === activeImgTab) || IMAGE_TABS[0];
  const whatsappClean = (agendamento.cliente?.telefone || '').replace(/\D/g, '');
  const instaHandle = (agendamento.cliente?.instagram || '').replace(/^@/, '');
  const comprovanteUrl =
    agendamento.tokenReserva && typeof window !== 'undefined'
      ? `${window.location.origin}/comprovante/${agendamento.tokenReserva}`
      : agendamento.tokenReserva
      ? `/comprovante/${agendamento.tokenReserva}`
      : '';

  async function handleCopyComprovante() {
    if (!comprovanteUrl) return;
    try {
      await navigator.clipboard.writeText(comprovanteUrl);
      toast('Link do comprovante copiado!', 'success');
    } catch {
      toast('Não foi possível copiar o link.', 'error');
    }
  }

  const whatsappComprovanteText = encodeURIComponent(
    `Olá ${agendamento.cliente?.nome || ''}! Segue o comprovante oficial da sua reserva na Gullart Lettering:\n` +
      `Protocolo: ${agendamento.codigoReserva || `#${agendamento.codigo}`}\n` +
      `Data e Horário: ${formatDateTimeBR(agendamento.dataHora)}\n` +
      `Sessão: ${agendamento.titulo}\n` +
      `Acesse seu comprovante aqui: ${comprovanteUrl}`
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onMouseDown={onClose}
      >
        <div
          className="bg-surface border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-modal flex flex-col overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="px-5 py-4 border-b border-border bg-[#0D0B12] flex items-start justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-text-muted">#{agendamento.codigo}</span>
                {agendamento.codigoReserva && (
                  <span className="text-[11px] font-mono text-apple-blue font-semibold">
                    {agendamento.codigoReserva}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1C1728] text-text-secondary border border-border">
                  {agendamento.estilo}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-snug truncate">
                {agendamento.titulo}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit?.(agendamento)}
                className="p-2 rounded-lg bg-[#1C1728] border border-border text-text-secondary hover:text-apple-blue transition-colors"
                title="Editar agendamento"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-[#1C1728] border border-border text-text-secondary hover:text-ios-red transition-colors"
                title="Excluir agendamento"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-[#1C1728] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conteúdo com Scroll */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Barra de Prova de Reserva / Comprovante */}
            {agendamento.tokenReserva && (
              <div className="p-3.5 rounded-xl bg-apple-blue/10 border border-apple-blue/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <ShieldCheck
                    size={17}
                    className={`shrink-0 mt-0.5 ${
                      agendamento.confirmadoPeloCliente ? 'text-ios-green' : 'text-apple-blue'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-white">
                      {agendamento.confirmadoPeloCliente
                        ? 'Reserva Confirmada pelo Cliente'
                        : 'Comprovante de Reserva Disponível'}
                      {agendamento.origem === 'LINK_PUBLICO' ? ' • Pré-cadastro Online' : ''}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {agendamento.confirmadoPeloClienteEm
                        ? `Confirmado digitalmente em ${formatDateTimeBR(agendamento.confirmadoPeloClienteEm)}`
                        : 'Envie o link do comprovante para o cliente confirmar presença e guardar como prova do horário.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyComprovante}
                    className="px-2.5 py-1.5 rounded-lg bg-[#13101B] border border-border text-[11px] font-semibold text-white hover:border-apple-blue inline-flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} /> Copiar Link
                  </button>
                  <a
                    href={`/comprovante/${agendamento.tokenReserva}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#13101B] border border-border text-[11px] font-semibold text-purple-300 hover:border-apple-blue inline-flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={12} /> Abrir
                  </a>
                  {whatsappClean && (
                    <a
                      href={`https://wa.me/55${whatsappClean}?text=${whatsappComprovanteText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-ios-green/15 border border-ios-green/30 text-[11px] font-semibold text-ios-green hover:bg-ios-green/25 inline-flex items-center gap-1 transition-colors"
                    >
                      <Share2 size={12} /> Enviar
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Grid Superior: Informações da Sessão & Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalhes da Tattoo & Horário */}
              <div className="p-4 rounded-xl bg-[#0D0B12] border border-border space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Detalhes da Sessão
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-apple-blue mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Data e Horário</span>
                      <span className="font-semibold text-white">
                        {formatDateTimeBR(agendamento.dataHora)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-apple-blue mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Duração Estimada</span>
                      <span className="font-semibold text-white">
                        {formatDuracao(agendamento.duracaoMinutos)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-ios-amber mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Local no Corpo</span>
                      <span className="font-semibold text-white">{agendamento.localCorpo}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Ruler size={14} className="text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Tamanho Aprox.</span>
                      <span className="font-semibold text-white">
                        {agendamento.tamanhoCm || 'A definir'}
                      </span>
                    </div>
                  </div>
                </div>
                {agendamento.tatuador && (
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="text-text-muted">Tatuador responsável</span>
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <Sparkles size={12} className="text-apple-blue" />
                      {agendamento.tatuador.nome}
                    </span>
                  </div>
                )}
              </div>

              {/* Card do Cliente & Valores */}
              <div className="p-4 rounded-xl bg-[#0D0B12] border border-border flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                    Cliente
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{agendamento.cliente?.nome}</p>
                      <p className="text-[11px] text-text-muted">{agendamento.cliente?.cidade || 'Curitiba'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {whatsappClean && (
                        <a
                          href={`https://wa.me/55${whatsappClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-ios-green/15 text-ios-green border border-ios-green/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-ios-green/25 transition-colors"
                        >
                          <Phone size={12} /> WhatsApp
                        </a>
                      )}
                      {instaHandle && (
                        <a
                          href={`https://instagram.com/${instaHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-purple-500/25 transition-colors"
                        >
                          <AtSign size={12} /> {instaHandle}
                        </a>
                      )}
                    </div>
                  </div>
                  {agendamento.cliente?.observacoes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-ios-amber/10 border border-ios-amber/20 text-[11px] text-ios-amber flex items-start gap-1.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{agendamento.cliente.observacoes}</span>
                    </div>
                  )}
                </div>

                {/* Financeiro da Sessão */}
                <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-text-muted block">Valor da Tattoo</span>
                    <span className="text-base font-bold text-white">
                      {formatMoney(agendamento.valorTotal)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block">
                      Sinal ({formatMoney(agendamento.valorSinal)}){' '}
                      {agendamento.sinalPago ? (
                        <span className="text-ios-green font-semibold">• Pago</span>
                      ) : agendamento.valorSinal > 0 ? (
                        <span className="text-ios-amber font-semibold">• Pendente</span>
                      ) : null}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary">
                      Restante: <strong className="text-white">{formatMoney(restante)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição da Ideia */}
            <div className="p-4 rounded-xl bg-[#0D0B12] border border-border">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Descrição / Ideia do Cliente
              </h3>
              <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                {agendamento.descricao || 'Nenhuma descrição informada.'}
              </p>
              {agendamento.observacoesSessao && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ios-green block mb-1">
                    Notas Técnicas / Pós-Sessão
                  </span>
                  <p className="text-xs text-text-secondary whitespace-pre-wrap">
                    {agendamento.observacoesSessao}
                  </p>
                </div>
              )}
            </div>

            {/* Galeria Visual: Referência / Esboço / Tattoo Pronta */}
            <div className="p-4 rounded-xl bg-[#0D0B12] border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Fotos da Tattoo, Referências & Esboços
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Clique em qualquer imagem para ampliar em tela cheia
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#07060A] p-1 rounded-xl border border-border">
                  {IMAGE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = countByType(tab.key);
                    const active = activeImgTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveImgTab(tab.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-apple-blue text-white shadow-sm'
                            : 'text-text-secondary hover:text-white'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            active ? 'bg-white/20 text-white' : 'bg-[#1C1728] text-text-muted'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Imagens */}
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredImages.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImg(img)}
                      className="group relative rounded-xl overflow-hidden bg-[#13101B] border border-border hover:border-apple-blue transition-all cursor-zoom-in aspect-square"
                    >
                      <img
                        src={resolveImageUrl(img.url)}
                        alt={img.legenda || agendamento.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                        <div className="flex justify-end gap-1.5">
                          <span className="p-1.5 rounded-lg bg-black/60 text-white">
                            <ZoomIn size={13} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteImage(img.id, e)}
                            className="p-1.5 rounded-lg bg-ios-red/80 text-white hover:bg-ios-red"
                            title="Remover imagem"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {img.legenda && (
                          <p className="text-[11px] text-white font-medium line-clamp-2">
                            {img.legenda}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center rounded-xl bg-[#07060A]/60 border border-dashed border-border text-xs text-text-muted">
                  Nenhuma imagem em <strong>{activeTabMeta.label}</strong> ainda.
                </div>
              )}

              {/* Upload Rápido */}
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  placeholder="Legenda opcional (ex: Decalque 15cm, Foto cicatrizada 30 dias...)"
                  className="input h-8 text-xs"
                />
                <ImageDropzone
                  compact
                  disabled={uploading}
                  hint={uploading ? 'Enviando imagem...' : activeTabMeta.hint}
                  onFilesSelected={handleUploadFiles}
                  onError={(msg) => toast(msg, 'error')}
                />
              </div>
            </div>
          </div>

          {/* Rodapé de Ações Rápidas */}
          <div className="px-5 py-3.5 border-t border-border bg-[#0D0B12] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              {agendamento.valorSinal > 0 && !agendamento.sinalPago && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    handleQuickPatch(
                      { sinalPago: true, status: agendamento.status === 'PENDENTE' ? 'CONFIRMADO' : agendamento.status },
                      'Sinal marcado como pago!'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-ios-amber/15 text-ios-amber border border-ios-amber/30 hover:bg-ios-amber/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Wallet size={14} /> Confirmar Sinal Pago
                </button>
              )}

              {agendamento.status === 'PENDENTE' && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleQuickPatch({ status: 'CONFIRMADO' }, 'Horário confirmado!')}
                  className="btn-secondary h-8 px-3 text-xs"
                >
                  Confirmar Horário
                </button>
              )}

              {agendamento.status === 'CONFIRMADO' && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleQuickPatch({ status: 'EM_ANDAMENTO' }, 'Sessão iniciada!')}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play size={13} /> Iniciar Sessão
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {agendamento.status !== 'CONCLUIDO' && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    handleQuickPatch(
                      { status: 'CONCLUIDO' },
                      'Tattoo marcada como concluída e movida para Serviços Feitos!'
                    )
                  }
                  className="px-4 py-1.5 rounded-lg bg-ios-green text-[#07060A] hover:brightness-110 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 size={14} /> Concluir Serviço
                </button>
              )}
              <button type="button" onClick={onClose} className="btn-secondary h-8 px-3 text-xs">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox image={lightboxImg} onClose={() => setLightboxImg(null)} />
    </>
  );
}

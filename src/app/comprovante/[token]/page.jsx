"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ruler,
  User,
  Phone,
  AtSign,
  Copy,
  Check,
  Printer,
  Share2,
  CalendarPlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { API_URL, resolveImageUrl } from '../../../services/api';
import {
  formatDateTimeBR,
  formatDuracao,
  formatMoney,
} from '../../../lib/tattooConstants';

function buildGoogleCalendarUrl(comp) {
  if (!comp?.dataHora) return '#';
  const start = new Date(comp.dataHora);
  const end = new Date(start.getTime() + (comp.duracaoMinutos || 120) * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const title = `Sessão Tattoo — ${comp.titulo} (${comp.studio?.nome || 'Gullart Lettering'})`;
  const details = [
    `Protocolo: ${comp.codigoReserva}`,
    `Estilo: ${comp.estilo}`,
    `Local no corpo: ${comp.localCorpo}`,
    comp.tamanhoCm ? `Tamanho: ${comp.tamanhoCm}` : '',
    `Comprovante: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location: comp.studio?.cidade || 'Curitiba - PR',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ComprovantePage() {
  const params = useParams();
  const token = params?.token;

  const [comprovante, setComprovante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    axios
      .get(`${API_URL}/public/comprovante/${encodeURIComponent(token)}`)
      .then((res) => {
        if (active) setComprovante(res.data);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.error || 'Comprovante não encontrado.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback silencioso
    }
  }

  async function handleConfirmAttendance() {
    if (confirming || !token) return;
    setConfirming(true);
    try {
      const res = await axios.post(`${API_URL}/public/comprovante/${encodeURIComponent(token)}`, {
        acao: 'CONFIRMAR',
      });
      setComprovante(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao confirmar presença.');
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07060A] flex items-center justify-center gap-2 text-xs text-text-muted">
        <Loader2 size={18} className="animate-spin text-apple-blue" />
        Carregando comprovante oficial...
      </div>
    );
  }

  if (error || !comprovante) {
    return (
      <div className="min-h-screen bg-[#07060A] flex items-center justify-center p-4">
        <div className="card-apple max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle size={36} className="mx-auto text-ios-red" />
          <h1 className="text-base font-bold text-white">Comprovante indisponível</h1>
          <p className="text-xs text-text-secondary">
            {error || 'Verifique se o link do comprovante está correto.'}
          </p>
          <Link href="/reservar" className="btn-primary inline-flex h-10 px-5 text-xs font-semibold">
            Fazer novo agendamento
          </Link>
        </div>
      </div>
    );
  }

  const dt = new Date(comprovante.dataHora);
  const dataExtenso = dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const horaStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isCanceled = comprovante.status === 'CANCELADO';
  const isCompleted = comprovante.status === 'CONCLUIDO';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const whatsappShareText = encodeURIComponent(
    `Comprovante de Reserva — ${comprovante.studio?.nome || 'Gullart Lettering'}\n` +
      `Protocolo: ${comprovante.codigoReserva}\n` +
      `Cliente: ${comprovante.cliente?.nome || ''}\n` +
      `Sessão: ${comprovante.titulo}\n` +
      `Data: ${dataExtenso} às ${horaStr}\n` +
      `Link do Comprovante: ${currentUrl}`
  );

  return (
    <div className="min-h-screen bg-[#07060A] text-text-primary relative overflow-x-hidden py-8 px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[560px] h-[300px] bg-apple-blue/15 rounded-full blur-[120px] pointer-events-none print:hidden" />

      <div className="max-w-xl mx-auto relative z-10 space-y-5">
        {/* Card Comprovante Oficial */}
        <article className="bg-[#13101B] border border-apple-blue/40 rounded-2xl overflow-hidden shadow-modal print:border-black print:bg-white print:text-black">
          {/* Topo da Marca */}
          <div className="p-6 text-center bg-gradient-to-b from-[#1A1329] to-[#13101B] border-b border-border relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#0D0B12] border border-apple-blue/60 flex items-center justify-center mb-3">
              <span className="font-gothic text-3xl leading-none text-white">G</span>
            </div>
            <h1 className="font-gothic text-3xl sm:text-4xl text-white leading-tight">
              Gullart Lettering
            </h1>
            <p className="font-gothic text-base text-apple-blue mt-0.5">Preto e cinza 🇧🇷</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mt-3">
              Comprovante Oficial de Reserva de Horário
            </p>

            {/* Selo de Status */}
            <div className="mt-4 flex justify-center">
              {isCanceled ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-ios-red/15 text-ios-red border border-ios-red/40">
                  <XCircle size={15} /> AGENDAMENTO CANCELADO
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-ios-green/15 text-ios-green border border-ios-green/40">
                  <CheckCircle2 size={15} /> SESSÃO CONCLUÍDA
                </span>
              ) : comprovante.confirmadoPeloCliente ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-ios-green/15 text-ios-green border border-ios-green/40">
                  <ShieldCheck size={15} /> HORÁRIO RESERVADO & CONFIRMADO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-ios-amber/15 text-ios-amber border border-ios-amber/40">
                  <Clock size={15} /> AGUARDANDO CONFIRMAÇÃO DO CLIENTE
                </span>
              )}
            </div>
          </div>

          {/* Protocolo & Destaque de Data/Hora */}
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0D0B12] border border-border">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">
                  Código / Protocolo da Reserva
                </span>
                <span className="text-lg font-mono font-bold text-apple-blue tracking-wider">
                  {comprovante.codigoReserva}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-text-muted block">
                  Sessão Nº
                </span>
                <span className="text-sm font-mono font-semibold text-white">
                  #{comprovante.codigo}
                </span>
              </div>
            </div>

            {/* Data, Horário e Duração */}
            <div className="p-4 rounded-xl bg-apple-blue/10 border border-apple-blue/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex items-start gap-2.5">
                <Calendar size={17} className="text-apple-blue mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted block">
                    Data Reservada
                  </span>
                  <span className="text-sm font-bold text-white capitalize">{dataExtenso}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={17} className="text-apple-blue mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted block">
                    Horário
                  </span>
                  <span className="text-sm font-bold text-white">
                    {horaStr} ({formatDuracao(comprovante.duracaoMinutos)})
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Confirmação se foi criado manualmente pelo tatuador */}
            {!isCanceled && !isCompleted && !comprovante.confirmadoPeloCliente && (
              <div className="p-4 rounded-xl bg-ios-amber/10 border border-ios-amber/30 space-y-3 print:hidden">
                <p className="text-xs text-ios-amber leading-relaxed">
                  Confirme abaixo sua presença nesta sessão para registrar a prova digital de
                  confirmação na agenda do estúdio.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmAttendance}
                  disabled={confirming}
                  className="btn-primary w-full h-10 text-xs font-bold"
                >
                  {confirming ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Confirmando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} /> Confirmar Minha Presença Agora
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Dados do Cliente */}
            <div className="space-y-2.5 pt-2 border-t border-border-subtle">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Dados do Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-apple-blue shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Nome</span>
                    <span className="font-semibold text-white">{comprovante.cliente?.nome}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-ios-green shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">WhatsApp</span>
                    <span className="font-semibold text-white">
                      {comprovante.cliente?.telefone}
                    </span>
                  </div>
                </div>
                {comprovante.cliente?.instagram && (
                  <div className="flex items-center gap-2">
                    <AtSign size={14} className="text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Instagram</span>
                      <span className="font-semibold text-white">
                        {comprovante.cliente.instagram}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-apple-blue shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Tatuador</span>
                    <span className="font-semibold text-white">
                      {comprovante.tatuador?.nome || 'Gullart'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados da Tatuagem */}
            <div className="space-y-2.5 pt-3 border-t border-border-subtle">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Projeto / Tatuagem
              </h2>
              <div className="p-3.5 rounded-xl bg-[#0D0B12] border border-border space-y-2.5">
                <p className="text-sm font-bold text-white">{comprovante.titulo}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1728] text-ios-amber border border-border">
                    <MapPin size={12} /> {comprovante.localCorpo}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1728] text-text-primary border border-border">
                    <Sparkles size={12} className="text-apple-blue" /> {comprovante.estilo}
                  </span>
                  {comprovante.tamanhoCm && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1728] text-text-secondary border border-border">
                      <Ruler size={12} /> {comprovante.tamanhoCm}
                    </span>
                  )}
                </div>
                {comprovante.descricao && (
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">
                    {comprovante.descricao}
                  </p>
                )}
              </div>

              {comprovante.valorTotal > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D0B12] border border-border text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">Valor Combinado</span>
                    <span className="font-bold text-white text-sm">
                      {formatMoney(comprovante.valorTotal)}
                    </span>
                  </div>
                  {comprovante.valorSinal > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Sinal</span>
                      <span
                        className={`font-semibold ${
                          comprovante.sinalPago ? 'text-ios-green' : 'text-ios-amber'
                        }`}
                      >
                        {formatMoney(comprovante.valorSinal)}{' '}
                        {comprovante.sinalPago ? '(Pago)' : '(A confirmar)'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Referências anexadas */}
            {comprovante.imagens?.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Referências Anexadas ({comprovante.imagens.length})
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {comprovante.imagens.map((img) => (
                    <img
                      key={img.id}
                      src={resolveImageUrl(img.url)}
                      alt={img.legenda || 'Referência'}
                      className="aspect-square w-full object-cover rounded-xl border border-border bg-[#0D0B12]"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rodapé de Autenticidade / Timestamp */}
            <div className="pt-3 border-t border-dashed border-border text-[11px] text-text-muted space-y-1">
              {comprovante.confirmadoPeloClienteEm && (
                <p className="text-ios-green font-medium">
                  ✓ Confirmado digitalmente pelo cliente em{' '}
                  {formatDateTimeBR(comprovante.confirmadoPeloClienteEm)}
                </p>
              )}
              <p>
                Guarde este link ou imprima o comprovante como prova da sua reserva de horário na
                agenda do estúdio.
              </p>
            </div>
          </div>
        </article>

        {/* Ações do Comprovante (ocultas na impressão) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary h-10 text-xs font-semibold"
          >
            <Printer size={14} /> Salvar PDF
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-secondary h-10 text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check size={14} className="text-ios-green" /> Copiado!
              </>
            ) : (
              <>
                <Copy size={14} /> Copiar Link
              </>
            )}
          </button>

          <a
            href={`https://wa.me/?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary h-10 text-xs font-semibold text-ios-green border-ios-green/30 hover:bg-ios-green/10"
          >
            <Share2 size={14} /> WhatsApp
          </a>

          <a
            href={buildGoogleCalendarUrl(comprovante)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary h-10 text-xs font-semibold"
          >
            <CalendarPlus size={14} /> Agenda
          </a>
        </div>

        <div className="text-center pt-2 print:hidden">
          <Link
            href="/reservar"
            className="text-xs text-text-muted hover:text-apple-blue transition-colors"
          >
            Agendar outra sessão em Gullart Lettering →
          </Link>
        </div>
      </div>
    </div>
  );
}

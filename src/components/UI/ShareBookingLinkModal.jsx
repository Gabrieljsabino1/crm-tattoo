"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useToast } from './Toast';
import {
  DURACOES_SESSAO,
  ESTILOS_TATTOO,
  LOCAIS_CORPO,
} from '../../lib/tattooConstants';

const HORARIOS_OPCOES = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export default function ShareBookingLinkModal({ isOpen, onClose, defaultDateKey = '' }) {
  const toast = useToast();
  const [mode, setMode] = useState('GERAL'); // GERAL | PERSONALIZADO
  const [copied, setCopied] = useState(false);

  // Campos do modo personalizado (convite para horário específico)
  const [data, setData] = useState(defaultDateKey);
  const [hora, setHora] = useState('14:00');
  const [duracao, setDuracao] = useState(120);
  const [titulo, setTitulo] = useState('');
  const [estilo, setEstilo] = useState('Lettering');
  const [localCorpo, setLocalCorpo] = useState('');
  const [valor, setValor] = useState('');
  const [sinal, setSinal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      if (defaultDateKey) setData(defaultDateKey);
    }
  }, [isOpen, defaultDateKey]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const generatedUrl = useMemo(() => {
    const base = `${origin}/reservar`;
    if (mode === 'GERAL') return base;

    const params = new URLSearchParams();
    if (data) params.set('data', data);
    if (hora) params.set('hora', hora);
    if (duracao && duracao !== 120) params.set('duracao', String(duracao));
    if (titulo.trim()) params.set('titulo', titulo.trim());
    if (estilo) params.set('estilo', estilo);
    if (localCorpo) params.set('local', localCorpo);
    if (Number(valor) > 0) params.set('valor', String(Number(valor)));
    if (Number(sinal) > 0) params.set('sinal', String(Number(sinal)));

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [origin, mode, data, hora, duracao, titulo, estilo, localCorpo, valor, sinal]);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast('Link de pré-cadastro e reserva copiado!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast('Não foi possível copiar automaticamente. Selecione e copie o link.', 'error');
    }
  }

  const whatsappMessage = encodeURIComponent(
    mode === 'PERSONALIZADO' && data && hora
      ? `Olá! Segue o link para fazer seu pré-cadastro e confirmar sua reserva na agenda da Gullart Lettering (${data
          .split('-')
          .reverse()
          .join('/')} às ${hora}):\n${generatedUrl}\n\nApós confirmar, você já recebe o comprovante oficial do seu horário!`
      : `Olá! Segue o link da agenda da Gullart Lettering para fazer seu pré-cadastro, escolher seu horário e receber seu comprovante oficial de reserva:\n${generatedUrl}`
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[92vh] shadow-modal flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-[#0D0B12] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-apple-blue/20 border border-apple-blue/40 flex items-center justify-center text-apple-blue">
              <Link2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Link de Pré-Cadastro & Reserva</h2>
              <p className="text-[11px] text-text-muted">
                O cliente reserva, confirma e recebe comprovante automático na sua agenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-[#1C1728]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0D0B12] border border-border">
            <button
              type="button"
              onClick={() => setMode('GERAL')}
              className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                mode === 'GERAL'
                  ? 'bg-apple-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Link Geral da Agenda
            </button>
            <button
              type="button"
              onClick={() => setMode('PERSONALIZADO')}
              className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                mode === 'PERSONALIZADO'
                  ? 'bg-apple-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Convite c/ Horário Fixo
            </button>
          </div>

          {mode === 'GERAL' ? (
            <div className="p-4 rounded-xl bg-[#0D0B12] border border-border space-y-2 text-xs text-text-secondary leading-relaxed">
              <p className="text-white font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-apple-blue" /> Ideal para Bio do Instagram ou WhatsApp
              </p>
              <p>
                Qualquer cliente com este link visualiza apenas os horários livres, faz o
                pré-cadastro (nome, WhatsApp, Instagram, ideia e referências), confirma a sessão e
                recebe um <strong className="text-white">Comprovante Oficial</strong> — enquanto o
                horário já aparece automaticamente reservado na sua Agenda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-text-muted">
                Pré-configure data, horário ou valor combinado com o cliente antes de enviar o link:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1 flex items-center gap-1">
                    <Calendar size={11} className="text-apple-blue" /> Data
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="input h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1 flex items-center gap-1">
                    <Clock size={11} className="text-apple-blue" /> Horário
                  </label>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="select h-9 text-xs"
                  >
                    {HORARIOS_OPCOES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Duração</label>
                  <select
                    value={duracao}
                    onChange={(e) => setDuracao(Number(e.target.value))}
                    className="select h-9 text-xs"
                  >
                    {DURACOES_SESSAO.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Estilo</label>
                  <select
                    value={estilo}
                    onChange={(e) => setEstilo(e.target.value)}
                    className="select h-9 text-xs"
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
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Ideia / Tattoo (opcional)
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Lettering antebraço"
                    className="input h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Local no Corpo (opcional)
                  </label>
                  <select
                    value={localCorpo}
                    onChange={(e) => setLocalCorpo(e.target.value)}
                    className="select h-9 text-xs"
                  >
                    <option value="">Cliente escolhe</option>
                    {LOCAIS_CORPO.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Valor Total R$ (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 600"
                    className="input h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Sinal R$ (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={sinal}
                    onChange={(e) => setSinal(e.target.value)}
                    placeholder="Ex: 150"
                    className="input h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Link Gerado */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Link pronto para enviar ao cliente
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                onFocus={(e) => e.target.select()}
                className="input h-10 text-xs font-mono text-apple-blue flex-1"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="btn-primary h-10 px-3.5 text-xs font-semibold shrink-0"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-10 text-xs font-semibold text-ios-green border-ios-green/30 hover:bg-ios-green/10"
            >
              <Share2 size={14} /> Enviar no WhatsApp
            </a>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-10 text-xs font-semibold"
            >
              <ExternalLink size={14} /> Abrir Prévia
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

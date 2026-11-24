"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, CalendarClock, FileImage, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTimeBR, formatMoney } from '../../lib/tattooConstants';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [alertas, setAlertas] = useState({
    sessoesProximas: [],
    semEsboco: [],
    sinaisPendentes: [],
    totalAlertas: 0,
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const fetchAlertas = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return;
      const response = await api.get('/alertas');
      setAlertas(response.data);
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    fetchAlertas();
    const interval = setInterval(fetchAlertas, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/agenda?busca=${encodeURIComponent(q)}`);
  };

  const roleLabel =
    {
      ADMIN: 'Tatuador • Admin',
      TATUADOR: 'Tatuador(a)',
      RECEPCAO: 'Recepção / Estúdio',
    }[user?.role] || user?.role;

  return (
    <header className="hidden md:flex h-14 border-b border-border bg-[#07060A]/90 backdrop-blur-md items-center justify-between px-6 sticky top-0 z-30 shrink-0 gap-4">
      {/* Busca Rápida */}
      <form onSubmit={handleQuickSearch} className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente, tattoo, estilo ou local no corpo..."
            className="w-full bg-[#13101B] text-xs text-text-primary placeholder:text-text-muted pl-8 pr-4 h-8 rounded-lg border border-border focus:border-apple-blue focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Assinatura da Marca Centralizada / Visível em todo o sistema */}
      <Link
        href="/dashboard"
        className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0B12] border border-border hover:border-border-hover transition-colors"
      >
        <span className="font-gothic text-[17px] text-white leading-none">Gullart Lettering</span>
        <span className="text-text-faint text-xs">/</span>
        <span className="font-gothic text-[14px] text-text-secondary leading-none">Preto e cinza 🇧🇷</span>
      </Link>

      {/* Ações da Direita */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Alertas */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="relative p-2 text-text-secondary hover:text-white transition-colors focus:outline-none rounded-lg hover:bg-surface"
            title="Lembretes e Alertas da Agenda"
          >
            <Bell size={18} />
            {alertas.totalAlertas > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ios-red text-[10px] font-bold text-white shadow-sm ring-2 ring-[#07060A]">
                {alertas.totalAlertas > 9 ? '9+' : alertas.totalAlertas}
              </span>
            )}
          </button>

          {isPopoverOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border shadow-modal rounded-xl overflow-hidden z-50">
              <div className="p-3.5 border-b border-border bg-[#0D0B12] flex items-center justify-between">
                <h3 className="font-gothic text-base text-white">
                  Alertas Gullart Lettering
                </h3>
                <span className="text-[11px] text-text-muted">
                  {alertas.totalAlertas} aviso(s)
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-2 divide-y divide-border-subtle">
                {alertas.totalAlertas === 0 ? (
                  <div className="py-6 text-center text-xs text-text-muted">
                    Agenda em dia! Nenhum alerta pendente.
                  </div>
                ) : (
                  <>
                    {alertas.sessoesProximas?.length > 0 && (
                      <div className="py-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-apple-blue uppercase tracking-wider flex items-center gap-1.5">
                          <CalendarClock size={12} />
                          Próximas 48h ({alertas.sessoesProximas.length})
                        </div>
                        {alertas.sessoesProximas.map((s) => (
                          <Link
                            href="/agenda"
                            onClick={() => setIsPopoverOpen(false)}
                            key={s.id}
                            className="flex items-start gap-2.5 p-2 hover:bg-[#1C1728] rounded-lg transition-colors"
                          >
                            <div className="mt-0.5 text-apple-blue">
                              <CalendarClock size={14} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-text-primary">
                                {s.titulo} — {s.clienteNome}
                              </p>
                              <p className="text-[11px] text-text-muted">
                                {formatDateTimeBR(s.dataHora)} • {s.localCorpo}
                              </p>
                              {!s.temEsboco && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-ios-amber mt-0.5">
                                  <FileImage size={10} /> Sem esboço anexado
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {alertas.sinaisPendentes?.length > 0 && (
                      <div className="py-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-ios-amber uppercase tracking-wider flex items-center gap-1.5">
                          <Wallet size={12} />
                          Sinais Pendentes ({alertas.sinaisPendentes.length})
                        </div>
                        {alertas.sinaisPendentes.map((s) => (
                          <Link
                            href="/agenda"
                            onClick={() => setIsPopoverOpen(false)}
                            key={s.id}
                            className="flex items-start gap-2.5 p-2 hover:bg-[#1C1728] rounded-lg transition-colors"
                          >
                            <div className="mt-0.5 text-ios-amber">
                              <Wallet size={14} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-text-primary">{s.clienteNome}</p>
                              <p className="text-[11px] text-text-muted">
                                Sinal de {formatMoney(s.valorSinal)} — {s.titulo}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-[1px] bg-border" />

        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-apple-blue to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-text-primary">{user.nome}</span>
              <span className="text-[10px] text-apple-blue font-medium">{roleLabel}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

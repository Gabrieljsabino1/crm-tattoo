"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Users,
  Shield,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpointPx);
    check();
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpointPx]);
  return isMobile;
}

const NAV_MAIN = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
];

const NAV_ESTUDIO = [
  { to: '/agenda', label: 'Agenda & Sessões', icon: CalendarDays },
  { to: '/servicos', label: 'Serviços Feitos', icon: CheckCircle2 },
  { to: '/orcamentos', label: 'Orçamentos', icon: ClipboardList },
];

const NAV_CADASTROS = [
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/usuarios', label: 'Equipe / Tatuadores', icon: Shield, adminOnly: true },
];

const MOBILE_BOTTOM_TABS = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/servicos', label: 'Feitos', icon: CheckCircle2 },
  { to: '/clientes', label: 'Clientes', icon: Users },
];

function NavItem({ to, label, Icon, collapsed }) {
  const pathname = usePathname();
  const isActive = pathname === to || (to !== '/dashboard' && pathname?.startsWith(to));
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const itemRef = useRef(null);

  function handleMouseEnter() {
    setHovered(true);
    if (collapsed && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    }
  }

  return (
    <div
      ref={itemRef}
      style={{ position: 'relative', margin: '2px 10px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={to}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '38px',
          padding: collapsed ? '0' : '0 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? '0' : '10px',
          borderRadius: '8px',
          backgroundColor: isActive ? '#7C3AED' : hovered ? '#1C1728' : 'transparent',
          color: isActive ? '#FFFFFF' : hovered ? '#F5F5F7' : '#A1A1A6',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          textDecoration: 'none',
          transition: 'all 150ms ease',
        }}
      >
        <Icon size={17} strokeWidth={isActive ? 2 : 1.75} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
        )}
      </Link>

      {collapsed &&
        hovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateY(-50%)',
              backgroundColor: '#13101B',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #261F36',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 200,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {label}
          </motion.div>,
          document.body
        )}
    </div>
  );
}

function NavSection({ label, sidebarCollapsed, children }) {
  if (sidebarCollapsed) return <>{children}</>;
  return (
    <div style={{ marginTop: '14px' }}>
      <div style={{ padding: '4px 16px', userSelect: 'none' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#6E6E73',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const isMobile = useIsMobile(768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const effectiveCollapsed = isMobile ? false : collapsed;

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  if (!user || pathname === '/login') return null;

  const filterNav = (items) => items.filter((item) => (!item.adminOnly ? true : isAdmin));

  const sidebarInner = (
    <>
      <div
        className="hidden md:flex shrink-0 items-center"
        style={{
          padding: collapsed ? '12px 0' : '12px 16px 0',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6E6E73',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          {collapsed ? <PanelLeftOpen size={16} strokeWidth={1.75} /> : <PanelLeftClose size={16} strokeWidth={1.75} />}
        </button>
      </div>

      <div className="md:hidden shrink-0 flex items-center justify-end" style={{ padding: '12px 14px 0' }}>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="text-text-secondary hover:text-white p-2"
        >
          <X size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* Brand: Gullart Lettering / Preto e cinza */}
      <button
        type="button"
        onClick={() => {
          router.push('/dashboard');
          setMobileOpen(false);
        }}
        className={
          effectiveCollapsed
            ? 'shrink-0 flex justify-center py-4'
            : 'shrink-0 px-3.5 py-4 flex items-center gap-2.5'
        }
        style={{
          borderBottom: '1px solid #1B1626',
          background: 'none',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#191426] to-[#0A0810] border border-apple-blue/60 flex items-center justify-center shrink-0 shadow-sm text-white">
          <span className="font-gothic text-xl leading-none text-white">G</span>
        </div>
        {!effectiveCollapsed && (
          <div className="flex flex-col items-start text-left leading-tight min-w-0">
            <span className="font-gothic text-white text-[18px] leading-tight truncate w-full">
              Gullart Lettering
            </span>
            <span className="font-gothic text-[12px] text-apple-blue leading-tight mt-0.5 truncate w-full">
              Preto e cinza 🇧🇷
            </span>
          </div>
        )}
      </button>

      {/* Navegação */}
      <nav
        className="flex-1 overflow-y-auto py-2 flex flex-col"
        onClick={(e) => {
          if (e.target.closest('a')) setMobileOpen(false);
        }}
      >
        <NavSection label="Visão Geral" sidebarCollapsed={effectiveCollapsed}>
          {filterNav(NAV_MAIN).map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} collapsed={effectiveCollapsed} />
          ))}
        </NavSection>

        <NavSection label="Estúdio & Agenda" sidebarCollapsed={effectiveCollapsed}>
          {filterNav(NAV_ESTUDIO).map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} collapsed={effectiveCollapsed} />
          ))}
        </NavSection>

        <NavSection label="Cadastros & Equipe" sidebarCollapsed={effectiveCollapsed}>
          {filterNav(NAV_CADASTROS).map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} collapsed={effectiveCollapsed} />
          ))}
        </NavSection>
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1B1626' }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-text-muted hover:text-ios-red transition-colors"
          style={{
            height: '36px',
            padding: effectiveCollapsed ? '0' : '0 12px',
            justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
            borderRadius: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Encerrar sessão"
        >
          <LogOut size={16} strokeWidth={1.75} />
          {!effectiveCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>Sair do sistema</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0D0B12]/95 backdrop-blur-md flex items-center justify-between px-4 z-40 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={() => setMobileOpen(true)} className="text-white p-1.5 rounded-lg hover:bg-surface shrink-0">
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#13101B] border border-apple-blue/60 flex items-center justify-center text-white shrink-0">
              <span className="font-gothic text-base leading-none">G</span>
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-gothic text-white text-[17px] leading-none truncate">
                Gullart Lettering
              </span>
              <span className="font-gothic text-[10px] text-apple-blue leading-tight truncate">
                Preto e cinza 🇧🇷
              </span>
            </div>
          </Link>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-apple-blue to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user.nome?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Bottom Tab Bar PWA no Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0D0B12]/95 backdrop-blur-xl border-t border-border z-40 flex items-center justify-around px-2">
        {MOBILE_BOTTOM_TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname?.startsWith(to));
          return (
            <Link
              key={to}
              href={to}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
                active ? 'text-apple-blue' : 'text-text-muted'
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.2 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Backdrop drawer Mobile */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop / Drawer Mobile */}
      <motion.aside
        initial={false}
        animate={{ width: effectiveCollapsed ? 58 : 230, x: isMobile && !mobileOpen ? -230 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 left-0 bottom-0 z-50 bg-[#0D0B12] flex flex-col border-r border-border"
        style={{ willChange: 'width, transform' }}
      >
        {sidebarInner}
      </motion.aside>
    </>
  );
}

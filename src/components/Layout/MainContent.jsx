"use client";

import { useSidebar } from '../../contexts/SidebarContext';
import { isPublicRoute } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

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

export default function MainContent({ children }) {
  const { collapsed } = useSidebar();
  const isMobile = useIsMobile(768);
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <main className="flex-1 w-full h-full min-h-screen bg-[#07060A]">{children}</main>;
  }

  const marginLeft = isMobile ? 0 : collapsed ? 58 : 230;

  return (
    <motion.main
      animate={{ marginLeft }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-1 overflow-y-auto w-full h-full relative flex flex-col bg-[#07060A]"
    >
      <Header />
      <div className={`flex-1 ${isMobile ? 'pt-14 pb-20' : ''}`}>{children}</div>
    </motion.main>
  );
}

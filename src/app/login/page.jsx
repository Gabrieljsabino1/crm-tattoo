"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);

    if (!result.success) {
      setError(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-[#07060A] relative flex items-center justify-center px-4 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Luz ambiente sutil */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-apple-blue/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[390px] relative z-10">
        {/* Identidade Gullart Lettering */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#191426] to-[#0D0A14] border border-apple-blue/60 flex items-center justify-center shadow-apple text-white mb-4">
            <span className="font-gothic text-4xl leading-none text-white">G</span>
          </div>
          <h1 className="font-gothic text-4xl text-white leading-tight">
            Gullart Lettering
          </h1>
          <p className="font-gothic mt-1.5 text-lg text-text-secondary">
            Preto e cinza 🇧🇷
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-[#13101B]/90 backdrop-blur-xl border border-border rounded-2xl p-7 shadow-modal">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="email">
                E-mail de Acesso
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-ios-red/10 border border-ios-red/30 text-ios-red text-xs leading-snug">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-2 h-10 font-semibold text-sm"
            >
              {loading ? 'Validando Acesso...' : 'Entrar no Estúdio'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-text-muted">
          <span className="font-gothic text-sm text-text-secondary">Gullart Lettering</span> ©{' '}
          {new Date().getFullYear()} —{' '}
          <span className="font-gothic text-sm text-text-secondary">Preto e cinza</span> 🇧🇷
        </p>
      </div>
    </motion.div>
  );
}

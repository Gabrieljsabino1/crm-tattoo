/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Padrão Roxo & Preto — Gullart Lettering
        'bg-app':          '#07060A',
        'bg-secondary':    '#0D0B12',
        surface:           '#13101B',
        'surface-hover':   '#1C1728',
        'surface-card':    '#120F1A',
        border:            '#261F36',
        'border-subtle':   '#1B1626',
        'border-hover':    '#3D3157',
        'text-primary':    '#F5F5F7',
        'text-secondary':  '#B4AEC4',
        'text-muted':      '#7B748C',
        'text-faint':      '#4E485C',

        // Cores de Destaque Roxo
        primary:           '#8B5CF6',
        'primary-hover':   '#7C3AED',
        'apple-blue':      '#8B5CF6',
        'apple-blue-soft': 'rgba(139, 92, 246, 0.16)',

        // Indicadores Semafóricos (Status de Sessão / Sinal)
        'ios-green':       '#34C759',
        'ios-green-soft':  'rgba(52, 199, 89, 0.15)',
        'ios-amber':       '#FF9500',
        'ios-amber-soft':  'rgba(255, 149, 0, 0.15)',
        'ios-red':         '#FF3B30',
        'ios-red-soft':    'rgba(255, 59, 48, 0.15)',

        // Tons Neutros
        titanium:          '#8E8E93',
        'titanium-dark':   '#48484A',
        'titanium-light':  '#D1D1D6',

        // Compatibilidade semântica
        positive:          '#34C759',
        negative:          '#FF3B30',
        warning:           '#FF9500',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        gothic: ['var(--font-gothic)', 'UnifrakturMaguntia', 'serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        kpi:   ['28px', { lineHeight: '1.1', fontWeight: '700' }],
        label: ['11px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        field: ['13px', { lineHeight: '1.5' }],
        data:  ['13px', { lineHeight: '1.5' }],
        page:  ['16px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        md:      '10px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '20px',
      },
      boxShadow: {
        apple:        '0 4px 24px -2px rgba(0, 0, 0, 0.65)',
        card:         '0 2px 12px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 6px 24px rgba(124, 58, 237, 0.18)',
        modal:        '0 16px 48px rgba(0, 0, 0, 0.78)',
      },
      width: {
        sidebar: '240px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        fast:    '100ms',
      },
    },
  },
  plugins: [],
};

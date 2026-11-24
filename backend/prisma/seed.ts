import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function ensureSampleImages() {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const samples: Record<string, string> = {
    'sample-ref-leao.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#0B0912"/>
      <circle cx="300" cy="300" r="210" fill="none" stroke="#2D3B55" stroke-width="2" stroke-dasharray="6 8"/>
      <polygon points="300,110 385,180 420,290 370,415 300,475 230,415 180,290 215,180" fill="#161E2E" stroke="#E5E7EB" stroke-width="3"/>
      <polygon points="300,155 355,215 375,305 300,425 225,305 245,215" fill="none" stroke="#8B5CF6" stroke-width="2.5"/>
      <path d="M250,270 L285,282 M350,270 L315,282 M285,345 L300,362 L315,345 M272,385 Q300,405 328,385" stroke="#F5F5F7" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="268" cy="285" r="7" fill="#F5F5F7"/><circle cx="332" cy="285" r="7" fill="#F5F5F7"/>
      <text x="300" y="545" text-anchor="middle" fill="#8E8E93" font-family="sans-serif" font-size="18" letter-spacing="3">REFERENCIA • LEAO GEOMETRICO</text>
    </svg>`,
    'sample-esboco-leao.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#F6F7FB"/>
      <g stroke="#1E293B" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="300" cy="285" r="195" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 6"/>
        <line x1="300" y1="65" x2="300" y2="515" stroke="#94A3B8" stroke-width="1" stroke-dasharray="5 5"/>
        <polygon points="300,105 390,175 425,295 375,420 300,480 225,420 175,295 210,175" stroke-width="2.5"/>
        <polygon points="300,150 360,210 380,305 300,430 220,305 240,210" stroke="#8B5CF6" stroke-width="2"/>
        <path d="M210,175 L300,220 L390,175 M175,295 L250,275 L300,320 L350,275 L425,295" stroke-width="1.5"/>
        <path d="M265,282 Q278,274 288,285 M335,282 Q322,274 312,285 M288,350 L300,368 L312,350" stroke-width="3"/>
      </g>
      <text x="300" y="555" text-anchor="middle" fill="#475569" font-family="monospace" font-size="17" letter-spacing="2">ESBOCO / DECALQUE • 18 CM</text>
    </svg>`,
    'sample-ref-floral.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#0B0912"/>
      <g stroke="#F5F5F7" fill="none" stroke-linecap="round">
        <path d="M300,480 C300,360 285,260 305,140" stroke-width="2.5"/>
        <path d="M300,260 C245,215 215,175 245,140 C275,115 310,165 300,225" stroke-width="2"/>
        <path d="M302,225 C345,175 385,180 375,220 C365,255 325,260 300,245" stroke-width="2"/>
        <path d="M298,350 C240,330 215,355 235,380 C255,400 285,385 299,365" stroke-width="1.8"/>
        <path d="M300,320 C350,300 385,320 365,350 C345,375 315,360 300,340" stroke-width="1.8"/>
        <circle cx="305" cy="140" r="28" stroke="#8B5CF6" stroke-width="1.8"/>
        <circle cx="305" cy="140" r="14" stroke="#F5F5F7" stroke-width="1.5"/>
      </g>
      <text x="300" y="545" text-anchor="middle" fill="#8E8E93" font-family="sans-serif" font-size="18" letter-spacing="3">REFERENCIA • RAMO FINE LINE</text>
    </svg>`,
    'sample-esboco-floral.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <g stroke="#0F172A" fill="none" stroke-linecap="round">
        <path d="M300,485 C300,355 290,250 308,135" stroke-width="2"/>
        <path d="M300,255 C238,205 210,168 242,135 C275,108 312,160 302,220" stroke-width="1.6"/>
        <path d="M302,220 C350,170 390,178 378,218 C365,252 325,258 300,242" stroke-width="1.6"/>
        <path d="M297,352 C238,328 212,354 234,382 C256,402 286,386 298,366" stroke-width="1.5"/>
        <path d="M300,318 C355,298 388,318 368,350 C348,375 316,360 300,338" stroke-width="1.5"/>
        <circle cx="308" cy="135" r="24" stroke="#8B5CF6" stroke-width="1.5"/>
      </g>
      <text x="300" y="555" text-anchor="middle" fill="#475569" font-family="monospace" font-size="17" letter-spacing="2">ESBOCO FINE LINE • 3RL</text>
    </svg>`,
    'sample-resultado-dragao.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs>
        <radialGradient id="skin" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#222A3A"/>
          <stop offset="100%" stop-color="#0E131D"/>
        </radialGradient>
      </defs>
      <rect width="600" height="600" fill="url(#skin)"/>
      <path d="M180,450 C140,360 220,280 300,280 C380,280 430,220 390,145 C355,95 270,115 245,170 C225,215 290,235 335,210" fill="none" stroke="#F5F5F7" stroke-width="10" stroke-linecap="round"/>
      <path d="M195,435 C165,365 235,300 300,300 C370,300 412,240 375,170" fill="none" stroke="#8B5CF6" stroke-width="3.5" stroke-dasharray="10 8"/>
      <circle cx="332" cy="155" r="8" fill="#FF9500"/>
      <path d="M350,130 L388,108 M360,145 L402,138" stroke="#F5F5F7" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="36" y="36" width="165" height="32" rx="16" fill="#34C759" fill-opacity="0.18" stroke="#34C759" stroke-opacity="0.5"/>
      <text x="118" y="57" text-anchor="middle" fill="#34C759" font-family="sans-serif" font-size="13" font-weight="bold">CONCLUIDA</text>
      <text x="300" y="545" text-anchor="middle" fill="#A1A1A6" font-family="sans-serif" font-size="18" letter-spacing="3">RESULTADO • DRAGAO ORIENTAL</text>
    </svg>`,
    'sample-resultado-adaga.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#0D0A14"/>
      <g stroke="#F5F5F7" fill="none" stroke-linejoin="round" stroke-linecap="round">
        <polygon points="300,95 322,350 300,455 278,350" fill="#1A2233" stroke-width="3.5"/>
        <line x1="300" y1="100" x2="300" y2="448" stroke="#8B5CF6" stroke-width="2"/>
        <rect x="242" y="344" width="116" height="16" rx="8" fill="#1A2233" stroke-width="3"/>
        <rect x="288" y="360" width="24" height="72" rx="6" fill="#1A2233" stroke-width="3"/>
        <circle cx="300" cy="450" r="14" fill="#8B5CF6" stroke="#F5F5F7" stroke-width="2.5"/>
        <path d="M230,220 C190,190 215,140 265,175 M370,260 C410,235 390,185 335,215" stroke="#FF3B30" stroke-width="3"/>
      </g>
      <rect x="36" y="36" width="165" height="32" rx="16" fill="#34C759" fill-opacity="0.18" stroke="#34C759" stroke-opacity="0.5"/>
      <text x="118" y="57" text-anchor="middle" fill="#34C759" font-family="sans-serif" font-size="13" font-weight="bold">CONCLUIDA</text>
      <text x="300" y="545" text-anchor="middle" fill="#A1A1A6" font-family="sans-serif" font-size="18" letter-spacing="3">RESULTADO • ADAGA BLACKWORK</text>
    </svg>`,
  };

  for (const [name, content] of Object.entries(samples)) {
    fs.writeFileSync(path.join(uploadsDir, name), content, 'utf-8');
  }
}

function dateOffset(daysOffset: number, hours: number, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function main() {
  ensureSampleImages();

  await prisma.imagemAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.create({
    data: {
      nome: 'Gullart',
      email: 'admin@gullartlettering.com',
      senha: hashedPassword,
      role: 'ADMIN',
      especialidade: 'Lettering & Preto e Cinza',
    },
  });

  const tatuadora = await prisma.user.create({
    data: {
      nome: 'Marina Costa',
      email: 'equipe@gullartlettering.com',
      senha: hashedPassword,
      role: 'TATUADOR',
      especialidade: 'Fine Line & Botânico',
    },
  });

  const [c1, c2, c3, c4, c5] = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'Lucas Ferreira',
        telefone: '41998214455',
        email: 'lucas.ferreira@email.com',
        instagram: '@lucas.ferreira',
        cidade: 'Curitiba',
        observacoes: 'Pele sensível na região interna do antebraço. Já fez 2 sessões no estúdio.',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Camila Andrade',
        telefone: '41991038821',
        email: 'camila.andrade@email.com',
        instagram: '@camilandrade',
        cidade: 'Curitiba',
        observacoes: 'Prefere traço bem fino (3RL). Sem alergias.',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Rafael Mendes',
        telefone: '41987442210',
        email: 'rafael.mendes@email.com',
        instagram: '@rafamendes_cwb',
        cidade: 'São José dos Pinhais',
        observacoes: 'Projeto de fechamento de braço oriental em 3 sessões.',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Juliana Ribeiro',
        telefone: '41996127709',
        instagram: '@ju.ribeiro',
        cidade: 'Curitiba',
        observacoes: 'Primeira tatuagem. Explicar cuidados pós-sessão.',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Thiago Nogueira',
        telefone: '41995503318',
        instagram: '@thiagonog',
        cidade: 'Colombo',
        observacoes: 'Curte blackwork pesado e pontilhismo.',
      },
    }),
  ]);

  // Agendamentos de HOJE e PRÓXIMOS DIAS
  await prisma.agendamento.create({
    data: {
      codigo: 101,
      clienteId: c1.id,
      tatuadorId: admin.id,
      titulo: 'Leão Geométrico Realista',
      descricao:
        'Leão com metade realista sombreada e metade com linhas geométricas limpas. Cliente quer foco no olhar intenso e acabamento suave nas bordas.',
      dataHora: dateOffset(0, 14, 0),
      duracaoMinutos: 180,
      localCorpo: 'Antebraço (parte externa)',
      estilo: 'Realismo',
      tamanhoCm: '18 cm',
      valorTotal: 1200,
      valorSinal: 300,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO',
      imagens: {
        create: [
          {
            tipo: 'REFERENCIA',
            url: '/uploads/sample-ref-leao.svg',
            legenda: 'Referência enviada pelo cliente no WhatsApp',
          },
          {
            tipo: 'ESBOCO',
            url: '/uploads/sample-esboco-leao.svg',
            legenda: 'Decalque final aprovado (18cm)',
          },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 102,
      clienteId: c2.id,
      tatuadorId: tatuadora.id,
      titulo: 'Ramo Botânico Fine Line',
      descricao:
        'Ramo delicado de lavanda e folhas finas acompanhando a curva da costela/clavícula. Traço ultra fino 3RL sem sombra pesada.',
      dataHora: dateOffset(0, 17, 30),
      duracaoMinutos: 90,
      localCorpo: 'Costela direita',
      estilo: 'Fine Line',
      tamanhoCm: '12 cm',
      valorTotal: 550,
      valorSinal: 150,
      sinalPago: true,
      formaPagamento: 'Cartão',
      status: 'CONFIRMADO',
      imagens: {
        create: [
          {
            tipo: 'REFERENCIA',
            url: '/uploads/sample-ref-floral.svg',
            legenda: 'Estilo de folha desejado',
          },
          {
            tipo: 'ESBOCO',
            url: '/uploads/sample-esboco-floral.svg',
            legenda: 'Esboço pronto para decalque',
          },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 103,
      clienteId: c4.id,
      tatuadorId: admin.id,
      titulo: 'Escrita Minimalista + Lua',
      descricao:
        'Frase curta em caligrafia fina com pequena lua crescente no pulso esquerdo. Ainda falta enviar o esboço para aprovação.',
      dataHora: dateOffset(1, 10, 30),
      duracaoMinutos: 60,
      localCorpo: 'Pulso esquerdo',
      estilo: 'Minimalista',
      tamanhoCm: '6 cm',
      valorTotal: 320,
      valorSinal: 100,
      sinalPago: false,
      formaPagamento: 'PIX',
      status: 'PENDENTE',
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 104,
      clienteId: c3.id,
      tatuadorId: admin.id,
      titulo: 'Fechamento Oriental — Sessão 2',
      descricao:
        'Continuação do sombreado das nuvens e ondas no ombro e bíceps, conectando com o dragão da 1ª sessão.',
      dataHora: dateOffset(3, 13, 0),
      duracaoMinutos: 240,
      localCorpo: 'Braço inteiro (Ombro/Bíceps)',
      estilo: 'Oriental',
      tamanhoCm: 'Fechamento',
      valorTotal: 1600,
      valorSinal: 400,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO',
      imagens: {
        create: [
          {
            tipo: 'REFERENCIA',
            url: '/uploads/sample-resultado-dragao.svg',
            legenda: 'Continuidade da 1ª sessão',
          },
        ],
      },
    },
  });

  // Serviços JÁ REALIZADOS (Concluídos - Portfólio & Histórico)
  await prisma.agendamento.create({
    data: {
      codigo: 98,
      clienteId: c3.id,
      tatuadorId: admin.id,
      titulo: 'Dragão Oriental — Sessão 1 (Linhas)',
      descricao:
        'Traço principal do dragão oriental subindo pelo antebraço até o ombro. Linhas firmes com 9RL e base de sombra.',
      dataHora: dateOffset(-12, 14, 0),
      duracaoMinutos: 240,
      localCorpo: 'Antebraço e Braço',
      estilo: 'Oriental',
      tamanhoCm: '32 cm',
      valorTotal: 1500,
      valorSinal: 400,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONCLUIDO',
      observacoesSessao: 'Usado 9RL + 11MG. Tinta Dynamic Black. Cicatrização excelente.',
      concluidoEm: dateOffset(-12, 18, 0),
      imagens: {
        create: [
          {
            tipo: 'RESULTADO',
            url: '/uploads/sample-resultado-dragao.svg',
            legenda: 'Foto logo após finalizar a 1ª sessão',
          },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 99,
      clienteId: c5.id,
      tatuadorId: admin.id,
      titulo: 'Adaga Blackwork com Pontilhismo',
      descricao:
        'Adaga ornamental em blackwork sólido com detalhes em vermelho e pontilhismo suave nas laterais da panturrilha.',
      dataHora: dateOffset(-5, 15, 0),
      duracaoMinutos: 150,
      localCorpo: 'Panturrilha esquerda',
      estilo: 'Blackwork',
      tamanhoCm: '20 cm',
      valorTotal: 950,
      valorSinal: 250,
      sinalPago: true,
      formaPagamento: 'Cartão',
      status: 'CONCLUIDO',
      observacoesSessao: 'Agulhas 7RL e 9RS. Cliente adorou o contraste com vermelho.',
      concluidoEm: dateOffset(-5, 17, 30),
      imagens: {
        create: [
          {
            tipo: 'RESULTADO',
            url: '/uploads/sample-resultado-adaga.svg',
            legenda: 'Resultado final no estúdio',
          },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 100,
      clienteId: c2.id,
      tatuadorId: tatuadora.id,
      titulo: 'Borboleta Fine Line',
      descricao: 'Borboleta minimalista com contorno fino e micro pontilhismo nas asas.',
      dataHora: dateOffset(-2, 11, 0),
      duracaoMinutos: 60,
      localCorpo: 'Ombro (posterior)',
      estilo: 'Fine Line',
      tamanhoCm: '7 cm',
      valorTotal: 380,
      valorSinal: 100,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONCLUIDO',
      observacoesSessao: 'Feito com 3RL. Sem necessidade de retoque.',
      concluidoEm: dateOffset(-2, 12, 0),
      imagens: {
        create: [
          {
            tipo: 'REFERENCIA',
            url: '/uploads/sample-ref-floral.svg',
            legenda: 'Referência delicada',
          },
          {
            tipo: 'ESBOCO',
            url: '/uploads/sample-esboco-floral.svg',
            legenda: 'Esboço final',
          },
        ],
      },
    },
  });

  // Orçamentos / Pedidos no Funil
  await prisma.orcamento.createMany({
    data: [
      {
        titulo: 'Fênix nas Costas',
        clienteId: c4.id,
        descricao: 'Quer uma fênix estilizada subindo da lombar até o meio das costas em preto e cinza.',
        localCorpo: 'Costas',
        estilo: 'Blackwork',
        tamanhoCm: '28 cm',
        valorEstimado: 1800,
        status: 'NOVO_PEDIDO',
      },
      {
        titulo: 'Cobertura no Tornozelo',
        clienteId: c5.id,
        descricao: 'Cobrir um símbolo antigo de 5cm com um floral dark / blackwork.',
        localCorpo: 'Tornozelo',
        estilo: 'Blackwork',
        tamanhoCm: '14 cm',
        valorEstimado: 750,
        status: 'ORCAMENTO_ENVIADO',
      },
      {
        titulo: 'Retrato do Pet (Cachorro)',
        clienteId: c1.id,
        descricao: 'Micro realismo do Golden Retriever no bíceps interno.',
        localCorpo: 'Braço (Bíceps)',
        estilo: 'Realismo',
        tamanhoCm: '10 cm',
        valorEstimado: 900,
        status: 'AGUARDANDO_SINAL',
      },
    ],
  });

  console.log('Seed Gullart Lettering executado com sucesso!');
  console.log('Login Admin: admin@gullartlettering.com | Senha: senha123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

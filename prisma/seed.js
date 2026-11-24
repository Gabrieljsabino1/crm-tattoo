const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

const IMG_REF_LEAO = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#0B0912"/>
  <circle cx="300" cy="300" r="210" fill="none" stroke="#3D3157" stroke-width="2" stroke-dasharray="6 8"/>
  <polygon points="300,110 385,180 420,290 370,415 300,475 230,415 180,290 215,180" fill="#161124" stroke="#E5E7EB" stroke-width="3"/>
  <polygon points="300,155 355,215 375,305 300,425 225,305 245,215" fill="none" stroke="#8B5CF6" stroke-width="2.5"/>
  <path d="M250,270 L285,282 M350,270 L315,282 M285,345 L300,362 L315,345 M272,385 Q300,405 328,385" stroke="#F5F5F7" stroke-width="4" stroke-linecap="round" fill="none"/>
  <circle cx="268" cy="285" r="7" fill="#F5F5F7"/><circle cx="332" cy="285" r="7" fill="#F5F5F7"/>
  <text x="300" y="545" text-anchor="middle" fill="#B4AEC4" font-family="sans-serif" font-size="18" letter-spacing="3">REFERENCIA • LEAO PRETO E CINZA</text>
</svg>`);

const IMG_ESBOCO_LEAO = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#F6F5FA"/>
  <g stroke="#1E1630" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="300" cy="285" r="195" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 6"/>
    <line x1="300" y1="65" x2="300" y2="515" stroke="#94A3B8" stroke-width="1" stroke-dasharray="5 5"/>
    <polygon points="300,105 390,175 425,295 375,420 300,480 225,420 175,295 210,175" stroke-width="2.5"/>
    <polygon points="300,150 360,210 380,305 300,430 220,305 240,210" stroke="#7C3AED" stroke-width="2"/>
    <path d="M210,175 L300,220 L390,175 M175,295 L250,275 L300,320 L350,275 L425,295" stroke-width="1.5"/>
    <path d="M265,282 Q278,274 288,285 M335,282 Q322,274 312,285 M288,350 L300,368 L312,350" stroke-width="3"/>
  </g>
  <text x="300" y="555" text-anchor="middle" fill="#475569" font-family="monospace" font-size="17" letter-spacing="2">ESBOCO / DECALQUE • 18 CM</text>
</svg>`);

const IMG_REF_LETTERING = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#0B0912"/>
  <g stroke="#F5F5F7" fill="none" stroke-linecap="round">
    <path d="M120,310 Q210,190 300,300 T480,290" stroke="#8B5CF6" stroke-width="3"/>
    <path d="M140,350 Q260,240 360,340 T490,325" stroke="#F5F5F7" stroke-width="2" opacity="0.6"/>
  </g>
  <text x="300" y="295" text-anchor="middle" fill="#F5F5F7" font-family="Georgia, serif" font-size="58" font-style="italic">Blessed</text>
  <text x="300" y="545" text-anchor="middle" fill="#B4AEC4" font-family="sans-serif" font-size="18" letter-spacing="3">REFERENCIA • LETTERING GOTICO</text>
</svg>`);

const IMG_ESBOCO_LETTERING = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#F8F7FC"/>
  <line x1="70" y1="305" x2="530" y2="305" stroke="#C4B5FD" stroke-width="1.5" stroke-dasharray="6 6"/>
  <text x="300" y="300" text-anchor="middle" fill="#181226" font-family="Georgia, serif" font-size="64" font-style="italic">Blessed</text>
  <text x="300" y="555" text-anchor="middle" fill="#475569" font-family="monospace" font-size="17" letter-spacing="2">ESBOCO LETTERING • 14 CM</text>
</svg>`);

const IMG_RESULTADO_DRAGAO = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="skin" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#221933"/>
      <stop offset="100%" stop-color="#09070F"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#skin)"/>
  <path d="M180,450 C140,360 220,280 300,280 C380,280 430,220 390,145 C355,95 270,115 245,170 C225,215 290,235 335,210" fill="none" stroke="#F5F5F7" stroke-width="10" stroke-linecap="round"/>
  <path d="M195,435 C165,365 235,300 300,300 C370,300 412,240 375,170" fill="none" stroke="#8B5CF6" stroke-width="3.5" stroke-dasharray="10 8"/>
  <circle cx="332" cy="155" r="8" fill="#FF9500"/>
  <rect x="36" y="36" width="165" height="32" rx="16" fill="#34C759" fill-opacity="0.18" stroke="#34C759" stroke-opacity="0.5"/>
  <text x="118" y="57" text-anchor="middle" fill="#34C759" font-family="sans-serif" font-size="13" font-weight="bold">CONCLUIDA</text>
  <text x="300" y="545" text-anchor="middle" fill="#B4AEC4" font-family="sans-serif" font-size="18" letter-spacing="3">RESULTADO • PRETO E CINZA</text>
</svg>`);

const IMG_RESULTADO_ADAGA = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#0D0A14"/>
  <g stroke="#F5F5F7" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <polygon points="300,95 322,350 300,455 278,350" fill="#1A1429" stroke-width="3.5"/>
    <line x1="300" y1="100" x2="300" y2="448" stroke="#8B5CF6" stroke-width="2"/>
    <rect x="242" y="344" width="116" height="16" rx="8" fill="#1A1429" stroke-width="3"/>
    <rect x="288" y="360" width="24" height="72" rx="6" fill="#1A1429" stroke-width="3"/>
    <circle cx="300" cy="450" r="14" fill="#8B5CF6" stroke="#F5F5F7" stroke-width="2.5"/>
  </g>
  <rect x="36" y="36" width="165" height="32" rx="16" fill="#34C759" fill-opacity="0.18" stroke="#34C759" stroke-opacity="0.5"/>
  <text x="118" y="57" text-anchor="middle" fill="#34C759" font-family="sans-serif" font-size="13" font-weight="bold">CONCLUIDA</text>
  <text x="300" y="545" text-anchor="middle" fill="#B4AEC4" font-family="sans-serif" font-size="18" letter-spacing="3">RESULTADO • ADAGA BLACKWORK</text>
</svg>`);

function dateOffset(daysOffset, hours, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function main() {
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

  const equipe = await prisma.user.create({
    data: {
      nome: 'Marina Costa',
      email: 'equipe@gullartlettering.com',
      senha: hashedPassword,
      role: 'TATUADOR',
      especialidade: 'Fine Line & Blackwork',
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
        observacoes: 'Prefere lettering gótico fino e sombreado suave. Sem alergias.',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Rafael Mendes',
        telefone: '41987442210',
        email: 'rafael.mendes@email.com',
        instagram: '@rafamendes_cwb',
        cidade: 'São José dos Pinhais',
        observacoes: 'Projeto de fechamento de braço preto e cinza em 3 sessões.',
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
        observacoes: 'Curte blackwork e lettering pesado.',
      },
    }),
  ]);

  await prisma.agendamento.create({
    data: {
      codigo: 101,
      clienteId: c1.id,
      tatuadorId: admin.id,
      titulo: 'Leão Preto e Cinza Realista',
      descricao:
        'Leão realista sombreado em preto e cinza com traços geométricos limpos. Foco no olhar e contraste suave.',
      dataHora: dateOffset(0, 14, 0),
      duracaoMinutos: 180,
      localCorpo: 'Antebraço (parte externa)',
      estilo: 'Preto e Cinza',
      tamanhoCm: '18 cm',
      valorTotal: 1200,
      valorSinal: 300,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO',
      imagens: {
        create: [
          { tipo: 'REFERENCIA', url: IMG_REF_LEAO, legenda: 'Referência enviada no WhatsApp' },
          { tipo: 'ESBOCO', url: IMG_ESBOCO_LEAO, legenda: 'Decalque final aprovado (18cm)' },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 102,
      clienteId: c2.id,
      tatuadorId: admin.id,
      titulo: 'Lettering Gótico "Blessed"',
      descricao: 'Caligrafia exclusiva Fraktur acompanhando a curva da costela com ornamentos finos.',
      dataHora: dateOffset(0, 17, 30),
      duracaoMinutos: 90,
      localCorpo: 'Costela',
      estilo: 'Lettering',
      tamanhoCm: '14 cm',
      valorTotal: 650,
      valorSinal: 150,
      sinalPago: true,
      formaPagamento: 'Cartão de Crédito',
      status: 'CONFIRMADO',
      imagens: {
        create: [
          { tipo: 'REFERENCIA', url: IMG_REF_LETTERING, legenda: 'Estilo de caligrafia desejada' },
          { tipo: 'ESBOCO', url: IMG_ESBOCO_LETTERING, legenda: 'Esboço pronto para decalque' },
        ],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 103,
      clienteId: c4.id,
      tatuadorId: equipe.id,
      titulo: 'Escrita Minimalista no Pulso',
      descricao: 'Palavra em caligrafia delicada no pulso esquerdo. Falta aprovar o esboço final.',
      dataHora: dateOffset(1, 10, 30),
      duracaoMinutos: 60,
      localCorpo: 'Pulso',
      estilo: 'Lettering',
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
      titulo: 'Fechamento Preto e Cinza — Sessão 2',
      descricao: 'Continuação do sombreado no ombro e bíceps conectando com a 1ª sessão.',
      dataHora: dateOffset(3, 13, 0),
      duracaoMinutos: 240,
      localCorpo: 'Braço inteiro (Fechamento)',
      estilo: 'Preto e Cinza',
      tamanhoCm: 'Fechamento',
      valorTotal: 1600,
      valorSinal: 400,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONFIRMADO',
      imagens: {
        create: [{ tipo: 'REFERENCIA', url: IMG_RESULTADO_DRAGAO, legenda: 'Continuidade da 1ª sessão' }],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 98,
      clienteId: c3.id,
      tatuadorId: admin.id,
      titulo: 'Dragão Preto e Cinza — Sessão 1',
      descricao: 'Traço principal e base de sombra do dragão subindo do antebraço até o ombro.',
      dataHora: dateOffset(-12, 14, 0),
      duracaoMinutos: 240,
      localCorpo: 'Antebraço (parte externa)',
      estilo: 'Preto e Cinza',
      tamanhoCm: '32 cm',
      valorTotal: 1500,
      valorSinal: 400,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONCLUIDO',
      observacoesSessao: 'Usado 9RL + 11MG. Dynamic Black + sumi wash. Cicatrização excelente.',
      concluidoEm: dateOffset(-12, 18, 0),
      imagens: {
        create: [{ tipo: 'RESULTADO', url: IMG_RESULTADO_DRAGAO, legenda: 'Foto logo após finalizar a 1ª sessão' }],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 99,
      clienteId: c5.id,
      tatuadorId: admin.id,
      titulo: 'Adaga Blackwork com Pontilhismo',
      descricao: 'Adaga ornamental em blackwork sólido com pontilhismo suave na panturrilha.',
      dataHora: dateOffset(-5, 15, 0),
      duracaoMinutos: 150,
      localCorpo: 'Panturrilha',
      estilo: 'Blackwork',
      tamanhoCm: '20 cm',
      valorTotal: 950,
      valorSinal: 250,
      sinalPago: true,
      formaPagamento: 'Cartão de Crédito',
      status: 'CONCLUIDO',
      observacoesSessao: 'Agulhas 7RL e 9RS. Ótima saturação.',
      concluidoEm: dateOffset(-5, 17, 30),
      imagens: {
        create: [{ tipo: 'RESULTADO', url: IMG_RESULTADO_ADAGA, legenda: 'Resultado final no estúdio' }],
      },
    },
  });

  await prisma.agendamento.create({
    data: {
      codigo: 100,
      clienteId: c2.id,
      tatuadorId: admin.id,
      titulo: 'Lettering Autoral no Ombro',
      descricao: 'Escrita autoral com traço fino e sombreamento suave.',
      dataHora: dateOffset(-2, 11, 0),
      duracaoMinutos: 60,
      localCorpo: 'Ombro',
      estilo: 'Lettering',
      tamanhoCm: '10 cm',
      valorTotal: 420,
      valorSinal: 100,
      sinalPago: true,
      formaPagamento: 'PIX',
      status: 'CONCLUIDO',
      observacoesSessao: 'Feito com 3RL e 5RL. Sem necessidade de retoque.',
      concluidoEm: dateOffset(-2, 12, 0),
      imagens: {
        create: [
          { tipo: 'REFERENCIA', url: IMG_REF_LETTERING, legenda: 'Referência' },
          { tipo: 'ESBOCO', url: IMG_ESBOCO_LETTERING, legenda: 'Esboço final' },
        ],
      },
    },
  });

  await prisma.orcamento.createMany({
    data: [
      {
        titulo: 'Lettering no Peito (Fraktur)',
        clienteId: c4.id,
        descricao: 'Quer frase no peito inteiro em fonte gótica com sombreamento preto e cinza.',
        localCorpo: 'Peito / Tórax',
        estilo: 'Lettering',
        tamanhoCm: '26 cm',
        valorEstimado: 1400,
        status: 'NOVO_PEDIDO',
      },
      {
        titulo: 'Cobertura no Tornozelo',
        clienteId: c5.id,
        descricao: 'Cobrir símbolo antigo de 5cm com blackwork sombreado.',
        localCorpo: 'Tornozelo / Pé',
        estilo: 'Blackwork',
        tamanhoCm: '14 cm',
        valorEstimado: 750,
        status: 'ORCAMENTO_ENVIADO',
      },
      {
        titulo: 'Retrato Preto e Cinza',
        clienteId: c1.id,
        descricao: 'Micro realismo em preto e cinza no bíceps interno.',
        localCorpo: 'Braço / Bíceps',
        estilo: 'Preto e Cinza',
        tamanhoCm: '12 cm',
        valorEstimado: 950,
        status: 'AGUARDANDO_SINAL',
      },
    ],
  });

  console.log('Seed NeonDB Gullart Lettering (schema crm_tattoo) executado com sucesso!');
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

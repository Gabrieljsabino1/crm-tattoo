# 𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤 — 𝔓𝔯𝔢𝔱𝔬 𝔢 𝔠𝔦𝔫𝔷𝔞 🇧🇷

CRM & Agenda PWA completo em **Next.js (PWA)** + **Express / Prisma**, baseado na arquitetura e visual dark do `imports-curitiba-crm`, personalizado com a identidade e tipografia Fraktur (`UnifrakturMaguntia`) da **𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤**.

## Funcionalidades

- **Agenda & Sessões (`/agenda`)**: Calendário mensal interativo com visualização diária/filtrada, horários, duração, local no corpo, estilo, tamanho, descrição da ideia, controle de sinal pago e status da sessão.
- **Fotos da Tattoo, Referências & Esboços**: Upload múltiplo (clique, arraste ou `Ctrl+V`) separado em abas **Referências**, **Esboço / Decalque** e **Tattoo Pronta**, com visualização ampliada (Lightbox).
- **Serviços Já Realizados (`/servicos`)**: Histórico completo e portfólio visual (Grade ou Lista) de tatuagens concluídas, faturamento, ticket médio e filtros por estilo ou cliente.
- **Funil de Orçamentos (`/orcamentos`)**: Kanban arrastável (`Novo Pedido` → `Orçamento Enviado` → `Aguardando Sinal` → `Agendado`) com conversão em 1 clique para a Agenda.
- **Clientes (`/clientes`)**: Cadastro com WhatsApp direto, Instagram, observações/anamnese (alergias/pele) e histórico completo de sessões por cliente.
- **PWA Instalável**: Manifesto, ícones, service worker (`@ducanh2912/next-pwa`) e barra de navegação mobile inferior para uso no celular como aplicativo.

## Como Rodar Localmente

### 1. Backend (API + Banco SQLite pronto para uso)
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
A API iniciará em `http://localhost:3333`.

### 2. Frontend (Next.js PWA)
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`.

### Acesso Padrão (Seed)
- **E-mail:** `admin@gullartlettering.com`
- **Senha:** `senha123`

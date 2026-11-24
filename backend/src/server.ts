import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import clientesRoutes from './routes/clientesRoutes';
import agendamentosRoutes from './routes/agendamentosRoutes';
import orcamentosRoutes from './routes/orcamentosRoutes';
import dashboardsRoutes from './routes/dashboardsRoutes';
import alertasRoutes from './routes/alertasRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Arquivos Estáticos (Fotos de referência, esboços e tattoos concluídas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas Principais
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/clientes', clientesRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/orcamentos', orcamentosRoutes);
app.use('/dashboards', dashboardsRoutes);
app.use('/alertas', alertasRoutes);

// Healthcheck
app.get('/', (_req, res) => {
  res.json({
    message: 'API 𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤 / 𝔓𝔯𝔢𝔱𝔬 𝔢 𝔠𝔦𝔫𝔷𝔞 🇧🇷 online!',
    status: 'ONLINE',
    version: '1.0.0',
  });
});

app.listen(PORT, () => {
  console.log(`Gullart Lettering API rodando em http://localhost:${PORT}`);
});

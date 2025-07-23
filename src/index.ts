import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// rotas
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import listRoutes from './routes/list.routes';
import cardRoutes from './routes/card.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir HTML estático
app.use(express.static(path.join(__dirname, '../public')));

// Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Redirecionar raiz para index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

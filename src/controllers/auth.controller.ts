import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async (req: Request, res: Response) => {
  //const { name, email, password } = req.body;

  console.log('BODY RECEBIDO:', req.body);

  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .setHeader('Content-Type', 'application/json')
        .json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return res
      .status(201)
      .setHeader('Content-Type', 'application/json')
      .json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return res
      .status(500)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Erro no servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

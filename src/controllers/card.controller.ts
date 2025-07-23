import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCard = async (req: Request, res: Response) => {
  const { title, description, listId } = req.body;
  const userId = (req as any).userId;

  try {
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({
      where: { id: list.boardId, userId },
    });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    const maxOrder = await prisma.card.aggregate({
      where: { listId },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? 0) + 1;

    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        order: newOrder,
      },
    });

    res.status(201).json(card);
  } catch {
    res.status(500).json({ error: 'Erro ao criar card' });
  }
};

export const getCardsByList = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const userId = (req as any).userId;

  try {
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({
      where: { id: list.boardId, userId },
    });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    const cards = await prisma.card.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
    });

    res.json(cards);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar cards' });
  }
};

export const updateCard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, order, listId } = req.body;
  const userId = (req as any).userId;

  try {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) return res.status(404).json({ error: 'Card não encontrado' });

    const list = await prisma.list.findUnique({ where: { id: card.listId } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({
      where: { id: list.boardId, userId },
    });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    const updated = await prisma.card.update({
      where: { id },
      data: {
        title,
        description,
        order,
        listId: listId ?? card.listId,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar card' });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) return res.status(404).json({ error: 'Card não encontrado' });

    const list = await prisma.list.findUnique({ where: { id: card.listId } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({
      where: { id: list.boardId, userId },
    });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.card.delete({ where: { id } });

    res.json({ message: 'Card deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar card' });
  }
};

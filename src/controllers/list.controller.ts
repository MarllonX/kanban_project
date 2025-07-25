import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createList = async (req: Request, res: Response) => {
  const { title, boardId } = req.body;
  const userId = (req as any).userId;

  try {
    const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
    if (!board) return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });

    const maxOrder = await prisma.list.aggregate({
      where: { boardId },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? 0) + 1;

    // Cor herdada do board (light-blue, light-yellow, etc)
    const lightColor = `bg-light-${board.color || 'gray'}`;

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        order: newOrder,
        color: lightColor,
      },
    });

    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar lista' });
  }
};


export const getListsByBoard = async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = (req as any).userId;

  try {
    // Validação de ownership
    const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
    if (!board) return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });

    const lists = await prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: { cards: true },
    });

    res.json(lists);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar listas' });
  }
};

export const updateList = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, order, color } = req.body;
  const userId = (req as any).userId;

  try {
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({ where: { id: list.boardId, userId } });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    const updated = await prisma.list.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(typeof order === 'number' && { order }),
        ...(color && { color }),
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar lista' });
  }
};


export const deleteList = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const list = await prisma.list.findUnique({ where: { id } });
    if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

    const board = await prisma.board.findFirst({ where: { id: list.boardId, userId } });
    if (!board) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.list.delete({ where: { id } });
    res.json({ message: 'Lista deletada com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar lista' });
  }
};

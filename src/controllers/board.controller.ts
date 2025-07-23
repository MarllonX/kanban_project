import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBoard = async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = (req as any).userId;

  try {
    const board = await prisma.board.create({
      data: { title, userId },
    });
    res.status(201).json(board);
  } catch {
    res.status(500).json({ error: 'Erro ao criar o board' });
  }
};

export const getBoards = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const boards = await prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boards);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar boards' });
  }
};

export const getBoardById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const board = await prisma.board.findFirst({
      where: { id, userId },
      include: {
        lists: {
          include: {
            cards: true,
          },
          orderBy: { order: 'asc' }
        },
      },
    });

    if (!board) return res.status(404).json({ error: 'Board não encontrado' });

    res.json(board);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar board' });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = (req as any).userId;

  try {
    const board = await prisma.board.updateMany({
      where: { id, userId },
      data: { title },
    });

    if (board.count === 0)
      return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });

    res.json({ message: 'Board atualizado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar board' });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    await prisma.board.deleteMany({ where: { id, userId } });
    res.json({ message: 'Board deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar board' });
  }
};

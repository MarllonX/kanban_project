"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBoard = exports.updateBoard = exports.getBoardById = exports.getBoards = exports.createBoard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createBoard = async (req, res) => {
    const { title } = req.body;
    const userId = req.userId;
    try {
        const board = await prisma.board.create({
            data: { title, userId },
        });
        res.status(201).json(board);
    }
    catch {
        res.status(500).json({ error: 'Erro ao criar o board' });
    }
};
exports.createBoard = createBoard;
const getBoards = async (req, res) => {
    const userId = req.userId;
    try {
        const boards = await prisma.board.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(boards);
    }
    catch {
        res.status(500).json({ error: 'Erro ao buscar boards' });
    }
};
exports.getBoards = getBoards;
const getBoardById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
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
        if (!board)
            return res.status(404).json({ error: 'Board não encontrado' });
        res.json(board);
    }
    catch {
        res.status(500).json({ error: 'Erro ao buscar board' });
    }
};
exports.getBoardById = getBoardById;
const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.userId;
    try {
        const board = await prisma.board.updateMany({
            where: { id, userId },
            data: { title },
        });
        if (board.count === 0)
            return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });
        res.json({ message: 'Board atualizado com sucesso' });
    }
    catch {
        res.status(500).json({ error: 'Erro ao atualizar board' });
    }
};
exports.updateBoard = updateBoard;
const deleteBoard = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        await prisma.board.deleteMany({ where: { id, userId } });
        res.json({ message: 'Board deletado com sucesso' });
    }
    catch {
        res.status(500).json({ error: 'Erro ao deletar board' });
    }
};
exports.deleteBoard = deleteBoard;

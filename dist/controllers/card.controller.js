"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.updateCard = exports.getCardsByList = exports.createCard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createCard = async (req, res) => {
    const { title, description, listId } = req.body;
    const userId = req.userId;
    try {
        const list = await prisma.list.findUnique({ where: { id: listId } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({
            where: { id: list.boardId, userId },
        });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
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
    }
    catch {
        res.status(500).json({ error: 'Erro ao criar card' });
    }
};
exports.createCard = createCard;
const getCardsByList = async (req, res) => {
    const { listId } = req.params;
    const userId = req.userId;
    try {
        const list = await prisma.list.findUnique({ where: { id: listId } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({
            where: { id: list.boardId, userId },
        });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
        const cards = await prisma.card.findMany({
            where: { listId },
            orderBy: { order: 'asc' },
        });
        res.json(cards);
    }
    catch {
        res.status(500).json({ error: 'Erro ao buscar cards' });
    }
};
exports.getCardsByList = getCardsByList;
const updateCard = async (req, res) => {
    const { id } = req.params;
    const { title, description, order, listId } = req.body;
    const userId = req.userId;
    try {
        const card = await prisma.card.findUnique({ where: { id } });
        if (!card)
            return res.status(404).json({ error: 'Card não encontrado' });
        const list = await prisma.list.findUnique({ where: { id: card.listId } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({
            where: { id: list.boardId, userId },
        });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
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
    }
    catch {
        res.status(500).json({ error: 'Erro ao atualizar card' });
    }
};
exports.updateCard = updateCard;
const deleteCard = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const card = await prisma.card.findUnique({ where: { id } });
        if (!card)
            return res.status(404).json({ error: 'Card não encontrado' });
        const list = await prisma.list.findUnique({ where: { id: card.listId } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({
            where: { id: list.boardId, userId },
        });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
        await prisma.card.delete({ where: { id } });
        res.json({ message: 'Card deletado com sucesso' });
    }
    catch {
        res.status(500).json({ error: 'Erro ao deletar card' });
    }
};
exports.deleteCard = deleteCard;

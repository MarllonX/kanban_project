"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteList = exports.updateList = exports.getListsByBoard = exports.createList = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createList = async (req, res) => {
    const { title, boardId } = req.body;
    const userId = req.userId;
    try {
        // Verifica se o board pertence ao usuário
        const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
        if (!board)
            return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });
        // Define a ordem automaticamente como o maior valor atual + 1
        const maxOrder = await prisma.list.aggregate({
            where: { boardId },
            _max: { order: true },
        });
        const newOrder = (maxOrder._max.order ?? 0) + 1;
        const list = await prisma.list.create({
            data: {
                title,
                boardId,
                order: newOrder,
            },
        });
        res.status(201).json(list);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao criar lista' });
    }
};
exports.createList = createList;
const getListsByBoard = async (req, res) => {
    const { boardId } = req.params;
    const userId = req.userId;
    try {
        // Validação de ownership
        const board = await prisma.board.findFirst({ where: { id: boardId, userId } });
        if (!board)
            return res.status(404).json({ error: 'Board não encontrado ou não autorizado' });
        const lists = await prisma.list.findMany({
            where: { boardId },
            orderBy: { order: 'asc' },
            include: { cards: true },
        });
        res.json(lists);
    }
    catch {
        res.status(500).json({ error: 'Erro ao buscar listas' });
    }
};
exports.getListsByBoard = getListsByBoard;
const updateList = async (req, res) => {
    const { id } = req.params;
    const { title, order } = req.body;
    const userId = req.userId;
    try {
        // Verifica se a lista pertence a um board do usuário
        const list = await prisma.list.findUnique({ where: { id } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({ where: { id: list.boardId, userId } });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
        const updated = await prisma.list.update({
            where: { id },
            data: { title, order },
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: 'Erro ao atualizar lista' });
    }
};
exports.updateList = updateList;
const deleteList = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const list = await prisma.list.findUnique({ where: { id } });
        if (!list)
            return res.status(404).json({ error: 'Lista não encontrada' });
        const board = await prisma.board.findFirst({ where: { id: list.boardId, userId } });
        if (!board)
            return res.status(403).json({ error: 'Acesso negado' });
        await prisma.list.delete({ where: { id } });
        res.json({ message: 'Lista deletada com sucesso' });
    }
    catch {
        res.status(500).json({ error: 'Erro ao deletar lista' });
    }
};
exports.deleteList = deleteList;

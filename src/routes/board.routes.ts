import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard
} from '../controllers/board.controller';

const router = Router();

router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;

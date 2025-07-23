import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createList,
  getListsByBoard,
  updateList,
  deleteList
} from '../controllers/list.controller';

const router = Router();

router.use(authenticate);

router.post('/', createList);
router.get('/board/:boardId', getListsByBoard);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;

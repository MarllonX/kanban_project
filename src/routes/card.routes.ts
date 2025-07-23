import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard
} from '../controllers/card.controller';

const router = Router();

router.use(authenticate);

router.post('/', createCard);
router.get('/list/:listId', getCardsByList);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;

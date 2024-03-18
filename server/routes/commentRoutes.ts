import express from 'express';
import { createCommentController, getCommentByIdController, updateCommentController, deleteCommentController } from '../controllers/commentController';
import { isAuthenticated } from '../middlewares/auth';

const router = express.Router();

// Non-authenticated routes
router.get('/:commentId', getCommentByIdController);

// Authenticated routes
router.use(isAuthenticated);

router.post('/:postId', createCommentController);
router.put('/:commentId', updateCommentController);
router.delete('/:commentId', deleteCommentController);

export default router;

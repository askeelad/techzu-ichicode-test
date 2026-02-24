import { Router, RequestHandler } from 'express';
import * as postController from './post.controller';
import * as likeController from '../likes/like.controller';
import * as commentController from '../comments/comment.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createPostSchema, getPostsQuerySchema } from './post.schema';
import { createCommentSchema } from '../comments/comment.schema';
import { AuthenticatedRequest } from '../../types/request.types';

const router = Router();

const auth = requireAuth as unknown as RequestHandler;

// Feed
router.get('/', auth, validate(getPostsQuerySchema), (req, res, next) => {
  void postController.getFeed(req as AuthenticatedRequest, res, next);
});

// Create post
router.post('/', auth, validate(createPostSchema), (req, res, next) => {
  void postController.createPost(req as AuthenticatedRequest, res, next);
});

// Single post
router.get('/:id', auth, (req, res, next) => {
  void postController.getPostById(req as AuthenticatedRequest, res, next);
});

// Delete post
router.delete('/:id', auth, (req, res, next) => {
  void postController.deletePost(req as AuthenticatedRequest, res, next);
});

// Like / unlike
router.post('/:id/like', auth, (req, res, next) => {
  void likeController.toggleLike(req as AuthenticatedRequest, res, next);
});

// Add comment
router.post('/:id/comment', auth, validate(createCommentSchema), (req, res, next) => {
  void commentController.addComment(req as AuthenticatedRequest, res, next);
});

// Get comments
router.get('/:id/comments', auth, (req, res, next) => {
  void commentController.getComments(req as AuthenticatedRequest, res, next);
});

export default router;

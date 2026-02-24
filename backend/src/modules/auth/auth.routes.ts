import { Router, RequestHandler } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { signupSchema, loginSchema, refreshTokenSchema, fcmTokenSchema } from './auth.schema';
import { AuthenticatedRequest } from '../../types/request.types';

const router = Router();

router.post('/signup', validate(signupSchema), (req, res, next) => {
  void authController.signup(req, res, next);
});

router.post('/login', validate(loginSchema), (req, res, next) => {
  void authController.login(req, res, next);
});

router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => {
  void authController.refresh(req, res, next);
});

router.post('/logout', requireAuth as unknown as RequestHandler, (req, res, next) => {
  void authController.logout(req as AuthenticatedRequest, res, next);
});

router.put(
  '/fcm-token',
  requireAuth as unknown as RequestHandler,
  validate(fcmTokenSchema),
  (req, res, next) => {
    void authController.updateFcmToken(req as AuthenticatedRequest, res, next);
  },
);

export default router;

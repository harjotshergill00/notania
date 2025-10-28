import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { verifySession } from './auth.service';

export const userRouter = Router();

userRouter.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    req.userId = verifySession(token);
    res.json({ userId: req.userId });
  } catch (error) {
    next(error);
  }
});

userRouter.use((req, res, next) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    req.userId = verifySession(token);
    next();
  } catch (error) {
    next(error);
  }
});

userRouter.post('/me/favorites', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { gameId } = req.body as { gameId?: string };
    if (!gameId) {
      return res.status(400).json({ message: 'gameId is required' });
    }
    await prisma.favorite.upsert({
      where: {
        userId_gameId: { userId, gameId },
      },
      create: { userId, gameId },
      update: {},
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

userRouter.delete('/me/favorites/:gameId', async (req, res, next) => {
  try {
    const userId = req.userId!;
    await prisma.favorite.delete({
      where: {
        userId_gameId: { userId, gameId: req.params.gameId },
      },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

userRouter.post('/history', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { gameId } = req.body as { gameId?: string };
    if (!gameId) {
      return res.status(400).json({ message: 'gameId is required' });
    }
    await prisma.history.create({ data: { userId, gameId } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

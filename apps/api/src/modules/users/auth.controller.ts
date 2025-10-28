import { Router } from 'express';
import { authenticateUser, registerUser, getUserProfile, verifySession } from './auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const session = await registerUser(req.body);
    res
      .cookie('session', session.token, {
        httpOnly: true,
        maxAge: session.expiresIn * 1000,
        sameSite: 'lax',
      })
      .json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const session = await authenticateUser(req.body);
    res
      .cookie('session', session.token, {
        httpOnly: true,
        maxAge: session.expiresIn * 1000,
        sameSite: 'lax',
      })
      .json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (_req, res, next) => {
  try {
    res.clearCookie('session').json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = verifySession(token);
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

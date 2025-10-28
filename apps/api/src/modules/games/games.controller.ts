import { Router } from 'express';
import { listGames, getGameBySlug, searchGames } from './games.service';

export const gamesRouter = Router();

gamesRouter.get('/', async (req, res, next) => {
  try {
    const result = await listGames(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

gamesRouter.get('/search', async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await searchGames(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

gamesRouter.get('/:slug', async (req, res, next) => {
  try {
    const game = await getGameBySlug(req.params.slug);
    res.json(game);
  } catch (error) {
    next(error);
  }
});

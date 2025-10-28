import { Router } from 'express';

export const adsRouter = Router();

type SlotConfig = {
  id: string;
  network: 'gam' | 'adinplay';
  sizes: string[];
  path?: string;
};

const slots: SlotConfig[] = [
  { id: 'notania-hero-top', network: 'gam', sizes: ['970x250', '728x90'], path: '/19968336/notania-hero-top' },
  { id: 'notania-game-leaderboard', network: 'gam', sizes: ['970x250', '728x90'], path: '/19968336/notania-game-leaderboard' },
  { id: 'notania-game-rail', network: 'adinplay', sizes: ['300x600', '300x250'] },
  { id: 'notania-search-top', network: 'adinplay', sizes: ['970x90', '728x90'] },
];

adsRouter.get('/slots', (_req, res) => {
  res.json({ slots });
});

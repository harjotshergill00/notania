import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json } from 'body-parser';
import { gamesRouter } from './modules/games/games.controller';
import { authRouter } from './modules/users/auth.controller';
import { userRouter } from './modules/users/user.controller';
import { adsRouter } from './modules/ads/ads.controller';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';

const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(json());
app.use(requestLogger);

app.use('/games', gamesRouter);
app.use('/auth', authRouter);
app.use('/ads', adsRouter);
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

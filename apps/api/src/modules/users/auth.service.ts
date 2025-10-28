import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { HttpError } from '../../utils/http-error';
import { prisma } from '../../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = credentialsSchema.extend({
  displayName: z.string().min(2),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const { email, password, displayName } = registerSchema.parse(data);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
    },
  });
  return createSession(user.id);
}

export async function authenticateUser(data: z.infer<typeof credentialsSchema>) {
  const { email, password } = credentialsSchema.parse(data);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, 'Invalid credentials');
  }
  return createSession(user.id);
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favorites: true },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites.map((favorite) => favorite.gameId),
  };
}

export function createSession(userId: string) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
  return { token, expiresIn: TOKEN_TTL_SECONDS };
}

export function verifySession(token: string) {
  const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
  return payload.sub;
}

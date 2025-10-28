import { z } from 'zod';
import { prisma } from '../../config/prisma';

export const listGamesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

export async function listGames(params: Partial<z.infer<typeof listGamesSchema>>) {
  const { page, pageSize, category, featured } = listGamesSchema.parse(params);
  const where: any = {};
  if (category) {
    where.categories = { has: category };
  }
  if (typeof featured === 'boolean') {
    where.featured = featured;
  }

  const [data, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.game.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getGameBySlug(slug: string) {
  return prisma.game.findUniqueOrThrow({ where: { slug } });
}

export async function searchGames(query: string) {
  const page = 1;
  const pageSize = 24;
  const data = await prisma.game.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { genre: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    },
    take: pageSize,
  });
  return { data, total: data.length, page, pageSize };
}

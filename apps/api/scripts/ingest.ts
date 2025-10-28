import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const prisma = new PrismaClient();

const gameSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  rating: z.number(),
  players: z.number(),
  releaseDate: z.string(),
  playUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  developer: z.string(),
  publisher: z.string(),
  featured: z.boolean().optional(),
});

type GameRecord = z.infer<typeof gameSchema>;

async function loadSource(): Promise<GameRecord[]> {
  const filePath = path.join(process.cwd(), 'data', 'games.json');
  const raw = await readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  return z.array(gameSchema).parse(parsed);
}

async function upsertGame(record: GameRecord) {
  await prisma.game.upsert({
    where: { slug: record.slug },
    update: {
      title: record.title,
      description: record.description,
      genre: record.genre,
      categories: record.categories,
      tags: record.tags,
      rating: record.rating,
      players: record.players,
      releaseDate: new Date(record.releaseDate),
      playUrl: record.playUrl,
      thumbnailUrl: record.thumbnailUrl,
      developer: record.developer,
      publisher: record.publisher,
      featured: record.featured ?? false,
    },
    create: {
      slug: record.slug,
      title: record.title,
      description: record.description,
      genre: record.genre,
      categories: record.categories,
      tags: record.tags,
      rating: record.rating,
      players: record.players,
      releaseDate: new Date(record.releaseDate),
      playUrl: record.playUrl,
      thumbnailUrl: record.thumbnailUrl,
      developer: record.developer,
      publisher: record.publisher,
      featured: record.featured ?? false,
    },
  });
}

async function main() {
  const records = await loadSource();
  let processed = 0;
  for (const record of records) {
    await upsertGame(record);
    processed += 1;
    if (processed % 100 === 0) {
      console.log(`Ingested ${processed} games`);
    }
  }
  console.log(`Finished ingesting ${processed} games`);
}

main()
  .catch((error) => {
    console.error('Ingestion failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

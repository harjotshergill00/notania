import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.history.deleteMany();
  await prisma.game.deleteMany();

  const genres = ['Action', 'Adventure', 'Puzzle', 'Strategy', 'Sports', 'Multiplayer'];
  const categories = ['Featured', 'Top Rated', 'New Releases', 'Indie Gems', 'Family Friendly', 'Retro'];

  const games = Array.from({ length: 1000 }).map((_, index) => {
    const title = faker.commerce.productName();
    const slug = faker.helpers.slugify(`${title}-${index}`).toLowerCase();
    return {
      slug,
      title,
      description: faker.lorem.paragraph(),
      genre: faker.helpers.arrayElement(genres),
      categories: faker.helpers.arrayElements(categories, { min: 2, max: 3 }),
      tags: faker.helpers.arrayElements(['arcade', 'multiplayer', 'singleplayer', 'cozy', 'retro', 'challenge', 'casual'], {
        min: 3,
        max: 6,
      }),
      rating: Number(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
      players: faker.number.int({ min: 1000, max: 5000000 }),
      releaseDate: faker.date.past({ years: 10 }),
      playUrl: `https://games.notania.games/${slug}/index.html`,
      thumbnailUrl: `https://images.unsplash.com/${faker.string.uuid()}?auto=format&fit=crop&w=600&q=80`,
      developer: faker.company.name(),
      publisher: faker.company.name(),
      featured: index < 24,
    };
  });

  await prisma.game.createMany({ data: games });

  console.log(`Seeded ${games.length} games`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

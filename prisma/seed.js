import { PrismaClient } from "@prisma/client";
import instrumentsSeed from "./seeds/instrumentsSeed.js";
import genresSeed from "./seeds/genresSeed.js";
import socialMediaSeed from "./seeds/socialMediaSeed.js";

const prisma = new PrismaClient();

async function main() {
  await instrumentsSeed(prisma);
  await genresSeed(prisma);
  await socialMediaSeed(prisma);

  console.log("Seeding done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

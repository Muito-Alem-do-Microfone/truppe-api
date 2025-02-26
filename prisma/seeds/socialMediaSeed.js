import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const socialMediaSeed = async (prisma) => {
  const socialMediaPlatforms = [
    { name: "Facebook" },
    { name: "Instagram" },
    { name: "Twitter" },
    { name: "YouTube" },
    { name: "TikTok" },
    { name: "LinkedIn" },
    { name: "Snapchat" },
    { name: "Reddit" },
    { name: "Spotify" },
    { name: "Deezer" },
  ];

  // Upsert ensures that the records are created only if they don't exist
  for (const platform of socialMediaPlatforms) {
    await prisma.socialMedia.upsert({
      where: { name: platform.name },
      update: {},
      create: platform,
    });
  }

  console.log("✅ Social Media platforms seeded successfully!");
};

export default socialMediaSeed;

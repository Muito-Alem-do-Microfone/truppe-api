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

  await prisma.socialMedia.createMany({
    data: socialMediaPlatforms,
    skipDuplicates: true,
  });

  console.log("✅ Social Media platforms seeded successfully!");
};

export default socialMediaSeed;

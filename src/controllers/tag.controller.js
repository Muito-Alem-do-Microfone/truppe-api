import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTags = async (req, res) => {
  try {
    const tags = await prisma.tags.findMany();
    res.send(tags);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tags.",
    });
  }
};

export const tagController = {
  getTags,
};

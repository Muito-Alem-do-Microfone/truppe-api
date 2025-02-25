import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getGenres = async (req, res) => {
  try {
    const genresList = await prisma.genre.findMany();
    res.send(genresList);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving genres.",
    });
  }
};

export const genreController = { getGenres };

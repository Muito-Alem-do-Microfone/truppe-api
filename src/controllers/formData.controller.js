import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFormOptions = async (req, res) => {
  try {
    const [genres, instruments, tags] = await Promise.all([
      prisma.genre.findMany({ orderBy: { name: "asc" } }),
      prisma.instrument.findMany({ orderBy: { name: "asc" } }),
      prisma.tags.findMany({ orderBy: { name: "asc" } }),
    ]);

    res.status(200).json({ genres, instruments, tags });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving form options.",
    });
  }
};

export const formDataController = { getFormOptions };

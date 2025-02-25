import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getInstruments = async (req, res) => {
  try {
    const instruments = await prisma.instrument.findMany();
    res.send(instruments);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving instruments.",
    });
  }
};

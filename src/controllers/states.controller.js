import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getStates = async (req, res) => {
  try {
    const statesList = await prisma.state.findMany();
    res.send(statesList);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving states.",
    });
  }
};

export const statesController = { getStates };

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAnnouncement = async (req, res) => {
  const {
    title,
    name,
    number,
    email,
    type,
    genreIds,
    state,
    city,
    description,
    instrumentIds,
  } = req.body;

  if (
    !title ||
    !name ||
    !number ||
    !email ||
    !type ||
    !genreIds ||
    !state ||
    !city ||
    !description ||
    !instrumentIds
  ) {
    return res.status(400).send({
      message:
        "One or more required fields are missing: Title, Name, Number, Email, Type, GenreIds, State, City, Description, InstrumentIds",
    });
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        name,
        number,
        email,
        type,
        state,
        city,
        description,
        genres: {
          connect: genreIds.map((genreId) => ({ id: genreId })),
        },
        instruments: {
          connect: instrumentIds.map((instrumentId) => ({ id: instrumentId })),
        },
      },
    });

    return res.status(201).json({
      status: "success",
      data: announcement,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({
          status: "error",
          message: "Duplicate entry found for unique field.",
        });
      }
    }

    console.error(err);
    return res.status(500).json({
      status: "error",
      message:
        "An unexpected error occurred while creating the announcement. Please try again later.",
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const id = req.params.id;

  try {
    const announcement = await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).send({ message: "Announcement deleted successfully." });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "We had some errors while deleting this announcement.",
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  const id = req.params.id;
  const {
    title,
    name,
    number,
    email,
    type,
    genreIds,
    state,
    city,
    description,
    instrumentIds,
  } = req.body;

  if (
    !title ||
    !name ||
    !number ||
    !email ||
    !type ||
    !genreIds ||
    !state ||
    !city ||
    !description ||
    !instrumentIds
  ) {
    return res.status(400).send({
      message:
        "One or more required fields are missing: Title, Name, Number, Email, Type, GenreIds, State, City, Description, InstrumentIds",
    });
  }

  try {
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        genre,
        state,
        city,
        description,
        owner_type: ownerType,
        owner_id: ownerId,
        latitude,
        longitude,
      },
    });
    res.send({
      message: "Announcement updated successfully.",
      data: updatedAnnouncement,
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "We had some errors while updating this announcement.",
    });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany();
    res.send(announcements);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving announcements.",
    });
  }
};

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createAnnouncement = async (req, res) => {
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
    socialLinks,
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
      message: "One or more required fields are missing",
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
        socialLinks: {
          create: socialLinks.map(({ socialMediaId, url }) => ({
            url,
            socialMedia: { connect: { id: socialMediaId } },
          })),
        },
      },
      include: {
        genres: true,
        instruments: true,
        socialLinks: { include: { socialMedia: true } },
      },
    });

    return res.status(201).json({
      status: "success",
      data: announcement,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while creating the announcement.",
    });
  }
};

const deleteAnnouncement = async (req, res) => {
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

const updateAnnouncement = async (req, res) => {
  const id = parseInt(req.params.id);
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
    socialLinks,
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
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
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
          set: genreIds.map((genreId) => ({ id: genreId })),
        },
        instruments: {
          set: instrumentIds.map((instrumentId) => ({ id: instrumentId })),
        },
        socialLinks: {
          deleteMany: {},
          create: socialLinks.map(({ socialMediaId, url }) => ({
            url,
            socialMedia: { connect: { id: socialMediaId } },
          })),
        },
      },
      include: {
        genres: true,
        instruments: true,
        socialLinks: { include: { socialMedia: true } },
      },
    });

    return res.status(200).json({
      status: "success",
      data: updatedAnnouncement,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating the announcement.",
    });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcementsList = await prisma.announcement.findMany();
    res.send(announcementsList);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving announcements.",
    });
  }
};

export const announcementController = {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
};

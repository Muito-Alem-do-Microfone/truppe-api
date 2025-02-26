import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createAnnouncement = async (req, res) => {
  const {
    title,
    name,
    number,
    email,
    age,
    about,
    type,
    genreIds,
    state,
    city,
    description,
    instrumentIds,
    socialLinks,
    tagIds,
  } = req.body;

  if (
    !title ||
    !name ||
    !number ||
    !email ||
    !age ||
    !about ||
    !type ||
    !genreIds ||
    !state ||
    !city ||
    !description ||
    !instrumentIds ||
    !tagIds
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
        age,
        about,
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
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        genres: true,
        instruments: true,
        socialLinks: { include: { socialMedia: true } },
        tags: true,
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
  const id = parseInt(req.params.id); // Convert the ID to an integer

  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await prisma.announcement.delete({
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
    age,
    about,
    type,
    genreIds,
    tagIds,
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
    !age ||
    !about ||
    !type ||
    !genreIds ||
    !state ||
    !city ||
    !description ||
    !instrumentIds ||
    !tagIds
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
        age,
        about,
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
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        genres: true,
        instruments: true,
        socialLinks: { include: { socialMedia: true } },
        tags: true,
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
    const announcementsList = await prisma.announcement.findMany({
      include: {
        genres: true,
        instruments: true,
        tags: true,
      },
    });
    announcementsList.forEach((announcement) => {
      delete announcement.about;
      delete announcement.email;
      delete announcement.number;
    });
    res.send(announcementsList);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving announcements.",
    });
  }
};

const getAnnouncementById = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        socialLinks: {
          include: {
            socialMedia: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        genres: true,
        instruments: true,
        tags: true,
      },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const socialLinks = announcement.socialLinks.map((socialLink) => ({
      id: socialLink.id,
      url: socialLink.url,
      socialMediaId: socialLink.socialMedia.id,
      socialMediaName: socialLink.socialMedia.name,
    }));

    res.status(200).json({
      ...announcement,
      socialLinks,
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving the announcement.",
    });
  }
};

export const announcementController = {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncementById,
};

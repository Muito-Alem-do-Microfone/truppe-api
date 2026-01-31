import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "../services/s3/imageUpload.js";

const prisma = new PrismaClient();

const webhookURL = process.env.DISCORD_SERVER_WEBHOOK;

const createAnnouncement = async (req, res) => {
  const { name, type, state, city, description, userId } = req.body;

  const toArray = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const socialLinks = [];
  let i = 0;
  while (req.body[`socialLinks[${i}][socialMediaId]`]) {
    socialLinks.push({
      socialMediaId: req.body[`socialLinks[${i}][socialMediaId]`],
      url: req.body[`socialLinks[${i}][url]`],
    });
    i++;
  }

  const genreIds = toArray(req.body.genreIds);
  const instrumentIds = toArray(req.body.instrumentIds);
  const tagIds = toArray(req.body.tagIds);

  const requiredFields = { name, type, state, city, description, userId };
  const requiredArrays = { genreIds, instrumentIds, tagIds };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const emptyArrays = Object.entries(requiredArrays)
    .filter(([_, value]) => !value || value.length === 0)
    .map(([key]) => key);

  const errors = [...missingFields, ...emptyArrays];

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Missing required fields",
      fields: errors,
    });
  }

  try {
    const user = await prisma.appUser.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.log("Uploading image to S3...");

    const imageUrl = req.file ? await uploadToS3(req.file) : null;

    console.log("Image uploaded:", imageUrl);

    const announcement = await prisma.announcement.create({
      data: {
        name,
        type,
        state,
        city,
        description,
        imageUrl,
        userId: parseInt(userId),
        genres: {
          connect: genreIds.map((id) => ({ id: parseInt(id) })),
        },
        instruments: {
          connect: instrumentIds.map((id) => ({ id: parseInt(id) })),
        },
        tags: {
          connect: tagIds.map((id) => ({ id: parseInt(id) })),
        },
        socialLinks: {
          create: socialLinks.map(({ socialMediaId, url }) => ({
            url,
            socialMedia: { connect: { id: parseInt(socialMediaId) } },
          })),
        },
      },
      include: {
        genres: true,
        instruments: true,
        socialLinks: { include: { socialMedia: true } },
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: "success",
      data: announcement,
    });
  } catch (err) {
    console.error("Error creating announcement:", err);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while creating the announcement.",
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  const id = parseInt(req.params.id);

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
    name,
    type,
    genreIds,
    tagIds,
    state,
    city,
    description,
    instrumentIds,
    socialLinks,
  } = req.body;

  const requiredFields = { name, type, state, city, description };
  const requiredArrays = { genreIds, instrumentIds, tagIds };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const emptyArrays = Object.entries(requiredArrays)
    .filter(([_, value]) => !value || value.length === 0)
    .map(([key]) => key);

  const errors = [...missingFields, ...emptyArrays];

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Missing required fields",
      fields: errors,
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
        name,
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

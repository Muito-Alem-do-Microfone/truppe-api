import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "../services/s3/imageUpload.js";

const prisma = new PrismaClient();

const webhookURL = process.env.DISCORD_SERVER_WEBOOK;

const createAnnouncement = async (req, res) => {
  const {
    title,
    name,
    number,
    email,
    age,
    about,
    type,
    state,
    city,
    description,
    userId,
  } = req.body;

  const parsedAge = parseInt(age, 10);

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

  if (
    !title ||
    !name ||
    !number ||
    !email ||
    Number.isNaN(parsedAge) ||
    parsedAge <= 0 ||
    !about ||
    !type ||
    !state ||
    !city ||
    !description ||
    !userId ||
    !genreIds ||
    genreIds.length === 0 ||
    !instrumentIds ||
    instrumentIds.length === 0 ||
    !tagIds ||
    tagIds.length === 0
  ) {
    return res.status(400).send({
      message: "One or more required fields are missing or invalid",
    });
  }

  try {
    // Validate that the user exists
    const user = await prisma.appUser.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const imageUrl = req.file ? await uploadToS3(req.file) : null;

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
        age: parsedAge,
        about,
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

    const discordPayload = {
      username: "Muito Além do Microfone -- Busque sua banda 🎵",
      embeds: [
        {
          title: `Novo Anúncio: ${title}`,
          description: `${city}, ${state}\n\n${description}`,
          color: 0x2ecc71,
          timestamp: new Date().toISOString(),
          fields: [
            { name: "Nome", value: name, inline: true },
            { name: "Tipo", value: type, inline: true },

            {
              name: "Gêneros",
              value:
                announcement.genres.map((g) => g.name).join(", ") ||
                "Não informado",
              inline: true,
            },
            {
              name: "Instrumentos",
              value:
                announcement.instruments.map((i) => i.name).join(", ") ||
                "Não informado",
              inline: true,
            },

            {
              name: "Contato",
              value: `${number} | ${email}`,
              inline: false,
            },

            {
              name: "Redes Sociais",
              value:
                announcement.socialLinks
                  .map((link) => `[${link.socialMedia.name}](${link.url})`)
                  .join(" • ") || "Nenhuma informada",
              inline: false,
            },
          ],
          footer: {
            text: "Busque sua banda por MADM",
          },
        },
      ],
    };

    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      console.error("Failed to send Discord message:", await response.text());
    } else {
      console.log("✅ Announcement saved & message sent to Discord!");
    }

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

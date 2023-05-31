const db = require("../models")
const { calculateLocationRange } = require("../utils/utils")
const Op = db.Sequelize.Op

const User = db.users
const Announcement = db.announcements


const create = async (req, res) => {
  if (!req.body.title || !req.body.genre || !req.body.state || !req.body.city, !req.body.ownerType || !req.body.ownerId || !req.body.latitude || !req.body.longitude) {
    res.status(400).send({
      message: "One or more required fields are missing: Title, Genre, State, City, Type, OwnerId, Latitude, Longitude"
    })
    return
  }

  const announcement = {
    title: req.body.title,
    genre: req.body.genre,
    state: req.body.state,
    city: req.body.city,
    description: req.body.description,
    owner_type: req.body.ownerType,
    owner_id: req.body.ownerId,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  }

  Announcement.create(announcement)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "We had some errors while creating this announcement."
      })
    })
}

const deleteAnnouncement = async (req, res) => {
  const id = req.params.id
  Announcement.destroy({
    where: {
      id: id
    }
  })
  .then(data => {
      res.status(200).send({
        message: "Announcement deleted successfully."
      })
    })
  .catch(err => {
      res.status(500).send({
        message:
          err.message || "We had some errors while deleting this announcement."
      })
    })
}

const updateAnnouncement = async (req, res) => {
  const id = req.params.id

  if (!req.body.title ||!req.body.genre ||!req.body.state ||!req.body.city,!req.body.ownerType ||!req.body.ownerId ||!req.body.latitude ||!req.body.longitude) {
    res.status(400).send({
      message: "One or more required fields are missing: Title, Genre, State, City, Type, OwnerId, latitude, longitude"
    })
    return
  }

  const announcement = {
    title: req.body.title,
    genre: req.body.genre,
    state: req.body.state,
    city: req.body.city,
    description: req.body.description,
    owner_type: req.body.ownerType,
    owner_id: req.body.ownerId,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  }

  Announcement.update(announcement, {
    where: {
      id: id
    }
  })
  .then(data => {
    res.send({
      message: "Announcement updated successfully."
    })
  })
.catch(err => {
    res.status(500).send({
      message:
        err.message || "We had some errors while deleting this announcement."
    })
  })
}

const searchWithinRange = async (req, res) => {
  let {latitude, longitude, range, ...queryParams} = req.query
  latitude = parseFloat(latitude)
  longitude = parseFloat(longitude)
  range = parseFloat(range)

  // Validate if latitude, longitude and range are valid
  if (!latitude || !longitude || !range) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  
  const {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude
  } = calculateLocationRange(latitude, longitude, range)

  await Announcement.findAll({
    where: {
      latitude: {
        [Op.between]: [minLatitude, maxLatitude]
      },
      longitude: {
        [Op.between]: [minLongitude, maxLongitude]
      },
      ...Object.fromEntries(
        Object.entries(queryParams).map(([key, value]) => [
          key,
          {
            [Op.iLike]: `%${value}%`
          }
        ])
      )
    }
  })
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "We had some errors while searching for announcements."
      })
    })
}


module.exports = {
  create,
  deleteAnnouncement,
  updateAnnouncement,
  searchWithinRange
};
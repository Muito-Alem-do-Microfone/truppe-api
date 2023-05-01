const db = require("../models")
const User = db.instruments
const Op = db.Sequelize.Op

const findAll = (req, res) => {
  User.findAll()
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instruments."
      })
    })
}

const findByName = (req, res) => {
  const name = req.params.name

  User.find({
    where: {
      name: name
    }
  })
  .then(data => {
    if (data) {
      res.send(data)
    } else {
      res.status(404).send({
        message: `Cannot find any instrument with name ${name}`
      })
    }
  })
  .catch(err => {
    res.status(500).send({
      message: `Error retrieving instrument with name ${name}`
    })
  })
}

module.exports = {
  findAll,
  findByName,
};
const db = require("../models")
const User = db.users
const Op = db.Sequelize.Op

const bcrypt = require("bcrypt")
const saltRounds = 10


const create = async (req, res) => {
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      })
      return
    }

    let encriptedPass

    await bcrypt
      .genSalt(saltRounds)
      .then(salt => {
        console.log('Salt: ', salt)
        return bcrypt.hash(req.body.password, salt)
      })
      .then(hash => {
        encriptedPass = hash
        console.log('Hash: ', hash)
      })
      .catch(err => console.error(err.message))

    const user = {
      username: req.body.username,
      email: req.body.email,
      password: encriptedPass,
      name: req.body.name,
      surname: req.body.surname
    }

    User.create(user)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "We had some errors while creating this user."
        })
      })
}

const findAll = (req, res) => {
  const name = req.query.name
  var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null

  User.findAll({ where: condition })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      })
    })
}

const findOne = (req, res) => {
  const id = req.params.id

  User.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).send({
          message: `Cannot find any user with id=${id}.`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving a user with id=" + id
      })
    })
}

const update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        })
      } else {
        res.send({
          message: `Cannot update user with id=${id}. Maybe any user was not found or req.body is empty!`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating user with id=" + id
      })
    })
}

const deleteUser = (req, res) => {
  const id = req.params.id

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        })
      } else {
        res.send({
          message: `Cannot delete any user with id=${id}. Maybe any user was found!`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete user with id=" + id
      })
    })
}


module.exports = {
  create,
  findAll,
  findOne,
  update,
  deleteUser
};
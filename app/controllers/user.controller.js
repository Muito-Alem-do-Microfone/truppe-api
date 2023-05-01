const db = require("../models")
const User = db.users
const Follow = db.follows
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

const follow = async (req, res) => {
  const followed_id = req.params.id
  console.log(followed_id, req.body.followerId)

  // check if body is empty
  if (!req.body.followerId || !followed_id) {
    res.status(400).send({
      message: "You need two user IDs to change follower status"
    })
    return
  }

  // check if users exists
  if (!User.findByPk(followed_id) || !User.findByPk(req.body.followerId)) {
    res.status(404).send({
      message: "One of the users does not exists"
    })
    return
  }

  // Check if the follower is already following the following user
  const alreadyFollows = await Follow.findOne({
    where: {
      follower_user_id: req.body.followerId,
      followed_user_id: followed_id,
    },
  })

  if (alreadyFollows) {
    // If the follow relationship already exists, delete it
    await alreadyFollows.destroy()
    res.status(200).send({
      message: "User unfollowed successfully"
    })
    return
  } else {
    // If the follow relationship does not exist, create it
    await Follow.create({
      follower_user_id: req.body.followerId,
      followed_user_id: followed_id,
    })
    res.status(200).send({
      message: "User followed successfully"
    })
    return
  }
}


module.exports = {
  create,
  findAll,
  findOne,
  update,
  deleteUser,
  follow
};
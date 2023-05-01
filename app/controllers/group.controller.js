const db = require("../models")
const Op = db.Sequelize.Op

const Group = db.groups
const User  = db.users
const isMember = db.isMember

const create = async (req, res) => {
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      })
      return
    }

    const group = {
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
    }

    Group.create(group)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "We had some errors while creating this group."
        })
      })
}

const findAll = (req, res) => {
  const name = req.query.name
  var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null

  Group.findAll({ where: condition })
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Groups."
      })
    })
}

const findOne = (req, res) => {
  const id = req.params.id

  Group.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).send({
          message: `Cannot find any group with id=${id}.`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving a group with id=" + id
      })
    })
}

const update = (req, res) => {
  const id = req.params.id;

  Group.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Group was updated successfully."
        })
      } else {
        res.send({
          message: `Cannot update group with id=${id}. Maybe any group was not found or req.body is empty!`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating group with id=" + id
      })
    })
}

const deleteGroup = (req, res) => {
  const id = req.params.id

  Group.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Group was deleted successfully!"
        })
      } else {
        res.send({
          message: `Cannot delete any Group with id=${id}. Maybe any Group was found!`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Group with id=" + id
      })
    })
}

const changeMember = async (req, res) => {
  const id = req.params.id
  const userId = req.body.userId

  if (!id || !userId) {
    res.status(400).send({
      message: "Content can not be empty!"
    })
    return
  }

  const group = Group.findOne({
    where: { id: id }
  })
  const user = User.findOne({
    where: { id: userId }
  })
  if (!group || !user) {
    res.status(404).send({
      message: `Cannot find group or user`
    })
    return
  }

  // check if relationship exists, if not, create a new one
  const alreadyAMember = await isMember.findOne({
    where: {
      group_id: id,
      user_id: userId
    }
  })

  if (alreadyAMember) {
    await alreadyAMember.destroy()
    res.status(200).send()
  } else {
    isMember.create({
      group_id: id,
      user_id: userId
    })
    .then(() => {
      res.status(200).send({
        message: "User was added to group successfully!"
      })
      return
    })
  }
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  deleteGroup,
  changeMember
};
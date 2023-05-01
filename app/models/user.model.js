module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    surname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    birthday: {
      type: Sequelize.DATE
    },
    about: {
      type: Sequelize.TEXT
    },
    number: {
      type: Sequelize.STRING
    },
    location: {
      type: Sequelize.STRING
    }
  }, {})
  User.associate = function(models) {
    User.belongsToMany(models.User, { through: models.Follow, foreignKey: 'follower_id', as: 'Follower' })
    User.belongsToMany(models.User, { through: models.Follow, foreignKey: 'followed_id', as: 'Followed' })
    User.belongsToMany(models.Instrument, {
      through: models.UserInstrument,
      foreignKey: 'user_id',
      as: 'Plays'
    })
    User.belongsToMany(models.Group, {
      through: models.isMember,
      foreignKey: 'user_id',
      as: 'Groups'
    })
  }

  return User
}
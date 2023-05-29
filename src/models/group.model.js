module.exports = (sequelize, Sequelize) => {
  const Group = sequelize.define("Group", {
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
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    founded_at: {
      type: Sequelize.DATE
    },
    about: {
      type: Sequelize.TEXT
    },
    number: {
      type: Sequelize.STRING
    },
    style: {
      type: Sequelize.STRING
    },
    location: {
      type: Sequelize.STRING
    }
  }, {})
  Group.associate = function(models) {
    Group.belongsToMany(models.User, { through: models.isMember, foreignKey: 'group_id', as: 'Member' })
  }

  return Group
}
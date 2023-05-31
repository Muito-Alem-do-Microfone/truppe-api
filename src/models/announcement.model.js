module.exports = (sequelize, Sequelize) => {
  const Announcement = sequelize.define("Announcement", {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    owner_id: {
      type: Sequelize.INTEGER,
    },
    owner_type: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    latitude :{
      type: Sequelize.FLOAT,
      allowNull: false
    },
    longitude :{
      type: Sequelize.FLOAT,
      allowNull: false
    },
    genre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {})

  return Announcement
}
module.exports = (sequelize, Sequelize, models) => {
  const Follow = sequelize.define("Follow", {
    follower_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'User',
        key: 'id',
      }
    },
    followed_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'User',
        key: 'id',
      }
    }
  }, {})
  Follow.associate = function(models) {
    Follow.belongsTo(models.User, {foreignKey: 'follower_id'})
    Follow.belongsTo(models.User, {foreignKey: 'followed_id'})
  }

  return Follow
}
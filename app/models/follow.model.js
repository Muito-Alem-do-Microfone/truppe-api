module.exports = (sequelize, Sequelize) => {
  const Follow = sequelize.define("Follow", {
    follower_user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    followed_user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  }, {})
  Follow.associate = function(models) {
    Follow.belongsTo(models.User, {foreignKey: 'follower_user_id'})
    Follow.belongsTo(models.User, {foreignKey: 'followed_user_id'})
  }

  return Follow;
};
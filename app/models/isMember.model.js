module.exports = (sequelize, Sequelize, models) => {
  const IsMember = sequelize.define("IsMember", {
    group_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Group',
        key: 'id',
      }
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'User',
        key: 'id',
      }
    }
  }, {})
  IsMember.associate = function(models) {
    IsMember.belongsTo(models.User, {foreignKey: 'user_id'})
    IsMember.belongsTo(models.Group, {foreignKey: 'group_id'})
  }

  return IsMember
}
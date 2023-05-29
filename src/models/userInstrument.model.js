
module.exports = (sequelize, Sequelize) => {
  const UserInstrument = sequelize.define("UserInstrument", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'User',
        key: 'id',
      }
    },
    instrument_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Instrument',
        key: 'id',
      }
    }
  }, {})
  UserInstrument.associate = function(models) {
    UserInstrument.belongsTo(models.User, {foreignKey: 'user_id'})
    UserInstrument.belongsTo(models.Instrument, {foreignKey: 'instrument_id'})
  }
  
  return UserInstrument
};
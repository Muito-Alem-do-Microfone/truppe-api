
module.exports = (sequelize, Sequelize) => {
  const Instrument = sequelize.define("Instrument", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
  })
  Instrument.associate = function(models) {
    Instrument.belongsToMany(models.User, {
      through: models.InstrumentUser,
      foreign_key: "instrument_id",
      as: "Owner"
    })
  }

  return Instrument
}
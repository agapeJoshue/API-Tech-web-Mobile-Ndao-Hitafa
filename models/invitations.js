'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invitations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invitations.init({
    sent_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    received_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'invitations',
  });
  return invitations;
};
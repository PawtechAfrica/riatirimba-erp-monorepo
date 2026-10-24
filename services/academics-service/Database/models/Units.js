const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Units = sequelize.define('Units', {
   
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Units.associate = (models) => {
 
  };

  return Units;
};

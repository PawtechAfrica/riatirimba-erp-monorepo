const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize, DataTypes) => {
  const Modules = sequelize.define('Modules', {
  
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    moduleNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
    },
    units: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    }
  })

  Modules.associate = (models) => {
  Modules.belongsTo(models.Courses, {
    foreignKey: 'courseCode',
    targetKey: 'code', // 👈 This is key
    as: 'course'
  });
};


  return Modules
}

const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Departments = sequelize.define('Departments', {
    
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });

  Departments.associate = (models) => {
  Departments.hasMany(models.Courses, {
    foreignKey: 'departmentId',
    as: 'courses'
  });
};


  return Departments;
};

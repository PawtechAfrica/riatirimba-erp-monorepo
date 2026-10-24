const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize, DataTypes) => {
  const Courses = sequelize.define('Courses', {
  
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
    },
    entryRequirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
    },
    examBody: {
      type: DataTypes.STRING,
      allowNull: true
    },

    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })

  Courses.associate = models => {
    Courses.belongsTo(models.Departments, {
      foreignKey: 'departmentId',
      as: 'department'
    })
    // add new associations  
  }

  return Courses
}
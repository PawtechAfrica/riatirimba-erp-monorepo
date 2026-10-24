
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
  
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    role: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING
    },
    nationalId: {
      type: DataTypes.STRING,
      unique:true
    }
    
  });
Users.associate = models => {
    Users.belongsToMany(models.Permissions, {
      through: 'UserPermissions',
      foreignKey: 'userId',
      otherKey: 'permissionId',
      as: 'permissions'
    });
  };


  return Users;
};


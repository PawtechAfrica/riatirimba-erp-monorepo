
module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define('Permissions', {
   
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    }
  });
Permissions.associate = models => {
    Permissions.belongsToMany(models.Users, {
      through: 'UserPermissions',
      foreignKey: 'permissionId',
      otherKey: 'userId',
      as: 'users'
    });
  };

  return Permissions;
};



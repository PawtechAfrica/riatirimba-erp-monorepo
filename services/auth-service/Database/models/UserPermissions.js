module.exports = (sequelize, DataTypes) => {
  const UserPermissions = sequelize.define('UserPermissions', {
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    permissionId: {
      type: DataTypes.INTEGER,
      references: { model: 'Permissions', key: 'id' }
    }
  }, {
    timestamps: false
  });

  return UserPermissions;
};

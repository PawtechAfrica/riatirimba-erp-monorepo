
// departments — DORMANT/REFERENCE. Data may come from Academics service.
// FKs are nullable since this service doesn't own the data.
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      // Optional: sync timestamp from Academics
      last_synced_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'departments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Department.associate = (models) => {
    Department.hasMany(models.Programme, {
      foreignKey: 'department_id',
      as: 'programmes',
    });
    // Optional: Department can have fee structures
    Department.hasMany(models.FeeStructure, {
      foreignKey: 'scope_id',
      constraints: false, // No FK constraint since scope_id is polymorphic
      as: 'feeStructures',
    });
  };

  return Department;
};
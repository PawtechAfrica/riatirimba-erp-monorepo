
// programmes — DORMANT/REFERENCE. Data may come from Academics service.
// FKs are nullable since this service doesn't own the data.
module.exports = (sequelize, DataTypes) => {
  const Programme = sequelize.define(
    'Programme',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      department_id: {
        type: DataTypes.STRING(50),
        allowNull: true, // NULLABLE - may not exist locally
        references: {
          model: 'departments',
          key: 'id',
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Optional: sync timestamp from Academics
      last_synced_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Optional: external reference from Academics
      external_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'programmes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Programme.associate = (models) => {
    Programme.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    // Programme can have fee structures (scope_id is polymorphic)
    Programme.hasMany(models.FeeStructure, {
      foreignKey: 'scope_id',
      constraints: false, // No FK constraint since scope_id is polymorphic
      as: 'feeStructures',
    });
    Programme.hasMany(models.StudentTermEnrollment, {
      foreignKey: 'programme_id',
      as: 'enrollments',
    });
    Programme.hasMany(models.FeeObligation, {
      foreignKey: 'programme_id',
      as: 'feeObligations',
    });
    // DORMANT
    Programme.hasMany(models.ModuleFeeStructure, {
      foreignKey: 'programme_id',
      as: 'moduleFeeStructures',
    });
  };

  return Programme;
};

// module_fee_structures — DORMANT. Exists for future per-module billing.
// No business logic reads/writes this table today (see spec §3.14 / §8).
module.exports = (sequelize, DataTypes) => {
  const ModuleFeeStructure = sequelize.define(
    'ModuleFeeStructure',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      module_code: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      programme_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      term_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2, 3]],
        },
      },
      scope_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      scope_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      student_category: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      valid_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      valid_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'module_fee_structures',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['module_code', 'term_number', 'scope_type', 'scope_id', 'student_category', 'valid_from'],
          name: 'module_fee_structures_version_uniq',
        },
      ],
    }
  );

  ModuleFeeStructure.associate = (models) => {
    ModuleFeeStructure.belongsTo(models.Programme, {
      foreignKey: 'programme_id',
      as: 'programme',
    });
    ModuleFeeStructure.hasMany(models.ModuleFeeLine, {
      foreignKey: 'module_fee_structure_id',
      as: 'lines',
    });
  };

  return ModuleFeeStructure;
};
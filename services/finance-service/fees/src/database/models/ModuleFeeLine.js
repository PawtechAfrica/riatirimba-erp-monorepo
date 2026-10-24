

// module_fee_lines — DORMANT. Vote head amounts per module fee structure.
module.exports = (sequelize, DataTypes) => {
  const ModuleFeeLine = sequelize.define(
    'ModuleFeeLine',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      module_fee_structure_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      vote_head_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      priority_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'module_fee_lines',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['module_fee_structure_id', 'vote_head_id'],
          name: 'module_fee_lines_uniq',
        },
      ],
    }
  );

  ModuleFeeLine.associate = (models) => {
    ModuleFeeLine.belongsTo(models.ModuleFeeStructure, {
      foreignKey: 'module_fee_structure_id',
      as: 'moduleFeeStructure',
    });
    ModuleFeeLine.belongsTo(models.VoteHead, {
      foreignKey: 'vote_head_id',
      as: 'voteHead',
    });
  };

  return ModuleFeeLine;
};
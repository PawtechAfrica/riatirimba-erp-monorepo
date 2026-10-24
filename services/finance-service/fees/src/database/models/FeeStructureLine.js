// // fee_structure_lines — vote head amounts per fee structure version.


module.exports = (sequelize, DataTypes) => {
  const FeeStructureLine = sequelize.define(
    'FeeStructureLine',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      fee_structure_id: {
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
      tableName: 'fee_structure_lines',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['fee_structure_id', 'vote_head_id'],
          name: 'fee_structure_lines_uniq',
        },
      ],
    }
  );

  FeeStructureLine.associate = (models) => {
    FeeStructureLine.belongsTo(models.FeeStructure, {
      foreignKey: 'fee_structure_id',
      as: 'feeStructure',
    });
    FeeStructureLine.belongsTo(models.VoteHead, {
      foreignKey: 'vote_head_id',
      as: 'voteHead',
    });
  };

  return FeeStructureLine;
};

// vote_heads — global, configurable fee categories. Never hardcoded as columns.
module.exports = (sequelize, DataTypes) => {
  const VoteHead = sequelize.define(
    'VoteHead',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      is_one_time: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_refundable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      priority_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'vote_heads',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  VoteHead.associate = (models) => {
    VoteHead.hasMany(models.FeeStructureLine, {
      foreignKey: 'vote_head_id',
      as: 'feeStructureLines',
    });
    VoteHead.hasMany(models.ObligationVoteHeadSnapshot, {
      foreignKey: 'vote_head_id',
      as: 'snapshots',
    });
    VoteHead.hasMany(models.PaymentDistribution, {
      foreignKey: 'vote_head_id',
      as: 'distributions',
    });
    VoteHead.hasMany(models.ModuleFeeLine, {
      foreignKey: 'vote_head_id',
      as: 'moduleFeeLines',
    });
  };

  return VoteHead;
};
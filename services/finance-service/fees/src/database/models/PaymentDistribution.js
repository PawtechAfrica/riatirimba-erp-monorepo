
// payment_distributions — waterfall result: how each payment was split
// across vote heads. Written at receipt-generation time, from snapshots only.
module.exports = (sequelize, DataTypes) => {
  const PaymentDistribution = sequelize.define(
    'PaymentDistribution',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      payment_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      obligation_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      vote_head_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      amount_applied: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'payment_distributions',
      timestamps: false,
      underscored: true,
    }
  );

  PaymentDistribution.associate = (models) => {
    PaymentDistribution.belongsTo(models.Payment, {
      foreignKey: 'payment_id',
      as: 'payment',
    });
    PaymentDistribution.belongsTo(models.FeeObligation, {
      foreignKey: 'obligation_id',
      as: 'obligation',
    });
    PaymentDistribution.belongsTo(models.VoteHead, {
      foreignKey: 'vote_head_id',
      as: 'voteHead',
    });
  };

  return PaymentDistribution;
};
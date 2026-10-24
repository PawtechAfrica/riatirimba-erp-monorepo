
// obligation_vote_head_snapshots — amounts frozen at obligation creation.
// Receipts always read from here, never from the live fee structure.
module.exports = (sequelize, DataTypes) => {
  const ObligationVoteHeadSnapshot = sequelize.define(
    'ObligationVoteHeadSnapshot',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
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
      vote_head_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      amount_assessed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      priority_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'obligation_vote_head_snapshots',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['obligation_id', 'vote_head_id'],
          name: 'obligation_vote_head_snapshots_uniq',
        },
      ],
    }
  );

  ObligationVoteHeadSnapshot.associate = (models) => {
    ObligationVoteHeadSnapshot.belongsTo(models.FeeObligation, {
      foreignKey: 'obligation_id',
      as: 'obligation',
    });
    ObligationVoteHeadSnapshot.belongsTo(models.VoteHead, {
      foreignKey: 'vote_head_id',
      as: 'voteHead',
    });
  };

  return ObligationVoteHeadSnapshot;
};
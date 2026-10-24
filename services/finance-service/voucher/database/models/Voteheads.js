module.exports = (sequelize, DataTypes) => {
  const Voteheads = sequelize.define(
    'Voteheads',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      allocation: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      balAvailable: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'voteheads',
      timestamps: true
    }
  )

  Voteheads.associate = models => {
    Voteheads.hasMany(models.VoucherBudgetLines, { foreignKey: 'voteheadId' })
  }

  return Voteheads
}
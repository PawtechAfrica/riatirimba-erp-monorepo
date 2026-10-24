module.exports = (sequelize, DataTypes) => {
  const VoucherBudgetLines = sequelize.define(
    'VoucherBudgetLines',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      voucherId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      voteheadId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      balBefore: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      thisPay: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      uncommittedBal: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      }
    },
    {
      tableName: 'voucher_budget_lines',
      timestamps: true
    }
  )

  VoucherBudgetLines.associate = models => {
    VoucherBudgetLines.belongsTo(models.Vouchers, { foreignKey: 'voucherId' })
    VoucherBudgetLines.belongsTo(models.Voteheads, { foreignKey: 'voteheadId' })
  }

  return VoucherBudgetLines
}
module.exports = (sequelize, DataTypes) => {
  const Vouchers = sequelize.define(
    'Vouchers',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      voucherNo: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },

      payeeName: {
        type: DataTypes.STRING,
        allowNull: false
      },

      payeeAddress: {
        type: DataTypes.STRING
      },

      accountName: {
        type: DataTypes.STRING
      },

      lineItems: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get () {
          return JSON.parse(this.getDataValue('lineItems') || '[]')
        },
        set (val) {
          this.setDataValue('lineItems', JSON.stringify(val))
        }
      },

      amountInWords: {
        type: DataTypes.STRING
      },

      paymentMethod: {
        type: DataTypes.ENUM(
          'CASH',
          'ONLINE',
          'KCB_OPERATIONS',
          'KCB_DEVELOPMENT',
          'EQUITY_BANK'
        ),
        allowNull: false
      },

      paymentDetails: {
        type: DataTypes.STRING,
        allowNull: true,
        comment:
          'Stores: Cash amount, EFT reference, or Cheque number based on payment method'
      },

      voteheadItems: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get () {
          return JSON.parse(this.getDataValue('voteheadItems') || '[]')
        },
        set (val) {
          this.setDataValue('voteheadItems', JSON.stringify(val))
        }
      },

      preparedBy: {
        type: DataTypes.STRING
      },

      preparedDate: {
        type: DataTypes.DATEONLY
      },

      approvedBy: {
        type: DataTypes.STRING
      },

      approvedDate: {
        type: DataTypes.DATEONLY
      },

      receivedSum: {
        type: DataTypes.STRING
      },

      receivedCashOrCheque: {
        type: DataTypes.STRING
      },

      receiverSignature: {
        type: DataTypes.STRING
      },

      receiverIdNo: {
        type: DataTypes.STRING
      },

      receivedDate: {
        type: DataTypes.DATEONLY
      },

      authorizedByPrincipal: {
        type: DataTypes.STRING
      },

      authorizedDate: {
        type: DataTypes.DATEONLY
      },

      pdfGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'vouchers',
      timestamps: true
    }
  )

  Vouchers.associate = models => {
    // Add relationships later if needed
     Vouchers.hasMany(models.VoucherBudgetLines, { foreignKey: 'voucherId' })
  }

  return Vouchers
}


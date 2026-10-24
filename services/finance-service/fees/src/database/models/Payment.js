
// // payments — one immutable row per transaction. No editing; reversals only.
// module.exports = (sequelize, DataTypes) => {
//   const Payment = sequelize.define(
//     'Payment',
//     {
//       id: {
//         type: DataTypes.STRING(20),
//         primaryKey: true,
//         allowNull: false,
//       },
//       student_id: {
//         type: DataTypes.STRING(50),
//         allowNull: true,
//       },
//       student_reg_no: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       receipt_number: {
//         type: DataTypes.STRING(30),
//         allowNull: false,
//         unique: true,
//       },
//       total_amount: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       payment_mode: {
//         type: DataTypes.STRING(20),
//         allowNull: false,
//         validate: {
//           isIn: [['cash', 'mpesa', 'bank_transfer', 'cheque', 'credit_transfer']],
//         },
//       },
//       transaction_ref: {
//         type: DataTypes.STRING(100),
//         allowNull: true,
//       },
//       funding_source: {
//         type: DataTypes.STRING(30),
//         allowNull: false,
//         validate: {
//           isIn: [
//             ['self', 'kuccps', 'nita', 'helb', 'employer', 'cdf_bursary', 'county_bursary', 'carry_forward'],
//           ],
//         },
//       },
//       helb_band: {
//         type: DataTypes.STRING(10),
//         allowNull: true,
//       },
//       sponsor_name: {
//         type: DataTypes.STRING(100),
//         allowNull: true,
//       },
//       received_by: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       is_reversal: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       reversal_of: {
//         type: DataTypes.STRING(20),
//         allowNull: true,
//       },
//       payment_date: {
//         type: DataTypes.DATEONLY,
//         allowNull: false,
//       },
//       notes: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: 'payments',
//       timestamps: true,
//       createdAt: 'created_at',
//       updatedAt: false,
//       underscored: true,
//       indexes: [
//         {
//           fields: ['student_reg_no'],
//           name: 'idx_payments_reg_no',
//         },
//         {
//           fields: ['student_id'],
//           name: 'idx_payments_student_id',
//         },
//         {
//           fields: ['receipt_number'],
//           name: 'idx_payments_receipt_number',
//         },
//       ],
//     }
//   );

//   Payment.associate = (models) => {
//     Payment.belongsTo(models.Payment, {
//       foreignKey: 'reversal_of',
//       as: 'originalPayment',
//     });
//     Payment.hasMany(models.Payment, {
//       foreignKey: 'reversal_of',
//       as: 'reversals',
//     });
//     Payment.hasMany(models.PaymentDistribution, {
//       foreignKey: 'payment_id',
//       as: 'distributions',
//     });
//   };

//   return Payment;
// };




























// payments — one immutable row per transaction. No editing; reversals only.
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
      },
      student_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receipt_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['cash', 'mpesa', 'bank_transfer', 'cheque', 'credit_transfer']],
        },
      },
      bank_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: [
            [
              'KCB',
              'Equity',
              'Cooperative',
              'Stanbic',
              'NCBA',
              'Absa',
              'Standard Chartered',
              'Diamond Trust Bank',
              'Family Bank',
              'I&M Bank',
              'Prime Bank',
              'National Bank',
              'NIC Bank',
              'Ecobank',
              'Citi Bank',
              'Bank of Africa',
              'K-Rep Bank',
              'Consolidated Bank',
              'Development Bank',
              'Kenya Post Office Savings Bank',
              'Gulf African Bank',
              'First Community Bank',
              'Sidian Bank',
              'Other',
            ]
          ],
        },
      },
      transaction_ref: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      funding_source: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [
            ['self', 'kuccps', 'nita', 'helb', 'employer', 'cdf_bursary', 'county_bursary', 'carry_forward'],
          ],
        },
      },
      helb_band: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      sponsor_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      received_by: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      is_reversal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reversal_of: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'payments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ['student_reg_no'],
          name: 'idx_payments_reg_no',
        },
        {
          fields: ['receipt_number'],
          name: 'idx_payments_receipt_number',
        },
        {
          fields: ['payment_mode'],
          name: 'idx_payments_payment_mode',
        },
      ],
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Payment, {
      foreignKey: 'reversal_of',
      as: 'originalPayment',
    });
    Payment.hasMany(models.Payment, {
      foreignKey: 'reversal_of',
      as: 'reversals',
    });
    Payment.hasMany(models.PaymentDistribution, {
      foreignKey: 'payment_id',
      as: 'distributions',
    });
  };

  return Payment;
};

// fee_obligations — one per enrollment event; the live balance.
module.exports = (sequelize, DataTypes) => {
  const FeeObligation = sequelize.define(
    'FeeObligation',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      enrollment_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      student_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      student_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      student_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      programme_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      programme_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      student_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_term: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2, 3]],
        },
      },
      obligation_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'term',
        validate: {
          isIn: [['term', 'one_time']],
        },
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'unpaid',
        validate: {
          isIn: [['unpaid', 'partial', 'cleared', 'overpaid']],
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'fee_obligations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        {
          fields: ['student_reg_no'],
          name: 'fee_obligations_reg_no_idx',
        },
      ],
    }
  );

  FeeObligation.associate = (models) => {
    FeeObligation.belongsTo(models.StudentTermEnrollment, {
      foreignKey: 'enrollment_id',
      as: 'enrollment',
    });
    FeeObligation.belongsTo(models.Programme, {
      foreignKey: 'programme_id',
      as: 'programme',
    });
    FeeObligation.hasMany(models.ObligationVoteHeadSnapshot, {
      foreignKey: 'obligation_id',
      as: 'snapshots',
    });
    FeeObligation.hasMany(models.PaymentDistribution, {
      foreignKey: 'obligation_id',
      as: 'distributions',
    });
    FeeObligation.hasMany(models.StudentCredit, {
      foreignKey: 'source_obligation_id',
      as: 'creditsGenerated',
    });
  };

  return FeeObligation;
};
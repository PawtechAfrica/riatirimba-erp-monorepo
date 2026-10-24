// student_credits — overpayment carry-forward. One row per student.
module.exports = (sequelize, DataTypes) => {
  const StudentCredit = sequelize.define(
    'StudentCredit',
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      student_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      source_obligation_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'student_credits',
      timestamps: true,
      createdAt: false,
      updatedAt: 'updated_at',
      underscored: true,
      indexes: [
        {
          fields: ['student_reg_no'],
          name: 'idx_student_credits_reg_no',
        },
        {
          fields: ['student_id'],
          name: 'idx_student_credits_student_id',
        },
      ],
    }
  );

  StudentCredit.associate = (models) => {
    StudentCredit.belongsTo(models.FeeObligation, {
      foreignKey: 'source_obligation_id',
      as: 'sourceObligation',
    });
  };

  return StudentCredit;
};
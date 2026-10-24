
// helb_assessments — HELB band classification per student.
module.exports = (sequelize, DataTypes) => {
  const HelbAssessment = sequelize.define(
    'HelbAssessment',
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      student_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      assessment_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      band: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2, 3, 4, 5]],
        },
      },
      scholarship_pct: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      loan_pct: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      household_pct: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      scholarship_amt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      loan_amt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      household_amt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      upkeep_amt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      assessed_date: {
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
      tableName: 'helb_assessments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'assessment_year'],
          name: 'helb_assessments_uniq',
        },
        {
          fields: ['student_reg_no'],
          name: 'idx_helb_assessments_reg_no',
        },
      ],
    }
  );

  return HelbAssessment;
};
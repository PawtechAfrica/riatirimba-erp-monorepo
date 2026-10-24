

// student_term_enrollments — the billing trigger.
module.exports = (sequelize, DataTypes) => {
  const StudentTermEnrollment = sequelize.define(
    'StudentTermEnrollment',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      student_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: true, // Can be null if not provided initially
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
      fee_structure_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      student_category: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [['regular', 'kuccps', 'nita', 'employer', 'self_sponsored']],
        },
      },
      is_new_student: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enrollment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      enrolled_by: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      source_event_id: {
        type: DataTypes.STRING(80),
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'completed', 'withdrawn', 'deferred']],
        },
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
      tableName: 'student_term_enrollments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'student_year', 'student_term'],
          name: 'student_term_enrollments_personal_term_uniq',
        },
        {
          fields: ['student_reg_no'],
          name: 'student_term_enrollments_reg_no_idx',
        },
        {
          fields: ['student_name'],
          name: 'student_term_enrollments_name_idx',
        },
      ],
    }
  );

  StudentTermEnrollment.associate = (models) => {
    StudentTermEnrollment.belongsTo(models.Programme, {
      foreignKey: 'programme_id',
      as: 'programme',
    });
    StudentTermEnrollment.belongsTo(models.FeeStructure, {
      foreignKey: 'fee_structure_id',
      as: 'feeStructure',
    });
    StudentTermEnrollment.hasMany(models.FeeObligation, {
      foreignKey: 'enrollment_id',
      as: 'obligations',
    });
  };

  return StudentTermEnrollment;
};

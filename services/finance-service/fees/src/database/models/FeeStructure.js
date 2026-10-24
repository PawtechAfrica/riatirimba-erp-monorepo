
// fee_structures — versioned fee rates. scope_id is polymorphic:
// - Can be programme_id (if scope_type = 'programme')
// - Can be department_id (if scope_type = 'department')
// - NULL (if scope_type = 'college')
// No FK constraint since scope_id is polymorphic
module.exports = (sequelize, DataTypes) => {
  const FeeStructure = sequelize.define(
    'FeeStructure',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      version_label: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      term_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { isIn: [[1, 2, 3]] },
      },
      scope_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { isIn: [['college', 'department', 'programme']] },
      },
      scope_id: {
        type: DataTypes.STRING(50),
        allowNull: true, // NULLABLE - can reference programme_id, department_id, or null
        // NO FOREIGN KEY CONSTRAINT - polymorphic
      },
      student_category: {
        type: DataTypes.STRING(30),
        allowNull: true,
        validate: { isIn: [[null, 'regular', 'kuccps', 'nita', 'employer', 'self_sponsored']] },
      },
      valid_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      valid_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: 'fee_structures',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['term_number', 'scope_type', 'scope_id', 'student_category', 'valid_from'],
          name: 'fee_structures_version_uniq',
        },
      ],
    }
  );

  FeeStructure.associate = (models) => {
    FeeStructure.hasMany(models.FeeStructureLine, {
      foreignKey: 'fee_structure_id',
      as: 'lines',
    });
    FeeStructure.hasMany(models.StudentTermEnrollment, {
      foreignKey: 'fee_structure_id',
      as: 'enrollments',
    });
    // Optional: Polymorphic associations (no FK constraints)
    FeeStructure.belongsTo(models.Programme, {
      foreignKey: 'scope_id',
      constraints: false,
      as: 'programme',
    });
    FeeStructure.belongsTo(models.Department, {
      foreignKey: 'scope_id',
      constraints: false,
      as: 'department',
    });
  };

  return FeeStructure;
};
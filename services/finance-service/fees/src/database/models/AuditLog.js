// audit_logs — every financial and system action, recorded.
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      }, // 'SYSTEM' for automated actions
      action: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      old_value: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      new_value: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ['user_id'],
          name: 'audit_logs_user_id_idx',
        },
        {
          fields: ['entity_type', 'entity_id'],
          name: 'audit_logs_entity_idx',
        },
        {
          fields: ['action'],
          name: 'audit_logs_action_idx',
        },
        {
          fields: ['created_at'],
          name: 'audit_logs_created_at_idx',
        },
      ],
    }
  );

  return AuditLog;
};

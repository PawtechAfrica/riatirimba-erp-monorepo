module.exports = (sequelize, DataTypes) => {
  const Files = sequelize.define(
    'Files',
    {
      originalName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fieldName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      b2FileName: {
        type: DataTypes.STRING,
        allowNull: true // null until uploaded
      },
      storagePath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'uploaded', 'failed'),
        defaultValue: 'pending'
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'files',
      timestamps: true
    }
  )

  return Files
}

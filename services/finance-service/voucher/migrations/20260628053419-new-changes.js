'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vouchers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      voucherNo:             { type: Sequelize.STRING, unique: true, allowNull: false },
      date:                  { type: Sequelize.DATEONLY, allowNull: false },
      payeeName:             { type: Sequelize.STRING, allowNull: false },
      payeeAddress:          { type: Sequelize.STRING },
      accountName:           { type: Sequelize.STRING },
      lineItems:             { type: Sequelize.TEXT, allowNull: false, defaultValue: '[]' },
      amountInWords:         { type: Sequelize.STRING },
      chequeNo:              { type: Sequelize.STRING },
      voteheadItems:         { type: Sequelize.TEXT, allowNull: false, defaultValue: '[]' },
      preparedBy:            { type: Sequelize.STRING },
      preparedDate:          { type: Sequelize.DATEONLY },
      approvedBy:            { type: Sequelize.STRING },
      approvedDate:          { type: Sequelize.DATEONLY },
      receivedSum:           { type: Sequelize.STRING },
      receivedCashOrCheque:  { type: Sequelize.STRING },
      receiverSignature:     { type: Sequelize.STRING },
      receiverIdNo:          { type: Sequelize.STRING },
      receivedDate:          { type: Sequelize.DATEONLY },
      authorizedByPrincipal: { type: Sequelize.STRING },
      authorizedDate:        { type: Sequelize.DATEONLY },
      pdfGenerated:          { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:             { type: Sequelize.DATE, allowNull: false },
      updatedAt:             { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vouchers');
  },
};

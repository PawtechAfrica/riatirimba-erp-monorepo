
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Permissions', [
      {
        name: 'view_users',
        description: 'Can view user list',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'edit_users',
        description: 'Can edit user details',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_roles',
        description: 'Can view roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'access_academics',
        description: 'Get access to academic module',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'access_mis_settings',
        description: 'Modify MIS-related settings',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'access_admission',
        description: 'Access admission related functions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'access_all_users',
        description: 'Get access to list of all users and related user modification functions',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};




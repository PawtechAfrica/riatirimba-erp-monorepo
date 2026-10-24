
'use strict';

const bcrypt = require('bcrypt');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        
        // Insert users
        const users = await queryInterface.bulkInsert('Users', [
          {
        name: 'System Admin', // fill yourself
        email: 'lab.pawtech@gmail.com',
        role: 'super',
        password: await bcrypt.hash('Afnog@#1', 10),
        nationalId: '01012025',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //    {
      //   name: 'Riatirimba TVC', // fill yourself
      //   email: 'info@riatirimbatvc.ac.ke',
      //   role: 'super',
      //   password: await bcrypt.hash('Afnog@#1', 10),
      //   nationalId: '12345678',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      {
        name: 'Mr. Paul Chacha Maroa', 
        email: 'registrar@riatirimbatvc.ac.ke',
        role: 'registrar',
        password: await bcrypt.hash('Registrar@25', 10),
        nationalId: '33445566',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mr. Joseph Kawala', // fill yourself
        email: 'principal@riatirimbatvc.ac.ke',
        role: 'principal',
        password: await bcrypt.hash('Principal@25', 10),
        nationalId: '87654321',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '', // fill yourself
        email: 'dp-admin@riatirimbatvc.ac.ke',
        role: 'dp-admin',
        password: await bcrypt.hash('Dprincipal_admin@25', 10),
        nationalId: '11223344',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '', 
        email: 'dp-academic@riatirimbatvc.ac.ke',
        role: 'dp-academic',
        password: await bcrypt.hash('Dprincipal_academic@25', 10),
        nationalId: '22334455',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      {
        name: 'Mr. Samwel Makori Gori', 
        email: 'dean@riatirimbatvc.ac.ke',
        role: 'dean',
        password: await bcrypt.hash('Dean@2025', 10),
        nationalId: '44556677',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '', 
        email: 'finance@riatirimbatvc.ac.ke',
        role: 'finance',
        password: await bcrypt.hash('Finance@25', 10),
        nationalId: '55667788',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mrs. Caroline Oyugi',
        email: 'procurement@riatirimbatvc.ac.ke',
        role: 'procurement',
        password: await bcrypt.hash('Procurement@25', 10),
        nationalId: '66778899',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mr. Edigah Morara', 
        email: 'examinations@riatirimbatvc.ac.ke',
        role: 'examinations',
        password: await bcrypt.hash('Examinations@25', 10),
        nationalId: '77889900',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '', // fill yourself
        email: 'research@riatirimbatvc.ac.ke',
        role: 'research',
        password: await bcrypt.hash('Research@25', 10),
        nationalId: '88990011',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mrs. Sarah Bosibori', 
        email: 'hr@riatirimbatvc.ac.ke',
        role: 'hr',
        password: await bcrypt.hash('Hro@2025', 10),
        nationalId: '99001122',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mrs. Abigael Jepkosgei', 
        email: 'pcc@riatirimbatvc.ac.ke',
        role: 'pcc',
        password: await bcrypt.hash('Pcc@2025', 10),
        nationalId: '10111213',
        createdAt: new Date(),
        updatedAt: new Date()
      }
        ], {returning: true});

        // Get permissions from DB
        // const [permissions] = await queryInterface.sequelize.query(`SELECT id, name FROM 'Permissions'`);

        // const userPermissions = [];

        // // Link permissions (you can adjust permission logic per user)
        // permissions.forEach(permission => {
        //   if (permission.name === 'view_users') {
        //     userPermissions.push({
        //       userId: 1, // John Doe
        //       permissionId: permission.id,
        //       createdAt: new Date(),
        //       updatedAt: new Date()
        //     });
        //   }

        //   if (permission.name === 'manage_users') {
        //     userPermissions.push({
        //       userId: 2, // Jane Admin
        //       permissionId: permission.id,
        //       createdAt: new Date(),
        //       updatedAt: new Date()
        //     });
        //   }

        //   if (permission.name === 'view_dashboard') {
        //     userPermissions.push({
        //       userId: 3, // Clerk User
        //       permissionId: permission.id,
        //       createdAt: new Date(),
        //       updatedAt: new Date()
        //     });
        //   }
        // });

        // Insert into UserPermissions
        // await queryInterface.bulkInsert('UserPermissions', userPermissions);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('UserPermissions', null, {});
        await queryInterface.bulkDelete('Users', null, {});
    }
};



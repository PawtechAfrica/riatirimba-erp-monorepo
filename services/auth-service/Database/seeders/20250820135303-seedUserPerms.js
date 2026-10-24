// 'use strict'

// module.exports = {
//   async up (queryInterface, Sequelize) {
//     // Get all permissions
//     const permissions = await queryInterface.sequelize.query(
//       // `SELECT id FROM 'Permissions';`,
//       `SELECT id FROM "Permissions";`,
//       { type: Sequelize.QueryTypes.SELECT }
//     )

//     // Build entries for user 1 and user 2 with all permissions
//     const userPermissions = []
//     for (const perm of permissions) {
//       userPermissions.push({
//         userId: 1,
//         permissionId: perm.id
//       })
//       userPermissions.push({
//         userId: 2,
//         permissionId: perm.id
//       })
//       userPermissions.push({
//         userId: 3,
//         permissionId: perm.id
//       })
//       userPermissions.push({
//         userId: 4,
//         permissionId: perm.id
//       })
//     }

//     // Insert into UserPermissions table
//     await queryInterface.bulkInsert('UserPermissions', userPermissions, {})
//   },

//   async down (queryInterface, Sequelize) {
//     // Delete only entries for userId 1 and 2
//     await queryInterface.bulkDelete(
//       'UserPermissions',
//       {
//         userId: { [Sequelize.Op.in]: [1, 2, 3, 4] }
//       },
//       {}
//     )
//   }
// }






'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    // Get all permissions
    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM "Permissions";`,
      { type: Sequelize.QueryTypes.SELECT }
    )

    // Get actual users (not assuming IDs 1,2,3,4)
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" ORDER BY id LIMIT 5;`,  // Get first 5 users
      { type: Sequelize.QueryTypes.SELECT }
    )

    // Build entries for first 4 users with all permissions
    const userPermissions = []
    
    for (const perm of permissions) {
      for (const user of users) {
        userPermissions.push({
          userId: user.id,  // Use actual user ID
          permissionId: perm.id
        })
      }
    }

    // Insert into UserPermissions table
    await queryInterface.bulkInsert('UserPermissions', userPermissions, {})
  },

  async down (queryInterface, Sequelize) {
    // Delete entries for all users (or adjust as needed)
    await queryInterface.bulkDelete(
      'UserPermissions',
      null,
      {}
    )
  }
}
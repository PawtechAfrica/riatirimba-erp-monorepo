'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    const departments = await queryInterface.bulkInsert(
      'Departments',
      [
        {
          name: 'Mechanical and Automotive Engineering Department',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Electrical and Electronics Engineering Department',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Building and Civil Engineering Department',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Computing and Informatics Department',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Fashion Design and Cosmetology Department',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Business Studies Department',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      { returning: true } // returns IDs of inserted rows
    )

    // const mechId = departments[0].id
    const [
      mechId,
      electricalId,
      buildingId,
      computingId,
      fashionId,
      businessId
    ] = departments.map(department => department.id)

    console.log({
      mechId,
      electricalId,
      buildingId,
      computingId,
      fashionId,
      businessId
    })

    const mech_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        {
          code: 'L6MEP',
          name: 'Mechanical Production Technology',
          departmentId: mechId,
          level: 6,
          duration: 6,
          entryRequirements: 'C- , Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5MEP',
          name: 'Mechanical Production Technology',
          departmentId: mechId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4MEP',
          name: 'Mechanical Production Machine Operations',
          departmentId: mechId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L6MEW',
          name: 'Welding',
          departmentId: mechId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5MEW',
          name: 'Welding',
          departmentId: mechId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4MEW',
          name: 'Welding',
          departmentId: mechId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3MEW',
          name: 'Welding',
          departmentId: mechId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L6MEA',
          name: 'Automotive Technology',
          departmentId: mechId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5MEA',
          name: 'Automotive Technology',
          departmentId: mechId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4MEA',
          name: 'Automotive Mechanic',
          departmentId: mechId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3MEA',
          name: 'Automotive Mechanic',
          departmentId: mechId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      { returning: true }
    )

    const electrical_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        {
          code: 'L6EE',
          name: 'Electrical Engineering',
          departmentId: electricalId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5EE',
          name: 'Electrical Engineering',
          departmentId: electricalId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4EE',
          name: 'Electrical Installation Technology',
          departmentId: electricalId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3EE',
          name: 'Electrical Installation Technology',
          departmentId: electricalId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {
        returning: true
      }
    )

    const building_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        {
          code: 'L6BCE',
          name: 'Civil Engineering',
          departmentId: buildingId,
          level: 6,
          duration: 7,
          entryRequirements: 'C-',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L6BT',
          name: 'Building Technology',
          departmentId: buildingId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5BT',
          name: 'Building Technology',
          departmentId: buildingId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Masonry Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4BCM',
          name: 'Masonry',
          departmentId: buildingId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3BCM',
          name: 'Masonry',
          departmentId: buildingId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5BCP',
          name: 'Plumbing',
          departmentId: buildingId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4BCP',
          name: 'Plumbing',
          departmentId: buildingId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3BCP',
          name: 'Plumbing',
          departmentId: buildingId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5BCJ',
          name: 'Carpentry and Joinery',
          departmentId: buildingId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4BCJ',
          name: 'Carpentry and Joinery',
          departmentId: buildingId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3BCJ',
          name: 'Carpentry and Joinery',
          departmentId: buildingId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {
        returning: true
      }
    )

    const computing_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        {
          code: 'L6ICT',
          name: 'ICT Technician',
          departmentId: computingId, // You'll need to define this variable
          level: 6,
          duration: 6,
          entryRequirements: 'Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5ICT',
          name: 'ICT Technician',
          departmentId: computingId, // You'll need to define this variable
          level: 5,
          duration: 4,
          entryRequirements: 'Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4ICT',
          name: 'ICT Operator',
          departmentId: computingId, // You'll need to define this variable
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {
        returning: true
      }
    )

    const fashion_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        {
          code: 'L6FD',
          name: 'Fashion Design',
          departmentId: fashionId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5FD',
          name: 'Fashion Design',
          departmentId: fashionId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4FD',
          name: 'Fashion Design',
          departmentId: fashionId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3FD',
          name: 'Fashion Design',
          departmentId: fashionId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        {
          code: 'L6CST',
          name: 'Cosmetology',
          departmentId: fashionId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5CST',
          name: 'Cosmetology',
          departmentId: fashionId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4CST',
          name: 'Cosmetology',
          departmentId: fashionId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE, Pass in Level 3',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L3CST',
          name: 'Cosmetology',
          departmentId: fashionId,
          level: 3,
          duration: 1,
          entryRequirements: 'KCPE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {
        returning: true
      }
    )

    const business_courses = await queryInterface.bulkInsert(
      'Courses',
      [
        // Human Resource Management Courses
        {
          code: 'L6HRM',
          name: 'Human Resource Management',
          departmentId: businessId, // Using businessId as specified
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5HRM',
          name: 'Human Resource Management',
          departmentId: businessId,
          level: 5,
          duration: 4,
          entryRequirements: 'D',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Office Administration Courses
        {
          code: 'L6OA',
          name: 'Office Administration',
          departmentId: businessId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5OA',
          name: 'Office Administration',
          departmentId: businessId,
          level: 5,
          duration: 4,
          entryRequirements: 'D, Pass in Level 4',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L4OA',
          name: 'Office Assistance',
          departmentId: businessId,
          level: 4,
          duration: 2,
          entryRequirements: 'KCSE',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Social Work Courses
        {
          code: 'L6SVW',
          name: 'Social Work',
          departmentId: businessId,
          level: 6,
          duration: 6,
          entryRequirements: 'C-, Pass in Level 5',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: 'L5SW',
          name: 'Social Work',
          departmentId: businessId,
          level: 5,
          duration: 4,
          entryRequirements: 'D',
          examBody: 'TVET CDACC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {
        returning: true
      }
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Departments', null, {})
    await queryInterface.bulkDelete('Courses', null, {})
  }
}

'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'vote_heads',
      [
        // One-time charges (priority 1-2)
        {
          id: 'VH-ADM',
          name: 'Admission Fee',
          description: 'One-time admission fee for new trainees',
          is_one_time: true,
          is_refundable: false,
          priority_order: 1,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-ID',
          name: 'Student ID',
          description: 'One-time trainee ID card fee',
          is_one_time: true,
          is_refundable: false,
          priority_order: 2,
          is_active: true,
          created_at: new Date()
        },
        // Recurring charges (priority 3-8)
        {
          id: 'VH-ACT',
          name: 'Activity',
          description: 'Trainees activities fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 3,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-EWC',
          name: 'Electricity, Water & Conservancy',
          description: 'Utilities and conservancy fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 4,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-LTT',
          name: 'Local Travel & Transport',
          description: 'Local travel and transport fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 5,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-PE',
          name: 'Personal Emoluments',
          description: 'Personal emoluments fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 6,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-RMI',
          name: 'R.M.I',
          description: 'Repair, Maintenance, and Improvement fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 7,
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'VH-TUI',
          name: 'Tuition',
          description: 'Tuition fee',
          is_one_time: false,
          is_refundable: false,
          priority_order: 8,
          is_active: true,
          created_at: new Date()
        }
      ],
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      'vote_heads',
      {
        id: [
          'VH-ADM',
          'VH-ID',
          'VH-ACT',
          'VH-EWC',
          'VH-LTT',
          'VH-PE',
          'VH-RMI',
          'VH-TUI'
        ]
      },
      {}
    )
  }
}
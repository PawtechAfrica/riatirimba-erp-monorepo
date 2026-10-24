'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Insert fee structures with shorter IDs (max 20 chars)
    await queryInterface.bulkInsert('fee_structures', [
      {
        id: 'FS-V1-T1-COL',
        version_label: '2026 Gazette',
        term_number: 1,
        scope_type: 'college',
        scope_id: null,
        student_category: null,
        valid_from: '2026-01-01',
        valid_to: null,
        total_amount: 22398.00,
        is_active: true,
        created_by: 'SYSTEM',
        created_at: now,
      },
      {
        id: 'FS-V1-T2-COL',
        version_label: '2026 Gazette',
        term_number: 2,
        scope_type: 'college',
        scope_id: null,
        student_category: null,
        valid_from: '2026-01-01',
        valid_to: null,
        total_amount: 22396.00,
        is_active: true,
        created_by: 'SYSTEM',
        created_at: now,
      },
      {
        id: 'FS-V1-T3-COL',
        version_label: '2026 Gazette',
        term_number: 3,
        scope_type: 'college',
        scope_id: null,
        student_category: null,
        valid_from: '2026-01-01',
        valid_to: null,
        total_amount: 22395.00,
        is_active: true,
        created_by: 'SYSTEM',
        created_at: now,
      },
    ], {});

    // Get the IDs of the inserted fee structures to link lines
    const [structures] = await queryInterface.sequelize.query(
      `SELECT id FROM fee_structures WHERE version_label = '2026 Gazette' ORDER BY term_number`
    );

    const fsTerm1Id = structures[0].id;
    const fsTerm2Id = structures[1].id;
    const fsTerm3Id = structures[2].id;

    // Insert fee structure lines (vote head amounts per term)
    await queryInterface.bulkInsert('fee_structure_lines', [
      // Term 1 Lines
      {
        id: 'FSL-T1-ACT',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-ACT',
        amount: 1600.00,
        priority_order: 5,
      },
      {
        id: 'FSL-T1-EWC',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-EWC',
        amount: 1324.00,
        priority_order: 6,
      },
      {
        id: 'FSL-T1-LTT',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-LTT',
        amount: 1400.00,
        priority_order: 7,
      },
      {
        id: 'FSL-T1-PE',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-PE',
        amount: 3500.00,
        priority_order: 8,
      },
      {
        id: 'FSL-T1-RMI',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-RMI',
        amount: 1334.00,
        priority_order: 9,
      },
      {
        id: 'FSL-T1-TUI',
        fee_structure_id: fsTerm1Id,
        vote_head_id: 'VH-TUI',
        amount: 13240.00,
        priority_order: 10,
      },
      // Term 2 Lines
      {
        id: 'FSL-T2-ACT',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-ACT',
        amount: 1600.00,
        priority_order: 5,
      },
      {
        id: 'FSL-T2-EWC',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-EWC',
        amount: 1323.00,
        priority_order: 6,
      },
      {
        id: 'FSL-T2-LTT',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-LTT',
        amount: 1400.00,
        priority_order: 7,
      },
      {
        id: 'FSL-T2-PE',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-PE',
        amount: 3500.00,
        priority_order: 8,
      },
      {
        id: 'FSL-T2-RMI',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-RMI',
        amount: 1333.00,
        priority_order: 9,
      },
      {
        id: 'FSL-T2-TUI',
        fee_structure_id: fsTerm2Id,
        vote_head_id: 'VH-TUI',
        amount: 13240.00,
        priority_order: 10,
      },
      // Term 3 Lines
      {
        id: 'FSL-T3-ACT',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-ACT',
        amount: 1600.00,
        priority_order: 5,
      },
      {
        id: 'FSL-T3-EWC',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-EWC',
        amount: 1323.00,
        priority_order: 6,
      },
      {
        id: 'FSL-T3-LTT',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-LTT',
        amount: 1400.00,
        priority_order: 7,
      },
      {
        id: 'FSL-T3-PE',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-PE',
        amount: 3500.00,
        priority_order: 8,
      },
      {
        id: 'FSL-T3-RMI',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-RMI',
        amount: 1333.00,
        priority_order: 9,
      },
      {
        id: 'FSL-T3-TUI',
        fee_structure_id: fsTerm3Id,
        vote_head_id: 'VH-TUI',
        amount: 13239.00,
        priority_order: 10,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Delete all fee structure lines first (due to foreign key constraints)
    await queryInterface.bulkDelete('fee_structure_lines', null, {});
    // Then delete fee structures
    await queryInterface.bulkDelete('fee_structures', null, {});
  },
};
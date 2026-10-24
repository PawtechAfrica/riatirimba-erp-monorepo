const express = require('express');
const router = express.Router();

// Public
router.use('/departments', require('./public/departments'));
router.use('/courses', require('./public/courses'));

// Student Portal
// router.use('/', require('./student/studentCourses'));

// Admin
// router.use('/admin/departments', require('./admin/departments'));
// router.use('/admin/courses', require('./admin/courses'));
// router.use('/admin/modules', require('./admin/modules'));
// router.use('/admin/units', require('./admin/units'));

module.exports = router;

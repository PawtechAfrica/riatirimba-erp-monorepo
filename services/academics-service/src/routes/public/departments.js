const express = require('express')
const router = express.Router()
const {
  getAllDepartments,
  getDepartmentCourses
} = require('../../controllers/departmentController')

router.get('/', getAllDepartments)
router.get('/:id/courses', getDepartmentCourses)

module.exports = router

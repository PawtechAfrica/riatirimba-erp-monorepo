const { Departments, Courses } = require('../../Database/models')

async function getAllDepartments (req, res) {
  try {
    const departments = await Departments.findAll()
    res.status(200).json({ departments })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error })
  }
}

async function getDepartmentCourses (req, res) {

  try {
    const courses = await Courses.findAll({
      where: { departmentId: req.params.id }
    })

    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

module.exports = { getAllDepartments, getDepartmentCourses }

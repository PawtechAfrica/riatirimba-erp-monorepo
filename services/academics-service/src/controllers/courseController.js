const { Departments, Courses } = require('../../Database/models')

async function getAllCourses (req, res) {
  try {
    const AllDepartmentCourses = await Departments.findAll({
      include: [
        {
          model: Courses,
          as: 'courses',
          attributes: [
            'id',
            'code',
            'name',
            'level',
            'entryRequirements',
            'examBody',
            'duration',
            'departmentId'
          ]
        }
      ],
      attributes: ['id', 'name']
    })
    res.json(AllDepartmentCourses)
  } catch (error) {
    res.json(error)
  }
}

module.exports = { getAllCourses }

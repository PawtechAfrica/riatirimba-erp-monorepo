import { AcademicServiceClass } from "./academic.service";
import { StudentService } from "./students.service";

const academicService = new AcademicServiceClass();
const studentService = new StudentService();
export { academicService, studentService };

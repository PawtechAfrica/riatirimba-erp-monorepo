import { NextOfKinService } from "./NextOfKin.service";
import { StudentsService } from "./Students.service";
import { EnrollmentService } from "./Enrollment.service";
import { AddressService } from "./Address.service";
import { AcademicHistoryService } from "./AcademicHistory.service";
import { CourseModuleService } from "./CourseModule.service";
import { AppDataSource } from "../database/data-source";
import { CourseModule } from "../database/entities/CourseModule.entity";
import { Enrollment } from "../database/entities/Enrollment.entity";
import { Student } from "../database/entities/Students.entity";
import { TermSessionService } from "./TermSession.service";
import { TermSession } from "../database/entities/TermSession.entity";

const nextOfKinService = new NextOfKinService();
const addressService = new AddressService();
const academicHistoryService = new AcademicHistoryService();
const studentService = new StudentsService(AppDataSource.getRepository(Student));
const enrollmentService = new EnrollmentService(AppDataSource.getRepository(Enrollment));
const courseModuleService = new CourseModuleService(AppDataSource.getRepository(CourseModule));
const termSession = new TermSessionService(AppDataSource.getRepository(TermSession));

export { nextOfKinService, studentService, enrollmentService, addressService, academicHistoryService };
export default {
	courseModuleService,
	termSession,
};

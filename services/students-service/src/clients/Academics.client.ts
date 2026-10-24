// src/external-services/AcademicServiceClass.ts
import { BaseServiceClient } from "./BaseService.client";
import { AppError } from "../utils/AppErrorClasses";

export type CourseObj = {
    id: number;
    code: string;
    name: string;
    level: number;
    entryRequirements: string;
    examBody: string;
    duration: number;
    departmentId: number;
};

export type DepartmentObj = {
    id: string;
    name: string;
    courses: Array<CourseObj>;
};

export class AcademicServiceClient extends BaseServiceClient {
    constructor() {
        super(
            process.env.NODE_ENV === "development" ? "http://localhost:5001/api" : "http://academics-service:3000/api",
        );
    }

    async allDepartmentsAndCourses(): Promise<Array<DepartmentObj>> {
        return this.get<Array<DepartmentObj>>("/courses");
    }

    async allCourses(): Promise<Array<CourseObj>> {
        const result = await this.allDepartmentsAndCourses();
        return result.flatMap((dept) => dept.courses);
    }
    async courseAndDepartment(courseId: number): Promise<{course: CourseObj|undefined, department: DepartmentObj|undefined}>{
        const allCoursesAndDepartments = await this.allDepartmentsAndCourses();
        // get department with course
        const got = allCoursesAndDepartments.find(dept => dept.courses.find(c => c.id == courseId))
        return {
            course: got?.courses.find(c => c.id == courseId),
            department: got
        }
    }
    async courseById(id: number | string): Promise<CourseObj | undefined> {
        const result = await this.allCourses();
        if (!result?.length) throw new AppError("No courses found", 404);

        return result.find((course) => course.id === Number(id));
    }
}

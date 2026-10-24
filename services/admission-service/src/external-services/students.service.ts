import { ReadyApplicantObj } from "../types";
import { StudentObj } from "./@external-types";
import { ExternalServiceBase } from "./ExternalServiceBase";

export type CreateManyObj = {
    message: "Student created successfully";
    success: ReadyApplicantObj[];
    failures: { index: 0; student: [Object]; error: { property: string; field: string }[] }[];
};
export class StudentService extends ExternalServiceBase<StudentObj> {
    constructor() {
        super("http://localhost:5002/api/v1", "http://students-service:5002/api/v1");
    }

    async createMany(applicants: ReadyApplicantObj[]): Promise<CreateManyObj> {
        try {
            return await this.post<CreateManyObj>("/students/create-many", applicants);
        } catch (error) {
            throw error;
        }
    }
}

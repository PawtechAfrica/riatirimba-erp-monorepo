import axios, {AxiosResponse} from "axios";

export type CourseObj = {
    "id": number,
    "name": string,
    "code": string,
    "duration": number
    "level": number,
}

export type DepartmentObj = {
    "id": string,
    "name": string,
    "courses": Array<CourseObj>,
}


export class AcademicServiceClass {
    private api = axios.create({
        baseURL: process.env.NODE_ENV === 'development' ? "http://localhost:5001/api": "http://academics-service:3000/api"
    })

    /**
     * @description - Fetches all courses grouped in departments
     */
    async allDepartmentsAndCourses(): Promise<Array<DepartmentObj> | undefined> {
        try {
            const result = await this.api.get("/courses") as AxiosResponse<Array<DepartmentObj>>
            return result.data
        } catch (err) {
            throw new Error("Error fetching courses")
        }
    }
}


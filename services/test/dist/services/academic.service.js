"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicServiceClass = void 0;
const axios_1 = __importDefault(require("axios"));
const bootstrappers_1 = require("../utils/bootstrappers");
class AcademicServiceClass {
    constructor() {
        this.api = axios_1.default.create({
            baseURL: "http://localhost:5001/api"
        });
    }
    /**
     * @description - Fetches all courses grouped in departments
     */
    async allDepartmentsAndCourses() {
        try {
            const result = await this.api.get("/courses");
            return result.data;
        }
        catch (err) {
            console.log(err);
            throw new Error("Error fetching courses");
        }
    }
    async allCourses() {
        try {
            const result = await this.allDepartmentsAndCourses();
            return result ? result.AllDepartmentCourses.flatMap(dept => dept.courses) : [];
        }
        catch (err) {
            return [];
        }
    }
    async courseById(id) {
        try {
            const result = await this.allCourses();
            if (!result)
                throw new bootstrappers_1.AppError("No courses found");
            return result.find(course => course.id === Number(id));
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AcademicServiceClass = AcademicServiceClass;
//# sourceMappingURL=academic.service.js.map
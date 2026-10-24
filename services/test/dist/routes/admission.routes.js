"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/admission/UserController");
const admissionRoutes = express_1.default.Router();
admissionRoutes
    .get("/applicants", UserController_1.getAllApplicants)
    .get("/applicant/:id", UserController_1.getApplicantById)
    .post("/applicant", UserController_1.createApplicant)
    .post("/login", UserController_1.applicantLogin)
    .patch("/applicant/:id", UserController_1.updateApplication);
exports.default = admissionRoutes;
//# sourceMappingURL=admission.routes.js.map
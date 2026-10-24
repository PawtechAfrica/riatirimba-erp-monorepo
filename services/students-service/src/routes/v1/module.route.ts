import express from "express";
import { CourseModuleController } from "../../controllers/module.controller";
import { AppDataSource } from "../../database/data-source";
import { CourseModule } from "../../database/entities/CourseModule.entity";
import validateSchema from "../../middleware/schema.middleware";
import { verifyJWT } from "../../middleware/verifyJWT";
import moduleSchema from "../../schema/module.schema";
import { CourseModuleService } from "../../services/CourseModule.service";
import { appPermissions } from "../../services/permissions.service";

const courseModuleRepo = AppDataSource.getRepository(CourseModule);
const courseModuleController = new CourseModuleController(new CourseModuleService(courseModuleRepo));

const courseModuleRouter = express.Router();

courseModuleRouter
	.get("/enroll/:term{.:year}", verifyJWT(appPermissions.VIEW_MODULES), courseModuleController.getEnrollments)
	.post(
		"/enroll/auto",
		verifyJWT(
			// appPermissions.ENROLL_MODULE
		),
		validateSchema(moduleSchema.autoCreateModuleSchema),
		courseModuleController.autoEnrollModule,
	);

export default courseModuleRouter;

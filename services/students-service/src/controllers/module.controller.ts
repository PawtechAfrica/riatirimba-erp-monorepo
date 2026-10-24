import { AutoCreateModuleSchemaInput } from "../schema/module.schema";
import { CourseModuleService } from "../services/CourseModule.service";
import respond from "../utils/respond";
import { tryCatchAsync } from "../utils/tryCatchAsync";
import { BaseController } from "./Base.controller";

export class CourseModuleController extends BaseController<CourseModuleService> {
	autoEnrollModule = tryCatchAsync(async (req, res) => {
		const { admissionNumber } = req.body as AutoCreateModuleSchemaInput["body"];
		const { sub } = req.user!;
		const result = await this.service.autoEnrollModule(admissionNumber, sub);
		respond(res, "Success", result);
	});

	getEnrollments = tryCatchAsync(async (req, res) => {
		// specificy term and year
		const results = await this.service.getModuleSessions();
		respond(res, "Success", results);
	});
}

import { BaseServiceClient } from "./BaseService.client";
import { IntakeObj, IntakePeriodEnum } from "./@types.external";

export class AdmissionServiceClient extends BaseServiceClient {
	constructor() {
		super(
			process.env.NODE_ENV === "development"
				? "http://localhost:5000/api/v1"
				: "http://admission-service:5000/api/v1",
		);
	}

	intakeById = async (id: number | string) => {
		try {
			return await this.get<IntakeObj>(`/intakes/intake/${id}`);
		} catch (_err) {
			return null;
		}
	};

	async batchCreateIntakes(intakes: { period: IntakePeriodEnum; year: number }[]): Promise<{
		completed: number;
		skipped: number;
		data: Record<string, IntakeObj>;
	}> {
		try {
			return await this.post<{
				completed: number;
				skipped: number;
				data: Record<string, IntakeObj>;
			}>("/intakes/batch-create", intakes);
		} catch (err) {
			throw err;
		}
	}

	allIntakes = async () => {
		try {
			return await this.get<IntakeObj>("/intakes/intakes");
		} catch (err) {
			throw err;
		}
	};
}

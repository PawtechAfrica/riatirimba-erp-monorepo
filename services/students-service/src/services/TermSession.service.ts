import dayjs from "dayjs";
import { TermSession } from "../database/entities/TermSession.entity";
import { CreateTermSessionInput } from "../schema/termSession.schema";
import { AppError } from "../utils/AppErrorClasses";
import { ModelServiceBase } from "./ModelService.base";
import { IsNull } from "typeorm";

export class TermSessionService extends ModelServiceBase<TermSession> {
	async getSessions(): Promise<TermSession[]> {
		return await this.repo.find({ relations: ["modules"], order: { id: "DESC" } });
	}

	async getActiveTermSession(): Promise<TermSession | null> {
		return await this.repo.findOneBy({ endDate: IsNull() });
	}

	async createSession(data: CreateTermSessionInput["body"]): Promise<TermSession> {
		// check no existing session for the same period in the same year
		const exists = await this.repo.existsBy({
			period: data.period,
			...(data.startDate && { year: dayjs(data.startDate).year() }),
		});
		if (exists) throw new AppError("A similar session already exists");

		const newSession = this.repo.create(data);
		await this.repo.save(newSession);
		return newSession;
	}

	async closeSession(id: string): Promise<TermSession> {
		const session = await this.repo.findOne({ where: { id }, relations: ["modules"] });
		if (!session) throw new Error("Term session not found");

		session.endDate = new Date();

		// close all related modules
		for (const module of session.modules) module.completedAt = new Date();

		await this.repo.save(session);
		return session;
	}
}

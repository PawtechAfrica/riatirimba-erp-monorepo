import { ObjectLiteral, Repository } from "typeorm";

export abstract class ModelServiceBase<T extends ObjectLiteral> {
	constructor(protected readonly repo: Repository<T>) {}
}

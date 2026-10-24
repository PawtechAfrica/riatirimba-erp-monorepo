import { ModelServiceBase } from "../services/ModelService.base";

export abstract class BaseController<T> {
	constructor(protected readonly service: T) {}
}

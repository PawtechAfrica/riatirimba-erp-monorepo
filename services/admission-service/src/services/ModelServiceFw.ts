import {
    Connection,
    EntityManager,
    EntityName,
    type EntityRepository,
    IDatabaseDriver,
    RequestContext
} from "@mikro-orm/core";
import {db} from "../database/utils/db-bootstrap.util";
import {AppError} from "../utils/bootstrappers";


export abstract class ModelServiceFw<T extends object> {
    protected abstract entity: EntityName<T>
    protected abstract baseFields: (keyof T)[]

    protected getExtraFields?(args: T): Promise<(keyof T)[]>

    protected get em(): EntityManager<IDatabaseDriver<Connection>> {
        return RequestContext.getEntityManager() || db.em.fork()
    }

    public get repo(): EntityRepository<T> {
        const repo = this.em.getRepository(this.entity)
        if (!repo) throw new AppError("No repository found for entity: " + this.entity)
        return repo
    }

    requiredSum = async (model: T): Promise<number> => {
        return this.baseFields.length + (this.getExtraFields ? (await this.getExtraFields(model)).length : 0)
    }

    public getCompletion = async (model: T) => {
        let completion = 0
        if (!this.repo || !this.em) return completion;
        // add any extra fields that maybe require conditions to be met
        let allFields = [...this.baseFields]
        if (this.getExtraFields)
            allFields = allFields.concat(await this.getExtraFields(model))
        // iterate through the fields and add 1 if the field is not null
        allFields.forEach(field => completion += (model[field] !== null ? 1 : 0))
        return completion
    }
}


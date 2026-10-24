import {ModelServiceFw} from "./ModelServiceFw";
import {Intake} from "../database/entities/Intake.entity";
import {IntakeFilterQuery} from "../types";


export class IntakeService extends ModelServiceFw<Intake> {
    entity = Intake;
    protected baseFields: (keyof Intake)[] = [];

    async fetchAndQuery(filters?: IntakeFilterQuery): Promise<Intake[]> {
        return await this.repo.find(
            !filters ? {} : {
                $and: Object.keys(filters).map(key => filters[key]
                    ? ({[key]: filters[key]})
                    : {}
                )
            }
        )
    }

}


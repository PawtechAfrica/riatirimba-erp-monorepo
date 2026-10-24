import {IntakeService} from "../services/intake.service";
import {tryCatch} from "../utils/bootstrappers";
import {IntakeFilterQuery} from "../types";


export class IntakeController {
    constructor(private readonly service: IntakeService) {
    }

    fetchIntakes = tryCatch(async (req, res) => {
        const {year, status, opens} = req.query as IntakeFilterQuery
        const result = await this.service.fetchAndQuery({year, status, opens})
        res.status(200).json(result)
    })
}


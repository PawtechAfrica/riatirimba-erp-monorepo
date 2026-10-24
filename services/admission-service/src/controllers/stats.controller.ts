import {AppError, tryCatch} from "../utils/bootstrappers";
import {StatsService} from "../services/stats.service";


export class StatsController {

    constructor(private readonly service: StatsService) {
    }

    getOneIntakeStat = tryCatch(async (req, res) => {
        const intake_key = req.params["intake_key"]
        if (!intake_key || typeof intake_key !== "string")
            throw new AppError("No intake key found!")
        const result = await this.service.oneIntakeStats(intake_key)
        res.status(200).json(result)
    })
}


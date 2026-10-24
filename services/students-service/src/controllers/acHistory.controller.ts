import {tryCatchAsync} from "../utils/tryCatchAsync";
import {AppError} from "../utils/AppErrorClasses";
import {validateDTO} from "../utils/validateDTO";
import {UpdateAcademicHistoryDto} from "../@types.global/dtos";
import {studentService} from "../services";
import {AcademicHistoryService} from "../services/AcademicHistory.service";


export class AcHistoryController {

    constructor(protected service: AcademicHistoryService) {

    }

    updateAcademicHistory = tryCatchAsync(async (req, res) => {
        const {id} = req.params;
        if (!id || Number.isNaN(Number(id)) || !req.body) throw new AppError("Broken or invalid request!")
        const validated = await validateDTO(UpdateAcademicHistoryDto, req.body);
        // take to service
        await this.service.updateAcademicHistory(Number(id), validated)
        res.status(200).json({
            message: "History updated successfully!",
        })
    })
}


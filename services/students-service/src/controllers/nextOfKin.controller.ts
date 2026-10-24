import {NextOfKinService} from "../services/NextOfKin.service";
import {tryCatchAsync} from "../utils/tryCatchAsync";
import {validateDTO} from "../utils/validateDTO";
import {CreateNextOfKinDTO, UpdateNextOfKinDTO} from "../@types.global/dtos";
import {AppError} from "../utils/AppErrorClasses";
import {studentService} from "../services";


export class NextOfKinController {

    constructor(protected service: NextOfKinService) {
    }

    createNextOfKin = tryCatchAsync(async (req, res) => {
        if (!req.body || !req.params.student_id || req.params.student_id == 'undefined') throw new AppError("Invalid request. No data provided!")
        const validated = await validateDTO(CreateNextOfKinDTO, req.body)
        // find student by id
        const student = await studentService.findOneById(req.params.student_id as string)
        if (!student)
            throw new AppError("Student not found!", 404)
        const created = await this.service.create(validated, student)
        res.status(201).json({
            message: "Next of kin created successfully!",
            data: created,
        })
    })
    updateNextOfKin = tryCatchAsync(async (req, res) => {
        if (!req.body) throw new AppError("Invalid request. No data provided!")
        const validated = await validateDTO(UpdateNextOfKinDTO, req.body)
        const updated = await this.service.update(validated)
        res.status(200).json({
            message: "Next of kin updated successfully!",
            data: updated,
        })
    })
    deleteNextOfKin = tryCatchAsync(async (req, res)=>{
        if(!req.params.id || req.params.id == 'undefined') throw new AppError("Invalid request!")
        const found = await this.service.repo.findOneBy({id: req.params.id as string})
        if(!found) throw new AppError("Next of kin not found!", 404)
        await this.service.repo.remove(found)
        res.status(200).json({
            message: "Next of kin deleted successfully!",
        })
    })
}


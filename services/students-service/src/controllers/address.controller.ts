import {AddressService} from "../services/Address.service";
import {tryCatchAsync} from "../utils/tryCatchAsync";
import {AppError} from "../utils/AppErrorClasses";
import {validateDTO} from "../utils/validateDTO";
import {CreateAddressDto, UpdateAddressDto} from "../@types.global/dtos";
import {studentService} from "../services";


export class AddressController {

    constructor(protected service: AddressService) {
    }

    createAddress = tryCatchAsync(async (req, res) => {
        const {student_id} = req.params;
        if (!student_id || !req.body) throw new AppError("Invalid or broken request!")
        // validate
        const validated = await validateDTO(CreateAddressDto, req.body)
        // find student
        const student = await studentService.findOneById(student_id as string)
        if (!student) throw new AppError("We couldn't find this student!")
        const result = await this.service.createAddress(validated, student)
        res.status(200).json({
            message: "Created address successfully",
            data: result
        })
    })

    updateAddress = tryCatchAsync(async (req, res) => {
        const {id} = req.params;
        if (!id || !req.body) throw new AppError("Invalid or broken request!")
        const validated = await validateDTO(UpdateAddressDto, req.body)
        const repo = await this.service.update(Number(id), validated)
        res.status(200).json({
                message: "Updated address successfully",
                data: repo
            }
        )
    })
}

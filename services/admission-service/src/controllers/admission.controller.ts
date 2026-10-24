import {AppError, tryCatch} from "../utils/bootstrappers";
import {AdmissionService} from "../services/admission.service";

export class AdmissionController {
    constructor(protected service: AdmissionService) {
    }

    approveApplications = tryCatch(async (req, res) => {
        const {applicant_ids} = req.body;
        if (!Array.isArray(applicant_ids)) throw new AppError("Your request is broken, please refresh and try again!");
        const result = await this.service.approveApplication(applicant_ids);
        res.status(200).send({
            message: "Applications approved successfully",
            data: result,
        });
    });
}

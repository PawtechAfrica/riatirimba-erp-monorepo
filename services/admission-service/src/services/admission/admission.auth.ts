import {AppError, tryCatch} from "../../utils/bootstrappers";
import {Applicants} from "../../database/entities/Applicants.entity";
import {db} from "../../database/utils/db-bootstrap.util";

export const applicantLogin = tryCatch(async (req, res) => {
    const {email, indexNumber} = req.body;
    if (!email || !indexNumber) throw new AppError("All fields are required!");
    const found = await db.em.findOne(
        Applicants,
        {$and: [{email}, {enrollments: {$contains: {$or: [{kcseIndexNumber: indexNumber}, {kcpeIndexNumber: indexNumber}]}}}]},
        {populate: ["documents", "nextOfKins", "academicHistory", "enrollments"]},
    );

    if (!found)
        throw new AppError("Invalid index number or email");

    res.status(200).json({
        message: "Welcome back",
        data: found,
    });
});

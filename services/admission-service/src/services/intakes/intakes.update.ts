// import { db } from "../../database/utils/db-bootstrap.util";
import {db} from "../../database/utils/db-bootstrap.util";
import {AppError, tryCatch} from "../../utils/bootstrappers";
import {Intake} from "../../database/entities/Intake.entity";


// close and open intakes
export const openOrCloseIntake = tryCatch(
    async (req, res) => {
        const intakeId = req.params['id']
        if (!intakeId)
            throw new AppError("Please select an intake!")
        const found = await db.em.findOne(Intake, { id: Number(intakeId) })
        if (!found)
            throw new AppError("Intake not found!")

        await db.em.persistAndFlush(found)
        res.status(200).json({
            message: found.closed ? "Intake closed successfully" : "Intake opened successfully!",
            intake: found
        })
    }
)

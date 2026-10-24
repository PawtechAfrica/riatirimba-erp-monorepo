import {AppError, tryCatch} from "../../utils/bootstrappers";
import {Intake} from "../../database/entities/Intake.entity";
import {QueryOrder} from "@mikro-orm/core";
import {db} from "../../database/utils/db-bootstrap.util";

/*
@deprecated Use intakeService.fetchAndQuery instead
TODO: Delete completely
 */
export const readAll = tryCatch(async (_req, res) => {
    const intakes = await db.em.findAll(Intake, {
        orderBy: [{opens: QueryOrder.DESC}],
        fields: ["id", "opens", "year", "period", "closes", "readable", "status", "periodYearKey", "createdAt"],
    });
    res.status(200).json(intakes);
});

export const readByKey = tryCatch(async (req, res) => {
    const periodKey = req.params["key"];
    if (!periodKey) throw new AppError("No ID provided!");

    const found = await db.em.findOne(Intake, {periodYearKey: periodKey}, {
        fields: ["id", "opens", "year", "period", "closes", "readable", "status", "periodYearKey", "createdAt"],
    });
    if (!found) throw new AppError("Intake not found!", 404);
    res.status(200).json(found);
});

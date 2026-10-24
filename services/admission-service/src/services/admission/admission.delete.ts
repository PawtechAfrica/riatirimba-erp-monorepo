import { Applicants } from "../../database/entities/Applicants.entity";
import { db } from "../../database/utils/db-bootstrap.util";
import { AppError, tryCatch } from "../../utils/bootstrappers";

export const deleteApplicants = tryCatch(async (req, res) => {
    const ids = req.body as string[];
    if (ids.length < 1) throw new AppError("No applicant selected!");
    const result: Applicants[] = [];

    ids.forEach((id) => {
        const found = db.em.getReference(Applicants, id);
        if (found) {
            db.em.assign(found, { deleted: true });
            result.push(found);
        }
    });

    await db.em.flush();

    res.status(200).json({
        message: `Successfully deleted applicants ${ids.length > 1 ? `${result.length}/${ids.length}` : ""}`,
        data: result.map((r) => r.id),
    });
});

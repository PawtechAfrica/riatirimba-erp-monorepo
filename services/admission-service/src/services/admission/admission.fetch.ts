import {AppError, tryCatch} from "../../utils/bootstrappers";
import {Applicants} from "../../database/entities/Applicants.entity";
import {QueryOrder, wrap} from "@mikro-orm/core";
import {db} from "../../database/utils/db-bootstrap.util";
import {PaginatedResponse} from "../../types";
import eventBus, {AppEvents} from "../../events";
import {admissionService} from "../index";

export const fetchAllApplicants = tryCatch(async (req, res) => {
    let { page, count } = req.query;
    eventBus.emit(AppEvents.APPLICANT_ADMITTED);
    await admissionService.migrateApplicants().catch(err => {
        console.log(err)
    })

    // default to 100
    const getCount = Number.isNaN(Number(count)) ? 100 : Number(count);
    // default to 1
    const getPage = Number.isNaN(Number(page)) ? 1 : Number(page);

    const list = await db.em.findAll(Applicants, {
        populate: ["nextOfKins", "documents", "address.*", "pending", "migrated"],
        orderBy: { completionStatus: QueryOrder.DESC_NULLS_LAST },
        limit: getCount,
        offset: (getPage - 1) * getCount,
    });

    res.status(200).json({
        page: getPage,
        pageSize: getCount,
        lastPageIs: (await db.em.count(Applicants)) / getCount,
        data: list,
    } as PaginatedResponse<Applicants>);
});

export const fetchApplicantById = tryCatch(async (req, res) => {
    const id = req.params["id"];
    if (!id) throw new AppError("No ID provided!");
    const found = await db.em.findOne(
        Applicants,
        { id },
        {
            populate: ["nextOfKins", "documents", "address.*", "pending", "migrated"],
        },
    );
    // found?.recalcCompletionStatus(db.em);
    if (!found) throw new AppError("Applicant not found!");
    res.status(200).json(wrap(found).toJSON());
});

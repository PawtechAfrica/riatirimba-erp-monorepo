import {AppError, tryCatch} from "../../utils/bootstrappers";
import {Applicants} from "../../database/entities/Applicants.entity";
import {GenderEnum} from "../../types";
import {wrap} from "@mikro-orm/core";
import {updatedDiff} from "deep-object-diff";
import {ApplicantDocuments} from "../../database/entities/ApplicantDocument.entity";
import {db} from "../../database/utils/db-bootstrap.util";
import FilesService from "../../external-services/files.service";

export const finalSubmission = tryCatch(async (req, res) => {
    const {submit, id} = req.body;
    if (!submit || typeof submit === "undefined")
        throw new AppError("Please consent to the submission for your application to be considered!");
    const found = await db.em.findOne(Applicants, {id});
    if (!found) throw new AppError("Sorry, no applicant with this credentials found, please log in and try again!");
    // ensure they have completed the form
    if (found.completionStatus < 100) throw new AppError("Please complete the form first before final submission!");
    // update the submitted status
    found.submitted = true;
    await db.em.persistAndFlush(found);
    res.status(200).json({
        message:
            "Your submission has been received and will be reviewed. You can no longer modify the information you have provided!",
        data: {submit: found.submitted},
    });
});

// multer breaks the request context
export const updateApplication = tryCatch(async (req, res) => {
    const em = db.em.fork();
    const id = req.params["id"];
    if (!id) throw new AppError("No ID provided!");
    const found = await em.findOne(Applicants, {id}, {populate: ["documents", "nextOfKins"]});
    if (!found) throw new AppError("Applicant with this ID not found!");
    if (found.submitted && !req.user?.role) throw new AppError("You already made your submission. You can no longer edit your application!");
    // if (found.pending) throw new AppError("You're already admitted, you cannot modify your data!");

    const copy = {...found};
    const clientData = req.body; // as Partial<ApplicantData>

    if (!clientData) throw new AppError("Invalid values");

    // correctly update intake
    // if ("intake" in clientData && clientData.intake != found.intake?.id) {
    //     const foundIntake = await em.findOne(Intake, { id: clientData.intake });
    //     if (foundIntake) found.intake = foundIntake;
    //     else throw new AppError("Invalid intake!");
    //     delete clientData.intake;
    // }
    // set gender to correct type
    if ("gender" in clientData && clientData.gender)
        clientData.gender = clientData.gender === "M" ? GenderEnum.MALE : GenderEnum.FEMALE;
    // safely update documents
    if ("documents" in clientData) {
        let foundDocs = await em.findOne(ApplicantDocuments, {id: found.documents.id});
        if (!foundDocs) foundDocs = new ApplicantDocuments();
        for (const key in clientData.documents) {
            // @ts-ignore todo: fix this typescript error
            const existingValue = found.documents[key];

            // if the existing value is a string and the new value is different from existing value then delete old file and set new value
            if (existingValue && typeof existingValue === "string" && existingValue !== clientData.documents[key]) {
                await FilesService.deleteOneFile(existingValue).catch(() => {
                    // locally catch this so you do not cause a breakage in the flow
                    console.warn(`Failed to delete the document: ${existingValue}`);
                });
            }
            if (!existingValue || existingValue !== clientData.documents[key]) {
                em.assign(foundDocs, {[key]: clientData.documents[key]});
            }
            await em.flush();
        }
        delete clientData["documents"];
    }

    const result = em.assign(found, {
        ...clientData,
    });
    await em.persist(found).flush();
    // const unchanged = isEqual(copy, result)

    const diff = updatedDiff(copy, result);
    if ("createdAt" in diff) delete diff["createdAt"];
    // const unchanged = Object.values(diff).length < 1
    res.status(200).json({
        message: "Application updated",
        data: wrap(found).toJSON(),
    });
    em.clear();
});

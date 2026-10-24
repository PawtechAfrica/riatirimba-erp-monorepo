// function for applicant to delete their files
import {AppError, tryCatch} from "../../utils/bootstrappers";
import FilesService from "../../external-services/files.service";
import {db} from "../../database/utils/db-bootstrap.util";
import {Applicants} from "../../database/entities/Applicants.entity";
import {makeLabel} from "../../utils/functions";
import {FileRecycle} from "../../database/entities/FileRecycle.entity";

export const applicantDeleteFile = tryCatch(
    async (req, res) => {
        const {fileKey, filename, id} = req.body;
        if (!id || !filename)
            throw new AppError("Please provide a valid filename!");
        // find user
        const found = await db.em.findOne(Applicants, id, {populate: ['documents']})
        if (!found)
            throw new AppError("User not found! Log in and try again!");
        // check if they can edit
        if (found.submitted)
            throw new AppError("No changes allowed after final submission.");
        // send deletion request
        await FilesService.deleteOneFile(filename)
            .catch(err => {
                console.error(err)
                // TODO: re-write this functionality to push to a queue
                // save the filename in temporary recycle db then delete it from the table
                db.em.create(FileRecycle, {fileName: filename})
            })
        // clear it from the db
        // @ts-ignore
        // todo: fix this typescript
        found.documents[fileKey] = null
        // persist
        await db.em.persist(found).flush()
        // send response
        res.status(200).json({
            message: `Successfully deleted ${makeLabel(fileKey)}!`,
            documents: found.documents,
        }).end()
    }
)


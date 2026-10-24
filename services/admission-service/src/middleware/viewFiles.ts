import {AppError, tryCatch} from "../utils/bootstrappers"
import filesService from "../external-services/files.service";

export const viewFiles = tryCatch(
    async (req, res) => {
        const fileName = req.params['filename']
        if (!fileName || typeof fileName !== "string")
            throw new AppError("Please provide file name!")
        const url = await filesService.view(fileName)
        res.status(200).json(url)
    }
)

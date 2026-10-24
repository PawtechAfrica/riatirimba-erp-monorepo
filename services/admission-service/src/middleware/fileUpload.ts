import {AppError, tryCatch} from "../utils/bootstrappers";
import * as fs from "fs";
import FilesService from "../external-services/files.service";
import FormData from 'form-data'
import {isValidImage} from "../utils/functions";
import * as console from "node:console";

export const fileUpload = (_callback?: (filename: string) => void) => {
    return tryCatch(async (req, _res, next) => {
        const fileList = req.files;

        // No files? Skip immediately
        if (!fileList || (Array.isArray(fileList) && fileList.length === 0) || (typeof fileList === 'object' && Object.keys(fileList).length === 0)) {
            return next();
        }

        // Flatten Multer's file list
        const list = Array.isArray(fileList) ? fileList : Object.values(fileList).flat();

        // Still empty after flattening? Skip
        if (list.length === 0) return next();

        // Now we know there are files, so create FormData
        const forwardForm = new FormData();

        for (const file of list) {
            if (file.fieldname === 'passportPhoto') {
                const metadata = await isValidImage(file);
                console.log(`Metadata: ${metadata.width} ${metadata.height}`);
                // Refuse image if the height / width error is greater than 2 pixels
                if (Math.abs(metadata.width - metadata.height) >= 2) {
                    throw new AppError("Invalid passport photo dimensions", 400);
                }
            }
            forwardForm.append(file.fieldname, fs.createReadStream(file.path), {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }
        // Upload to the second server
        const results = await FilesService.upload(forwardForm);

        // Map results to request body
        const resultObj: { [key: string]: string } = {};
        for (const result of results.files) {
            resultObj[result.field] = result.b2FileName;
            // callback(result.b2FileName)
        }
        Object.assign(req.body, {documents: resultObj});

        // Clean up temp files
        list.forEach(file => fs.unlinkSync(file.path));

        // res.status(500).end()
        next();
    });
};


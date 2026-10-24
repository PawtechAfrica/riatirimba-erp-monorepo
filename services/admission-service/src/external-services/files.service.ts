import axios from "axios";
import dotenv from "dotenv";
import {UploadedFilesRespObj} from "./files.service.types";

dotenv.config();

class FilesService {
    private url =
        process.env.NODE_ENV === "development" ? `http://localhost:4000/api` : "http://filegate-service:4000/api";
    private api = axios.create({
        baseURL: this.url,
    });

    async view(fileName: string) {
        const result = await this.api(`${this.url}/files/${fileName}`);
        return result.data.url;
    }

    async upload(formData: any): Promise<UploadedFilesRespObj> {
        const results = await this.api.post(`${this.url}/upload`, formData);
        return results.data;
    }

    async deleteOneFile(filename: string): Promise<void> {
        /** todo: complete */
        const result = await this.api.post(`${this.url}/delete_file`, {b2FileName: filename});
        return result.data;
    }
}

export default new FilesService();

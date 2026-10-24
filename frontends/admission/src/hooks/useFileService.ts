import apis from "@/libs/axios.ts";
import type {ApplicantDocuments} from "@/libs/types.ts";


export function useFileService() {

    async function getUrl(name: string | null): Promise<string | undefined> {
        try {
            const url = await apis.admission.get(`/view-files/${name}`);
            return url.data;
        } catch (err) {
            return "/ui/missing_image.svg"
        }
    }

    async function deleteFile(filename: string, fileKey: string, id: string): Promise<{
        message: string,
        documents: ApplicantDocuments
    }> {
        try {
            const url = await apis.admission.post('/admission/delete-file', {
                filename, fileKey, id
            });
            return url.data;
        } catch (err) {
            throw err;
        }
    }


    return {getUrl, deleteFile}
}

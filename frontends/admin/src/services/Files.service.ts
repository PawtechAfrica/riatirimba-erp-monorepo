import apis from "@/libs/api.ts";


class FileService {
    // private api = api.files

    async getUrl(name: string | null): Promise<string> {
        try {
            const url = await apis.admission.get(`/view-files/${name}`);
            return url.data;
        } catch (err) {
            return "/ui/missing_image.svg"
        }
    }

    async deleteFile() {

    }
}

export default new FileService()

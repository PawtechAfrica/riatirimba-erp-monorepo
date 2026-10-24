export interface MigrationFailureObj {
    index: 679,
    trainee: Record<string, any>,
    error: { property: string, message: string }[]
}

export class MigrationService {

    async uploadExcel(_data: FormData): Promise<{
        message: string,
        success: [],
        failures: MigrationFailureObj[]
    }> {
        try {
            // const result = await apis.excel.post("/upload-excel", data)
            // return result.data;
            return {message: "Out of order", success: [], failures: []}
        } catch (err) {
            throw err
        }
    }
}

export default new MigrationService()


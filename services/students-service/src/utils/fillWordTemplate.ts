import createReport from "docx-templates";
import fs from "fs";
import path from "path";

// export type FileOutputName = `${string}.${'docx' | 'pdf'}`
export type FileOutputName = `${string}.${'docx' | 'pdf' | 'odt'}`

export const fillWordTemplate = async (outputName: FileOutputName, template: Uint8Array<ArrayBufferLike>, data: Record<string, any>, outputPath = path.join(__dirname, "../../user_downloads")) => {
    const buffer = await createReport({
        template,
        data,
        cmdDelimiter: ['{#', '#}']
    })
    const finalOutputPath = path.join(outputPath, outputName)
    fs.writeFileSync(finalOutputPath, buffer)
    return finalOutputPath
}


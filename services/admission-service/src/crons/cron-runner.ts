import {migrateApplicantsCron} from "./migrate-applicants.cron"
import "../events/listeners"


export const runCrons = async () => {
    try {
        console.log("⏱  RUNNING CRONS")
        await migrateApplicantsCron.start()
    } catch (e) {
        console.log("ERROR RUNNING CRONS:\n", e)
    }
}

export const killCrons = async (): Promise<boolean> => {
    try {
        await migrateApplicantsCron.stop()
        return true
    } catch (e) {
        throw e
    }
}

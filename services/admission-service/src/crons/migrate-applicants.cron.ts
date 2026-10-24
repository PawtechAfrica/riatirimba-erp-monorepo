import cron from 'node-cron'
import eventBus, {AppEvents} from "../events";

// run a task every 5 minutes
// export const migrateApplicantsCron = cron.schedule('*/5 * * * *', () => {
export const migrateApplicantsCron = cron.schedule('*/1 * * * *', () => {
    // emit migration event
    console.log("\t📞 Call migrating applicants...")
    eventBus.emit(AppEvents.APPLICANT_ADMITTED)
})


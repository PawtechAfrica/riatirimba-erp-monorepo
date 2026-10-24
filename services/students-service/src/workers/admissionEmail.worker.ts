/**
 * send admission email
 * todo: Move from passing object IDs to using student admission number instead
 */
import { Worker } from "bullmq";
import queueConfig from "../config/queue.config";
import redis from "../lib/redis";
import emailer from "../lib/emailer";
import path from "path";
import { generatePdfBuffer } from "../utils/sharedFunctions";
import { AdmissionLetterPayload } from "../@types.global";

export default () => {
    console.log("Worker started!");
    const worker = new Worker<AdmissionLetterPayload>(
        queueConfig.ADMISSION_EMAIL_QUEUE,
        async (job) => {
            console.log("⏩ Sending email to: ", job.data.email);

            const templatePath = path.join(__dirname, "../templates", "admission.template.ejs");

            const pdf = await generatePdfBuffer(templatePath, { student: job.data });

            await emailer
                .sendMail({
                    from: '"Registrar" <info@riatirimbatvc.ac.ke>',
                    to: job.data.email,
                    subject: "Admission Confirmation",
                    html: `<html>We are happy to inform you have successfully been admitted to Riatirimba TVC. Find attached below your admission letter</html>`,
                    attachments: [
                        {
                            filename: `Admission_Letter_${job.data.admissionNumber}.pdf`,
                            content: Buffer.from(pdf),
                            contentType: "application/pdf",
                        },
                    ],
                })
                .then((result) => {
                    console.log("Email sent successfully! ", result);
                })
                .catch((err) => {
                    // todo: report this error to sentry
                    console.error("Error sending email: ", err);
                });
        },
        {
            connection: redis,
            concurrency: 5,
        },
    );
    worker.on("failed", (job, err) => {
        console.error(`[Worker] ❌ Job ${job?.id} failed: ${err.message}`);
    });
};

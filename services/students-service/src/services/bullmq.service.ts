import { Queue } from "bullmq";
import redis from "../lib/redis";
import { AdmissionLetterPayload } from "../@types.global";

class BullMqService {
    get admissionEmailQueue() {
        return new Queue<AdmissionLetterPayload>("admission-email-queue", { connection: redis });
    }
}

export default new BullMqService();

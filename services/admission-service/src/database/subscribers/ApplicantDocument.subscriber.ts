import {EntityName, EventArgs, EventSubscriber} from "@mikro-orm/core";
import {ApplicantDocuments} from "../entities/ApplicantDocument.entity";

export class ApplicantDocumentSubscriber implements EventSubscriber {
    getSubscribedEntities(): EntityName<ApplicantDocuments>[] {
        return [ApplicantDocuments];
    }

    async afterUpdate(args: EventArgs<ApplicantDocuments>): Promise<void> {
        if (args.changeSet && args.changeSet.entity) {
            // check for applicant entity and update their modified date to trigger the completion status update
            const applicant = args.entity.applicant;
            applicant.updatedAt = new Date();
            await args.em.transactional(em => {
                    em.persist(applicant).flush()
                    em.persist(args.entity).flush()
                }
                , {clear: true});
        }
    }
}
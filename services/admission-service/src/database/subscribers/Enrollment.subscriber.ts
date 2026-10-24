import {EntityName, EventArgs, EventSubscriber} from "@mikro-orm/core";
import {Enrollment} from "../entities/Enrollment.entity";


export class EnrollmentSubscriber implements EventSubscriber<Enrollment> {

    getSubscribedEntities(): EntityName<Enrollment>[] {
        return [Enrollment]
    }

    beforeCreate(args: EventArgs<Enrollment>): void | Promise<void> {
        // remove admission number if they are a new applicant
        if (args.changeSet?.entity && args.changeSet.entity.newApplicant && args.changeSet.entity.admissionNumber)
            args.em.assign(args.entity, {admissionNumber: null})
    }

    beforeUpdate(args: EventArgs<Enrollment>): void | Promise<void> {
        // remove admission number if they are a new applicant
        if (args.changeSet?.entity && args.changeSet.entity.newApplicant && args.changeSet.entity.admissionNumber)
            args.em.assign(args.entity, {admissionNumber: null})
    }
}


import { EntityName, EventArgs, EventSubscriber } from "@mikro-orm/core";
import { Intake, IntakeStatus } from "../entities/Intake.entity";
import dayjs from "dayjs";

export class IntakeSubscriber implements EventSubscriber {
    getSubscribedEntities(): EntityName<Intake>[] {
        return [Intake];
    }

    private updateStatus(intakeEntity: Intake): IntakeStatus {
        const now = dayjs().startOf("day");
        const opensDate = dayjs(intakeEntity.opens).startOf("day");
        const closesDate = intakeEntity.closes
            ? dayjs(intakeEntity.closes).startOf("day")
            : opensDate.add(10, "days").startOf("day");
        const oneMonthLater = closesDate.add(1, "month");

        if (now.isBefore(opensDate)) return IntakeStatus.UPCOMING;
        else if (
            (now.isSame(closesDate) || now.isBefore(closesDate)) &&
            (now.isSame(opensDate) || now.isAfter(opensDate))
        )
            return IntakeStatus.OPEN;
        else if (now.isSame(oneMonthLater) || now.isAfter(oneMonthLater)) return IntakeStatus.OVERDUE;
        else return IntakeStatus.CLOSED;
    }

    onLoad(event: EventArgs<Intake>): void {
        event.em.assign(event.entity, { status: this.updateStatus(event.entity) });
    }
    beforeCreate(event: EventArgs<Intake>): void {
        event.em.assign(event.entity, { status: this.updateStatus(event.entity) });
    }
    beforeUpdate(event: EventArgs<Intake>): void {
        event.em.assign(event.entity, { status: this.updateStatus(event.entity) });
    }
}

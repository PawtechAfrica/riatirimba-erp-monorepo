import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { Student } from "../entities/Students.entity";
import { studentService } from "../../services";

@EventSubscriber()
export class StudentSubscriber implements EntitySubscriberInterface<Student> {
    listenTo() {
        return Student;
    }
}

import {ApplicantService} from "./applicant.service"
import {NextOfKinsService} from "./nextOfKins.service";
import {AcademicHistoryService} from "./academicHistory.service";
import {AddressService} from "./address.service";
import {EnrollmentService} from "./enrollment.service";
import {DocumentService} from "./document.service";
import {AdmissionService} from "./admission.service";
import {StatsService} from "./stats.service";
import {IntakeService} from "./intake.service";

const applicantService = new ApplicantService()
const nextOfKinService = new NextOfKinsService()
const acHistoryService = new AcademicHistoryService()
const addressService = new AddressService()
const enrollmentService = new EnrollmentService()
const documentService = new DocumentService()

const admissionService = new AdmissionService()
const statService = new StatsService()
const intakeService = new IntakeService()

export {
    applicantService,
    nextOfKinService,
    acHistoryService,
    addressService,
    enrollmentService,
    documentService,
    admissionService,
    statService,
    intakeService
}

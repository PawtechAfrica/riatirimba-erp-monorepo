import {EntityManager} from "@mikro-orm/core";
import {Seeder} from "@mikro-orm/seeder";
import {faker} from "@faker-js/faker";
import {Applicants} from "../entities/Applicants.entity";
import {Address} from "../entities/Address.entity";
import {NextOfKin} from "../entities/NextOfKin.entity";
import {AcademicHistory} from "../entities/AcademicHistory.entity";
import {Enrollment} from "../entities/Enrollment.entity";
import {ApplicantDocuments} from "../entities/ApplicantDocument.entity";
import {Intake} from "../entities/Intake.entity";
import {BasicEducationEnum, ExamBodyEnum, GenderEnum, GradeEnum, StudentTypeEnum, TertiaryLevel} from "../../types";

export class ApplicantSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        // Fetch intakes
        const intakes = await em.find(Intake, {});
        const intake = intakes.length > 0 ? faker.helpers.arrayElement(intakes) : undefined;

        const total = 200;

        for (let i = 0; i < total; i++) {
            let tier = 1;
            if (i >= 20 && i < 50) tier = 2;
            else if (i >= 50 && i < 80) tier = 3;
            else if (i >= 80 && i < 120) tier = 4;
            else if (i >= 120 && i < 160) tier = 5;
            else if (i >= 160) tier = 6;

            const uniqueEmail = `applicant_${i}_${faker.string.alphanumeric(5)}@example.com`.toLowerCase();

            // Step 1: Create and flush the core Applicants entity
            const applicant = em.create(Applicants, {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: uniqueEmail,
            });

            // Tier 2+ fields (profile info)
            if (tier >= 2) {
                em.assign(applicant, {
                    middleName: faker.person.middleName(),
                    phone: `+2547${faker.string.numeric(5)}${String(i).padStart(3, '0')}`,
                    gender: faker.helpers.arrayElement([GenderEnum.MALE, GenderEnum.FEMALE]),
                    birthDay: faker.date.birthdate({ min: 16, max: 35, mode: "age" }),
                    birthCertNumber: `BC-${faker.string.numeric(5)}-${String(i).padStart(3, '0')}`,
                    nationalId: `ID-${faker.string.numeric(5)}-${String(i).padStart(3, '0')}`,
                    pinNumber: `PIN${faker.string.numeric(6)}${String(i).padStart(3, '0')}K`,
                });
            }

            await em.persistAndFlush(applicant);

            // Step 2: Create Address if Tier >= 2
            if (tier >= 2) {
                const address = em.create(Address, {
                    applicant,
                    county: faker.helpers.arrayElement(["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu"]),
                    location: faker.location.city(),
                    subLocation: faker.location.street(),
                    village: faker.location.streetAddress(),
                    poBox: faker.number.int({ min: 100, max: 99999 }),
                    zipCode: faker.number.int({ min: 100, max: 99999 }),
                });
                await em.persistAndFlush(address);
            }

            // Step 3: Create NextOfKin if Tier >= 3
            if (tier >= 3) {
                const nok = em.create(NextOfKin, {
                    applicant,
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    phone: `+2547${faker.string.numeric(5)}${String(i + total).padStart(3, '0')}`,
                    email: faker.internet.email(),
                    relationship: faker.helpers.arrayElement(["Father", "Mother", "Guardian", "Sibling"]),
                });
                await em.persistAndFlush(nok);
            }

            // Step 4: Create AcademicHistory if Tier >= 4
            if (tier >= 4) {
                const highestEd = faker.helpers.arrayElement([
                    BasicEducationEnum.PRIMARY_SCHOOL,
                    BasicEducationEnum.HIGH_SCHOOL,
                    BasicEducationEnum.TERTIARY,
                ]);

                const academic = em.create(AcademicHistory, {
                    applicant,
                    highestEducationLevel: highestEd,
                    kcpeIndexNumber: `${faker.string.numeric(8)}${String(i).padStart(3, '0')}/2018`,
                    primarySchool: `${faker.company.name()} Primary School`,
                    highSchool: (highestEd === BasicEducationEnum.HIGH_SCHOOL || highestEd === BasicEducationEnum.TERTIARY)
                        ? `${faker.company.name()} High School`
                        : undefined,
                    kcseIndexNumber: (highestEd === BasicEducationEnum.HIGH_SCHOOL || highestEd === BasicEducationEnum.TERTIARY)
                        ? `${faker.string.numeric(8)}${String(i).padStart(3, '0')}/2022`
                        : undefined,
                    kcseGrade: (highestEd === BasicEducationEnum.HIGH_SCHOOL || highestEd === BasicEducationEnum.TERTIARY)
                        ? faker.helpers.arrayElement(Object.values(GradeEnum))
                        : undefined,
                    tertiarySchool: (highestEd === BasicEducationEnum.TERTIARY)
                        ? `${faker.company.name()} Institute`
                        : undefined,
                    tertiaryLevel: (highestEd === BasicEducationEnum.TERTIARY)
                        ? faker.helpers.arrayElement(Object.values(TertiaryLevel))
                        : undefined,
                });
                await em.persistAndFlush(academic);
            }

            // Step 5: Create Enrollment if Tier >= 5
            if (tier >= 5) {
                const newApp = faker.helpers.arrayElement([true, false]);
                const enrollment = em.create(Enrollment, {
                    applicant,
                    course: faker.number.int({ min: 1, max: 20 }),
                    intake: intake || null,
                    newApplicant: newApp,
                    examiningBody: faker.helpers.arrayElement(Object.values(ExamBodyEnum)),
                    studentType: faker.helpers.arrayElement(Object.values(StudentTypeEnum)),
                    admissionNumber: newApp ? undefined : `ADM-${String(i).padStart(4, '0')}-${faker.string.alphanumeric(4).toUpperCase()}`,
                    yearOfStudy: newApp ? undefined : faker.number.int({ min: 1, max: 4 }),
                });
                await em.persistAndFlush(enrollment);
            }

            // Step 6: Create ApplicantDocuments if Tier >= 6
            if (tier >= 6) {
                const docs = em.create(ApplicantDocuments, {
                    applicant,
                    kcpeCertificate: `https://example.com/docs/kcpe_${faker.string.alphanumeric(8)}.pdf`,
                    kcseCertificate: `https://example.com/docs/kcse_${faker.string.alphanumeric(8)}.pdf`,
                    birthCertificate: `https://example.com/docs/birth_${faker.string.alphanumeric(8)}.pdf`,
                    nationalId: `https://example.com/docs/id_${faker.string.alphanumeric(8)}.pdf`,
                    passportPhoto: `https://example.com/docs/photo_${faker.string.alphanumeric(8)}.jpg`,
                    tertiaryCertificate: `https://example.com/docs/tertiary_${faker.string.alphanumeric(8)}.pdf`,
                });
                await em.persistAndFlush(docs);
            }
        }
    }
}

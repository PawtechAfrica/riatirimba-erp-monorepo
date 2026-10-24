import dayjs from "dayjs";
import clients from "../clients";
import { AppError } from "./AppErrorClasses";

export async function generateAdmissionNumber(courseId: number, intakeId: string, count: number) {
	/**
     CourseCode + IntakePeriod1stCharacter + last 2 digits of the year + / + 001
     * */
	// const courseLevels: Record<string, string | undefined> = {6: "D", 5: "C", 4: "A"};
	const course = await clients.academicServiceClient.courseById(courseId);
	const intake = await clients.admissionServiceClient.intakeById(intakeId);
	if (!intake) throw new AppError("Unable to find the intake!");
	if (!course) throw new AppError(`Unable to generate admission number! Please double check the course!`, 500);
	const courseCode = course.code;
	const intakePeriod1stChar = intake.period.charAt(0);
	const last2digitsOfYear = intake.year
		? dayjs(intake.opens || new Date())
				.set("year", intake.year)
				.format("YY")
		: dayjs().format("YY");
	return `${courseCode}${intakePeriod1stChar}${last2digitsOfYear}/${String(count + 1).padStart(3, "0")}`;
}

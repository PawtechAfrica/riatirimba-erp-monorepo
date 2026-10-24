import {tryCatch} from "../../utils/bootstrappers";
import {Applicants} from "../../database/entities/Applicants.entity";
import {db} from "../../database/utils/db-bootstrap.util";
import {academicService} from "../../external-services";

export const admissionFilter = tryCatch(
    async (req, res) => {
        let {term, intake, course, department, newApplicant, page, count} = req.query;

        const qb = db.em.createQueryBuilder(Applicants, "a")
            .select("*")
            .leftJoinAndSelect("a.enrollments", "e")
            .leftJoinAndSelect("a.nextOfKins", "nok")
            .leftJoinAndSelect("a.academicHistory", "ah")
            .leftJoinAndSelect("a.address", "addr")
            .leftJoinAndSelect("a.documents", "docs")
            .where({deleted: false});


        if(newApplicant) {
            qb.andWhere({'e.newApplicant': newApplicant === '1'})
        }

// 🔹 Department → map to courseIds
        if (department) {
            const depCourses = (await academicService.allDepartmentsAndCourses() ?? [])
                .filter(dep => Number(dep.id) === Number(department)) // cast to number
                .flatMap(dep => dep.courses.map(c => c.id));

            if (depCourses.length > 0) {
                qb.andWhere({"e.course": {$in: depCourses}});
            }
        }

// 🔹 Course filter
        if (course) {
            qb.andWhere({"e.course": Number(course)});
        }

// 🔹 Intake filter (string!)
        if (intake) {
            qb.andWhere({"e.intake": intake});
        }

// 🔹 Term filter (ILIKE for Postgres)
        if (term) {
            qb.andWhere({
                $or: [
                    {firstName: {$ilike: `%${term}%`}},
                    {middleName: {$ilike: `%${term}%`}},
                    {lastName: {$ilike: `%${term}%`}},
                    {email: {$ilike: `%${term}%`}},
                    {phone: {$ilike: `%${term}%`}},
                ],
            });
        }

// 🔹 Pagination
        const [items, total] = await qb
            .limit(Number(count))
            .offset((Number(page) - 1) * Number(count))
            .getResultAndCount();

        res.status(200).json({
            page,
            pageSize: count,
            lastPageIs: Math.ceil(total / Number(count)),
            data: items,
        });
    });

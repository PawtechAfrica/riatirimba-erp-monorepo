import {AppError, tryCatch} from "../../utils/bootstrappers";
import {AdmissionStats} from "../../database/entities/AdmissionStats.entity";
import {QueryOrder} from "@mikro-orm/core";
import {db} from "../../database/utils/db-bootstrap.util";

type Row = {
    year: number | string;
    intake?: number | string;
    intake_id?: number | string;
    id?: number | string;
    period_year_key: string;
    gender: string | null;
    applicant_count: number | string;
    admitted_count: number | string;
};

type IntakeStat = {
    periodYearKey: string;
    applicants: { M: number; F: number; unspecified: number };
    total: number;
    admitted: number;
    acceptanceRate: number; // percent (0-100, 2dp)
};

function reshape(rows: Row[], intakeId?: number) {
    const normalizeGender = (g: unknown): "M" | "F" | "unspecified" => {
        if (g == null) return "unspecified";
        const s = String(g).trim();
        if (/^m(ale)?$/i.test(s)) return "M";
        if (/^f(emale)?$/i.test(s)) return "F";
        return "unspecified";
    };

    // ---- Mode B: one intake only ----
    if (intakeId) {
        if (rows.length === 0) return null;

        const out: IntakeStat = {
            periodYearKey: rows[0].period_year_key,
            applicants: {M: 0, F: 0, unspecified: 0},
            total: 0,
            admitted: 0,
            acceptanceRate: 0,
        };

        for (const r of rows) {
            const g = normalizeGender(r.gender);
            const count = Number(r.applicant_count ?? 0);
            const admitted = Number(r.admitted_count ?? 0);

            out.applicants[g] += count;
            out.admitted += admitted;
        }

        out.total = out.applicants.M + out.applicants.F + out.applicants.unspecified;
        out.acceptanceRate = out.total > 0 ? +((out.admitted / out.total) * 100).toFixed(2) : 0;

        return out;
    }

    // ---- Mode A: all intakes grouped by year + month ----
    const result: Record<number, Record<string, IntakeStat>> = {};

    for (const r of rows) {
        const year = Number(r.year);
        const periodYearKey = r.period_year_key;
        const gender = normalizeGender(r.gender);

        if (!result[year]) result[year] = {};
        if (!result[year][periodYearKey]) {
            result[year][periodYearKey] = {
                periodYearKey: periodYearKey,
                applicants: {M: 0, F: 0, unspecified: 0},
                total: 0,
                admitted: 0,
                acceptanceRate: 0,
            };
        }

        const intake = result[year][periodYearKey];
        intake.applicants[gender] += Number(r.applicant_count ?? 0);
        intake.total += Number(r.applicant_count ?? 0);
        intake.admitted += Number(r.admitted_count ?? 0);
    }

    for (const year of Object.keys(result)) {
        for (const intake of Object.values(result[Number(year)])) {
            intake.acceptanceRate = intake.total > 0 ? +((intake.admitted / intake.total) * 100).toFixed(2) : 0;
        }
    }

    return result;
}

// export const liveStatsForOne = tryCatch(async (req, res) => {
//     const {intake_id} = req.params;
//     if (!intake_id) throw new AppError("Intake not found! Refresh and try again!");
//     const knex = db.em.getKnex();
//
//     const results = await knex
//         .select([
//             knex.raw(`i.period_year_key AS period_year_key`),
//             knex.raw(`COALESCE(a.gender, 'unspecified') AS gender`),
//             knex.raw(`COUNT(a.id)::int AS applicant_count`),
//             knex.raw(`SUM(CASE WHEN a.admitted = true THEN 1 ELSE 0 END)::int AS admitted_count`),
//         ])
//         .from("intake AS i")
//         .leftJoin("enrollment AS e", "e.intake_id", "i.id") // 🔄 maybe needs "e.intakeId"
//         .leftJoin("applicants AS a", "a.id", "e.applicant_id")
//         .where("i.id", Number(intake_id))
//         .groupByRaw(`i.period_year_key, COALESCE(a.gender, 'unspecified')`);
//
//
//     const shaped = reshape(results, parseInt(intake_id));
//     res.status(200).json(shaped);
// });


export const liveStatistics = tryCatch(async (_req, res) => {
    const knex = db.em.getKnex();

    const results = await knex
        .select([
            knex.raw(`EXTRACT(YEAR FROM i.opens)::int AS year`),
            knex.raw(`i.id AS intake_id`),
            knex.raw(`i.period_year_key AS period_year_key`),
            knex.raw(`COALESCE(a.gender, 'unspecified') AS gender`),
            knex.raw(`COUNT(a.id)::int AS applicant_count`),
            knex.raw(`SUM(CASE WHEN a.admitted = true THEN 1 ELSE 0 END)::int AS admitted_count`),
        ])
        .from("applicants AS a")
        .innerJoin("intake AS i", "a.intake_id", "i.id")
        .groupByRaw(`EXTRACT(YEAR FROM i.opens), i.id, i.period_year_key, COALESCE(a.gender, 'unspecified')`)
        .orderByRaw(`EXTRACT(YEAR FROM i.opens) DESC, i.opens ASC`);

    const shaped = reshape(results);
    res.status(200).json(shaped);
});

export const admissionStatistics = tryCatch(async (_req, res) => {
    // series of the last 10 intakes
    const admissionStats = await db.em.findAll(AdmissionStats, {
        populate: ["intake"],
        fields: [
            "id",
            "applicantsCount",
            "genderCount",
            "acceptanceByGender",
            "applicantGrades",
            "completeApplications",
            "courses",
            "ages",
            "migrationCount",
            "intake.id",
            "intake.opens",
            "intake.closes",
            "intake.status",
            "intake.periodYearKey",
        ],
        orderBy: [{intake: {opens: QueryOrder.ASC}}],
    });
    res.status(200).json(admissionStats);
});

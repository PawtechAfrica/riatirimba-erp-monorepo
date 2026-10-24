import {AppError, tryCatch} from "../../utils/bootstrappers";
import dayjs from "dayjs";
import {Intake, IntakeStatus} from "../../database/entities/Intake.entity";
import {db} from "../../database/utils/db-bootstrap.util";
import {IntakePeriodEnum} from "../../types";

export const batchCreate = tryCatch(async (req, res) => {
    const intakeList = req.body as { period: IntakePeriodEnum; year: number; opens?: string; closes?: string }[];

    const clean = intakeList
        .filter((anIntake) => anIntake.period && anIntake.year)
        .map((cl) => ({
            period:
                cl.period === "JAN"
                    ? IntakePeriodEnum.JANUARY_INTAKE
                    : cl.period === "MAY"
                      ? IntakePeriodEnum.MAY_INTAKE
                      : IntakePeriodEnum.SEPTEMBER_INTAKE,
            year: cl.year,
        }));

    const results = await Promise.allSettled(
        clean.map((intakeData) =>
            db.em.transactional(async (em) => {
                return await em.upsert(Intake, intakeData, {
                    onConflictFields: ["periodYearKey"],
                });
            }),
        ),
    );

    const successfulIntakes: Intake[] = [];
    const failedIntakes: { intake: any; error: any }[] = [];

    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            successfulIntakes.push(result.value);
        } else {
            console.error(`Failed to upsert intake ${clean[index].period}-${clean[index].year}:`, result.reason);
            failedIntakes.push({
                intake: clean[index],
                error: result.reason instanceof Error ? result.reason.message : "Unknown error",
            });
        }
    });

    const dataMap: Record<string, Intake> = {};
    for (const intake of successfulIntakes) {
        dataMap[intake.periodYearKey] = intake;
    }

    res.status(200).json({
        completed: successfulIntakes.length,
        skipped: failedIntakes.length,
        failed: failedIntakes,
        totalProcessed: clean.length,
        data: dataMap,
    });
});

export const createIntake = tryCatch(async (req, res) => {
    let { period, year, opens, closes } = req.body;
    if (!period) throw new AppError("Intake period is required!");

    // make sure opens and closes are valid dates if they are provided
    if ((opens && !dayjs(opens).isValid()) || (closes && !dayjs(closes).isValid()))
        throw new AppError("Invalid opening or closing dates!");

    // make sure the opening date is before the closing date if they are provided
    if (opens && closes && dayjs(closes).isBefore(opens, "day"))
        throw new AppError("Opening date must be before closing date!");
    if (!year || Number.isNaN(+year)) {
        year = dayjs().year();
    }
    // ensure no intake in the same period
    const exists = await db.em.findOne(Intake, { periodYearKey: `${year}-${period.toUpperCase()}` });
    if (exists) throw new AppError("You cannot intakesCreate more than one intake in the same period!");
    // intakesCreate intake
    const newIntake = new Intake({period, year, opens, closes});
    await db.em.persist(newIntake).flush();
    res.status(200).json({
        message: `${newIntake.readable} created successfully!`,
        data: newIntake,
    });
});

export const update = tryCatch(async (req, res) => {
    const { key } = req.params;
    const { period, opens, closes, status } = req.body;
    // ensure only valid integer IDs
    if (!key) throw new AppError("An intake id is required!");
    // validate status to be a valid IntakeStatus enum
    if (!Object.values(IntakeStatus).includes(status)) throw new AppError("Invalid intake status!");
    // confirm opens is in the request body and is today or later
    // update intake
    const intake = await db.em.findOne(Intake, {periodYearKey: key});
    if (!intake) throw new AppError("Intake not found!");
    if (period) intake.period = period;
    if (opens) intake.opens = opens;
    if (closes) intake.closes = closes;

    await db.em.persist(intake).flush();
    res.status(200).json({
        message: `${intake.readable} updated successfully!`,
        data: intake,
    });
});

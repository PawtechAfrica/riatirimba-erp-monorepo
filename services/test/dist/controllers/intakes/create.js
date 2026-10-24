"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const bootstrappers_1 = require("../../utils/bootstrappers");
const dayjs_1 = __importDefault(require("dayjs"));
const index_1 = require("../../index");
const Intake_entity_1 = require("../../database/entities/Intake.entity");
exports.create = (0, bootstrappers_1.tryCatch)(async (req, res) => {
    const { opens, closes } = req.body;
    if (!opens)
        throw new bootstrappers_1.AppError("An opening date is required!");
    // valid dates and closing date is after opening date
    const validDates = (0, dayjs_1.default)(opens).isValid() && (closes ? ((0, dayjs_1.default)(closes).isValid() && (0, dayjs_1.default)(closes).isAfter(opens)) : true);
    if (!validDates)
        throw new bootstrappers_1.AppError("Invalid dates!");
    const overdue = (0, dayjs_1.default)().isAfter(closes, 'day');
    if (overdue)
        throw new bootstrappers_1.AppError("You can't create an overdue Intake, please set a future date!");
    // ensure no intake in the same month
    const exists = await index_1.api.em.findOne(Intake_entity_1.Intake, { monthYearKey: (0, dayjs_1.default)(opens).format('YYYY-MM') });
    if (exists)
        throw new bootstrappers_1.AppError("You cannot create more than one intake in the same month!");
    // create intake
    const newIntake = new Intake_entity_1.Intake(opens, closes);
    await index_1.api.em.persistAndFlush(newIntake);
    res.status(200).json({
        message: `${newIntake.readable} created successfully!`,
        data: newIntake
    });
});
//# sourceMappingURL=create.js.map
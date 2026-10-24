"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readById = exports.readAll = void 0;
const bootstrappers_1 = require("../../utils/bootstrappers");
const index_1 = require("../../index");
const Intake_entity_1 = require("../../database/entities/Intake.entity");
exports.readAll = (0, bootstrappers_1.tryCatch)(async (_req, res) => {
    const intakes = await index_1.api.em.findAll(Intake_entity_1.Intake);
    res.status(200).json(intakes);
});
exports.readById = (0, bootstrappers_1.tryCatch)(async (req, res) => {
    const id = req.params['id'];
    if (!id)
        throw new bootstrappers_1.AppError("No ID provided!");
    const found = await index_1.api.em.findOne(Intake_entity_1.Intake, { id: parseInt(id) });
    res.status(200).json(found ? found : {});
});
//# sourceMappingURL=read.js.map
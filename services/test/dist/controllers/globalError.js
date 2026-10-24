"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalError;
const bootstrappers_1 = require("../utils/bootstrappers");
function globalError(error, _req, res, _next) {
    console.log(error);
    try {
        if (error instanceof bootstrappers_1.AppError)
            return res.status(error.status).json({ error: error.message }).end();
        return res.status(500).json({ error: "Sorry, something went wrong! Please try again later!" }).end();
    }
    catch (error) {
        return res.status(500).json({ error: "Sorry, something went completely wrong! Please try again later!" }).end();
    }
}
//# sourceMappingURL=globalError.js.map
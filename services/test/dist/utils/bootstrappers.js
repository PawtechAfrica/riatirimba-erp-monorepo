"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.tryCatch = void 0;
const tryCatch = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
exports.tryCatch = tryCatch;
class AppError extends Error {
    constructor(message, status = 400) {
        super();
        this.status = status;
        this.message = message;
        this.status = status;
        this.log();
    }
    log() {
        console.error(`Error occurred while executing request:
\t message: ${this.message}\n\t`, this);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=bootstrappers.js.map
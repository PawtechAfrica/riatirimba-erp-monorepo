"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admission_routes_1 = __importDefault(require("./admission.routes"));
const express_1 = __importDefault(require("express"));
const intakes_routes_1 = __importDefault(require("./intakes.routes"));
const v1Routes = express_1.default.Router();
v1Routes
    .use("/admission", admission_routes_1.default)
    .use("/intakes", intakes_routes_1.default);
exports.default = v1Routes;
//# sourceMappingURL=v1.js.map
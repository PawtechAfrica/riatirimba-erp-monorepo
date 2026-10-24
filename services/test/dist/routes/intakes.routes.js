"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const intakes_1 = __importDefault(require("../controllers/intakes"));
const intakesRoutes = express_1.default.Router();
intakesRoutes
    .post("/intake", intakes_1.default.create)
    .get("/intakes", intakes_1.default.readAll);
exports.default = intakesRoutes;
//# sourceMappingURL=intakes.routes.js.map
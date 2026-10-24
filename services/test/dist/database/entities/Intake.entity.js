"use strict";
// src/entities/Intake.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intake = exports.IntakeStatus = void 0;
const core_1 = require("@mikro-orm/core");
const dayjs_1 = __importDefault(require("dayjs"));
var IntakeStatus;
(function (IntakeStatus) {
    IntakeStatus["UPCOMING"] = "upcoming";
    IntakeStatus["OPEN"] = "open";
    IntakeStatus["CLOSED"] = "closed";
    IntakeStatus["OVERDUE"] = "overdue";
})(IntakeStatus || (exports.IntakeStatus = IntakeStatus = {}));
let Intake = class Intake {
    generateMonthYearKey() {
        this.monthYearKey = (0, dayjs_1.default)(this.opens).format('YYYY-MM');
    }
    setStatus() {
        const now = (0, dayjs_1.default)().startOf('day');
        const opensDate = (0, dayjs_1.default)(this.opens).startOf('day');
        const closesDate = (0, dayjs_1.default)(this.closes).startOf('day');
        const oneMonthLater = closesDate.add(1, 'month');
        if (now.isBefore(opensDate)) {
            this.status = IntakeStatus.UPCOMING;
        }
        else if (now.isSame(closesDate) || now.isBefore(closesDate))
            this.status = IntakeStatus.OPEN;
        else if (now.isSame(oneMonthLater) || now.isAfter(oneMonthLater))
            this.status = IntakeStatus.OVERDUE;
        else
            this.status = IntakeStatus.CLOSED;
    }
    get readable() {
        return `${(0, dayjs_1.default)(this.opens).format("MMMM YYYY")} intake`;
    }
    constructor(opens, closes) {
        this.monthYearKey = (0, dayjs_1.default)(this.opens).format('YYYY-MM');
        this.status = IntakeStatus.OPEN;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.opens = new Date(opens);
        if (closes)
            this.closes = new Date(closes);
    }
};
exports.Intake = Intake;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Intake.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], Intake.prototype, "opens", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Intake.prototype, "closes", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Object)
], Intake.prototype, "monthYearKey", void 0);
__decorate([
    (0, core_1.BeforeCreate)(),
    (0, core_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Intake.prototype, "generateMonthYearKey", null);
__decorate([
    (0, core_1.OnLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Intake.prototype, "setStatus", null);
__decorate([
    (0, core_1.Enum)({ items: () => IntakeStatus, default: IntakeStatus.OPEN, type: 'string' }),
    __metadata("design:type", String)
], Intake.prototype, "status", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], Intake.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], Intake.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)({ persist: false }),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Intake.prototype, "readable", null);
exports.Intake = Intake = __decorate([
    (0, core_1.Entity)(),
    (0, core_1.Unique)({ properties: ['monthYearKey'] }),
    __metadata("design:paramtypes", [Object, Object])
], Intake);
//# sourceMappingURL=Intake.entity.js.map
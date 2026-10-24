"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Applicant = void 0;
const core_1 = require("@mikro-orm/core");
const uuid_1 = require("uuid");
const Intake_entity_1 = require("./Intake.entity");
const NextOfKin_entity_1 = require("./NextOfKin.entity");
let Applicant = class Applicant {
    constructor(firstName, lastName, email, phone, kcseIndexNumber) {
        this.id = (0, uuid_1.v4)();
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.admitted = false;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.kcseIndexNumber = kcseIndexNumber;
    }
};
exports.Applicant = Applicant;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], Applicant.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ hidden: true }),
    __metadata("design:type", Date)
], Applicant.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ onUpdate: () => new Date(), hidden: true }),
    __metadata("design:type", Date)
], Applicant.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "firstName", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Applicant.prototype, "middleName", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "lastName", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], Applicant.prototype, "email", void 0);
__decorate([
    (0, core_1.Property)({ unique: true }),
    __metadata("design:type", String)
], Applicant.prototype, "phone", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "idType", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "idNumber", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "gender", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Applicant.prototype, "birthDay", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Object)
], Applicant.prototype, "county", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Object)
], Applicant.prototype, "subCounty", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Object)
], Applicant.prototype, "constituency", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Object)
], Applicant.prototype, "ward", void 0);
__decorate([
    (0, core_1.OneToOne)({ entity: () => NextOfKin_entity_1.NextOfKin, nullable: true }),
    __metadata("design:type", NextOfKin_entity_1.NextOfKin)
], Applicant.prototype, "nextOfKin", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "primarySchool", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "secondarySchool", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "kcseIndexNumber", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Applicant.prototype, "kcseGrade", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true }),
    __metadata("design:type", Object)
], Applicant.prototype, "course", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Intake_entity_1.Intake),
    __metadata("design:type", Intake_entity_1.Intake)
], Applicant.prototype, "intake", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json' }),
    __metadata("design:type", Object)
], Applicant.prototype, "documents", void 0);
__decorate([
    (0, core_1.Property)({ default: false, hidden: true }),
    __metadata("design:type", Boolean)
], Applicant.prototype, "admitted", void 0);
exports.Applicant = Applicant = __decorate([
    (0, core_1.Entity)(),
    __metadata("design:paramtypes", [String, String, String, String, String])
], Applicant);
//# sourceMappingURL=Applicant.entity.js.map
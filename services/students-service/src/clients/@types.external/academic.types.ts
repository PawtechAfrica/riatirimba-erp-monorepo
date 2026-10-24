export interface IntakeObj {
    id: number;
    period: IntakePeriodEnum
    year: number;
    opens?: Date;
    closes?: Date;
    status?: IntakeStatus;
}

export enum IntakeStatus {
    UPCOMING = "upcoming",
    OPEN = 'open',
    CLOSED = 'closed',
    OVERDUE = 'overdue',
}

export enum IntakePeriodEnum {
    JANUARY_INTAKE = "JAN",
    MAY_INTAKE = "MAY",
    SEPTEMBER_INTAKE = "SEP"
}
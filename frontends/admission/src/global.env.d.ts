declare type DepartmentObj = {
    id: number;
    name: string;
    courses: CourseObj[];
};

declare type CourseObj = {
    id: number;
    name: string;
    code: string;
    duration: number;
};


declare type IntakeStatusObj = 'closed' | 'open' | 'upcoming' | 'overdue'

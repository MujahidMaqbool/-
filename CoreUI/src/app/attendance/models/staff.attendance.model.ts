export class StaffAttendanceModel {
    Staff: Staff;
    StaffShift?: StaffShift;
    StaffAttendance?: StaffAttendance;
    IsStaffClockIn?: boolean;
    IsShiftTimeNotStarted? : boolean;
}

export class Staff {
    ImagePath: string;
    Title: string;
    StaffID: number;
    FirstName: string;
    LastName: string;
    FullName?: string;
    Email: string;
}

export class StaffShift {
    StaffShiftID: number;
    StaffID: number;
    StartDate: Date;
    StartTime: string;
    EndTime: string;
}

export class StaffAttendance {
    StaffAttendanceID: number;
    StaffShiftID: number;
    StaffID: number;
    ClockIn: string;
    ClockOut: string;
    ClockInNotes: string;
    ClockOutNotes: string;
}

export class StaffClockIn {
    StaffShiftID: number;
    ClockInNotes: string;
}

export class StaffClockOut {
    StaffAttendanceID: number;
    StaffShiftID: number;
    ClockOutNotes: string;
    ClockIn:string;
    ClockDate:Date;
}
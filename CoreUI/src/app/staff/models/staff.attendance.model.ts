export class StaffAttendanceModel {
    Staff: Staff;
    StaffShift?: StaffShift;
    StaffAttendance?: StaffAttendance;
    IsStaffClockIn?: boolean;
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
    ClockIn: any;
    ClockOut: any;
    ClockDate: string;
    ClockInNotes: string;
    ClockOutNotes: string;
}

export class StaffClockIn {
    StaffID: number;
    StaffShiftID: number;
    ClockInNotes: string;
}

export class StaffClockOut {
    StaffAttendanceID: number;
    StaffID: number;
    StaffShiftID: number;
    ClockOutNotes: string;
}

export class CheckShiftsParameter {
    public clockDate: string = "";
    public staffID: number = 0;
}
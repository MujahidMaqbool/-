export class TimesheetSearchParam {

    StaffPositionID: number = 0;
    AllStaff: any;
    AllSchedulerActivityType: any;
    DateFrom: any = new Date();
    DateTo: any = new Date();
    PageNumber:number = 1;
    pageSize:number = 10;
}

export class TimesheetSearchParameter {
    staffID: any;
    AllSchedulerActivityType: any;
    startDate: any;
    endDate: any;
    PageNumber:number = 1;
    pageSize:number = 10;
}
export class StaffGeoLocation{
    CheckInAttendanceSourceTypeID:number;
    CheckInAttendanceSourceTypeName: string;
    CheckOutAttendanceSourceTypeID:number;
    CheckOutAttendanceSourceTypeName: string;
    ClockDate: string;
    ClockIn: string;
    ClockInAddress: string;
    ClockInLat: any;
    ClockInLong: any;
    ClockInNotes: string;
    ClockOut: any;
    ClockOutAddress: any;
    ClockOutLat: any;
    ClockOutLong: any;
    ClockOutNotes: string;
    Difference: any;
    FirstName: string;
    IsNegative: boolean;
    LastName: string;
    Scheduled: any;
    ShiftEndTime: any;
    ShiftStartDate: any;
    ShiftStartTime: any;
    StaffID: number;
    StaffPositionID: number;
    StaffPositionName: string;
    Title: string;
    Worked: string;
}
export class LatitudeLongitude{
    Latitude : number;
    Longitude : number;
}
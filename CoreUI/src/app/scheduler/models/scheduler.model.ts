export class SchedulerDataSource {

    ActivityType: string;
    ActivityTypeID: number;
    /** Default properties */
    id: number;
    text: string;
    description: string;
    startDate: any;
    CreatedOn: any;
    startDateTimeZone: string;
    endDate: any;
    endDateTimeZone: string;
    Duration: any;
    allDay: boolean;
    recurrenceRule: string;
    recurrenceException: string;
    SchedulerActivityTypeColor: string;
    CreatedByName: string;

    /** For Services Only */
    SaleTypeID: number;
    SaleTypeName: string;
    SaleStatusTypeID: number;
    SaleSourceTypeID: number;
    SaleStatusTypeName: string;
    BookingStatusTypeID: number;
    BookingStatusTypeName: string;
    ServiceID: number;
    Price: number;
    EnrolledAttendee: number;
    IsServiceReschedule: boolean;

    /** For Services partial payament Only*/
    IsSale: boolean;
  
    /** Memberhsip Benefit */
    DiscountedPrice: number;
    IsMembershipBenefit:string;
    /** For Class*/
    ClassCode: string;
    IsActive: boolean = false;

    CustomerID: number;
    CustomerName: string;
    CustomerTypeID: number;
    CustomerTypeName: string;
    CustomerEmail: string;
    CustomerMobile: string;
    FacilityID: number;
    FacilityName: string;
    ServiceCategoryID: number;
    ServiceCategoryName: string;
    CleaningTimeInMinute: number;
    ServicePackageID: number;
    StaffID: number;
    StaffFullName: string;
    StaffPositionID: number;
    StaffPositionName: string;
    MarkAsDone: boolean;
    PriorityTypeName: string;
    IsDragable: boolean;

}

export class ShiftAndAttendanceDataSource {

    id: number;
    text: string;
    startDate: string;
    endDate: string;
    description: string;
    StaffShiftID: number;
    StaffID: number;
    AttendanceStatus: number;
    IsStaffAttendance: boolean;
    IsShiftAttended: boolean;
}

export class StaffShiftDataSource {
    id: number;
    text: string;
    startDate: Date;
    endDate: Date;
    displayStartDate: Date;
    displayEndDate: Date;
    recurrenceRule: string;
    recurrenceException: string;
    description: string;
    StaffID: number;
    UnpaidBreak: number;
}

export class CellSelectedData {

    id: number = 0;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    ActivityType: string;
    ActivityTypeID: number;
    StaffID: number = 0;
    StaffPositionID: number = 0;
    StaffFullName: string;
    StaffEmail: string;
    StaffPhone: string;
    StaffShiftID: number;
    ShiftStartTime: Date;
    ShiftEndTime: Date;
    ShiftDescription: string;
    isRecurrenceException?: boolean;
    // In case of Call, Appointment, Task only
    CustomerTypeID: number;
    CustomerTypeName: string;
    CustomerID: number;
    CustomerName: string;
    CustomerEmail: string;
    CustomerMobile: string;
    /** In Case of Drag n Drop Edit This Only Recurrence Exception */
    DragStartDate: Date;
    IsDragDrop: boolean;
    //added by fahad implemetation grouping
    FacilityID: number;
    isRescheduleService: boolean = false;
    ServiceID:number;
}

export class SchedulerSearchParam {

    FacilityID: number = 0;
    AllStaffPosition: any;
    AllStaff: any;
    AllFacility: any;
    AllSchedulerActivityType: any;
}

export class RRuleData {
    repeat: string
}

/** Activities For Scheduler */

export class ActivityViewModel {

    public CustomerActivityID: number;  // PK
    public CustomerID: number;  // like: LeadID, MemberID, ClientID
    public CustomerTypeID: number; // like: Lead, Member, Client
    public Title: string;
    public Description: string;
    public AssignedToStaffID: number;
    public FollowUpDate: Date;
    public FollowUpStartTime: any;
    public FollowUpEndTime: any;
    public ContactReasonTypeID: number;   // for member case
}

export class ActivityLaterViewModel {

    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public AssignedToStaffID: number;
    public FollowupDate: Date;
    public FollowUpStartTime: any;
    public FollowUpEndTime: any;
    public ContactReasonTypeID: number;
    public CustomerID: number;
}


/** For Call & Appointment Later */
export class UpdateLaterActivity {

    public CustomerActivityID: number = 0;
    public ActivityTypeID: number = 0;
    public CustomerID: number = 0;
    public AssignedToStaffID: number;
    public FollowupDate: Date;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
}

export class LeadCallLaterActivity {

    public CustomerActivityID: number = 0;
    public Title: string = "";
    public Description: string = null;
    public AssignedToStaffID: number = 0;
    public FollowupDate: Date;
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public CustomerID: number = 0;
}

export class MemberCallLaterActivity {

    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowupDate: Date;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
}

export class ClientAppointmentLaterActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowupDate: Date;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
}

export class LeadAppointmentLaterActivity {

    public CustomerActivityID: number = 0;
    public AppointmentTypeID: number;
    public Title: string = "";
    public Description: string = "";
    public AssignedToStaffID: number = 0;
    public FollowupDate: Date;
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public CustomerID: number = 0;
}

export class MemberAppointmentLaterActivity {

    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowupDate: Date;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
}

export class StaffTaskActivity {

    public StaffActivityID: number = 0;
    public PriorityTypeID: number = 0;
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: Date = new Date();
    public FollowUpStartTime: any;
    public FollowUpEndTime: any;
    public AssignedToStaffID: number;
    public MarkedAsDone: boolean = false;
}

export class SmallSchedulerDates {
    Date: Date;
    StartTime: Date;
    EndTime: Date;
}
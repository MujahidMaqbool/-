export class ClassAppointmentDetail {
    ClassID: number;
    ClassName: string;
    StartDate: Date;
    StartTime: string;
    EndDate: Date;
    EndTime: string;
    RecurrenceRule: string;
    RecurrenceException: string;
    Notes: string = "";
    PricePerSession: number = undefined;
    AssignedToStaffID: number;
    AssignedToStaffName: string;
    FacilityID: number = 0;
    AttendeeMin: number = undefined;
    AttendeeMax: number = undefined;
    ShowOnline: boolean = false;
    IsHidePriceOnline: boolean = false;
    IsActive: boolean = true;
    IsFeatured: boolean = false;
    IsUpdate: boolean;
    ParentClassID: number;
    StaffPay: number = undefined;
    CostPrice: number = undefined;
    StreamingLink: string = "";
    ClassCategoryID: number;
    ItemTax: ClassTax[] = [];
    IsDragAndDrop: boolean = false;
    EnableWaitList: boolean = false;
    WaitListMaxCount: number = undefined;  
    IsClassWaitList: boolean;   
}

export class UpdateClass{
    ClassID: number
    ClassCode: string
    AssignedToStaffID: number
    StartDate: Date
    StartTime: string   
    EndTime: string
    RecurrenceRule: string
    RecurrenceException: string
    IsUpdate: boolean
    IsDragAndDrop: boolean
}

export class classAppointmentsDataSource {
    id: number
    text: string
    startDate: Date
    endDate: Date
    allDay: boolean
    recurrenceRule: string
    description: string
    StaffID: number
    StaffFullName: string
    StaffPositionID: number
    StaffPositionName: string
    ClassFacilityID: number
    ClassFacilityName: string
    AttendeeMin: number
    AttendeeMax: number
    EnrolledAttendee: number
    PricePerSession: number
    BookBefore: number
    BookBeforeDurationTypeName: number
    CancelBefore: number
    CancelBeforeDurationTypeName: number
    ClassColor: string
    ImagePath: string
}

export class classFundamentals {

    classFacilityList: ClassFacilityList
    durationTypeList: DurationTypeList
    staffList: StaffList;
}

export class ClassFacilityList {

    ClassFacilityID: number
    ClassFacilityName: string
    IsActive: boolean;
}

export class classSearchFundamentals {

    StaffID: number
    StaffFullName: string;
}

export class DurationTypeList {

    DurationTypeID: number
    DurationTypeName: string
    IsActive: boolean;
}

export class StaffList {

    StaffID: number
    StaffFullName: string;
}

export class ClassTax
{
    public TaxID: number = 0;
}

export class ResourcesDataSource {
    id: number
    text: string
    email: string
    mobile: string
    avatar: string
    color: string
    selected: boolean
    staffPositionID: number
    staffPositionName: string
}

export class ClassCategories {
    ClassCategoryID: number;
    ClassCategoryName: string;
    ParentClassList: ParentClasses[] = [];
}

export class ParentClasses {
    ParentClassID: number;
    ParentClassName: string;
    ClassDurationInMinutes: string;
    IsActive:boolean;

}

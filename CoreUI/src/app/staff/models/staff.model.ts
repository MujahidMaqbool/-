
export class StaffSearchParameter {
    public StaffName: string = "";
    public CardNumber: string = "";
    public StaffPositionID: number = 0;
    public BranchID: number = 0;
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    public IsActive: number = 1;
}

export class StaffSearchParameters {
    public StaffName: string = "";
    public CardNumber: string = "";
    public StaffPositionID: number = 0;
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    public IsActive: boolean = true ;
}


export class Staff {
    public StaffID: number = 0;
    public StaffPositionID: number;
    public Title: String = "";
    public FirstName: string = "";
    public LastName: string = "";
    public CardNumber: string = "";
    public CardAccessID : string = "";
    public Email: string = "";
    public Phone: string ;
    public Mobile: string;
    public Gender: String = "";
    public BirthDate: any;
    public CountryID: number;
    public StateCountyName: string;
    public CityName: string;
    public PostCode: string = "";
    public Address1: string = "";
    public Address2: string = "";
    public ImageFile?: any = "";
    public ImagePath: string = "";
    public AllowLogin: boolean = true;
    public IsSuperAdmin: boolean = false;
    public OnlineDisplayName: string;
    public Permission: Permission = new Permission();
    public Notes: string = "";
}

export class Branch {
    public BranchID: number;
    public BranchName: string;
    public RoleID: number = 0;
    public IsSelected: boolean = false;
    public IsRoleSelected: boolean = true;
    public IsEnableRolesAndDefault: boolean = false;
    public IsShowActions: boolean = false;
    public RoleList: any[];
}

export class StaffDocument {
    public StaffDocumentName: string = "";
    public StaffDocumentID: number = 0;
    public StaffID: number = 0;
    public DocumentPath: string = "";
    public Description: string = "";
    public CreatedOn: string = "";
}

export class StaffInfo {
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Mobile: string;
    public Address: string;
    public IsActive: boolean = true;
    public ImagePath: string;
}

export class StaffBranchList {
    BranchName: string;
    IsActive: boolean;
    IsDefault: boolean;
    RoleName: string;
}

export class StaffView {
    public StaffPositionName: string;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public CardNumber: string;
    public Email: string;
    public Gender: string;
    public BirthDate: Date;
    public Phone: string;
    public Mobile: string;
    public Address1: string;
    public Address2: string;
    public CountryName: string;
    public StateCountyName: string;
    public CityName: string;
    public PostCode: string;
    public ImagePath: string;
    public Notes: string;
    public StaffBranchRoleName: string;
    public AllowLogin: boolean = true
    public Permission: Permission = new Permission();
    public StaffBranchList: StaffBranchList[];
}

export class StaffShift {

    StaffShiftID: number = 0;
    StaffID: number = 0;
    StaffPositionID: number = null;
    UnpaidBreak: number = 0;
    Description: string = "";
    StartDate: any = new Date();
    StartTime: any = "";
    EndTime: any = "";
    RecurrenceRule: string;
    RecurrenceException: string;
    IsUpdate: boolean = false;
    SaveAsShiftTemplate: boolean = false;
}

export class UpdateStaffShift {

    StaffShiftID: number = 0;
    StaffID: number = 0;
    StartDate: Date = new Date();
    StartTime: string = "";
    EndTime: string = "";
    RecurrenceRule: string;
    RecurrenceException: string;
}

// Staff Dashbord 
export class StaffDashboardParam {
    public DateFrom: string = "";
    public DateTo: string = "";
}

export class StaffPendingTask {
    public FollowUpDate: string = "";
    public FollowUpEndTime: string = "";
    public FollowUpStartTime: string = "";
    public StaffFullName: string = "";
    public StaffImagePath: string = "";
    public TaskTitle: string = "";


}
export class StaffAttendance {
    public Name: string = "";
    public TotalCount: string = "";

}

export class StaffSchedulerHours {
    public AttendanceActualHours: string = "";
    public AttendanceWeeklyHours: string = "";
    public ElapsedAttendanceHoursLastWeek: string = "";
    public ElapsedShiftHoursLastWeek: string = "";
    public ScheduledShiftHours: string = "";
    public WeeklyShiftHours: string = "";
    public ScheduleHourWeekPercent ="";
    public ActualHourWeekPercent ="";
    public ShiftForeCastEnd ="";
    public ShiftForeCastStart = "";
    public ScheduledShiftHoursLastWeekPositive: boolean = true;
    public ActualHoursLastWeekPositive: boolean = true;

}

export class StaffProfile {
    StaffID: number;
    Title: string;
    FirstName: string;
    LastName: string;
    Gender: string;
    BirthDate: Date;
    Phone: string;
    Mobile: string;
    Address1: string;
    Address2: string;
    CountryID: number;
    StateCountyName: string;
    CityName: number;
    PostCode: string;
    ImageFile: string;
    ImagePath: string;
}

export class SaveStaffForOtherBranch {
    public StaffID: number;
    public Permission: Permission = new Permission();
}

export class Permission {
    public RoleID: number;
    public ShowOnScheduler: boolean = false;
    public CanDoClass: boolean = false;
    public CanDoService: boolean = false;
    public CanDoServiceOnline: boolean = false;
    public OnlineDisplayName: string;
    public FirstAidAllowed: boolean = false;
    public AllowTip: boolean = false;
    public DoorAccessAllowed : boolean = true;
}

export class Service {
    public ServiceID: number;
    public ServiceName: string;
    public IsSelected: boolean;
}

export class ServiceCategoryWithServiceList {
    public ServiceCategoryID: number;
    public ServiceCategoryName: string;
    //public IsSelected: boolean;
    public ServiceList: Service[] = [];
}
export class StaffService {
    public StaffID: number;
    public ServiceList: ServiceForSave[];
}

export class ServiceForSave {
    public ServiceID: number;
}

export class EditEmail {
    public OldEmail: string;
    public NewEmail: string;
}
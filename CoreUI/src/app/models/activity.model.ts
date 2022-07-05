export class AppointmentActivity {
    /* Shared */
    public CustomerID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string = null;
    public IsNow: boolean = true;
    public ContactReasonTypeID: number;
    public FollowUpDate: Date = new Date();
    /* Later Case */
    public AssignedToStaffID: number;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public Date: string;
    /*
        Duration contains no. of minutes,
        these minutes will be added to Start Time
        for the calculation of End Time
    */
    public Duration: number;
    /* Now Case */
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public TrialEndDate: Date;
    public LostReasonTypeID: number;
    public MembershipID?: number;
    public ActivitySubTypeID: number;
}

export class AppointmentLaterActivity {
    public CustomerID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowUpDate: any;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
}

export class AppointmentNowActivity {
    public CustomerID: number;
    public CustomerActivityID: number;
    public Title: string;
    public FollowUpDate: any;
    public ContactReasonTypeID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public ActivitySubTypeID : number;
    public Description: string;
    public TrialEndDate: any;
    public LostReasonTypeID: number;
    public MembershipID?: number;
}

export class AppointmentMarkAsDoneActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public MembershipID?: number;
    public LostReasonTypeID?: number;
    public Title: string;
    public Description:string;
    public ContactReasonTypeID: number;
    public CompletionDate: string;
}

export class CallActivity {
    /* Shared */
    public CustomerActivityID: number;
    public Title: string;
    public Description: string = null;
    public IsNow: boolean = true;
    public ContactReasonTypeID: number;
    /* Later Case */
    public AssignedToStaffID: number;
    public FollowUpDate: Date = new Date();
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public Date: string;
    /*
        Duration contains no. of minutes,
        these minutes will be added to Start Time
        for the calculation of End Time
    */
    public Duration: number;
    /* Now Case */
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public LostReasonTypeID: number;
    public MembershipID?: number;
    public ActivitySubTypeID: number;
    public CustomerID : number;
}

export class CallLaterActivity {
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public AssignedToStaffID: number;
    public FollowUpDate: any;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public MembershipID?: number;
    public ContactReasonTypeID: number;
}

export class CallNowActivity {
    public CustomerID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public ActivitySubTypeID : number;
    public LostReasonTypeID: number;
    public MembershipID?: number;
    public ContactReasonTypeID: number;
    public FollowUpDate: string;
}

export class CallMarkAsDoneActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public MembershipID?: number;
    public LostReasonTypeID?: number;
    public Title: string;
    public Description:string;
    public ContactReasonTypeID: number;
    public CompletionDate: string;
}

export class EmailActivity {
    public CustomerID: number;
    public CustomerActivityID: number;
    public TemplateTextID?: number = null;
    public EmailSubject: string;
    public EmailBody: string;
    public AssignedToStaffID: number;
    public ContactReasonTypeID: number;
    public CustomerTypeID?: number;
}

export class SMSActivity {
    public CustomerID: number;
    public CustomerActivityID: number;
    public TemplateTextID?: number = null;
    public Title: string;
    public Description: string;
    public ContactReasonTypeID: number;
    public CustomerTypeID?: number;
}

export class GroupActivity {
    public ClassID: number;
    public ClassDate: string;
    public TemplateTextID?: number = null;
    public Title: string;
    public Description: string;
    public ContactReasonTypeID: number;
}

export class AppNotification {
    public TemplateTextID?: any;
    public ContactReasonTypeID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public CustomerID: number;
}

export class NoteActivity {
    public Title: string = "";
    public Description: string = "";
}

export class TaskActivity {
    public PriorityTypeID: number = undefined;
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: any = new Date();
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public AssignedToStaffID: number;
}

export class TaskActivityView {
    public PriorityTypeName: string = "";
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: string;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public MarkedAsDone: boolean;
    public AssignedToStaffName: string;
    public AssignedToStaffID: number;
    public isMyTask: boolean;
}

export class EmailView {
    public To: string;          // Person Name
    public ToEmail: string;     // To Email
    public From: string;        // Person Name
    public FromEmail: string;   // From Email
    public Subject: string;
    public Body: string;
    public Date: Date;
}


/* Collections */

export class ActivityList {
    constructor() { };
    public CustomerActivityID: number;
    public ActivityTypeID: number = 0;
    public ActivityTypeName: string = "";
    public ActivityOutComeName: string = "";
    public ActivityWhatNextName: string = "";
    public Title: string = "";
    public Description: string = "";
    public EmailSubject: string = "";
    public EmailBody: string = "";
    public MarkedAsDone?: boolean;
    public FollowUpDate?: Date;
    public CreatedOn: Date;
    public ModifiedOn: Date;
    public FollowUpStartTime?: any;
    public FollowUpEndTime?: any;
    public TrialEndDate?: any;
    public IsNow: boolean;
    public AssignedToStaffName: string;

    public StartTime: string;
    public ModifiedTime: string;

    /* For Icons rendering only */
    public ShowEditIcon: boolean = false;
    public ShowViewIcon: boolean = false;
    public ShowMarkAsDoneIcon: boolean = false;
    public ShowDeleteIcon: boolean = false;
}

export class ActivityType {
    public ActivityTypeID: number;
    public ActivityTypeName: string;
    public IsActive: boolean;
}

export class PriorityType {
    public PriorityTypeID: number = 0;
    public PriorityTypeName: string;
    public IsActive: boolean;
}

export class Template {
    public TemplateTextID: number;
    public TemplateTextTitle: string;
}

export class StatusType {
    public StatusTypeID: number;
    public StatusTypeName: string;
    public IsActive: boolean;
}

export class ActivityOutcome {
    public ActivityOutcomeID: number;
    public ActivityOutComeName: string;
}

export class ContactReasonType {
    public ContactReasonTypeID: number;
    public ContactReasonTypeName: string;
}

export class LostReasonType {
    public LostReasonTypeID: number;
    public LostReasonTypeName: string;
}

export class WhatNext {
    public ActivityWhatNextID: number;
    public ActivityWhatNextName: string;
}

export class Staff {
    public StaffID: number;
    public StaffFullName: string;
}

export class ActivityCount {
    public AppointmentCount: number = 0;
    public CallCount: number = 0;
    public EmailCount: number = 0;
    public NoteCount: number = 0;
    public SMSCount: number = 0;
    public TaskCount: number = 0
}

export class ActivityPersonInfo {
    public FirstName: string;
    public LastName: string;
    public Name: string;
    public Email: string;
    public Mobile: string;
    public Address: string;
    public EmailAllowed: boolean;
    public SMSAllowed: boolean;
    public AppNotificationAllowed: boolean;
    public PhoneCallAllowed: boolean;
    public MemberMessageAllowed: boolean;
    public IsWalkedIn: boolean;
    public CustomerTypeName:string;
    public CustomerTypeID?:number;
    public CustomerID?:number;
    public RewardProgramAllowed:boolean;
    public RewardProgramEnrolledBranchID: number;
    public AllowPartPaymentOnCore: boolean;
}

export class AllStaffTask {
    StaffActivityID: number;
    PriorityTypeName: string;
    Title: string;
    Description: string;
    FollowUpDate: Date;
    FollowUpStartTime: string;
    FollowUpEndTime: string;
    AssignedToStaffName: string;
    MarkedAsDone: boolean;
    AssignedToStaffID: number;
    CreatedBy: number;
}

export class StaffTaskSearchParameter {
    public StaffID?: number = 0;
    public DateFrom?: string = "";
    public DateTo?: string = "";
    public PriorityTypeID?: number = 0;
    public MarkedAsDone?: number = 0;
    public PageNumber: number;
    public PageSize: number;

    public StaffName: string = "";
    public FollowUpDate?: string = "";

}

export class AppointmentActivity {
    /* Shared */
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public IsNow: boolean = true;
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
    public ActivityWhatNextID: number;
    public ActivitySubTypeID: number;
}

export class AppointmentLaterActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowUpDate: any;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public ActivitySubTypeID: number;
}

export class AppointmentNowActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public ActivityWhatNextID: number;
    public FollowUpDate: string;
    public ActivitySubTypeID: number;
}

export class AppointmentMarkAsDoneActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number;
    public Title: string;
    public Description: string;
    public ContactReasonTypeID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public CompletionDate: string;
}

export class CallActivity {
    /* Shared */
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public IsNow: boolean = true;
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
    public ActivitySubTypeID: number;
}

export class CallLaterActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public AssignedToStaffID: number;
    public FollowUpDate: any;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public ActivitySubTypeID: number;
}

export class CallNowActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public FollowUpDate: string;
    public ActivitySubTypeID: number;
}

export class CallMarkAsDoneActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number;
    public Title: string;
    public Description: string;
    public ContactReasonTypeID: number;
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;    
    public CompletionDate: string;
}

export class EmailActivity {
    public CustomerActivityID: number = 0;
    public TemplateTextID: number;
    public EmailSubject: string;
    public EmailBody: string;
    public CustomerID: number;
    public ActivitySubTypeID: number;
    public ContactReasonTypeID: number;
}

export class SMSActivity {
    public CustomerActivityID: number = 0;
    public TemplateTextID: number;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ActivitySubTypeID: number;
    public ClassID: number;
    public ContactReasonTypeID: number;
}

export class NoteActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
}

export class MemberMessage {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number;
}

export class AchievementActivity {
    public CustomerActivityID: number = 0;
    public Title: string;
    public Description: string;
    public CustomerID: number = 0;
}

export class MemberAppNotification {
    public TemplateTextID?: any;
    public ContactReasonTypeID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public CustomerID: number;
}

export class MemberActivity {
    public CustomerActivityID: number;
    public ActivityTypeID: number;
    public ActivitySubTypeID: number;
    public ActivityTypeName: string;
    public ActivitySubTypeName: string;
    public AssignedToStaffName: string;
    public Description: string;
    public MemberContactReasonTypeName: string;
    public FollowUpDate: Date;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public TrailEndDate: Date;
    public MarkedAsDone: boolean;
    public EmailSubject: string;
    public EmailBody: string;
    public CreatedOn: Date;
    public ModifiedOn: Date;
    public IsNow: boolean;

    public StartTime: string;
    public ModifiedTime: string;

    /* For Icons rendering only */
    public ShowEditIcon: boolean = false;
    public ShowViewIcon: boolean = false;
    public ShowMarkAsDoneIcon: boolean = false;
    public ShowDeleteIcon: boolean = false;
}

export class MemberContactReasonType {
    public ContactReasonTypeID: number;
    public ContactReasonTypeName: string;
}

export class MemberActivityTabOptions {
    public isEditMode: boolean;
    public defaultActiveTab: string;
    public activeTabs: string[];
    public isMarkAsDone?: boolean;
    public modelData?: any;
}

export class MemberActivityCount {
    public AppointmentCount: number = 0;
    public CallCount: number = 0;
    public EmailCount: number = 0;
    public NoteCount: number = 0;
    public SMSCount: number = 0;
    public AppNotificationCount: number = 0;
    public MemberMessageCount: number = 0;
    public MemberAchievementsCount: number = 0;
}

export class MemberActivityInfo {
    public FullName: string;
    public ImagePath: string;
    public Email: string;
    public Mobile: string;
    public Phone: string;
    public Address1: string;
}



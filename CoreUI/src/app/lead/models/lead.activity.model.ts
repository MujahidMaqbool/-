export class SearchActivity {
    public CustomerActivityID: number;
    public ActivityTypeID: number;
    public ActivityTypeName: string;
    public AssignedToStaffName: string;
    public Title: string;
    public Description: string;
    public FollowUpDate?: any;
    public FollowUpStartTime?: any;
    public FollowUpEndTime?: any;
    public TrailEndDate?: any;
    public MarkedAsDone?: any;
    public EmailSubject: string;
    public EmailBody: string;
    public CreatedOn: Date;
    public ModifiedOn?: any;
    public IsNow: boolean;
    public OverDueDay?: number;
    public RemainingDay?: number;
    public IsOverDue: boolean;
    public TooltipInfo: string;
    public Time?: string;

    public ShowEditIcon: boolean;
    public ShowMarkAsDoneIcon: boolean;
    public ShowViewIcon: boolean;
    public ShowDeleteIcon: boolean;
}

export class AppointmentLaterActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number = 0;
    public Title: string = "";
    public Description: string = "";
    public AssignedToStaffID: number = 0;
    public FollowUpDate: Date;
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";

    public constructor(init?: Partial<AppointmentLaterActivity>) {
        Object.assign(this, init);
    }
}

export class AppointmentNowActivity {
    public CustomerID: number = 0;
    public CustomerActivityID: number = 0;
    public Title: string = "";
    public ActivityOutcomeID: number;
    public ActivityWhatNextID: number;
    public Description: string = null;
    public TrialEndDate: Date = null;
    public LostReasonTypeID: number = null;
    public MembershipID?: number;

    public constructor(init?: Partial<AppointmentNowActivity>) {
        Object.assign(this, init);
    }
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
    public TrialEndDate?: string;

    public constructor(init?: Partial<AppointmentMarkAsDoneActivity>) {
        Object.assign(this, init);
    }
}

export class CallLaterActivity {
    public CustomerActivityID: number = 0;
    public Title: string = "";
    public Description: string = null;
    public AssignedToStaffID: number = 0;
    public FollowUpDate: Date;
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public CustomerID: number = 0;

    public constructor(init?: Partial<CallLaterActivity>) {
        Object.assign(this, init);
    }
}

export class CallNowActivity {
    public CustomerActivityID: number = 0;
    public Title: string = "";
    public ActivityOutcomeID: number = 0;
    public Description: string = "";
    public ActivityWhatNextID: number = 0;
    public CustomerID: number = 0;
    public LostReasonTypeID: number = null;
    public MembershipID?: number;
    public FollowUpDate: string;

    public constructor(init?: Partial<CallNowActivity>) {
        Object.assign(this, init);
    }
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

    public constructor(init?: Partial<CallMarkAsDoneActivity>) {
        Object.assign(this, init);
    }
}

export class EmailActivity {
    public CustomerActivityID: number = 0;
    public TemplateTextID?: number = null;
    public EmailSubject: string;
    public EmailBody: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;

    public constructor(init?: Partial<EmailActivity>) {
        Object.assign(this, init);
    }
}

export class NoteActivity {
    public CustomerActivityID: number = 0;
    public CustomerID: number;
    public Title: string = "";
    public Description: string = "";

    public constructor(init?: Partial<NoteActivity>) {
        Object.assign(this, init);
    }
}

export class SMSActivity {
    public CustomerActivityID: number = 0;
    public TemplateTextID?: number = null;
    public Title: string;
    public Description: string;
    public CustomerID: number;
    public ContactReasonTypeID: number;

    public constructor(init?: Partial<SMSActivity>) {
        Object.assign(this, init);
    }
}

export class TaskActivity {
    public CustomerActivityID: number = 0;
    public PriorityTypeID: number = undefined;
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: Date = new Date();
    public AssignedToStaffID: number;
    public CustomerID: number;

    public constructor(init?: Partial<TaskActivity>) {
        Object.assign(this, init);
    }
}

export class LeadAppNotification {
    public TemplateTextID?: any;
    public ContactReasonTypeID: number;
    public CustomerActivityID: number;
    public Title: string;
    public Description: string;
    public CustomerID: number;

    public constructor(init?: Partial<LeadAppNotification>) {
        Object.assign(this, init);
    }
}
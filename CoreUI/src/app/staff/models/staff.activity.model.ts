export class NoteActivity {
    public StaffActivityID: number = 0;
    public AssignedToStaffID: number;
    public Title: string = "";
    public Description: string = "";

    public constructor(init?: Partial<NoteActivity>) {
        Object.assign(this, init);
    }
}

export class TaskActivity {
    public PriorityTypeID: number = undefined;
    public StaffActivityID: number;
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: any = new Date();
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public AssignedToStaffID: number;
}

export class EmailActivity {
    public StaffActivityID: number = 0;
    public TemplateTextID?: number = null;
    public EmailSubject: string;
    public EmailBody: string;
    public AssignedToStaffID: number;

    public constructor(init?: Partial<EmailActivity>) {
        Object.assign(this, init);
    }
}

export class StaffTaskView {
    public PriorityTypeName: string = "";
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: string;
    public FollowUpStartTime: string = "";
    public FollowUpEndTime: string = "";
    public MarkedAsDone: boolean;
    public AssignedToStaffName: string;
}

export class SMSActivity {
    public StaffActivityID: number = 0;
    public TemplateTextID?: number = null;
    public Title: string;
    public Description: string;
    public AssignedToStaffID: number;

    public constructor(init?: Partial<SMSActivity>) {
        Object.assign(this, init);
    }
}

export class StaffActivityTask {
    public StaffActivityID: number = 0;
    public StaffID: number = 0;
    public ActivityTypeID: number = undefined;
    public PriorityTypeID: number = undefined;
    public StatusTypeID: number = undefined;
    public Title: string = "";
    public Description: string = "";
    public FollowUpDate: Date = new Date();
    public AssignedToStaffID: number = undefined;
    public Priority: string = "";
    public Status: string = "";
    public AssignedToStaff: string = "";

    public constructor(init?: Partial<TaskActivity>) {
        Object.assign(this, init);
    }

}

export class StaffActivityInfo {
    FullName: string;
    ImagePath: string;
    Email: string;
    Mobile: string;
    Phone: string;
    Address1: string;
}

export class StaffActivityCount {
    public AppointmentCount: number = 0;
    public CallCount: number = 0;
    public EmailCount: number = 0;
    public NoteCount: number = 0;
    public SMSCount: number = 0;
    public TaskCount: number = 0;
}

export class StaffActivityTabOptions {
    public isEditMode: boolean;
    public defaultActiveTab: string;
    public activeTabs: string[];
    public isMarkAsDone?: boolean;
    public modelData?: any;
}

export class StaffTaskMarkAsDone {
    public StaffActivityID: number;
    public StaffID: number;
    public CompletionDate: string;
    public CompletionNote: string;
    public CreatedBy: number;
}

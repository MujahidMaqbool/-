
export class SaveAutomation {
    public RuleID: number = 0;
    public RuleName: string;
    public IsActive: boolean = true;
    public FromEmailName: string;
    public ReplyEmailAddress: string;
    public EventCategoryTypeID: number = 0;
    public EventTypeID: number = 0;
    public SegmentID: number;
    public DurationValue?: number;
    public DurationTypeID?: number;
    public RepeatValue?: number;
    public DoNotSendBefore: string = "";
    public DoNotSendAfter: string = "";
    public RuleAudience: RuleAudience[] = [];
    public AutomationRuleAudienceCommunication: AutomationRuleAudienceCommunication[] = [];
    public AutomationRuleAudienceGroup: AutomationRuleAudienceGroup[] = [];
}

export class RuleAudience {
    public RuleAudienceID: number = 0;
    public AudienceTypeID: number = 0;
    public RuleID: number = 0;
}

export class Audience {
    public RuleAudienceID: number = 0;
    public AudienceTypeID: number = 0;
    public RuleID: number = 0;
    public AudienceChecked: boolean = false;
}

export class AutomationRuleAudienceCommunication {
    public RuleAudienceCommunicationID: number = 0;
    public RuleAudienceID: number = 0;
    public CommunicationTypeID: number = 0;
    public TemplateTextID: number = 0;
    public AudienceTypeID: number = 0;
}


export class EventCategoryType {
    EventCategoryTypeID: number;
    EventCategoryTypeName: string;
}


export class EventType {
    AllowAfter: boolean;
    AllowBefore: boolean;
    AllowCustomer: boolean;
    AllowRelatedStaff: boolean;
    AllowRepeat: boolean;
    AllowSegment: boolean;
    AllowStaffPosition: boolean;
    EventTypeID: number;
    EventTypeName: string;
    EventCategoryTypeID: number;
}



export class AutomationRuleStaffPosition {
    public StaffPositionID: number;
    public StaffPositionName: string;

}
export class AutomationRuleAudienceGroup {
    public StaffPositionID?: number;
    public StaffPositionName?: string;
    public RuleAudienceGroupID: number = 0;
    public AudienceGroupID: number = 0;
    public RuleAudienceID: number = 0;
    public AudienceGroupName?: string;
}

export class Template {
    public TemplateTextID: number;
    public TemplateTextTitle: string;
}

export class AutomationRuleTemplate {
    public RuleAudienceCommunicationID: number = 0;
    public RuleID: number = 0;
    public RuleAudienceID: number = 0;
    public TemplateTextID: number;
    public TemplateTextTitle: string;
    public AudienceTypeID: number;
    public IsCustomer: number;
    public CommunicationTypeID: number;
    public AudienceSelected: boolean = false;
   // public AudiencTemplateSelected: boolean = false;
}

export class AudienceTemplate {
    public AudienceCustomerNotificationIsActive: boolean = false;
    public AudienceCustomerEmailIsActive: boolean = false;
    public AudienceCustomerSMSIsActive: boolean = false;

    public AudienceStaffNotificationIsActive: boolean = false;
    public AudienceStaffEmailIsActive: boolean = false;
    public AudienceStaffSMSIsActive: boolean = false;

    public AudienceStaffPositionNotificationIsActive: boolean = false;
    public AudienceStaffPositionEmailIsActive: boolean = false;
    public AudienceStaffPositionSMSIsActive: boolean = false;

    public AudienceCustomerNotificationDisabeld: boolean = false;
    public AudienceCustomerEmailDisabeld: boolean = false;
    public AudienceCustomerSMSDisabeld: boolean = false;

    public AudienceStaffNotificationDisabeld: boolean = false;
    public AudienceStaffEmailDisabeld: boolean = false;
    public AudienceStaffSMSDisabeld: boolean = false;

    public AudienceStaffPositionNotificationDisabeld: boolean = false;
    public AudienceStaffPositionEmailDisabeld: boolean = false;
    public AudienceStaffPositionSMSDisabeld: boolean = false;

    public CustomerEmailTemplateTextID: number = 0;
    public CustomerSMSTemplateTextID: number = 0;
    public CustomerNotficationTemplateTextID: number = 0;

    public StaffEmailTemplateTextID: number = 0;
    public StaffSMSTemplateTextID: number = 0;
    public StaffNotficationTemplateTextID: number = 0;

    public StaffPositionEmailTemplateTextID: number = 0;
    public StaffPositionSMSTemplateTextID: number = 0;
    public StaffPositionNotficationTemplateTextID: number = 0;

    public TemplateTextTitle: string;
    public AudienceTypeID: number = 0;;
    public CommunicationTypeID: number = 0;;
    public RuleAudienceCommunicationID: number = 0;;
}

export class DurationType {
    public DurationTypeID: number;
    public DurationTypeName: string;
}
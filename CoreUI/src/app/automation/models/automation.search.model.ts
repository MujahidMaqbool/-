export class AutomationSearch {
    EventCategoryType: EventCategoryType[];
    RuleAudience: RuleAudience;
    EventType: EventType[];
    StatusList: StatusList[];
}

export class StatusList {
    StatusID: number;
    StatusName: string;
}

export class EventCategoryType {
    EventCategoryTypeID: number;
    EventCategoryTypeName: string;
}

export class RuleAudience {
    public RuleStaffAudience: Audience[];
    public RuleCustomerAudience: Audience[];
}

export class Audience {
    AudienceTypeID: number;
    AudienceTypeName: string;
}

export class EventType {
    EventTypeID: number;
    EventCategoryTypeID: number;
    EventTypeName: string;
    AllowSegment: boolean;
    AllowBefore: boolean;
    AllowAfter: boolean;
    AllowRepeat: boolean;
    AllowCustomer: boolean;
    AllowRelatedStaff: boolean;
    AllowStaffPosition: boolean;
}

export class AutomationSearchParameter {
    public EventCategoryTypeID: number = 0;
    public EventTypeID: number = 0;
    public AudienceTypeID: number = 0;
    public RuleName: string = "";
    public IsActive: number = 1;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";

}

export class AutomationSearchParameters {
    public EventCategoryTypeID: number = null;
    public EventTypeID: number = null;
    public AudienceTypeID: number = null;
    public RuleName: string = "";
    public IsActive: boolean = true;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";

}
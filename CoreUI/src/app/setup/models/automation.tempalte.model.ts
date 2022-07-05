export class AutomationTemplateSearchParameter {
    public TemplateTextTitle: string = "";
    public EventCategoryTypeID: number = 0;
    public AudienceTypeID: number = 0;
    public IsCustomer: boolean = null;
    public CommunicationTypeID: number = 0;
    public IsActive: number = 1;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    /// Added below param by Asim on 14/09/2021
    public IsFixed: boolean = null;
}


export class SaveAutomationTemplate {
    TemplateTextID: number = 0;
    TemplateTextTitle: string= "";
    TemplateTextSubject: string= "";
    TemplateTextDescription: string = "";
    CommunicationTypeID: number = 0;
    EventCategoryTypeID: number = 0;
    EventTypeID: number = 0;
    IsActive: boolean = true;
    IsCustomer: boolean = true;
    IsFixed: boolean = false;
}

export class AutomationTemplateFundamental {
    EventCategoryType: EventCategoryType[];
    EventType: EventType[];
    TemplateVariable: TemplateVariable[];
    AudienceType: AudienceType[];
    CommunicationType: CommunicationType[];
    StatusList: StatusList[];
}

export class EventCategoryType {
    EventCategoryTypeID: number;
    EventCategoryTypeName: string;
}

export class EventType {
    EventTypeID: number;
    EventCategoryTypeID: number;
    EventTypeName: string;
}

export class TemplateVariable {
    VariableName: string;
    VariableCategoryTypeID: number;
    EventCategoryTypeID: number;
}

export class AudienceType {
    AudienceTypeID: number;
    AudienceTypeName: string;
}

export class CommunicationType {
    CommunicationTypeID: number;
    CommunicationTypeName: string;
}

export class StatusList {
    StatusID: number;
    StatusName: string;
}
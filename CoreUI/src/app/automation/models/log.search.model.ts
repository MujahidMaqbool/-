export class Fundamental {
    EventCategoryType: EventCategoryType[];
    CommunicationType: CommunicationType[];
    EventType: EventType[];
}

export class EventCategoryType {
    EventCategoryTypeID: number;
    EventCategoryTypeName: string;
}

export class CommunicationType {
    CommunicationTypeID: number;
    CommunicationTypeName: string;
}

export class EventType {
    EventTypeID: number;
    EventCategoryTypeID: number;
    EventTypeName: string;
}

export class Log {
    public EventCategoryTypeName: string = "";
    public EventTypeName: string = "";
    public EventDateTime: string = "";
    public AudienceTypeName: string = "";
    public CommunicationTypeName: string = "";
    public AudienceName: string = "";
    public AudienceEmail: string = "";
}

export class LogSearch {
    public EventCategoryTypeID?: number = 0;
    public EventTypeID?: number = 0 ;
    public CommunicationTypeID?: number = 0;
    public DateFrom: string;
    public DateTo: string;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";

}
// export class LogSearchparameter {
//     public EventCategoryTypeID: number = null;
//     public EventTypeID: number = null;
//     public CommunicationTypeID: number = null;
//     public DateFrom: string;
//     public DateTo: string;
//     public PageNumber: number;
//     public PageSize: number;
//     public SortIndex: number = 1;
//     public SortOrder: string = "ASC";

// }
export class LeadDashboradParameter {
    public DateFrom: string = "";
    public DateTo: string = "";
    public statusTypeID?: number = 0;
}
export class SaleTourEnquiryStatus {
    public MonthNames: string = "";
    public NewLead: number;
    public Tour: number;
    public Sale: number;
}

export class OwnLeads {
    MonthNames: string;
    enquiry: number;
    proposalMade: number;
    meetingArranged: number;
    proposalSent: number;
    finalMeeting:number;
    sales: number;
    lost: number;
}

export class EnquirySource {
    EnquirySourceTypeID: number;
    EnquirySourceTypeName: string;
    EnquirySourceCount: number = 0;
}


export class LeadActivity {
    ActivityTypeID: number;
    ActivityTypeName: string;
    ActivityTypeCount: number;
}
export class LeadFlow {
    LeadStatusTypeFriendlyName: string;
    TotalLead: number;
}

export class AtivtiesSummary {
    public LeadStatusTypeName: string = "";
    public LeadStatusTypeID: number;
    public TotalLead: number;
    public val: number;
    public color: string = "";
}


export class LeadEnquiryTour {
    value: string;
    name: string;
}

export class LeadStatusTypeList {
    LeadStatusTypeFriendlyName: string;
    LeadStatusTypeID: number;
}

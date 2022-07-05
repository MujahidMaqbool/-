export class LeadSearchParameter {
    public Name: string = "";
    public CustomerID:number;
    public MembershipID: number = 0;
    public LeadStatusTypeID: number = 0;
    public AssignedToStaffID: number = 0;
    public ActivtyTypeID: string = "";
    public Email: string = "";
    public DateFrom: string = "";
    public DateTo: string = "";
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
}


export class LeadReportsSearchParameter {
    public CustomerName: string = "";
    public CustomerID?:number = 0;
    public MembershipID?: number = 0;
    public LeadStatusTypeID?: number = 0;
    public AssignedToStaffID?: number = 0;
    public LostReasonTypeID?: number = 0;
    public EnquirySourceTypeID?: number = 0;
    public ActivityTypeID ?: number = 0;
    public Email: string = "";
    public DateFrom: string = "";
    public DateTo: string = "";
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
}
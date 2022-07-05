export class StaffReportSearchParameter {
    public StaffID?: number = null;
    public StaffPositionID?: number = 0;
    public StatusID: number;
    public IsActive: number = 1;
    public StaffName: string = "";
    public CardNumber: string = "";
    public DateFrom: string = "";
    public DateTo: string = "";
    public ActivityTypeID?: number = 0;
    public PriorityTypeID: number;
}

export class PriorityType {
    public PriorityTypeID: number;
    public PriorityTypeName: string;
    public IsActive: boolean;
}
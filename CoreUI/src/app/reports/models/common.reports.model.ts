export class CommonReportSearchParam {
    public CustomerID?: number = null;
    public StaffID?: number = null;
    public PersonID?: number = 0;
    public ServiceID?: number = 0;
    public CustomerTypeID?: number = 0;
    public ActivityTypeID: number = 0;
    public DateFrom: string = "";
    public DateTo: string = "";
    public BookingStatusTypeID: number = 0;

    public NumberOfVisitTo: number = null;
    public NumberOfVisitFrom: number = null;
    public MembershipStatusTypeID: number = null;

    public CustomerNumberFrom: number = 1;
    public CustomerNumberTo: number = 500;
}

export class InventoryChnageLogSearchParam{
    public ProductName :string;
    public ProductID: number= 0;
    public ProductCategoryID :number = null;
    public BrandID :number = null;
    public DateFrom :number;
    public DateTo :number;
    public FileFormatTypeID :number;
}

export class RewardProgramSearchParam {
    public FileFormatTypeID : any;
    public CustomerTypeID: number = 0;
    public CustomerID: number = 0;
    public CustomerStatusID : number = 1;
    public RewardProgramID?: number = 0 ;
    public EnrollmentStatusID: number = 1;
    public DateFrom: string = "";
    public DateTo: string = "";
    public ProductID: number = 0;

}
// public class RewardProgramSummaryReportVM
// {
// public int fileFormatTypeID { get; set; }
// public int? CustomerTypeID { get; set; }
// public int? CustomerID { get; set; }
// public int? CustomerStatusID { get; set; }
// public int? RewardProgramID { get; set; }
// public int? EnrollmentStatusID { get; set; }
// public DateTime FromDate { get; set; }
// public DateTime ToDate { get; set; }
// }

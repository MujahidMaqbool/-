export class MainDashboardSearchParams
{
    public SaleType:number;
    public PersonId:number;
    public DateFrom :string;
    public DateTo :string;


}

export class MemberAttendance
{
    public FirstName:string;
    public LastName:string;
    public Email:string;
    public MemberFullName :string;
    public MembershipID:number;
    public ClockInDate :string;
    public MembershipName :string;
    public ImagePath :string;
    public CustomerID:number;

}

export class StaffAttendance
{
    public StaffFullName :string;
    public StaffID:number;
    public ClockDate: string;
    public ClockIn :string;
    public ClockOut :string;
    public ImagePath :string;
    public StartTime:string;
    public EndTime:string;
    public IsTimeStatusPlus:number;
    public TimeDifference:any;
}

export class SaleTypeSummary
{
    public TotalSale:number;
    public Month :string;
    public Year:any;
}
export class MembershipStatus
{
    public Total:number;
    public Name :string;
}

export class MembersContract {
    TwelveTo24Month: number;
    SixTo12Month: number;
    ThreeTo6Month: number;
    OneToThreeMonth: number;
    NotInContract: number;
}

export class PersonInfo {
    CustomerID:number;
    FirstName: string;
    LastName: string;
    Phone: string = null;
    Mobile: string = null;
    Email: string;
    DateofBirth: string;
    LastVisitDate: string;
    ImagePath: string = null;
}

export class StaffPendingTask {
    Title: string;
    FollowUpDate: string;
    FollowUpStartTime: string;
    FollowUpEndTime: string;
    StaffFullName: string;
    PriorityTypeName: string;
    ImagePath: string;
}

export class MemberContract {
    Total: number;
    Name: string;
}

export class TotalSaleSummary {
    TotalSale: number = 0 ;
    TotalSaleChangePercentage: number = 0 ;
    TotalMembershipSales: number = 0 ;
    TotalMembershipSaleChangePercentage: number = 0 ;
    TotalNumberOfMembershipSold: number = 0 ;
    TotalNumberOfMembershipSoldChangePercentage: number = 0 ;
    TotalServiceSale: number = 0 ;
    TotalServiceSaleChangePercentage: number = 0 ;
    TotalProductSale: number = 0 ;
    TotalProductSaleChangePercentage: number = 0 ;
    TotalOnlineSales: number = 0 ;
    TotalOnlineSalesChangePercentage: number = 0 ;
    TotalStaffAttendance: number = 0 ;
    TotalStaffAttendanceChangePercentage: number = 0 ;
    TotalMemberAttendance: number = 0 ;
    TotalMemberAttendancePercentage: number = 0 ;
}

export class RewardProgramSummaryViewModel{
    CustomersEnrolled: number = 0;
    PointBalance: number = 0;
    CurrencyValuePB: number = 0;
    PointRedeemIn30Days: number = 0;
    CurrencyValuePR: number = 0;
}


export class ApiResponse {
    public MessageCode: number;
    public MessageText: string;
    public MessageData: any;
    public Result: any;
    public TotalRecord: number;
}

export class PersonInfo {
    public PersonID: number;
    public PersonTypeID: number;
    public FirstName: string = "";
    public LastName: string = "";
    public Address1: string = "";
    public MembershipID: number;
    public ImagePath: string = "";
}

export class AllPerson {
    public CustomerID: number;
    public StaffID: number;
    public CustomerTypeID: number;
    public CustomerTypeName: string;
    public Email: string = "";
    public ImagePath: string = "";
    public Mobile: string;
    public FirstName: string = "";
    public LastName: string = "";
    public FullName?: string;
    public AllowPartPaymentOnCore: boolean;
    public HasMembership: boolean;
    public IsBlocked: boolean;

}

export class AllStaff {
    public ImagePath: string;
    public Title: string;
    public StaffID: number;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Mobile: string;
    public Address1?: any;
    public RoleName?: any;
    public FullName?: string;
}

export class ReportSearchParameter {
    public Name: string = "";
    public Email: string = "";
    public CardNumber: string = "";
    public CustomerID: number;
    public CustomerTypeID: number;
    public DateFrom: string = "";
    public DateTo: string = "";
}


export class PersonDetail {
    public FirstName: string = "";
    public LastName: string = "";
    public Name: string = "";
    public Email: string = "";
    public Address1: string = "";
    public Mobile: number;
    public ImagePath: string = "";
    public EmailAllowed: boolean;
    public SMSAllowed: boolean;
    public AppNotificationAllowed: boolean;
    public PhoneCallAllowed: boolean;
    public CustomerTypeName: string = "";
    public CustomerTypeID?: number;
    public CustomerID?: number;
    public IsWalkedIn: boolean;
    public LeadStatusTypeID?: number;
    public AssignedToStaffID?: number;
    public LeadStatusTypeList?: any[] = [];
    public StaffList?: any[] = [];
    public MembershipID: number;
    public MemberMessageAllowed: boolean;
    public AllowPartPaymentOnCore: boolean;
    public IsBlocked: boolean;
    public RewardProgramAllowed: boolean;
    public RewardProgramEnrolledBranchID: number;
}

export class DateToFrom {
    public DateFrom: string = "";
    public DateTo: string = "";
}

export class MemberShipBenifitSearchFilter {
    public BranchID: number = 0;
    public ItemID: number = 0;
    public CategoryID: number = 0;
}

export class ModulePermission {
    public ModuleID: number = 0;
    public ModulePageList: ModulePage[] = [];

}

export class ModulePage {
    public ModulePageID: number;
}

export class InvoiceHistory {
    public CustomerID: string = "";
    public POSHistory: boolean = false;
}

export class DD_Branch {
    public BranchID: number;
    public BranchName: string;
    public Email: string;
    public Address1: string;
    public Phone1: string;
    public Currency: string;
    public CurrencySymbol: string;
    public TimeZone: string;
    public AllowPartPayment: boolean;
    public AllowStripeTerminal: boolean;
    public DateFormatID: number;
    public TimeFormatID: number;
    public WeekStartDayID: number = 4;
    public BranchTimeFormat12Hours: boolean = false;
    public ISOCode: string;
    public IsCustomerDefaultBranch: boolean;

    public constructor(init?: Partial<DD_Branch>) {
        Object.assign(this, init);
    }
}

export class CompanyInfo {
    public ImagePath: string;
    public CompanyName: string;
    public Email: string;
    public Phone1: string;
    public Address: string;
}

export class POSBooking {
    public CustomerID: number = 0;
    public POSBooking: boolean = false;
}

export class StateCounty {
    public StateCountyID: number;
    public CountryID: number;
    public StateCountyName: string;
}

export class UtcTimeZone {
    public Abbreviation: string;
    public CountryID: number;
    public IsAhead: boolean = false;
    public OffsetTime: "00:00:00"
    public UTCTimeZoneID: number;
    public UTCTimeZoneName: string;
}

export class Notification {
    public ActivityTypeID: number;
    public Title: string;
    public Description: string;
    public FollowUpDate: string;
    public FollowUpStartTime: string;
    public FollowUpEndTime: string;
    public StaffName: string;
    public StaffID: number;
    public CustomerTypeID: number;
    public CustomerID: number;
    public ActivityID: number;
    public PriorityTypeID: number;
    public MarkedAsDone: boolean;
    public PriorityTypeName: string;
    public CreatedOn: string;
    public ShiftStartDate: string;
    public ShiftStartTime: string;
    public ShiftEndTime: string;
}

export class Tax {
    public TaxID: number = 0;
    public TaxName: string = "";
    public TaxPercentage: number = 0;
    public IsSelected: boolean = true;
}

export class DeleteImage {
    public ModulePageID: number;
    public EntityID: number;
    public FileName: string;
}

export class MarkAsRead {
    public StaffActivityID: number = 0;
    public StaffID: number = 0;
    public CustomerID: number = 0;
}

export class CustomerBillingAddress {
    public addressTypeID: number = 1;
    public Address1: string = "";
    public Address2: string = "";
    public CountryID: number = 0;
    public StateCountyName: string = "";
    public CityName: string = "";
    public PostalCode: string = "";
    public Phone: any = "";
    public CustomerId?: number;
    public CountryName: string = "";
    public StateCountyCode: string;
    public isStateCounty: boolean;
}

export class CustomerAddress {
    constructor(public AddressTypeID: number) { }
    public Address1: string = "";
    public Address2: string = "";
    public CountryID: number = null;
    public StateCountyName: string = "";
    public CityName: string = "";
    public PostalCode: string = "";
    public CustomerId?: number;
    public Mobile: string = null;
    public CountryName: string;
    public StateCountyCode: string;
    public isShowCountyCode: boolean = false;
    public isRequiredCOuntyCode: boolean = true;
}

export class AllStateList {
    public StateCountyID: number;
    public StateCountyCode: string;
    public StateCountyName: string;
}

export class CustomerBillingDetail {
    public FirstName: string;
    public LastName: string;
    public Address1: string;
    public Address2: string;
    public CountryName: string;
    public StateCountyName: string;
    public CityName: string;
    public PostalCode: string;
    public Phone: string;
}
export class EditCustomerEmail {
    public OldEmail: string = "";
    public NewEmail: string = "";
    public CustomerID: number;
}

export class CustomerBasicInfo {
    public IsWalkedIn: boolean = false;
    public TermsOfServiceURL: string = "";
    public BranchAddress: string = "";
    public BranchPhone: string = "";
    public AllowPartPaymentOnCore: boolean = false;
    public CustomerTypeID: number;
    public CustomerTypeName: string = "";
    public ImagePath: string = "";
    public CustomerID: number;
    public Title: string = "";
    public FirstName: string = "";
    public Email: string = "";
    public Mobile: string = "";
    public IsBlocked:  boolean;

}

export class CustomerMemberhsip {
    public CustomerMembershipID: number;
    public MembershipName: string;
    public MemberhsipConcatName: string;
    public BranchName: number;
    public BranchID: number;
}


export class InvoiceSaleHistory {

    // public SaleID: number;
    // public CustomerID: number;
    // public CustomerName: string;
    // public TotalAmount: number;
    // public TotalAmountPaid: number;
    // public BalanceAmount: number;
    // public DiscountAmount: number;
    // public InvoiceStatus: string;
    // public IsRefundAllow: boolean = false;
    // public ReferenceNumber: string;
    // public CreatedOn: string;
    // public ModifiedBy: string;
    // public ModifiedOn: string;
    // public TotalPrice: number;
    // public Adjustment: number;
    // public SaleCurrentStatus: string;
    // public SaleCurrentStatusTypeID: number;
    // public SaleSource: string;
    // public SaleStatusTypeId: number;
    // public Reason: string;
    // public Note: string;
    // public IsMembershipSale: boolean;

    public Adjustment: number;
    public AppSourceTypeName: string;
    public BalanceAmount: number;
    public CreationDate: string;
    public CurrencySymbol: string;
    public CustomerID: number;
    public CustomerName: string;
    public InvoiceDueDate: string;
    public IsOverDue: boolean = false;
    public PaymentMethod: string;
    public PaymentMethodID: number;
    public ReferenceNumber: string;
    public SaleID: number;
    public SaleInvoicePaymentID: number;
    public StatusTypeID: number;
    public StatusTypeName: string;
    public TotalDue: number;
    public TotalPaid: number;
    public IsSaleLogsExist: boolean = false;

    public InvoiceSaleDetail: InvoiceSaleHistoryDetail[] = [];

}

export class InvoiceSaleHistoryDetail {

    public SaleInvoiceID: number;
    public Adjustment: number;
    public AppSourceTypeName: string;
    public BalanceAmount: number;
    public CreationDate: string;
    public CustomerID: number;
    public CustomerName: string;
    public InvoiceDueDate: string;
    public PaymentMethod: number;
    public IsOverDue: boolean = false;
    public PaymentMethodID: number;
    public ReferenceNumber: string;
    public SaleID: number;
    public SaleInvoicePaymentID: number;
    public StatusTypeID: number;
    public StatusTypeName: string;
    public TotalDue: number;
    public TotalPaid: number;
}


export class CustomerWaitlistSearchParameter {
    public ItemName: string;
    public CustomerID: number = 0;
    public DateFrom: string;
    public DateTo: string
    public ItemTypeID: number = 0;
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 2;
    public SortOrder: string = 'DESC';
    public WaitListStatusTypeID: number = 1
    public AppSourceTypeID: number = 1;
}

export class AllWaitlist {

    ItemID: number;
    ItemName: string;
    ItemTypeID: number;
    BookingTypeName: string;
    IsAvailable: boolean;
    ItemList: WaitlistItemList[];
    IsBlocked:boolean;
}

export class WaitlistItemList {
    CreatedBy: number;
    CreatedDate: string;
    CustomerID: number;
    CustomerMembershipID: number;
    MembershipName:string;
    CustomerPaymentGatewayID: number;
    DetailItemID: number;
    DetailItemTypeID: number;
    DurationInMinutes: number;
    EndTime: string;
    ItemID: number;
    ItemPrice: number;
    ModifiedDate: string;
    RequestDate: string;
    StaffID: number;
    StaffName: string;
    StartTime: string;
    WaitListStatusTypeID: number;
    WaitListStatusTypeName: string;
    ParentClassID:number;
    IsAvailable: boolean = false;
    WaitListID: number;
    WaitListDetailID: number;
    IsNotified: boolean = false;
    NotifiedOn: string;
    Email: string;
    AllowPartPaymentOnCore: boolean;
    CustomerTypeID: number;
    CustomerName: string;
    Mobile: string;
    IsBlocked:boolean;
}
export class waitListMembership{
    MemberShipID : number;
    MemberShipName : string;
}

export class SearchWaitlistParam {
    ItemID: number;
    ItemName: string;
    ItemTypeID: number;
    BookingTypeName: string;
    IsAvailable: boolean;
}
export class StaffAuthentication{
    BranchID : number;
    CoreAuthToken? : string;
    EnterpriseAuthToken? : string;
}

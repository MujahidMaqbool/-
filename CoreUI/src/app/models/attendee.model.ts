
export class Attendee {
    public ID: number;
    public Name: string = "";
    public PersonTypeID: number;
    public PersonTypeName: string = "";
}

export class AttendeeClass {

    public OccurrenceDate: any = "";
    public ImagePath: string;
    public ClassID: number;
    public Name: string;
    public Description: string;
    public PricePerSession: number;
    public StartDate: Date;
    public StartTime: string;
    public EndTime: string;
    public FacilityID: number;
    public FacilityName: string;
    public AssignedToStaffID: number;
    public AssignedToStaffName: string;
    public IsFeatured: boolean;
    public ParentClassIsActive: boolean;
}


export class AllAttendees {
    public SaleID: number;
    public ItemID: number;
    public SaleNo: number;
    public SaleSourceTypeID: number;
    public AppSourceTypeName: string;
    public BookingStatusTypeID: number;
    public BookingStatusTypeName: string;
    public SaleStatusTypeID: number;
    public SaleStatusTypeName: string;
    public SaleTypeID: number;
    public SaleTypeName: string;
    public CustomerID: number;
    public CustomerName: string = "";
    public CustomerTypeName: string = "";
    public CustomerTypeID: number;
    public CreatedOn: Date;
    public ClassID: string = "";
    public ServicePackageID: string = "";
    public ProductID: string = "";
    public Email: string = "";
    public Mobile: string = "";
    public ImagePath: string = "";
    public SaleDetailID: number;
    public IsFree: boolean = true;
    public AppNotificationAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public EmailAllowed: boolean = true;
    public CustomerMembershipID: number = null;
    public FormStatusColor: string;
    public InvoiceNumber: string;
    public IsClassCancellationLateFlatFee: boolean;
    public ClassCancellationLateCharges: number;
    public SaleDiscountPerItemPercentage : number;
    public ItemPrice: number;
    public ItemDiscountedPrice : number;
    public AmountPaid: number;
    public TotalDue: number;
    public IsBlocked:boolean;
    public IsClassCancellationPolicy: boolean;
    public ClassNoShowCharges: number;
    public StartDate: string = "";
    public StartTime: string = "";
    public IsEarlyCancellation : boolean = true;
    public CancelBeforeDurationTypeID : number ;
    public CancelBefore : any;
    public IsBenefitConsumed : boolean ;
    // public IsCancellationEarly : any ;
    // public IsCancellationLate : any ;
    public CanCancelBooking : any ;
    public ClassCancellationLate : boolean ;
    public ClassCancellationEarly : boolean;
    public AllowPartPaymentOnCore: boolean;
    public ParentClassID: number;
    public CheckedInDateTime: string;
    public IsCheckedIn: boolean;
    public ClassNoShowFee: boolean;
    public ClassNoShow : boolean;
    public ClassCancellationLateBenefit: boolean;
    public ClassCancellationEarlyBenefit: boolean;
    public ClassNoShowBenefit: boolean;
    public ClassRescheduleBenefit:boolean;
    public IsClassNoShowFlatFee: boolean;
    public TotalPrice:Number;
    public IsWalkedIn:boolean;
    public TotalAdjustment:boolean;
    public MembershipName:string = null;
}
export class CancelationPolicyDetails {
    public ItemID: number;
    public ItemTypeID: number;
    public StartDate: string;
    public StartTime: string;
    public BookBefore: number;
    public BookBeforeDurationTypeID: number;
    public CancelBefore: number;
    public CancelBeforeDurationTypeID: number;
}

export class SaveAttendee {
    public CustomerTypeID: number;
    public CustomerID: number;
    public ClassID: number = 1;
    public ClassStartDate: Date;
    //  public isAttendeeAlreadyExist:boolean = true;

    // public PersonTypeID: number;
    // public PersonID: number;
    // public InvoiceStatusTypeID: number;
    // public isAttendeeAlreadyExist:boolean = true;
    // public InvoiceDetailList:InvoiceDetailList[]=[];
}
export class InvoiceDetailList {
    public BranchID: number;
    public ClassID: number;
    public Qty: number = 1;
}

export class AttendeeDetail {
    public PersonID: number;
    public PersonName: number;
    public PersonTypeID: number = 1;
    public PersonTypeName: string = "";
    public IsFree: boolean = false;
}

export class ClassList {
    public ImagePath: string = "";
    public ClassID: number;
    public Name: string = "";
    public Description: string = "";
    public PricePerSession: string = "";
    public StartTime: string = "";
    public EndTime: string = "";
    public FacilityName: string = "";
    public Trainer: string = "";
}

export class ClassAttendanceDetail {
    public ClassID: number;
    public ClassName: string;
    public StartDate: Date;
    public StartTime: string;
    public EndTime: string;
    public PricePerSession: number;
    public TotalTaxPercentage: number;
    public StaffID: number;
    public StaffName: string;
    public FacilityID: number;
    public FacilityName: string;
    public AttendeeMin: number = undefined;
    public AttendeeMax: number = undefined;
    public SignedIn: number;
    public TotalAttendee: number;
    public AssignedToStaffName: string;
    public IsActive: boolean;
    public BookBefore?: number;
    public BookBeforeDurationTypeID?: number;
    public CancelBefore?: number;
    public CancelBeforeDurationTypeID?: number;
    public Status: number;
    public Absent: number;
    public ItemDiscountAmount: number;
    public CustomerMembershipID: number;
    public ParentClassID: number;
    public TotalWaitList: number;
    public TotalNoShow: number;
    public TotalCanceled: number;
    public IsClassWaitList : boolean;
    public RestrictedCustomerTypeNames: string = "";



}

export class ClassInfo {
    public ClassID: number = 0;
    public ClassDate: Date = new Date();
}

export class AttendeeClassAttendance {
    public ClassID: number;
    public ClassDate: string;
    public CustomerID: number;
    public SaleDetailID: number;
    public IsAttended: boolean;
    public IsFree: boolean;
    public CustomerMembershipID: number;
}

export class AttendeMemberhsip {
    CustomerMembershipID: number = 0;
    MembershipID: number;
    MembershipName: string;
}

export class MemberMemberhsip {
    CustomerMembershipID: number = 0;
}

export class FreeClassesMemberships {
    CustomerMembershipID: number = 0;
    DiscountPerncentage: number;
    DiscountPercentage: number;
    IsBenefitSuspended: boolean;
    IsBenefitsSuspended: boolean;
    IsFree: boolean = false;
    MembershipID: number;
    MembershipName: string;
    RemainingSession: number;
    IsConsumed: boolean;
    IsMembershipBenefit: boolean;
    NoLimits: boolean;
}

export class NoShowCancelationRescheduleViewModel {
    appSourceTypeID: number = 0;
    activityType?: string;
    isRefundNow: boolean;
    isChargeNow: boolean;
    chargesAmount: number;
    paymentGatewayID: number;
    saleTypeID: number;
    customerPaymentGatewayID?: number;
    customerID: number;
    saleDetailID?: number;
    customerBookingID?: number;
    notes?: string;
    itemTypeID?: number;
    itemID: number;
}

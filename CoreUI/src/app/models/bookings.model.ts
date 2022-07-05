export class ClassBooking {
    public BookingStatusTypeName: string = "";
    public CreatedOn: Date;
    public ServiceDuration: string = "";
    public ItemStartDate: Date;
    public SaleNo: string = "";
    public SaleStatusTypeName: string = "";
    public IsFree: boolean;
    public ItemName: string = "";
    public ItemTypeName: string = "";
    public Price: string = "";
    public Qty: string = "";
    public StartDate: string = "";
    public StartTime: string = "";
    public EndTime: string = "";
    public CleaningTime: string = "";
    public CustomerBookingID: number;
    public SaleDetailID: number;
    public CustomerID: number;
    public IsWalkedIn: boolean;
    public StaffName:string = "";
    public CustomerName:string = "";
    public CustomerTypeName:string = "";
    public ItemPrice: number;
    public HasForm: boolean;
    public CustomerMembershipID: number;
    public MembershipName: string = "";

}


export class SearchBooking {
    // public PersonTypeID: number = 0;
    public ItemTypeID: number = 0;
    public BookingStatusTypeID: number = 0;
    public CustomerID: number = 0;
    public DateFrom: string = "";
    public DateTo: string = "";
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 4;
    public SortOrder: string = "DESC";
}
export class CancelNoShowBooking {
    public AppSourceTypeID: number = 1;
    public ActivityType?: string;
    public ActionType?: string;
    public IsRefundNow: boolean = false;
    public IsChargeNow: boolean = false;
    public ChargesAmount: number;
    public PaymentGatewayID?: number;
    public SaleTypeID?: number;
    public CustomerPaymentGatewayID?: number;
    public CustomerID: number;
    public SaleDetailID?: number;
    public SaleID?: number;
    public CustomerBookingID?: number;
    public Notes: string;
    public ItemTypeID: number;
    public ItemID: number;
    public ReasonID?: number;
    public PayTabsPaymentCartID?: number;
    public Token: string;
    public IsEarlyCancellationSelected?: boolean = false;
    public PaymentReferenceNo?: number = null;
    public ClassNoShowBenefit: boolean;
    public ClassCancellationLateBenefit: boolean;
    public ClassCancellationEarlyBenefit: boolean;
    public IsBenefitConsumed: boolean = false;
    public DiscountType:string;
    public CustomerMembershipID:number;
    public paymentModes: Array<object> = [];
}
//only using this on frontend
export class CancelNoshowDialogModel {
    public CustomerID: number;
    public CustomerName: string;
    public CustomerTypeId: number;
    public CancelbookingType: any;
    public IsCancellationFeeInPercentage: boolean;
    public CancellationCharges: number;
    public OldTotalDue: number;
    public AmountPaid: number;
    public ItemDiscountedPrice: number;
    public SaleID: number;
    public InvoiceNumber: string;
    public SaleDetailID: number;
    public CustomerBookingID: number
    public NoShowCharges: number;
    public ItemID: number;
    public IsBookingID: boolean = false;
    public IsClassAttendance: boolean = false;
    public ClassNoShowBenefit: boolean;
    public ClassCancellationLateBenefit: boolean;
    public ClassCancellationEarlyBenefit: boolean;
    public IsEarlyCancellation: boolean;
    public CancellationEarly: boolean;
    public CancellationLate: boolean;
    public IsNoShowFlatFee: boolean;
    public EarlyCancellationText;
    public LateCancellationText;
    public ServiceStartDate: Date;
    public DiscountType:string;
    public CustomerMembershipID:number;

}
export class RescheduleBooking {
    public AppSourceTypeID: number = 1;
    public ActivityType?: string
    public ActionType?: string;
    public IsRefundNow: boolean;
    public IsChargeNow: boolean;
    public ChargesAmount: number;
    public PaymentGatewayID?: number
    public SaleTypeID?: number;
    public CustomerPaymentGatewayID?: number;
    public CustomerID: number;
    public SaleDetailID?: number;
    public SaleID?: number;
    public CustomerBookingID?: number;
    public Notes?: string;
    public ItemTypeID?: number;
    public ItemID?: number;
    public ReasonID?: number;
    public IsEarlyCancellationSelected: boolean;
    public Token?: string;
    public IsBenefitConsumed: boolean;
    public PaymentReferenceNo?: number = null;
    public NewItemID: number;
    public NewStartDate: Date;
    public NewStartTime?: string;
    public NewEndTime?: string;
    public CustomerMembershipID?: number;
    /**for service only */
    public StaffID: Number;
    public FacilityID: Number;
    public paymentModes: Array<object>;
    public TotalAjustment: number;
    public DiscountType:string;
}

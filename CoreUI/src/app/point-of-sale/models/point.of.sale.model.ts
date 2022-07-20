import { CustomFormView } from "src/app/models/customer.form.model";

export class MembershipBaseProductGlobalRemainingSession{
    public CustomerMembershipID: number;
    public productGlobalRemainingSession: number;
    public remainingSessionDetail: RemainingSessionDetail[] = [];
    public productGlobalRemainingSessionCopy: number;


}

export class POSProduct {
    public ProductCategoryID: number;
    public ProductID: number;
    public Name: string;
    public Price: number;
    public TotalTaxPercentage: number;
    public Description: string;
    public ImagePath: string;
    public Code: string;
    /* Memberhsip Benefit */
    public RemainingSession?: number;
    public DiscountPrice: number;
    public DiscountPercentage: number;
    public TotalDiscount: number;
    public IsMembershipBenefit: boolean;
    public IsBenefitsSuspended: boolean;
    public IsConsumed: boolean;
    public IsFeatured: boolean;
    public PricePerSession: number;
    public IsFree: boolean;
    public GlobalRemainingSession: number;

    //for rewards points
    public AmountSpent: number;
    public MemberBaseEarnPoints: number;
    public CustomerEarnedPoints: number;

    //for show purchase restriction tooltip
    public WithTooltipVisible: boolean = false;
    public RestrictedCustomerTypeNames: string = "";
    public IsStandard: boolean;
    public ProductVariantID: number;
    public ProductVariantBranchID: number;
    public ProductClassificationID: number;
    public ProductClassificationName: string;
    public BrandID: number;
    public BrandName: string;
    public CurrentStock: number = 0;

    public TotalPrice: number = 0;

    public IsStockBelowThreshold: boolean;
    public InventoryDisplayStock: boolean;
    public HasTrackInventory: boolean;

    public InventoryOverselling: boolean;
    public ItemVariantName: string;
    public ProductVariantName: string;
    public CustomerMembershipID: number;
    public ReorderThreshold: number;

    //for FE use only 
    public ServerImageAddress: string;

}

export class POSServicePackageModel {
    public DurationTypeID: number;
    public DurationTypeName: string;
    public DurationValue: number;
    public Price: number;
    public ServiceID: number;
    public ServicePackageID: number;
    public TotalTaxPercentage: number;

    public TotalPrice: number;
    public CurrentPrice: number;
    public DiscountPrice: number;
    public TotalDiscount: number;
    public IsMembershipBenefit: boolean;
    public IsFree: boolean;
    public RemainingSession: number;
    public DiscountPercentage?: number;
    public IsBenefitsSuspended: boolean;
    public PricePerSession?: number;
    public IsBenefit?: boolean;


}

export class POSServiceModel {
    public Description: string;
    public ImagePath: string;
    public Name: string;
    public ServiceCategoryID: number;
    public ServiceCategoryName?: number;
    public ServiceID: number;

    public ServicePackageList: POSServicePackageModel[];
    public IsAddedToCart: boolean;
    public IsAddedToWaitList: boolean = false;

    /* Memberhsip Benefit */
    public IsMembershipBenefit: boolean;
    public IsBenefitsSuspended: boolean;
    public IsConsumed: boolean;
    public IsFree: boolean;
    public IsBenefit: boolean;
    public GlobalRemainingSession: number;
    public RemainingSession: number;
    public MembershipEndDate: any;

    //for show purchase restriction tooltip
    public WithTooltipVisible: boolean = false;
    public RestrictedCustomerTypeNames: string = "";

    // for rewards points
    public AmountSpent: number;
    public MemberBaseEarnPoints: number;
    public CustomerEarnedPoints: number;

}

export class POSClass {
    public ClassID: number;
    public Description: string;
    public EndTime: string;
    public FacilityName: string;
    public ImagePath: string;
    public Name: string;
    public OccurrenceDate: string;
    public PricePerSession: number;
    public TotalPrice: number;
    public StartDate: Date;
    public StartTime: string;
    public Trainer: string;
    public TrainerID: number;
    public TotalTaxPercentage: number;
    public Status: number;
    public StatusName: string;
    public BookingStartDateTime: any;

    //for show purchase restriction tooltip
    public WithTooltipVisible: boolean = false;
    public RestrictedCustomerTypeNames: string = "";


    public IsAvailable: boolean;
    public IsAddedToCart: boolean;
    public IsFree: boolean;
    public IsAlreadyBooked: boolean;

    public ParentClassID: number;
    public SessionConsumed: number;
    public DiscountPrice: number;
    public DiscountPercentage: number;
    public TotalDiscount: number;
    public IsMembershipBenefit: boolean;
    public IsBenefitsSuspended: boolean;
    public IsConsumed: boolean;
    public IsFeatured: boolean;
    public ItemCurrentPrice: number;
    public RemainingSession: number;
    public GlobalRemainingSession: number;

    //use for waitlist
    public EnableWaitList: boolean;
    public IsWaitListCapacityReached: boolean;
    public IsShowWaitListButton: boolean;



    //for family and friend booking
    public IsBookedAgain: boolean = false;
    public IsFamilyAndFriendItem: boolean = false;
    public IsItemStockOutDated: boolean = false;

    public IsCartItemUseBenefit: boolean = false;
    public AttendeeMax: number;
    public SpacesLeftFree: number;

    public IsClassBookingForFamilyAndFriends: boolean = false;
    public IsClassBookingFreeBenefitsForFamilyAndFirends: boolean = false;
    public IsClassBookingDiscountBenefitsForFamilyAndFriends: boolean = false;

    //for rewards points
    public AmountSpent: number;
    public MemberBaseEarnPoints: number;
    public CustomerEarnedPoints: number;
}

export class POSClassModel {
    public OccurrenceDate: string;
    public ClassPOSList: POSClass[];
}

export class POSClient {
    public CustomerTypeID: number;
    public CustomerTypeName: string;
    public CustomerID: number;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public FullName?: string;
    public Mobile: string;
    public Email: string;
    public ImagePath: string;
    public AllowPartPaymentOnCore: boolean;
    public HasMembership: boolean;
    public IsWalkedIn?: boolean;
    public IsBlocked: boolean;

}

export class ProductCategory {
    ProductCategoryID: number;
    ProductCategoryName: string;
}

export class ClassCategory {
    ClassCategoryID: number;
    ClassCategoryName: string;
}

export class ServiceCategory {
    ServiceCategoryID: number;
    ServiceCategoryName: string;
}

export class TimeSlot {
    public ID?: string;
    public Time: string;
}

export class ServiceStaff {
    public StaffID: number;
    public StaffFullName: string;
    public TimeSlotList: TimeSlot[];
    public ImagePath: string;
}


export class WaitListWorkTimeBrackets {
    public BranchWorkTimeBracketID: number;
    public BracketName: string;
    public EndTime: string;
    public StartTime: string;
}
// export class SaleProduct {
//     public ProductID: number;
//     public Qty: number;
// }

// export class SaleClass {
//     public ClassID: number;
//     public ClassStartDate: Date;
// }

export class SaleService {
    public ServicePackageID: number;
    public StaffID: number;
    public ServiceDate: string;
    public ServiceStartTime: string;
    public ServiceEndTime: string;
    public Note: string;
    public IsWaitlistItem: boolean;
}

export class BookingForFamilyAndFriends {
    public TotalAttendeeAdded: number = null;
    public TotalBenefitsUse: number = null;
}

export class SaleWaitListService {
    public ServicePackageID: number;
    public StaffID: number;
    public ServiceDate: string;
    public ServiceStartTime: string;
    public ServiceEndTime: string;
    public ServiceBranchWorkTimeBracketID: number;

}

export class CartWaitListService {
    public ServicePackageID: number;
    public ServiceDurationValue: number;
    public ServiceDurationTypeName: string;
    public StaffID: number;
    public StaffFullName: string;
    public ServiceDate: string;
    public ServiceStartTime: string;
    public ServiceEndTime: string;
    public ServiceStartTimeForShow: string;
    public ServiceEndTimeForShow: string;
    public ServiceBranchWorkTimeBracketID: number;
    public ServiceBranchWorkTimeBracketName: string;
    public IsWaitlistItem: boolean;
    public CustomerMembershipID: number;
    public Note: string;
}

export class POSSaleDetail {
    public WaitListDetailID?: number;
    public CustomerBookingID?: number;
    public ItemTypeID: number;
    public ItemID: number;
    public AssignedToStaffID: number;
    public FacilityID: number;
    public StartDate: any;
    public StartTime: string;
    public EndTime: string;
    public Qty: number;
    public Note: string;
    public Description: string;
    public ItemDiscountAmount?: number;
    public CustomerMembershipID?: number;
    public DiscountPrice?: number;
    public TotalDiscount?: number;
    public DiscountType?: string;
    public IsWaitlistItem: boolean;
    public IsFamilyAndFriendItem: boolean;
    public FamilyAndFriendIsNotAvailable: boolean;
    public IsItemStockOutDated: boolean = false;

}
export class PayTabPaymentMode {
    public SaleTypeID: number = null;
    public IsSaveCard: boolean = false;
    public CustomerPaymentGatewayID: number = null;
    public PaymentGatewayID: number = null;
    public CardScheme: string = null;
    public CardLast4Digit: string = null;
    public CardAuthenticationURL: string = null;
    public Token: string = null;
    public Status: string = null;
    public Code: number = 0;
    public Message: string = null;
}
export class SaleInvoice {
    public QueueSaleID: number;
    public PaymentMode: SalePaymentMode = new SalePaymentMode();
    public PaymentModes: SalePaymentMode[] = new Array<SalePaymentMode>();
    public ApplicationArea: string;
    public CustomerID: number;
    public TipAmount: number;
    public TipStaffID: number;
    public DiscountAmount: number = 0;
    public ServiceChargesAmount: number = 0;
    public Note: string;
    public SaleDetailList: POSSaleDetail[];
    public TotalAmountPaid: number;
    public TotalAmountRecieved: number;
    public ReasonID: number;
    public dueDate: string;
    public customerFormList: CustomFormView[];
    public WaitListDetailID: number;
    public TotalEarnedRewardPoints: number = 0;

    public SaleInvoiceNumber: string;
    public TotalDue: number;
    public TotalFailedAmountToBePaid: number;
    public UnProcessedPayments: UnProcessedPayments[];
    public InvoiceReceiptPayments: SalePaymentMode[] = new Array<SalePaymentMode>();
}

export class UnProcessedPayments {
    public Amount: number;
    public CardLastFourDigits: number;
    public CardScheme: number;
    public IsPaymentProcessed: boolean;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public PaymentAuthorizationID: number;
    public TransactionReference: string;
    public Currency: string;
    public Code: string;
    public Status: string;
    public Message: string;
}

export class SavePOSForAddMoreItems {
    public paymentModes: SalePaymentMode[] = new Array<SalePaymentMode>();
    public tipAmount: number = 0;
    public tipStaffName: string;
    public saleDiscount: number = 0;
    public isDiscountInPercentage: boolean = false;
    public isServiceChargesInPercentage: boolean = false;
    public dueDate: Date;
    public serviceCharges: number = 0;
    public rewardPointsUsed: number = 0;
    public paymentNote: string = "";
    public tipStaffID: number;
}

export class SalePaymentMode {
    public SaleTypeID: number;
    public CustomerID: number;

    public IsWalkedIn: boolean = false;
    public IsNewCard: boolean = false;

    // for stripe terminal
    public PaymentIntentID: string;

    //public IsNotIntegrated: boolean = false;
    public IsStripeTerminal: boolean = false;
    public CardToken: string;
    public IsSaveCard: boolean = false;
    public CustomerPaymentGatewayID: number;
    public PaymentGatewayID: number;
    public IsSaveInstrument: boolean = false;
    public StripeTerminalRefenceNo: any;

    // use for split payment
    public PaymentAuthorizationID: string;
    public Currency: string;
    public Amount: number;
    public CashReceived: number;

    // for use stripe
    public GatewayCustomerID: string;
    public InstrumentID: string;
    public LastDigit: string;
    public Brand: string;

    // for front end use only
    public PaymentTypeID: number;

}

export class SavedCard {
    // public Id: string;
    // public Brand: string;
    // public Last4: string;
    // public IsDefault: boolean;
    public CustomerPaymentGatewayID: number;
    public InstrumentName: string;
    public InstrumentLastDigit: string;
    public PaymentGatewayID?: number;
    // Used on front end
    public Title: string;
}

export class POSItem {
    public ItemID: number;
    public ItemTypeID: number;
    public Title: string;
    public Price: number;
    public Image: string;
    public Description: string;
}

export class POSCartItem {
    public ItemID: number;
    public Name: string;
    public Description: string;
    public Qty: number;
    public Price: number;
    public ItemTypeID: number;
    public TotalTaxPercentage: number;
    public TotalAmountExcludeTaxForPOS: number;
    public TotalAmountExcludeTax: number;
    public IsFree: boolean;
    public IsAlreadyBooked: boolean;
    public IsQuantityDisabled: boolean;
    public IsOutdated: boolean;
    public IsNotAvailable: boolean;
    public ItemTotalTaxAmount: number;
    public TotalAmountIncludeTax: number;

    /* For Service */
    public ServiceID?: number;
    public StaffID?: number;
    public ServiceDate?: string;
    public ServiceStartTime?: string;
    public ServiceEndTime?: string;
    public SelectedForPay?: boolean;
    public ServiceWaitListNote?: string; //for wait list

    /* For Classes */
    public ClassStartDate?: string;
    public ClassStartTime?: string;
    public ClassEndTime?: string;

    /* Is Memberhsip Benefit*/
    public PricePerSession?: number;
    public DiscountPercentage?: number;
    public ItemDiscountAmount?: number;
    public CustomerMembershipID?: number;
    public DiscountPrice?: number;
    public TotalDiscount?: number;
    public IsMembershipBenefit?: boolean;
    public DiscountType?: string;
    public RemainingSession?: number;
    public PerLineItemDiscount: number = 0;
    public IsBenefitsSuspended?: boolean;
    public IsConsumed?: boolean;
    public IsSessionConsumed: boolean = false;

    public IsWaitlistItem: boolean;
    public IsFamilyAndFriendItem: boolean = false;
    public IsCartItemUseBenefit: boolean = false;
    public IsItemOutOfStock: boolean = false;

    public Note: string;

    // for reward points
    public AmountSpent: number;
    public MemberBaseEarnPoints: number;
    public CustomerEarnedPoints: number;

    ///////////////////////////////
    public ProductVariantID: number;
    public ItemVariantName: string;
    public InventoryDisplayStock: boolean;
    public HasTrackInventory: boolean;

    public CurrentStock: number = 0;
    public ActualStock: number = 0;

    public InventoryOverselling: boolean;


    public ProductID:number;

}

export class SaleQueueDetail {
    public ItemTypeID: number;
    public ItemID: number;
    public ItemName: string;
    public ItemDescription: string;
    public AssignedToStaffID: number;
    public StartDate: any;
    public StartTime: string;
    public EndTime: string;
    public FacilityID: number;
    public ServiceID: number;
    public IsMembershipBasedClass: boolean;
    public Qty: number;
    public Price: number;
    public TotalTaxPercentage: number;
    public ItemDiscountAmount?: number;
    public CustomerMembershipID?: number;
    public IsFree: boolean;
    public IsMembershipBenefit: boolean;
    public IsWaitlistItem: boolean;
    public Note: string;
    public IsFamilyAndFriendItem: boolean = false;
    public IsItemStockOutDated: boolean = false;

    public IsCartItemUseBenefit: boolean = false;
    public MembershipName: string;
    public ItemVariantName : string;
    public CurrentStock : number;
    public ProductID : number;
    public GlobalSession : number;
    public RemainingSession : number;
    public HasTrackInventory : boolean;
    public InventoryOverselling : boolean;

}

export class SaveQueue {
    public QueueSaleID: number;
    public CustomerID: number;
    public CustomerName: string;
    public TipAmount: number;
    public TipStaffID: number;
    public PaymentNote: string;
    public DiscountAmount: number;
    public ServiceChargesAmount: number;
    public IsDiscountInPercentage: boolean;
    //public Note: string;
    public CustomerMembershipID: number;
    public IsServiceChargesInPercentage: boolean;
    public DueDate: string;

    public QueueSaleDetailList: SaleQueueDetail[];
    public QueueSalePaymentGatewayList: SaleQueuePaymentGateway[];
}

export class SaleQueuePaymentGateway {
    public QueueSalePaymentGatewayID: number;
    public QueueSaleID: number;
    public PaymentGatewayID: number;
    public CustomerPaymentGatewayID: number;
    public Amount: number;
    public PaymentAuthorizationID: string;

    public IsStripeTerminal: boolean;
    public SaleTypeID: number;
    public LastDigit: string;
    public IsSaveInstrument: boolean;
    public IsSaveCard: boolean;
}

export class SaleQueue {
    public QueueSaleID: number;
    public CustomerTypeID: number;
    public CustomerID: number;
    public CustomerName: string;
    public TipAmount: number;
    public TipStaffID: number;
    public DiscountAmount: number;
    public ServiceChargesAmount: number;
    public PaymentNote: string;
    public CreatedOn: Date;
    public StaffName: string;
    public ItemDiscountAmount?: number;
    public CustomerMembershipID?: number;
}

export class SaleQueueSearchParams {
    public CustomerID: number;
    public StaffID: number;
    public CreatedOn: string;
    public PageNumber: number = 1;
    public PageSize: number = 10;
}

export class InvoiceInQueue {
    public InvoiceNumber: number;
    public CartItems: POSCartItem[];
    public ClientID: number;
    public ClientName: string;
    public GrossAmount: number;
    public NetAmount: number;
    public IsServiceCharges: boolean;
    public IsTaxable: boolean;
    public IsDeliveryCharges: boolean;
    public ServiceChargeRate: number;
    public DeliveryCharges: number;
    public TaxRate: number;
    public DiscountRate: number;
    public Quantity: number;
}

export class QueuedInvoiceForGrid {
    public InvoiceNumber: number;
    public NoOfItems: number;
    public Quantity: number;
    public ClientName: string;
    public GrossAmount: number;
    public NetAmount: number;
}

export class ServiceViewModel {
    public serviceModel: POSServiceModel;
    public servicesInCart: POSCartItem[];
}

/** Bookings > Class Booking */
export class SearchClassBooking {
    public StartDate: any = new Date();
    public EndDate: any = new Date();
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 2;
    public SortOrder: string = "DESC";
}

export class ClassBookingDetail {
    public ClassID: number
    public ClassName: string
    public OccurrenceDate: Date
    public ClassTime: string
    public PricePerSession: number
    public AssignedToStaffName: string
    public BookBefore: number
    public BookBeforeDurationTypeName: string
    public AttendeeMax: number
    public AttendeeMin: number
    public TotalBooked: number
    public FreeSlots: number
    public Present: number
    public Absent: number
    public Status: number;
    public StatusName: string;
    public MinAttendeMeet: boolean = true;
    public WaitList: number;
    public WaitListCapacity: number;
    public IsCancelled: boolean;
    public NoShowCount: number;
    public CancellationCount: number;

}

export class POSClassInfo {
    public ClassID: number;
    public AttendeeMin: number;
    public AttendeeMax: number;
    public BookBefore?: any;
    public BookBeforeDurationTypeID?: any;
    public CancelBefore?: any;
    public CancelBeforeDurationTypeID?: any;
    public TotalEnrolledAttendees: number;
    public EnableWaitList: boolean;
    public IsWaitListCapacityReached: boolean;
}

export class FreeClassBooking {
    public CustomerBookingID: number;
    public ItemID: number;
    public CustomerTypeID: number;
    public CustomerID: number;
    public StartDate: string;
    public StartTime: string;
    public EndTime: string;
}

export class SavePartialInvocie {

    public SaleID: number;
    public CashReceived: number;
    public InvoiceAmount: number;
    public SaleStatusTypeID: number;
    public SaleTypeID: number;
    public CustomerID: number;
    public Note: string;
    public GatewayCustomerID: string;
    public PaymentMode: SalePaymentMode = new SalePaymentMode();
    public PaymentModeList: SalePaymentMode[] = new Array<SalePaymentMode>();
    public customerFormList: CustomFormView[];
    public PaymentReferenceNo: string;

    ////
    public InvoiceDueDate: string;
    public SaleDiscountAmount: number;
    public SaleTipAmount: number;
    public SaleServiceChargesAmount: number;
    public TipStaffID: number;

}

export class StripePaymentIntent {
    public CustomerPaymentGatewayID: number;
    public ClientSecret: string = "";
}

export class MemberhsipBenefits {
    /* Is Memberhsip Benefit*/
    public ItemTypeID: number;
    public ItemID: number;
    public DiscountPercentage: number;
    public RemainingSession: number;
    public GlobalRemainingSession: number;
    public IsFree: boolean;
    public IsMembershipBenefit: boolean;
    public IsBenefitsSuspended: boolean;
    public OccurrencesDate: any;

}


export class RemainingSessionDetail {
    public ItemTypeID: number;
    public ItemID: number;
    public RemainingSession: number;
    public AllowedSession: number;
    public IsMembershipBenefit: boolean;
    public CustomerMembershipID: number;
    //  public DiscountPercentage: number;
    // public GlobalRemainingSession: number;
    // public IsFree: boolean;
    // public IsMembershipBenefit: boolean;
    // public IsBenefitsSuspended: boolean;
}

export class POSFormsDetail {
    public CustomerID: number;
    public CustomerBookingIDs: string = "";
    public ItemList: ItemList[];
}

export class ItemList {
    public ItemTypeID: number;
    public ItemID: number;
}


export class SaveSaleCardInvoice {
    public SaleID: number;
    public CustomerID: number;
    public PaymentReferenceNo: string;
    public CustomerPaymentGatewayID: number;
    public InvoiceAmount: number;
    public CashReceived: number;
    public IsSaveCard: boolean;
    public IsSaveInstrument: boolean;

}

export class UpdateCardSaleStatus {
    public SaleID: number;
    public CustomerID: number;
    public CustomerPaymentGatewayID: number;
    public IsSaveCard: boolean;
    public IsSaveInstrument: boolean;

}

export class PayTabs {
    public CustomerID: number;
    public SaleTypeID: number
    public PaymentGatewayID: number;
    public Amount: number;
    public SaleID: string;
    public SaleDescription: string;
    public Currency: string;
    public InstrumentID: string;
    public Return: string;
    public CustomerName: string;
    public CustomerEmail: string;
    public StreetAddress: string = "";
    public StreetAddress2: string = "";
    public City: string = "";
    public State: string = "";
    public Country: string = "";
    public CountryID: number = 0;
    public PostalCode: string = "";
    public isSaveCard: boolean;
}

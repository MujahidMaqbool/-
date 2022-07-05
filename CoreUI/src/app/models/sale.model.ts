export class SaleHistory {
    public BalanceAmount: number;
    public BillNo: number;
    public CustomerID: number;
    public CustomerName: string;
    public InstrumentName: string;
    public PaymentGatewayName: string;
    public SaleID: number;
    public SaleInvoiceID: number;
    public SaleStatusTypeId: number;
    public SaleStatusTypeName: string;
    public SaleCurrentStatus: string;
    public TotalPrice: number;
    public TotalAmountPaid: number;
    public CreatedOn: string;
    public SaleHistoryDetailList: string;
    public hasAmountPaid: boolean;
    public hasWrittenOff: boolean;
    public Reason: string;
    public Note: string;
    public IsMembershipSale: boolean;
    public RefundAllow: boolean;
    public WrittenOffAllow: boolean = true;


}


export class SearchSaleHistory {
    public CustomerID: string = "";
    public SaleInvoicePaymentNumber: string = "";
    public SaleInvoiceNumber: string = "";
    public SaleStatusTypeID: number = 0;
    public AppSourceTypeID: number = 0;
    public InvoiceDueTerm: string = null;
    public DateFrom: string = "";
    public DateTo: string = "";
    public PageNumber: number;
    public PageSize: number;
    public SortOrder: string;
    public SortIndex: number;
}

export class SaleDetail {
        //public BillNo: string = "";
        //public BranchName: number;
        //public CreatedOn: string = "";
        //public CustomerTypeID: number;
        //public CustomerTypeName: string = "";
        // public DiscountAmount: number;
        // public SaleID: number;
        // public SaleStatusTypeName: string = "";
        // public ServiceChargesAmount: number;
        // public SubTotalPrice:number;
        // public TotalPrice: number;
        // public TotalTaxAmount: number;
        // public InvoiceDetailList: SaleHistoryDetailList[] = [];
        // public TotalBalance : number;

        // Invoice Refund Details
        public InvoiceNumber: string;
        public InvoiceStatus:string;
        public RefundMethod:string;
        public TotalRefundedAmount: number;
        public RefundReasonName:string;
        public RefundNote:string;

        public CustomerTypeID: number;
        public CustomerName: string = "";
        public CustomerTypeName: string = "";
        public CompanyName: string = "";
        public Email: string = "";
        public SaleID: number;
        public SaleInvoiceNumber: string = "";
        public InvoiceDate: string = "";
        public InvoiceDueDate: string = "";
        public SaleStatusTypeName: string = "";
        public SaleNote: string;
        public RecentRefundReasonName: string;
        public RecentRefundNote: string;
        public WriteoffReasonName: string;
        public WriteoffReasonNote: string;
        // public SaleStatusTypeName: number;
        public BranchName: string = "";
        public SubTotalPrice: number;
        public ServiceChargesAmount: number;
        public SaleDiscountAmount: number;
        public AppliedTaxNames: string = ""
        public TotalTaxAmount: number;
        public TotalPrice: number;
        public TotalDue: number;
        public Adjustment: number;
        public TotalAmountPaid: number;
        public BalanceAmount: number;
        public TipAmount: number;
        public TipStaffID: number;
        public SaleStatusTypeID: number;
        public IsWalkedIn: boolean;
        public RefundedServiceChargesAmount: number;
        public RefundedTipAmount: number;
        public IsRefunded: boolean;
        public IsPOSLineItemDiscount: boolean;
        public CurrencySymbol: string;
        public ItemTotalDiscountAmount: number = 0;
        public IsShowAddedToInventory: boolean = false;
        public ItemList: SaleHistoryDetailList[] = [];
        public PaymentList: SaleDetailPaymentList[] = [];
        public SaleNotes: InvoiceDetailNotes[] = [];
        public SaleReceipt : any = [];

        //Receipt Info
        public CashierName : string;
        public ReceiptDate : string;
        public IsStatusChanged: boolean = false;
        public EarnedRewardPointsIsToBeCalculated: boolean;
        public RewardPointsEarned: number;
}

export class InvoiceDetailNotes {
  public Notes: string = "";
  public ReasonCategoryName: string = "";
  public ReasonName: string = "";
}
  export class SaleDetailPaymentList {
        public Adjustment: number;
        public CreatedOn: string;
        public CurrencySymbol: number;
        public InstrumentLastDigit: number;
        public InstrumentName: number;
        public InvoiceTypeID: string = "";
        public InvoiceTypeName: string = "";
        public MethodName: string = "";
        public PaymentGatewayName: string = "";
        public PaymentMethod: number;
        public PaymentReferenceNo: string = "";
        public PaymentStatusTypeID: string = "";
        // payment method
        public PaymentStatusTypeName : string;
        public PaymentMethodID: number;
        public ReferenceNo : string;
        public TotalPaid : string;
}

export class SaleHistoryDetailList {
        public AssignedToStaffName: string = "";
        public Duration: string = "";
        public EndDate: string = "";
        public EndTime: string = "";
        public ImagePath: string = "";
        public IsFree: boolean;
        public IsItemCancelled: boolean;
        public IsItemNoShow: boolean;
        public IsItemRescheduled: boolean;
        public ItemName: string = "";
        public ItemVariantName: string;

        public ItemPricePerUnit: string ="";
        public ItemTypeName: string = "";
        public ItemTypeID: number;
        public ItemPrice: number;
        public ItemTotalPrice: number;
        public ItemQty: number;
        public ItemTotalDiscountedPrice: number;
        public StartDate: string = "";
        public StartTime: string = "";
        public BookingStatusTypeName: string = "";
        public TotalTaxPercentage: number;
        public PricePerSession: number;
        public DiscountType: string = "";
        public TotalDiscount: number;
        public DiscountPercentage: number;
        public IsMembershipBenefit: boolean;
        public IsLineItemDiscount: boolean;
        public ItemDiscountAmount: number;
        public RefundedQty: number;
        public RefundedAmount: number;
        public IsRefunded: boolean;
        public ItemTaxAmount: number;
        public IsItemBenefitReverted: boolean;
        public SaleDetailID:number;
        public NoShowCharges: number;
        public ItemReScheduleCount : number;
        public MembershipName : string;
        public InventoryAddedQty : number;
        // Refund
        public IsPOSLineItemDiscount: boolean;
        public ItemRefundedQty: number;
        public ItemRefundedPrice: number;
        public ItemRefundedAmount:number;


        // Used on Front End
        public ShowBookingTime: boolean;
        public MembershipPaymentInterval : string;
        public MembershipPaymentName : string;
        public ItemCancellationCharges :any;
        public ItemRescheduleCharges : number;
        public HasTrackInventory: boolean;
}

export class ReceiptModel {
    public ReceiptDate: string;
    public ReceiptTime: string;
    public ReceiptNo: string;
    public CashierID: string;
    public CustomerName: string;
    public branchName: string;
    public ReceiptAdjustmentAmount: string;
    public AppliedTaxNames: string;

    public MethodName: string;
    public PaymentGatewayName: string;
    public SaleStatusTypeName: string;
    public SaleTypeName: string;
    public LastDigits: string;
    public InvoiceAmount: string;
    public BalanceDue: string;
    public isShowRewardPointEarned : boolean;

    public Items: ReceiptItem[] = [];
    public paymentMethod: ReceiptPaymentMethod[] = [];
    public paidPaymentMethod: ReceiptPaymentMethod[] = [];
    public SubTotal: string;
    public ServiceCharges: string;
    public TotalRefundedServiceChargesAmount: string;
    public IsRefunded: boolean;
    public CurrencySymbol: string;

    public TipAmount: string;
    public TotalRefundedTipAmount: string;
    public Discount: string;
    public Tax: string;
    public Balance: string;
    public Total: string;
    public AmountPaid: string;

    // public IsPartialReceipt: boolean = false;
    public IsPreviouslyAmountPaid: boolean = false;
    public HasRemainingAmount: boolean = false;
    public BalanceAmount: string;
    public TotalPreviousPaid: string;

    //public BranchInfo: ReceiptBranchInfo;
    /* Is Memberhsip Benefit*/
    public DiscountPercentage?: number;
    public TotalDiscount?: number;
    public IsMembershipBenefit?: boolean;
    public DiscountType?: string;

    // Processed By Date and Time
    public ReceiptProcessedByDate: string;
    public ReceiptProcessedByTime: string;

    /**For reward program */
    public EarnedRewardPointsIsToBeCalculated: boolean;
    public RewardPointsEarned: number;

}

export class ReceiptPaymentMethod{
    public MethodName: string;
    public paymentMethod: string;
    public PaymentGatewayName: string;
    public SaleStatusTypeName: string;
    public PaymentMethodID: number;
    public SaleTypeName: string;
    public LastDigits: string;
    public InvoiceAmount: string;
    public BalanceDue: string;
    public Adjustment : string;
}

export class CustomerRewardPointsDetailForPOS{
    public CustomerID: number = 0;
    public CustomerRewardProgramID: number = 0;
    public MaximumPointsRedeemLimit: number = 0;
    public MinimumPointsRequiredtoRedeem: number = 0;
    public PointBalanceRedemptionValue: number = 0;
    public PointsBalance: number = 0;
    public RewardProgramID: number = 0;
    public RewardProgramRedemptionPoints: number = 0;
    public RewardProgramRedemptionValue: number = 0;
    public MaximumPointsRedeemLimitInPercentage: number = 0;
    public CopyPointsBalance: number = 0;
}

export class ReceiptItem {
    public Name: string;
    public VariantName: string;
    public Qty: string;
    public Price: string;
    public Amount: string;
    public ItemTaxAmount: string;
    public Description: string;
    /*  Memberhsip Benefit*/
    public TotalDiscount?: number;
    public IsMembershipBenefit?: boolean;
    public DiscountType?: string;
    public ReceiptDate: string;
    public MembershipPaymentInterval : string;
    public MembershipName : string;
    public MembershipPaymentStartDate : string;
    public MembershipPaymentEndDate : string;
    public MembershipPaymentName : string;
    public ItemIsRefunded : boolean;
    public ItemRefundedAmount : number;
    public RefundedAmount : number;
    public RefundedQty : number;
    public IsItemRescheduled : boolean;
    public ItemReScheduleCount : number;
    public RewardPointsEarned: number = 0;
    public EarnedRewardPointsIsToBeCalculated: boolean = false;
}

export class InvoiceFundamental {
    public SaleStatusTypeID: number;
    public SaleStatusTypeName: string;
}

export class AppSourceType {
    public AppSourceTypeID: number;
    public AppSourceTypeName: string;
}

export class BadDebtReasonFundamental {
    public ReasonID: number;
    public ReasonName: string;
}

export class VoidedReasonFundamental {
    public ReasonID: number;
    public ReasonName: string;
}

export class SaveBadDebt {
    public SaleID: number;
    public ReasonID: number;
    public Notes: string;
}

export class SaveVoided {
    public SaleID: number;
    public ReasonID: number;
    public Notes: string;
}

// export class ReceiptBranchInfo {
//     public Address: string;
//     public Email: string;
//     public Phone: string;
//     public TaxNumber: string;
//     public Website: string;
// }

export class RefundSaleDetail {

    public ItemList: RefundSaleItems[] = [];
    public Reasons: RefundReasonList[] = [];
    public RefundMethods: RefundMethodList[] = [];

    public Adjustment: number;
    public AppliedTaxNames: string;
    public BalanceAmount: number;
    public BranchID: number;
    public BranchName: string = "";
    public CashierName: string = "";
    public CompanyID: number;
    public CompanyName: string;
    public CurrencySymbol: string;
    public CustomerID: number;
    public CustomerName: string;
    public InvoiceDate: string;
    public InvoiceDueDate: string = "";
    public RefundedServiceChargesAmount: number;
    public RefundedTipAmount: number;
    public RemainingServiceChargesAmountThatCanBeRefunded: number;
    public RemainingTipAmountThatCanBeRefunded: number;
    public RemainingTotalAmountThatCanBeRefunded: number;
    public ReasonID: number;
    public SaleDiscountAmount: number;
    public SaleID: number;
    public SaleInvoiceNumber: string;
    public SaleNote: string;
    public SaleStatusTypeID: number;
    public SaleStatusTypeName: string;
    public ServiceChargesAmount: number;
    public SaleInvoiceID: number;
	public SubTotalPrice: number;
	public TipAmount: number;
    public TotalAmountPaid: number;
    public TotalDue: number;
    public TotalSaleAmount: number;
    public TotalSaleRefundedAmount: number;
    public TotalTaxAmount: number;

     //for credit invoices
     public TotalRefundedAmount: number;
     public InvoiceStatus: string;
     public InvoiceNumber: string;

    // Used on Front End
    public IsSelectedServiceCharges: boolean = true;
    public IsSelectedTip: boolean = true;
	 public IsSelectedTax: boolean = true;
    public IsValidRefundedServiceChargesAmount : boolean = true;
    public IsValidRefundedTipAmount : boolean= true;
	public IsValidRefundedTaxAmount : boolean= true;
    ///for reward points
    public RewardPointsEarned: number;
   public CustomerRewardPointsFundamentals =  new customerRewardPointsFundamental();
}

export class customerRewardPointsFundamental {
    BranchID: number;
    CustomerID: number;
    CustomerRewardProgramID: number;
    RewardProgramID: number;
    RewardProgramName: string;
    MinimumPointsRequiredtoRedeem: number;
    MaximumPointsRedeemLimitInPercentage: number;
    PointsBalance: number;
    PointBalanceRedemptionValue: number;
    RewardProgramRedemptionPoints: number;
    RewardProgramRedemptionValue: number;
    SkippedRewardProgramID: number;
}

export class RefundMethodList {
    public PaymentGatewayID: number;
    public PaymentGatewayName: string = "";
    public TotalAmountPaid: number = 0;
}

export class RefundReasonList {
    public ReasonID: number;
    public ReasonName: string = "";
}

export class RefundSaleItems {
    public ItemsDetail: RefundedItemsList;
    public AssignedToStaffName: string = "";
    public AssignedToStaffID: number;
    public CleaningTimeInMinute: string = "";
    public Cost: number;
    public CustomerMembershipID: number;
    public Duration: string = "";
    public EndDate: string = "";
    public EndTime: string = "";
    public ImagePath: string = "";
    public IsFree: boolean;
    public IsInventoryAdded: boolean;
    public IsItemCancelled: boolean;
    public IsItemRescheduled: boolean;
    public IsItemNoShow: boolean;
    public IsItemBenefitReverted: boolean;
    public IsMembershipBenefit: boolean;
    public IsRefunded: boolean;
    public ItemCancellationCharges: number;
    public ItemRescheduleCharges:number;
    public ItemCategoryID : number;
    public ItemCategoryName: string;
    public ItemDiscountAmount: number;
    public ItemTaxAmount: number;

	public ItemID: number;
	public ItemName: string = "";
    public ItemVariantName: string;
	public ItemPrice: number;
	public ItemQty: number;
	public ItemReScheduleCount: number;
	public ItemTotalPrice: number;
	public ItemTypeID: number;
	public ItemTypeName: number;
    public ItemTotalDiscountedPrice: number;
    public ItemPricePerUnit: number
	public MembershipPaymentInterval: string = "";
	public MembershipPaymentName: string = "";
	public NoShowCharges: number;
	public PaymentNumber: number;
	public RecurringInterval: number;
	public RefundedAmount: number;
	public RefundedQty: number;
    public RemainingItemAmountThatCanBeRefunded: number;
    public RemainingItemQtyThatCanBeRefunded: number
	public SaleDetailID: number;
	public StartDate: string = "";
	public StartTime: string = "";
	public TotalTaxPercentage: number;
    public InventoryAddedQty: number;
    public RemainingItemQtyAddedToInventoryRefunded: number;
    public RemainingItemQtyAddedToInventoryThatCanBeRefunded: number;


    // Used on Front End
    public IsLineItemDiscount: boolean = false;
    public RemainingItemQtyRefunded: number;
    public ShowBookingTime: boolean;
    public IsDisabledInventoryAdded: boolean;
    public IsDisabledRefunded: boolean;
    public IsSelected: boolean = true;
    public hasItemRefundAmountValid: boolean = true;
    public hasAddedToInventoryValid: boolean = true;
    public IsShowBenefitReturn: boolean = true;
    /////
    public HasTrackInventory: boolean;
}

export class SaveRefundDetail {
    public ReasonID: number;
    public CustomerID: number;
    public PaymentGatewayID: number;
    public Note: string = "";
    public RefundAmount: number;
    public SaleID: number;
    public IsFlatAmountRefund: boolean;
    public isRevertAllMembershipBenefits: boolean = false;
    public RefundedTipAmount: number;
    public RefundedServiceChargesAmount: number;
    public RemainingServiceChargesAmountThatCanBeRefunded: number;
    public RemainingTipAmountThatCanBeRefunded: number;
    public ItemList: RefundedItemsList[] = [];
}

export class SaveOverPaidRefundDetail {
    public SaleInvoiceID: number;
    public PaymentGatewayID: number;
    public Note: string = "";
    public CustomerID: number;
    public ReasonID: number;
}

export class RefundedItemsList {
    public IsInventoryAdded: boolean;
    public IsRefunded: boolean;
    public SaleDetailID: number;
    public RefundedAmount: number;
    public RefundAmount: number = 0;
    public RefundedQty: number;
    public RefundQty: number;
    public IsBenefitReverted: boolean;
    public InventoryAddedQty: number;

}


export class InvoiceHistoryDetail {

    public CustomerName: string;
    public TotalAmount: number;
    public SaleCurrentStatus: string;
    public PaymentGatewayName: string;
    public TotalPrice: number;
    public TotalAmountPaid: number;
    public BalanceAmount: number;
    public IvoiceHistoryDetail: IvoiceHistory[] = [];
}

export class IvoiceHistory {
    public CreatedOn: string;
    public TotalAmountPaid: number;
    public BalanceAmount: number;
    public SaleID: number;
    public SaleStatusTypeName: number;
    public TotalBalance: number;
    public SaleStatusTypeID: number;
    public hasAmountPaid: boolean;
    public hasWrittenOff: boolean;
    public Reason: string;
    public Note: string;
    public IsMembershipSale: boolean;
    public RefundAllow: boolean;
    public WrittenOffAllow: boolean = true;

}

export class SalePaymentModeViewModel {
    paymentGatewayID: number;
    isStripeTerminal: boolean = false;
    saleTypeID: number;
    amount: number;
    cashReceived: number;
    isSaveCard: boolean = false;
    isSaveInstrument: boolean = false;
}

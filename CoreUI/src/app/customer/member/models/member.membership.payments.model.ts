
export class MemberMembershipPayments {
      public BillNo: string;
      public CollectedDate: string;
      public CollectionDate: string;
      public CreatedOn: string;
      public CustomerID: number;
      public CustomerMembershipID: number;
      public CustomerMembershipPaymentID: number;
      public CustomerName: string;
      public IsManualTransaction: boolean;
      public MembershipID: number;
      public MembershipName: string;
      public MembershipPaymentName: string;
      public MembershipPaymentTypeID: number;
      public ModifiedOn: Date;
      public PaymentGatewayID: number;
      public PaymentGatewayName: string;
      public PaymentReferenceNo: string;
      public PaymentStatusTypeID: number;
      public PaymentStatusTypeName: string;
      public Price: number;
      public ProRataPrice: number;
      public SaleTypeID: number;
      public SaleTypeName: string;
      public TotalTaxPercentage: number;
      public StatusCode: string;
      public StatusMessage: string;
      public CanDoRetry: boolean;
      // Used on Front to Calculate Price + ProRataPrice + Tax
      public TotalAmount: number;
      public TemporaryDisable: boolean = false;
      public Installment: number;
      public SaleNo: string;
      public HasActivityLog: boolean;
}

export class MemberPaymentSearch {
      public CustomerID: number;
      public MembershipID: number;
      public CustomerMembershipID: number;
      public PaymentGatewayID: number;
      public PaymentStatusTypeID: number;
      public DateFrom: string;
      public DateTo: string;
      public PageNumber: number = 1;
      public PageSize: number;
}

export class MembershipTranscation {
      public CustomerMembershipPaymentID: number;
      public MembershipID: number;
      public CustomerMembershipID: number;
      public CustomerPaymentGatewayID: number;
      public PaymentGatewayID: number;
      public Price: number;
      public CollectionDate: any;
      public Notes: string = "";
      public MembershipPaymentTypeID: number;
      public IsAdjustFuturePayment: boolean;
      public SaleTypeID: number;
      public ProRataPrice: number = 0;
      public TaxAmount: number;
      public AppliedTaxNames: string;
      public IsProRata: boolean;
}

export class Membership {
      public CustomerMembershipID: number;
      public MembershipID: number;
      public MembershipName: string;
      public IsAutoRoll: boolean;
      public TotalTaxPercentage: number;
      public DurationTypeID: number;
      public EndDate: any;
      public MembershipStatusTypeID: number;
      public StartDate: any;
      public AppliedTaxNames: string;
}

export class PaymentGateway {
      public CustomerPaymentGatewayID: number;
      public InstrumentLastDigit: string;
      public InstrumentName: string;
      public PaymentGatewayID: number;
      public PaymentGatewayName: string;
      public PaymentProcessingDays: number;
      public SaleTypeID: number;
      public SaleTypeName: string;
}

export class PaymentStatus {
      public PaymentStatusTypeId: number;
      public PaymentStatusTypeName: string;
}

export class TransactionPaymentDetail {
      public CustomerMembershipPaymentID: number;
      public CustomerMembershipID: number;
      public CustomerPaymentGatewayID:number;
      public CustomerID: number;
      public SaleTypeID: number;
      public PaymentGatewayID: number;
      public MembershipName: string;
      public MembershipPaymentName: string;
      public Price: number;
      public ProRataPrice: number;
      public TotalTaxPercentage: number;
      public CollectionDate: Date;
      public Notes: string;

      // Used on Front End
      public TaxAmount: number;
      public TotalAmount: number
}

export class PayTransaction {
      public CustomerMembershipPaymentID: number;
      public CustomerID: number;
      public SaleTypeID: number;
      public Notes: string;
      public PaymentGatewayID: number;
      public CustomerPaymentGatewayID: number;
      public PaymentGatewayToken: string;
}

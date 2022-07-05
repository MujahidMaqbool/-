
export class MemberMembership {
    public MembershipID: number;
    public CustomerMembershipID: number = 0;
    public MembershipName: string;
    public IsAutoRoll: boolean;
    public TotalTaxPercentage: number;
}

export class MemberMembershipPaymentsDetail {
    public CustomerMembershipPaymentID: number;
    public CustomerMembershipID: number;
    public PaymentStatusTypeID: number;
    public CollectionDate: string;
    public PaymentStatusTypeName: string;
}

export class MembershipFreezeDetail {

    public CustomerMembershipID: number;
    public CustomerPaymentGatewayID: number;
    public PaymentStatusTypeID: number = 2;
    public CustomerID: number;
    public MembershipID: number;
    public Intervals: number = 1;
    public Freeze: boolean = true;
    public OpenEndedSuspension: boolean = false;
    public IsGoCardless: boolean = false;
    public StartCollectionDateID: number;
    public Price: number;
    public PaymentGatewayID: number;
    public IsManualTransaction: boolean = true;
    public Notes: string;
    public SuspendMembershipPayment: SuspendMembershipPayment[] = [];
    public MemberMembershipFreezePayment: MemberMembershipFreezePayment;
}

export class SaveMembershipFreezeDetail {
    public CustomerID: number;
    public CustomerMembershipID: number;
    public CustomerMembershipPaymentID: number;
    public CustomerPaymentGatewayID: number;
    public MembershipID: number;
    public IsFreeze: boolean = true;
    public IsOpenEnded: boolean;
    public Intervals: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public Price: number;
    public CollectionDate: any;
    public Notes: string;
}

export class SuspendMembershipPayment {
    public PaymentStatusTypeID: number = 2;
    public CustomerMembershipPaymentID: number;
}

export class MemberMembershipFreezePayment {
    public CustomerMembershipPaymentID: number = 0;
    public CustomerMembershipID: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number = 0;
    public PaymentStatusTypeID: number = 0;
    public MembershipPaymentTypeID: number = 1;
    public SinglePaymentCollectionTypeID?: number = null;
    public IsManualTransaction: boolean = true;
    public Price: number;
    public ProRataPrice: number;
    public TotalTaxPercentage: number;
    public CollectionDate: Date;
    public CollectedDate: Date;
    public Notes: string;
}
import { Card, DirectDebit, StripeTerminal } from "./member.gateways.model";
import { CustomerBillingDetail } from "src/app/models/common.model";
import { CustomFormView } from "src/app/models/customer.form.model";

export class MemberMembership {
    /* Shared */
    public CustomerID: number;
    public CustomerMembershipID: number;
    public EndDate: Date;
    public ImagePath: string;
    public IsAutoRoll: boolean;
    public IsOpenEndedFreeze: boolean;
    public MembershipID: number;
    public MembershipName: string;
    public MembershipStatusTypeID: number;
    public MembershipStatusTypeName: string;
    public StartDate: Date;
    public MembershipCancellationReasonTypeName = "";
    public MembershipCancellationReason: "";
    public MembershipCancellationReasonTypeID: number;
    public HasActivityLog : boolean = false;
}
export class MemberShipSearch {
    public CustomerID: number;
    public MembershipID: number;
    public CustomerMembershipID:number;
    public MembershipStatusTypeID: number;
    public DateFrom: string;
    public DateTo: string;
    public PageNumber: number = 1;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
}
export class MembershipStatus {
    public MembershipStatusTypeID: number;
    public MembershipStatusTypeName: string;
}
export class SaveMemberMembershipPlan {
    public CustomerID: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public InstrumentID: number;
    public ReplaceMembershipID: number;
    public ReplaceCustomerMembershipID: number;
    public MembershipID: number;
    public StartDate: Date;
    public MembershipPaymentPlanDetailList: MembershipPaymentPlanDetail[];
}

export class GetMemberMembershipPlan {
    public MembershipID: number;
    public StartDate: any;
    public MembershipPaymentPlanDetailList: MembershipPaymentPlanDetail[];
}


export class MembershipPaymentPlanDetail {
    public MembershipPaymentTypeID: number;
    public MembershipPaymentID: number;
    public MembershipPaymentName: string;
    public Price: number;
    public CollectionDate: any;
    public SkipProRata: boolean;
}

export class MembershipPaymentSummary {
    public MembershipName: string;
    public ValidFrom: Date;
    public ValidTo: Date;
    public TotalPrice: number;
    public TotalTaxPercentage: number;
    public MembershipPaymentSummaryList: MembershipPaymentSummaryDetail[];
}

export class MembershipPaymentSummaryDetail {
    public MembershipPaymentID: number;
    public MembershipPaymentTypeID: number;
    public SinglePaymentCollectionTypeID: number;
    public MembershipPaymentName: string;
    public CollectionDate: any;
    public DurationTypeID: number;
    public Price: number;
    public ProRataPrice: number;
    public TotalPrice: number;
    public DueDate: any;
    // Used on Front End
    public TaxAmount: number;
}

export class MembershipsFundamentals {
    public MembershipID: number;
    public MemberMembershipID: number;
    public CustomerMembershipID:number;
    public MembershipName: string;
    public IsMembershipLimitReached;
    public RestrictedCustomerTypeNames: string="";
    public MembershipPaymentPlanList: MembershipPaymentPlan[];
}

export class MembershipPaymentPlan {
    public MembershipPaymentID: number;
    public MembershipPaymentTypeID: number;
    public SinglePaymentCollectionTypeID: number;
    public MembershipPaymentName: string;
    public Price: number;
    public IsProRata: boolean;

    // Used on Front END
    public CollectionDate: Date;
    public SkipProRata: boolean;
}

export class SaveMemberMembership {
    public CustomerID: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public ReplaceMembershipID: number;
    public ReplaceCustomerMembershipID: number;
    public MembershipID: number;
    public StartDate: Date;
    public Notes: string;
    public CustomerPaymentGatewayID: number;
    public OldMembershipID: number;
    public Card: Card;
    public DirectDebit: DirectDebit;
    public PublicToken: string;
    public AccountDetail: AccountDetail;
    public isSkippedRewardProgram:boolean;
    public customerViewedRewardProgramID:number;
  //  public StripeTerminal: StripeTerminal;
    public MembershipPaymentPlanDetailList: MembershipPaymentPlanDetail[];
    public GatewayCustomerViewModel:GatewayCustomerViewModel;
    public MembershipForms: CustomFormView[] = new Array<CustomFormView>();
}


export class EditMemberMembership {
  public StartDate: Date;
  public EndDate: Date;
  public CustomerMembershpiID: number;
  public Description: string = "";
  public MembershipName:string;
}

export class AccountDetail {
    public ID: string;
    public Name: string;
    public Mask: string;
    public SubType: string;
    public Type: string;
}


export class ViewPaymentSummary {
    public MembershipID: number;
    public SaleTypeID: number;
    public CustomerID: number;
    public PaymentDate: any;
    public TotalAmount: number;
    public TotalTaxPercentage: number;
    public TaxAmount: number;
    public NextPaymentAmount: number;
    public NextPaymentProRata: number;
    public NextPaymentInterval: number;
    public NextPaymentDate: any;
    public Notes: string;
    public PaymentList: ViewPayment[];
    public BillingDetails?: CustomerBillingDetail;
    public AccountDetails?: AccountDetails;
    public CustomerGatewayId:number;
}

export class AccountDetails {
    public CardNumber: string;
    public NameOnCard: string;
    public Expiry: string;

    public AccountHolderName: string;
    public AccountNumber: string;
    public BranchCode: string;
    public BankCode: string;
}

export class ViewPayment {
    public PaymentName: string;
    public Price: number;
    public ProRataPrice: number;
    public TotalPrice: number;
}

export class CancelMembership {
    public CustomerID: number;
    public CustomerMembershipID: number;
    public ScheduledCancellationDate: any;
    public CancelMembershipNow: boolean = true;
    public MembershipCancellationReason = "";
    public MembershipCancellationReasonTypeID: number;
}
export class CancelMembershipReasons {
    public MembershipCancellationReasonTypeName: "";
    public MembershipCancellationReasonTypeID: number;
}
export class GatewayCustomerViewModel {
    public GatewayCustomerID: string;
    public PaymentMethod: string;
    public Brand: string;
    public LastDigit: string;

}

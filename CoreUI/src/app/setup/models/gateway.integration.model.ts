export class SaveIntegration {
    public Scope: string;
    public State: string;
    public Code: string;
}

export class BranchGatwayIntegration {
    public PaymentGatewayID: number;
    public PaymentGatewayName: string;
    public WidgetDefaultPaymentGatewayId: number;
    public WidgetCheckOutPaymentGatewayIDs: Array<number> = [];
}


export class StripeTerminal {
    constructor() { };

    public RegistrationCode: string = "";
    public Label: string = "";

}

export class StripeReader {
    constructor() { };

    public RegistrationCode: string;
    public Label: string;

}

export class PaymentSettings {
    public BranchID: number;
    public PaymentGatewayID: number;
    public CheckoutPaymentGatewayIDs: any[];

    public DontRequireMemberPaymentMethodwhenTotalZero: boolean;
    public DontRequireClientPaymentMethodwhenTotalZero: boolean;
    public DontRequireMembershipPaymentMethodWhenTotalZero : boolean;
    public IsHomeAddressNotRequired : boolean;
    public IsGuestCheckoutEnabled: boolean;

    // public AllowPartPayment: boolean;
    public AllowPartPaymentOnCore: boolean;
    public AllowPartPaymentOnWidget: boolean;

    // public IsPartialPaymentCore: boolean;
    public IsPartialPaymentWidgetAndApp: boolean;
    public WidgetPartPaymentFriendlyName: string;
    public PartialPaymentLable: string;
    public WidgetPartPaymentForMember: any;
    public WidgetPartPaymentForNonMember: any;

    public IsSplitPaymentsEnabledOnCore: boolean;
    public IsSplitPaymentsEnabledOnWidgetAndApps: boolean;

    public RewardProgramPaymentOnCore : boolean;
    public RewardProgramPaymentOnWidgetAndApp : boolean;

}
export class ConnectStripeAccount {
        email: string;
        redirectUrl: string
}
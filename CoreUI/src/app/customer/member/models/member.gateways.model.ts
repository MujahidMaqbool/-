export class CustomerPaymentGateway {
    public CustomerPaymentGatewayID: number;
    public SaleTypeID: number;
    public SaleTypeName: string;
    public PaymentGatewayID: number;
    public PaymentGatewayName: string;
    public CreatedOn: Date;
    public Brand: string;
    public Last4: string;
    public IsDefault: boolean;
    public MandateStatusName: string;
    public StatusCode: string;
    public StatusMessage: string;
    public IsArchived: boolean;
}

export class GatewayAccountSearch {
  public SortIndex: number = 1;
  public SortOrder: string = "DESC";
  public CustomerID: number = 0;
}

export class SaveCustomerGateway {
    public CustomerID: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public Card?: Card;
    public DirectDebit?: DirectDebit;
    public PublicToken: string;
    public AccountDetail?: StripeDDAccount;
}

export class AuthenticateCard {
    public CustomerID: number;
    public SaleTypeID: number;
    public PaymentGatewayID: number;
    public CardToken: string;
    public IsSaveCard: boolean;
    public CustomerPaymentGatewayID: number;

}

export class StripeCardAuthentication {
    public CustomerID: number;
    public SaleTypeID: number;
    public AppSourceType: string;
    public PaymentGatewayID: number;
    public CardToken: string;
    public IsSaveCard: boolean;
    public CustomerPaymentGatewayID: number;
}

export class Card {
    public PaymentGatewayToken: string;
}

export class DirectDebit {
    public AccountHolderName: string;
    public AccountNumber: string;
    public BankCode: string;
    public BranchCode: string;
    public CountryCode: string;
    public AccountType: string;
}

export class StripeTerminal {
    public CustomerPaymentGatewayID: number;
    public PaymentGatewayID: number;
    public SaleTypeID: number;
}

export class BranchPaymentGateway {
    public PaymentGatewayID?: number;
    public PaymentGatewayName?: string;
    public PaymentProcessingDays?: number;
    public SaleTypeID?: number;
    public SaleTypeName?: string;
}

export class StripeDD {
    public CustomerId: number;
    public PublicToken: string;
    public IsAuthorized: boolean;
    public Account:StripeDDAccount = new StripeDDAccount();
}
export class StripeDDAccount {
    public ID: string;
    public Name: string;
    public Mask: string;
    public SubType: string;
    public Type: string;
}

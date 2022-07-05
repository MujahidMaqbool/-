// export class GoCardlessCreateToken {
//     public PublishableAccessToken: string;
//     public AccountNumber: string;
//     public BankCode: string;
//     public BranchCode: string;
//     public IBAN: string;
//     public AccountHolderName: string;
//     public BankAccountCountryCode: string;

//     public GivenName: string;
//     public FamilyName: string;
//     public AddressLine1: string;
//     public City: string;
//     public Region: string;
//     public PostalCode: string;
//     public CountryCode: string;
//     public AccountType: string;
// }

export class SaveGoCardless {
    public AccountHolderName: string;
    public AccountNumber: string;
    public PrefixAccountNumber: string;
    public BankCode: string;
    public BranchCode: string;
    public CountryCode: string;
    public Check: string;
    public AccountType: string;
}

export class SavedAccount {
    // public Id: string;
    // public BankName: string;
    // public Ending: string;
    public CustomerPaymentGatewayID: number;
    public InstrumentName: string;
    public InstrumentLastDigit: string;

    // Used on front end
    public Title: string;
}
export class SEPACountry {
    
    public CountryID: number;
    public CountryName: string;
    public ISOCode: string;
    public PhoneCode: string;
    
}

export class SEPACountryAccountDetail {
    
    public CountryCode: string;
    public BankCodeMax: number;
    public BranchCodeMax: number;
    public AccountCodeMax: number;
    public CheckMax: number;
}

export class SEPADashDigit {
    public CountryCode: string;
    public DashAfterDigit: SEPADashAfterDigit[];
}
export class SEPADashAfterDigit {
   // public BankCodeDigit: number;
    public BranchCodeDigit: number;
    public AccountCodeDigit: number;
    public AccountCheckDigit: number;
    public SpaceRequired: boolean = false;
    
}


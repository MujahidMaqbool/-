export class CompanyDetails {
    constructor() { };
    public CompanyID: number = 0;
    public CountryID: number = 0;
    public StateCountyName : number = 0;
    public CityName: string;
    public CurrencyID: number = 0;
    public CompanyLanguageID: number = 0;
    public CompanyName: string = "";
    public NTN: number;
    public RegNo: number;
    public Email: string;
    public Website: string;
    public Phone1: string;    
    public Fax: string;
    public Address1 : string;
    public Address2 : string;
    public PostalCode: string;
    public ImageFile: string;
    public ImagePath: string;
    public IsActive: boolean = true;
    public ContactName: string = "";
    public ContactPhone: string;
    public ContactAddress: string;
    public ContactEmail: string;
    public AppleStoreURL: string;
    public GooglePlayStoreURL: string;
}

export class CompanyInfo {
    public CompanyID: number;
    public ImagePath: string;
    public CompanyName: string;
    public Email: string;
    public Phone1: string;
    public Address: string;
}

export class CompanyDetailsErrorMessages {
    public readonly getCompanyDetails: string = 'There was some error while getting company details. Please try later';
    public readonly getFundamentals: string = 'There was some error while getting dropdowns. Please try later';
    public readonly saveCompanyDetails: string = 'Company Details could not be saved. Please try later';
}
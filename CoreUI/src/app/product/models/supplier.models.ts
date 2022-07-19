export class BranchList{
    public BranchID : number;
    public BranchName: string;
    public BranchCode : number;
    public CompanyID : number;
}

export class SupplierViewModel{
    public IsActive : boolean = false;
    public SupplierID : number = 0;
    public SupplierName?: string = "";
    public CompanyID	: number;
    public Email? :string = "";
    public Website?:	string = "";
    public Description?:	string = "";
    public ContactTitle?: string = "";
    public ContactFirstName?	: String = "";
    public ContactLastName?:	string = "";
    public ContactPhone?:string = "";
    public ContactMobile?:string = "";
    public AddressLine1?	:string = "";
    public AddressLine2?: string = "";
    public CityName?: string = "";
    public PostalCode?: string = "";
    public StateCountyName	:string = "";
    public CountryID	:number = 0;
    public HasBranchPermission: boolean = true;
    public AppSourceTypeID: number;
    public IsMultiBranch : boolean = false;
    public SupplierBranchVM :SupplierBranch[] = [];
}

export class SupplierBranch{
    public BranchName?: string;
    public BranchID : number;
    public IsActive: boolean = false;
    public IsIncluded : boolean = false;
}

export class SupplierSearchParameter {
    public SupplierName : string = '';
    public TypeID: number = 0;
    public BranchID: number = 0;
    public StatusID: number = null;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 0;
    public SortOrder: string = "DESC";
}

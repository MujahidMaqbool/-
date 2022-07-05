export class SaleReportSearchParameter {
    public SaleSourceTypeID: number = 0;
    public ItemTypeID: number = 0;
    public SaleTypeID: number = 0;
    public DateFrom: string =  "";
    public DateTo: string =  "";
    public StaffID?: number = 0;
    public CustomerID?: number = 0;
    public ProductID?: number = 0;
    public ProductCategoryID:number = 0;
    public ServiceID?: number = 0;
    public ServiceCategoryID: number = 0;
    public ClassID?: number = 0;
    public ClassCategoryID: number = 0;
    public PaymentGateWayID: number = 0;
    public MembershipID : number = 0;
    public BranchID : number = 0;
    public PaymentStatusTypeID: number = 0;
    public BrandID: number = 0;
    public ProductName: string = "";
}


export class Procduct {
    public ProductID:  number;
    public ProductName: string = "";
    public ProductCategoryID:  number;
}

export class ProductCategory {
    public ProductCategoryID?: number;
    public ProductCategoryName: string = "";
}


export class Service {
    public ServiceID:  number;
    public ServiceName: string = "";
    public ServiceCategoryID:  number;
}

export class ServiceCategory {
    public ServiceCategoryID: number;
    public ServiceCategoryName: string = "";
}
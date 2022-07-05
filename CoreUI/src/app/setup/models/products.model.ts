
export class Products {
    constructor() { };

    public ProductID: number = 0;
    public ProductCategoryID: number = null;
    public ProductName: string = "";
    public ProductCategoryName:string = "";
    public TotalPrice: number = 0;
    public ProductCode: string = "";
    public Price: number = 0;
    public Cost: number = 0;
    public ImageFile: string = "";
    public ImagePath: string = "";
    public Description: string = "";
    public IsActive: boolean = true;
    public IsOnline: boolean = false;
    public IsHidePriceOnline: boolean = false;
    public IsFeatured: boolean = false;
    public IsSaleSuspended: boolean = false;
    public ItemTax : SaveTax[] = [];
    public RestrictedCustomerTypeID: string = "";

}

export class SearchParameter
{
    public productName: string = "";
    public productCategoryID: number = 0;
    public IsActive: number = 1;
}

export class SaveTax
{
    public TaxID: number = 0;
}

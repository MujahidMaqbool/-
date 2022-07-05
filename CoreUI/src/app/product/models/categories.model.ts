export class ProductCategory {
    public ProductCategoryID: number;
    public ProductCategoryName: string;
    public AppSourceTypeID:number;
    public Description: string;
    public IsActive: boolean;
    public ImageFile: string;
    public ImagePath: string;
    public HasBranchPermission:boolean = true;
}

export class Branch {
    public BranchID: number;
    public BranchName: string;
    public IsActive: boolean;
    public IsIncluded: boolean;
    // public IsInActiveDisabled: boolean = false;
}

export class SearchCategory {
    public CategoryTypeID: number = null;
    public CategoryName: string;
    public CategoryStatusID: number = null;
    public appSourceTypeID: number = 1;
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number;
    public SortOrder: string;
}

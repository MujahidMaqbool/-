export class InventoryAdjustStock {
    public currentStock: number;
    public newStock: number;
    public adjustStock: number = null;
    public adjustmentReason: string = null;
    public stockAdjustmentStatusID: boolean;
    public productVariantBranchIDList: Array<any> = [];
    // public IsInActiveDisabled: boolean = false;
}

export class InventoryDetail {
    public ProductCode: string;
    public ProductID: number;
    public CurrentStock: number;
    public RetailValue: number;
    public ProductName: string;
    public TotalCurrentStock : number;
    public TotalRetailValue : number;
    public ProductVariants: Array<ProductVariants> = [];
}

export class ProductVariants {
    public BranchID: string = null;
    public ProductVariantName: string;
    public CurrentStock: number;
    public RetailValue: number;
    public ProductVariantID: number;
    public ProductVariantBranches: Array<ProductVariantBranches> = [];
}

export class ProductVariantBranches {
    public BranchID: number;
    public BranchName: string;
    public CurrentStock: number;
    public ProductVariantBranchID: number;
    public ProductVariantID: number;
    public RetailValue: number;
    public StockValue: number;
    public isSelected : boolean = false;
}
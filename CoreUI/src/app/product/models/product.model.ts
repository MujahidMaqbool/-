export class SaveProductModel {
    public ProductID: number;
    public ProductName: string
    public ProductClassificationID: number;
    public ProductCategoryID: number;
    public BrandID: number;
    public RestrictedCustomerTypeIDs: string;
    public Description: string;
    public HasBranchPermission: boolean;
    public AllowBranchEditPrice: boolean;
    public AllowBranchTrackInventory: boolean;
    public ProductMediaVM: ProductMediaViewModel[] = []
    public ProductBranchPermissionVM: ProductBranchPermissionViewModel[] = [];
    public ProductVariantBranchVM: SaveProductVariantBranchViewModel[] = [];
    public ProductVariantPackagingVM: ProductVariantPackagingViewModel = new ProductVariantPackagingViewModel();
    public AppSourceTypeID: number = null;
  }

  export class ProductMediaViewModel {
    public ProductMediaID: number;
    public ProductID: number;
    public ImageFile: string;
    public ImagePath: string;
    public IsDefault: boolean;

    //for FE use
    public ServerImageAddress: string = "";
  }

  export class ProductBranchPermissionViewModel {
    public ProductBranchPermissionID: number;
    public ProductID: number;
    public BranchID: number;
    public BranchName: string;
    public IsActive: boolean;
    public IsOnline: boolean;
    public IsHidePriceOnline: boolean;
    public IsFeatured: boolean;
    public HasTrackInventory: boolean;
    public HasShipping: boolean;
    public IsIncluded: boolean;
  }

  export class SaveProductVariantBranchViewModel {
    constructor() { };
    public ProductVarientBranchID: number;
    public ProductVariantID: number;
    public BranchID: number;
    public BranchName: string;
    public Barcode: string
    public Sku: string
    public SupplierID: number;
    public SupplierName: number;
    public SupplierCode: string
    public ReorderThreshold: number;
    public ReorderQuantity: number;
    public SupplierPrice: number;
    public Price: number;
    public TotalTaxPercentage: number;
    public TotalPrice: number;
    public ItemTaxVM: ItemTaxViewModel[] = [];

    ///for FE use only
    public CollapseItemTaxVM: ItemTaxViewModel[] = [];
  }

  export class ProductVariantBranchViewModel {
    constructor() { };
    public ProductVarientBranchID: number;
    public ProductVariantBranchID : number;
    public ProductVariantID: number;
    public BranchID: number;
    public BranchName: string;
    public Barcode: string;
    public SKU: string;
    public SupplierID: number;
    public SupplierName: number;
    public SupplierCode: string
    public ReorderThreshold: number;
    public ReorderQuantity: number;
    public SupplierPrice: number;
    public Price: number;
    public TotalTaxPercentage: number;
    public TotalPrice: number;
    public isSelected: boolean;
    public Tax :string;
    public TaxIDs :string;
    public ItemTaxVM: ItemTaxViewModel[] = [];
    public IsPriceAndTaxUpdate : boolean = false;
    ///for FE use only
    public productVariantViewModel: ProductVariantViewModel[] = [];
    public CollapseItemTaxVM: ItemTaxViewModel[] = [];
    public PriceCheckBoxVM: ProductPriceCheckBoxViewModel = new ProductPriceCheckBoxViewModel();
  }

  export class ProductVariantViewModel {
    public ProductVariantID: number;
    public ProductVariantName: string;
    public ProductVariantBranchVM: ProductVariantBranchViewModel[] = [];
  }

  export class ProductPriceCheckBoxViewModel {
    public isBarCode: boolean = false;
    public isSKU: boolean = false;
    public isSupplier: boolean = false;
    public isSupplierCode: boolean = false;
    public isisSupplierPrice: boolean = false;
    public isRecordThreshold: boolean = false;
    public isReOrderQty: boolean = false;
    public isPrice: boolean = false;
    public isTax: boolean = false;
  }

  export class ItemTaxViewModel {
    public TaxID: number;
    public TaxName: string;
  }

  export class ProductVariantPackagingViewModel {
    public ProductVariantPackagingID: number;
    public ProductVariantID: number;
    public Weight: number;
    public WeightUnitID: number;
    public DimensionUnitID: number;
    public Length: number;
    public Width: number;
    public Height: number;
    public SizeVolume: number;
    public SizeVolumeUnitID: number;
  }

  export class ProductVariantPricingModel {
    ProductVariantBranchViewModel: any;
    constructor() { };
    public ProductVariantID: number;
    public ProductVariantName: string;
    public ProductName: string;
    public ProductVarianthVM: ProductVariantViewModel[] = [];
  }

  export class ProductSearchParameter {
    public ProductID: number
    public ProductName: string = null;
    public AppSourceTypeID: number = null;
    public ProductClassificationID: number = null;
    public ProductCategoryIDs: string = null;
    public BranchIDs: string = null;
    public BrandIDs: string = null;
    public IsActive: boolean = null;
    public IsOnline: boolean = null;
    public BusinessUseOnly: boolean = null;
    public HasTrackInventory: boolean = null;
    public SupplierIDs: string = null;
    public FromCreationDate: string = null;
    public ToCreationDate: string = null;
    public PageNumber: number;
    public PageSize: number;
  }

  export class SupplierDropDown {
    public SupplierID: number;
    public SupplierName: string;
    public BranchIDs = [];
  }

  export class HideAndShowFavouriteViewColumnProduct {
    isProductColumn: boolean = true;
    isClassificationColumn: boolean = true;
    isTypeColumn: boolean = true;
    isCategoryColumn: boolean = true;
    isBrandColumn: boolean = true;
    isPurchaseRestrictionColumn: boolean = false;
    isVarientStatusColumn: boolean = true;
    isProductStatusColumn: boolean = true;

    isShowOnlineColumn: boolean = false;
    isHidePriceOnlineColumn: boolean = false;
    isFeaturedColumn: boolean = false;
    // isBusinessUseOnlyColumn: boolean = false;
    isTrackInventoryColumn: boolean = false;
    isShippingColumn: boolean = false;
    isBarCodeColumn: boolean = false;
    isSKUColumn: boolean = false;
    isSupplierColumn: boolean = false;
    isSupplerCodeColumn: boolean = false;
    isSupplierPriceColumn: boolean = false;
    isPriceColumn: boolean = false;
    isTaxColumn: boolean = false;
    isRetailPriceColumn: boolean = true;
    isCurrentStockColumn: boolean = true;
    isReorderQuantityColumn: boolean = false;
    isThresholdPointColumn: boolean = false;
    isStockValueColumn: boolean = false;
    isRetailValueColumn: boolean = false;
  }

  export class ProductPriceAndInventoryDetailModel {
    public ProductID: number;
    public PageNumber: number;
    public PageSize: number;
    public BranchID: number;
  }

  export class HideAndShowFavouriteViewColumnProductForFavView
   {
    isProductColumn: boolean = false;
    isClassificationColumn: boolean = false;
    isTypeColumn: boolean = false;
    isCategoryColumn: boolean = false;
    isBrandColumn: boolean = false;
    isBranchColumn: boolean = false;
    isPurchaseRestrictionColumn: boolean = false;
    isVarientStatusColumn: boolean = false;
    isProductStatusColumn: boolean = false;

    isShowOnlineColumn: boolean = false;
    isHidePriceOnlineColumn: boolean = false;
    isFeaturedColumn: boolean = false;
    isTrackInventoryColumn: boolean = false;
    isShippingColumn: boolean = false;
    isBarCodeColumn: boolean = false;
    isSKUColumn: boolean = false;
    isSupplierColumn: boolean = false;
    isSupplerCodeColumn: boolean = false;
    isSupplierPriceColumn: boolean = false;
    isPriceColumn: boolean = false;
    isTaxColumn: boolean = false;
    isRetailPriceColumn: boolean = false;
    isCurrentStockColumn: boolean = false;
    isReorderQuantityColumn: boolean = false;
    isThresholdPointColumn: boolean = false;
    isStockValueColumn: boolean = false;
    isRetailValueColumn: boolean = false;
  }


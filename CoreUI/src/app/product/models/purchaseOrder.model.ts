export class PurchaseOrderViewModel {
    AppSourceTypeID: number = 1;
    PurchaseOrderID: number;
    BranchID: number = null;
    SupplierID: number = 0;
    PurchaseOrderNumber: number;
    PurchaseOrderDate: any;
    ExpectedDeliveryDate?: any;
    PurchaseOrderName?: string = "";
    PurchaseOrderCreatedName?: string = "";
    BranchName: string = "";
    grnCreatedName?: string = "";
    Notes?:string;
    CreatedOn: Date;
    CreatedBy: Date;
    ModifiedOn: Date;
    ModifiedBy: Date;
    Type?:string;
    TotalPrice: number;
    PurchaseOrderDetails: PurchaseOrderDetailsViewModel[] = [];
    GrnList: any= [];
  }
  
  export class PurchaseOrderDetailsViewModel {
    PurchaseOrderDetailID?: number;
    PurchaseOrderID?: number;
    ProductVariantID: number;
    OrderQuantity: number = 1;
    SupplierPrice: number = 0;
    TotalPrice: number = 0;
    ReorderQuantity:number = 0;
    /** */
    CurrentStock: number;
    ReorderThreshold: number;
    SupplierCode: number;
    ProductName: string = "";
    ProductVariantName: string = "";
  }
  
  export class PurchaseOrderSearchParameter {
    PONumber: number ;
    GRNNumber: number ;    
    TypeID: number = 0;
    SupplierID: number = 0;
    StatusID: number = 0;
    PageNumber: number = 1;
    FromDate: Date ;
    ToDate: Date;
    PageSize: number = 10;
    }
  
    export class BranchList {
      BranchID: number;
      BranchName: String = "";
      BranchCode: number;
      CompanyID: number;
  
    }
  
    export class SuppliersList {
      SupplierID: number;
      SupplierName: String = "";
      BranchID: number;
    }
  
  export class ProductVariantsSearchParameter {
    ProductName: string = "";
    BranchID: number;
    SupplierID: number = null;
    PageNumber: number = 1;
    PageSize: number = 10; 
    ProductVariantIDs?: string;
  }
  
  export class ProductVariantItems {
    BranchID: number;
    CurrentStock: number;
    ProductID: number;
    ProductName: string = "";
    ProductVariantBranchID: number;
    ProductVariantID: number;
    ProductVariantName: "";
    ReorderThreshold: number;
    SupplierPrice: number = 1;
    SupplierCode: number;
    TotalPrice: number;
    OrderQuantity: number = 1;
    ReorderQuantity: number;
    IsSelected?: boolean = false;
  
  }
  
  export class EmailModel {
    PurchaseOrderID: number;
    SupplierEmail: Array<any> = [];
    DisplayName: string = "";
    Subject: string = "";
    Text: string = "";
    isGrn: number = 0;

  }
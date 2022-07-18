/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike } from "rxjs";

/********************* Material:Refference ********************/
// import { MatDialogService } from "@app/services/mat.dialog.service";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";

/********************** Services & Models *********************/
/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";
import { MatPaginator } from "@angular/material/paginator";
import { LoaderService } from "@app/services/app.loader.service";
import { AuthService } from "@app/helper/app.auth.service";

/* Models */
import { ApiResponse, DD_Branch } from "@app/models/common.model";
// import { AllProductSelectToggleModel } from "@app/models/all-select-toggle-model";
import { HideAndShowFavouriteViewColumnProduct, HideAndShowFavouriteViewColumnProductForFavView, ProductSearchParameter, SupplierDropDown } from "@app/product/models/product.model";

/********************** Component *********************/
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";
import { ProductPriceComponent } from "../product-price/product.price.component";
import { ViewProductComponent } from "../view/view.products.component";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";

/**********************  Configurations *********************/
import { Messages } from "@helper/config/app.messages";
import { ProductApi } from "@app/helper/config/app.webapi";
import { Configurations } from "@app/helper/config/app.config";
import { ProductFavouriteViewColumnNameString, Product_SearchFundamental_DropDowns, ProductAreaEnum, EnumSaleSourceType, ProductClassification, ENU_Package, } from "@app/helper/config/app.enums";
import { ENU_Permission_Module, ENU_Permission_Product, } from "@app/helper/config/app.module.page.enums";
// import { ProductVariantComponent } from "@app/product/product-variant/product.variant.component";
// import { EditInventoryComponent } from "@app/product/edit-inventory/edit.inventory.component";
import { DataSharingService } from "@app/services/data.sharing.service";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { ProductVariantComponent } from "../product-variant/product.variant.component";
import { AllProductSelectToggleModel } from "@app/product/models/all-select-toggle-model";
import { EditInventoryComponent } from "../edit-inventory/edit.inventory.component";

@Component({
  selector: "app-products-search",
  templateUrl: "./search.products.component.html",
})
export class SearchProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @ViewChild("productDateSearch") productDateSearch: DateToDateFromComponent;

  @ViewChild("allSelectedBranch") public allSelectedBranch: MatOption;
  @ViewChild("branchSelect") branchSelect: MatSelect;

  @ViewChild("selectProductCategory") public selectProductCategory: MatSelect;
  @ViewChild("allProductCategorySelected")
  public allProductCategorySelected: MatOption;

  @ViewChild("selectProductBrand") public selectProductBrand: MatSelect;
  @ViewChild("allProductBrandSelected")
  public allProductBrandSelected: MatOption;

  productAreaEnum = ProductAreaEnum;

  @ViewChild("selectProductSupplier") public selectProductSupplier: MatSelect;
  @ViewChild("allProductSupplierSelected")
  public allProductSupplierSelected: MatOption;
  // models and objects
  productSearchParameter: ProductSearchParameter = new ProductSearchParameter();
  favouriteViewColumnNameList: Array<any> = Configurations.ProductFavouriteViewColumnNameList;
  dummyFavouriteViewColumnNameList: Array<any> = Configurations.ProductDefaultViewColumnNameList;
  hideAndShowFavouriteViewColumn: HideAndShowFavouriteViewColumnProduct = new HideAndShowFavouriteViewColumnProduct();
  deepCopyFavouriteViewColumnNameList: Array<any> = [];

  selectedFavouriteViewColumn: Array<number> = [];
  Product_SearchFundamental_DropDowns = Product_SearchFundamental_DropDowns;
  allSelectToggleModel: AllProductSelectToggleModel = new AllProductSelectToggleModel();
  selectedBranchesList: Array<any> = [];

  branchList: Array<any> = [];
  StockAdjustmentReasons: Array<any> = [];
  statusList: Array<any> = [];
  productTypes: Array<any> = [];
  productClassifications: Array<any> = [];

  suppliers: Array<SupplierDropDown> = [];
  brands: Array<any> = [];
  productCategories: Array<any> = [];
  productList: Array<any> = [];
  copySuppliers: Array<SupplierDropDown> = [];
  copyBrands: Array<any> = [];
  copyProductCategories: Array<any> = [];

  selectedProductCategoryList: Array<any> = [];
  selectedProductBrandList: Array<any> = [];
  selectedProductSupplierList: Array<any> = [];
  currentBranchSubscription: SubscriptionLike;
  packageIdSubscription: SubscriptionLike;
  // locals
  appSourceTypeID = EnumSaleSourceType;
  messages = Messages;
  isDataExists: boolean = false;
  dateToPlaceHolder: string = "Product Created Date";
  dateFromPlaceHolder: string = "Product Created Date";
  dateToLabel: string = "Date Created (To)";
  dateFromLabel: string = "Date Created (From)";


  isAdvanceSearch: boolean = false;
  canResetEnable: boolean = false;
  showDropDownGrid: boolean;
  currencyFormat: string;
  productClassification = ProductClassification;
  enum_Product_ClassificationType = ProductClassification;
  allowedPages = {
    Save_Product: false,
    Delete_Product: false,
    View_Product: false,
    Pricing_Product:false,
    Inventory_Product:false,
  };

  isExceedPackage: boolean = false;
  package = ENU_Package;
  isMultiBranch:boolean = false;
  constructor(
    private _httpService: HttpService,
    private _dialog: MatDialogService,
    private _messageService: MessageService,
    private _loaderService: LoaderService,
    public _authService: AuthService,
    private _dataSharingService: DataSharingService,

  ) {
    this.getFundamentals();
    this.isMultiBranchID();
    this.getBranchInfo();

  }

  ngOnInit() {

    this.setPermission();
    this.getFavouriteView();
  }

  ngAfterViewInit() {
  }


  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
    this.currentBranchSubscription?.unsubscribe();
  }
  setPackagePermission(packageId: number) {
    switch (packageId) {
        case this.package.Full:
          this.isExceedPackage = true;
            break;
    }
    if(!this.isExceedPackage){
      //we are not showing supplier info if package is not exceed
      this.favouriteViewColumnNameList = this.favouriteViewColumnNameList.filter(i => i.FavouriteViewColumnIndex != 16 && i.FavouriteViewColumnIndex != 17 && i.FavouriteViewColumnIndex != 18  )
    }

    //we are not showing Type info if Single Branch
    if(!this.isMultiBranch){
      this.favouriteViewColumnNameList = this.favouriteViewColumnNameList.filter(i => i.FavouriteViewColumnIndex != 3 );
      this.dummyFavouriteViewColumnNameList = this.dummyFavouriteViewColumnNameList.filter(i => i.FavouriteViewColumnIndex != 3 )
    }
    this.deepCopyFavouriteViewColumnNameList = JSON.parse(JSON.stringify(this.favouriteViewColumnNameList));

  }
  //#Start method region

  setPermission() {
    this.allowedPages.Save_Product = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Save);
    this.allowedPages.Delete_Product = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Delete);
    this.allowedPages.View_Product = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_View);
    this.allowedPages.Pricing_Product = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Pricing_Save);
    this.allowedPages.Inventory_Product = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Inventory_Save);
  }

  onClickSearchProduct() {
    this.appPagination.pageNumber = 1;
    //this.appPagination.pageSize = 10;
    this.appPagination.paginator.pageIndex = 0;
    this.productSearchParameter.ProductName = this.productSearchParameter?.ProductName ? this.productSearchParameter.ProductName.trim() : this.productSearchParameter.ProductName;
    this.searchAllProducts()
  }

  /* Get Product list */
  searchAllProducts() {
    this.mapProductSearchFilters();
    let productSearch = JSON.parse(JSON.stringify(this.productSearchParameter));
    productSearch.PageNumber = this.appPagination.pageNumber;
    productSearch.PageSize = this.appPagination.pageSize;

    this._httpService.save(ProductApi.productSearch, productSearch).subscribe(
      (data: ApiResponse) => {
        this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.appPagination.totalRecords = data.TotalRecord;
          this.productList = data.Result;

        } else {
          this.appPagination.totalRecords = 0;
          this.productList = [];

        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Product")
        );
      }
    );
  }

  //here we map the data to search parameter objects
  mapProductSearchFilters() {
    if (this.allSelectToggleModel.isAllSelectedBranch) {
      this.productSearchParameter.BranchIDs = null
    }
    // else {
    //   this.productSearchParameter.BranchIDs = this.selectedBranchesList
    //     .map((x) => x.BranchID)
    //     .join(",");
    // }
    if (this.isAdvanceSearch) {
      if (!this.allSelectToggleModel.isAllSelectedProductCategory) {
        this.productSearchParameter.ProductCategoryIDs =
          this.selectedProductCategoryList
            .map((x) => x.ProductCategoryID)
            .join(",");
      } else {
        this.productSearchParameter.ProductCategoryIDs = null;
      }

      if (!this.allSelectToggleModel.isAllSelectedProductBrand) {
        this.productSearchParameter.BrandIDs = this.selectedProductBrandList
          .map((x) => x.BrandID)
          .join(",");
      } else {
        this.productSearchParameter.BrandIDs = null;
      }
      if (!this.allSelectToggleModel.isAllSelectedProductSupplier) {
        this.productSearchParameter.SupplierIDs =
          this.selectedProductSupplierList.map((x) => x.SupplierID).join(",");
      } else {
        this.productSearchParameter.SupplierIDs = null;
      }
    }
  }

  /* Get Search Fundamentals */
  getFundamentals() {
    this._httpService.get(ProductApi.getProductFundamentals).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.branchList = response.Result.Branches;
          this.StockAdjustmentReasons = response.Result.StockAdjustmentReasons;
          this.statusList = response.Result.StatusList;
          this.productTypes = response.Result.ProductTypes;
          this.productClassifications = response.Result.ProductClassifications;
          this.suppliers = response.Result.Suppliers;
          this.brands = response.Result.Brands;
          this.productCategories = response.Result.ProductCategories;

          this.copySuppliers = response.Result.Suppliers;
          this.copyBrands = response.Result.Brands;
          this.copyProductCategories = response.Result.ProductCategories;
          setTimeout(() => {
            this.searchAllProducts();

            // if (this.branchSelect) {
            //   this.branchSelect.options.forEach((item: MatOption) => {
            //     if (item.viewValue == "All")
            //       this.allSelectToggleModel.isAllSelectedBranch = true;
            //     item.select();
            //   });
            //   this.searchAllProducts();
            // }
          }, 100);

        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Product")
          );
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Product")
        );
      }
    );
  }

  /* apply and also save the view */
  onSaveAndApplyFavView(isFromApply) {
    this.mapFavView();

    var FavColumnArray = [];
    if (this.selectedFavouriteViewColumn.length > 0) {
      this.selectedFavouriteViewColumn.forEach((i) => {
        var findIndex = this.favouriteViewColumnNameList.find(x => x.FavouriteViewColumnIndex == i);
        if (findIndex) {
          FavColumnArray.push(findIndex)
        }
      })
    }

    AuthService.setFavViewProduct(FavColumnArray as any);

    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Favourite View"));
    this.showDropDownGrid = false;
    this.selectedFavouriteViewColumn = [];
    this.getFavouriteView();

  }

  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.searchAllProducts();
    }
  }

  /* get Branch Info*/
  getBranchInfo() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
          if (packageId && packageId > 0) {
            this.setPackagePermission(packageId);
          }
      }
  );
    // get data according to selected branch
    this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe(
      (branch: DD_Branch) => {
        if (branch.BranchID) {
          this.currencyFormat = branch.CurrencySymbol;
        }
      }
    )
  }

  //check here if we have interprise level permission or not
  async isMultiBranchID() {
    await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
    this.isMultiBranch = isMultiBranch;
    if(!isMultiBranch){
      this.productSearchParameter.AppSourceTypeID = EnumSaleSourceType.OnSite;
    }
  });
  }

  /* delete Product */
  onDeleteProduct(productID: number) {
    const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: {
        Title: this.messages.Delete_Messages.Confirm_delete,
        header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "product "),
        description: this.messages.Delete_Messages.Del_Msg_Undone,
        ButtonText: this.messages.General.Delete,
      },
    });
    dialogRef.componentInstance.confirmDelete.subscribe(
      (confirmDelete: any) => {
        if (confirmDelete) {
          this._httpService
            .delete(ProductApi.deleteProduct + productID)
            .subscribe(
              (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                  this._messageService.showSuccessMessage(
                    this.messages.Success.Delete_Success.replace(
                      "{0}",
                      "Product"
                    )
                  );
                  this.resetSearchFilter();
                } else {
                  this._messageService.showErrorMessage(response.MessageText);
                }
              },
              (error) => {
                this._messageService.showErrorMessage(
                  this.messages.Error.Delete_Error.replace("{0}", "Product")
                );
              }
            );
        }
      }
    );
  }
  // reveive pagination data
  reciviedDate($event) {
    this.productSearchParameter.FromCreationDate = $event.DateFrom;
    this.productSearchParameter.ToCreationDate = $event.DateTo;
  }

  /* Method to set the toggle  Fav View*/
  togglePersonalGrid(show: boolean) {
    setTimeout(() => {
      this.showDropDownGrid = show;
    });
  }

  //#region  Fav View
  mapFavView() {
    this.favouriteViewColumnNameList.forEach((productView) => {
      if (productView.selected) {
        this.selectedFavouriteViewColumn.push(
          productView.FavouriteViewColumnIndex
        );
      }
    });
  }

  onApply(isFromApply: boolean) {
    this._loaderService.show();
    setTimeout(() => {
      this.temporaryFavView();
      this._loaderService.hide();
      this.canResetEnable = true;
    }, 1000);
  }

  //temporaray fav view (not saved on backend)
  temporaryFavView() {
    this.dummyFavouriteViewColumnNameList = [...this.favouriteViewColumnNameList,];
    this.favouriteViewColumnNameList.forEach((x) => {
      if (x.selected == false) {
        this.dummyFavouriteViewColumnNameList.splice(
          this.dummyFavouriteViewColumnNameList.indexOf(x),
          1
        );
      }
    });
    this.favouriteViewColumnNameList.forEach((x) => {
      if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Product
      ) {
        this.hideAndShowFavouriteViewColumn.isProductColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.Classification
      ) {
        this.hideAndShowFavouriteViewColumn.isClassificationColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Type
      ) {
        this.hideAndShowFavouriteViewColumn.isTypeColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.Category
      ) {
        this.hideAndShowFavouriteViewColumn.isCategoryColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Brand
      ) {
        this.hideAndShowFavouriteViewColumn.isBrandColumn = x.selected;
      }
      if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.VariantStatus) {
        this.hideAndShowFavouriteViewColumn.isVarientStatusColumn = x.selected;
      }
      if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.PurchaseRestriction) {
        this.hideAndShowFavouriteViewColumn.isPurchaseRestrictionColumn = x.selected;
      }
      if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.ProductStatus) {
        this.hideAndShowFavouriteViewColumn.isProductStatusColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.ShowOnline
      ) {
        this.hideAndShowFavouriteViewColumn.isShowOnlineColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.HidePriceOnline
      ) {
        this.hideAndShowFavouriteViewColumn.isHidePriceOnlineColumn =
          x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.Featured
      ) {
        this.hideAndShowFavouriteViewColumn.isFeaturedColumn = x.selected;
      }
      // if (
      //   x.FavouriteViewColumnName ===
      //   ProductFavouriteViewColumnNameString.BusinessUseOnly
      // ) {
      //   this.hideAndShowFavouriteViewColumn.isBusinessUseOnlyColumn =
      //     x.selected;
      // }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.TrackInventory
      ) {
        this.hideAndShowFavouriteViewColumn.isTrackInventoryColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.Shipping
      ) {
        this.hideAndShowFavouriteViewColumn.isShippingColumn = x.selected;
      }

      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.BarCode
      ) {
        this.hideAndShowFavouriteViewColumn.isBarCodeColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.SKU
      ) {
        this.hideAndShowFavouriteViewColumn.isSKUColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.Supplier
      ) {
        this.hideAndShowFavouriteViewColumn.isSupplierColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.SupplerCode
      ) {
        this.hideAndShowFavouriteViewColumn.isSupplerCodeColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.SupplierPrice
      ) {
        this.hideAndShowFavouriteViewColumn.isSupplierPriceColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Price
      ) {
        this.hideAndShowFavouriteViewColumn.isPriceColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Tax
      ) {
        this.hideAndShowFavouriteViewColumn.isTaxColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.RetailPrice
      ) {
        this.hideAndShowFavouriteViewColumn.isRetailPriceColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.CurrentStock
      ) {
        this.hideAndShowFavouriteViewColumn.isCurrentStockColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.ReorderQuantity
      ) {
        this.hideAndShowFavouriteViewColumn.isReorderQuantityColumn =
          x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.ThresholdPointColumn
      ) {
        this.hideAndShowFavouriteViewColumn.isThresholdPointColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.StockValue
      ) {
        this.hideAndShowFavouriteViewColumn.isStockValueColumn = x.selected;
      }
      if (
        x.FavouriteViewColumnName ===
        ProductFavouriteViewColumnNameString.RetailValue
      ) {
        this.hideAndShowFavouriteViewColumn.isRetailValueColumn = x.selected;
      }
    });
    this.showDropDownGrid = false;
  }

  // get the fav view
  getFavouriteView() {
    var favouriteViews: any = [];


    favouriteViews = JSON.parse(AuthService.getFavViewProduct());
    if (favouriteViews) {
      this.dummyFavouriteViewColumnNameList = [];
      if (favouriteViews.length > 0) {
        this.favouriteViewColumnNameList.forEach((i) => {
          var findIndex = favouriteViews.find(x => x.FavouriteViewColumnIndex == i.FavouriteViewColumnIndex);
          if (findIndex) {
            i.selected = true;
          } else {
            i.selected = false;
          }
        })
      }
      this.canResetEnable = favouriteViews && favouriteViews.length > 0 ? true : false;
      this.dummyFavouriteViewColumnNameList = favouriteViews;
      this.hideAndShowFavouriteViewColumn = new HideAndShowFavouriteViewColumnProductForFavView();
      this.hideAndShowFavouriteViewColumns(favouriteViews, false);

    } else {
      this.canResetEnable = false;
      this.favouriteViewColumnNameList = [];
      let favViewListForExceedPackage = Configurations.ProductFavouriteViewColumnNameList;
      let dummyFavouriteViewColumnNameListExceedPackage = Configurations.ProductDefaultViewColumnNameList;
      if(!this.isExceedPackage){
        this.favouriteViewColumnNameList = favViewListForExceedPackage.filter(i => i.FavouriteViewColumnIndex != 16 && i.FavouriteViewColumnIndex != 17 && i.FavouriteViewColumnIndex != 18 );
        this.dummyFavouriteViewColumnNameList = dummyFavouriteViewColumnNameListExceedPackage.filter(i => i.FavouriteViewColumnIndex != 16 && i.FavouriteViewColumnIndex != 17 && i.FavouriteViewColumnIndex != 18 );
      } else{
        this.favouriteViewColumnNameList = Configurations.ProductFavouriteViewColumnNameList;
        this.dummyFavouriteViewColumnNameList = Configurations.ProductDefaultViewColumnNameList;
      }

      //we are not showing Type info if Single Branch
      if(!this.isMultiBranch){
        this.favouriteViewColumnNameList = this.favouriteViewColumnNameList.filter(i => i.FavouriteViewColumnIndex != 3 );
        this.dummyFavouriteViewColumnNameList = this.dummyFavouriteViewColumnNameList.filter(i => i.FavouriteViewColumnIndex != 3 )
      }


      this.hideAndShowFavouriteViewColumn = new HideAndShowFavouriteViewColumnProduct();

      if (this.dummyFavouriteViewColumnNameList.length > 0) {
        this.favouriteViewColumnNameList.forEach((i) => {
          var findIndex = this.dummyFavouriteViewColumnNameList.find(x => x.FavouriteViewColumnIndex == i.FavouriteViewColumnIndex);
          if (findIndex) {
            i.selected = true;
          } else {
            i.selected = false;

          }
        })
      }
      this.hideAndShowFavouriteViewColumns(this.dummyFavouriteViewColumnNameList, false);
    }

  }

  //hide and show the view (fav view oe default view)
  hideAndShowFavouriteViewColumns(favouriteViewColumnNameList: Array<any>, isFromApply?: boolean) {
    if (favouriteViewColumnNameList && favouriteViewColumnNameList.length > 0) {
      favouriteViewColumnNameList.forEach((x) => {
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Product
        ) {
          this.hideAndShowFavouriteViewColumn.isProductColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Classification
        ) {
          this.hideAndShowFavouriteViewColumn.isClassificationColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Type
        ) {
          this.hideAndShowFavouriteViewColumn.isTypeColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Category
        ) {
          this.hideAndShowFavouriteViewColumn.isCategoryColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Brand
        ) {
          this.hideAndShowFavouriteViewColumn.isBrandColumn = true;
          x.isDefault = true;
        }
        if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.ProductStatus) {
          this.hideAndShowFavouriteViewColumn.isProductStatusColumn = true;
          x.isDefault = true;
        }
        if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.PurchaseRestriction) {
          this.hideAndShowFavouriteViewColumn.isPurchaseRestrictionColumn = true;
          x.isDefault = true;
          x.selected = true;
        }
        if (x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.VariantStatus) {
          this.hideAndShowFavouriteViewColumn.isVarientStatusColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.ShowOnline
        ) {
          this.hideAndShowFavouriteViewColumn.isShowOnlineColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.HidePriceOnline
        ) {
          this.hideAndShowFavouriteViewColumn.isHidePriceOnlineColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Featured
        ) {
          this.hideAndShowFavouriteViewColumn.isFeaturedColumn = true;
          x.isDefault = true;
        }
        // if (
        //   x.FavouriteViewColumnName ===
        //   ProductFavouriteViewColumnNameString.BusinessUseOnly
        // ) {
        //   this.hideAndShowFavouriteViewColumn.isBusinessUseOnlyColumn = true;
        //   x.isDefault = true;
        // }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.TrackInventory
        ) {
          this.hideAndShowFavouriteViewColumn.isTrackInventoryColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Shipping
        ) {
          this.hideAndShowFavouriteViewColumn.isShippingColumn = true;
          x.isDefault = true;
        }

        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.BarCode
        ) {
          this.hideAndShowFavouriteViewColumn.isBarCodeColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.SKU
        ) {
          this.hideAndShowFavouriteViewColumn.isSKUColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Supplier
        ) {
          this.hideAndShowFavouriteViewColumn.isSupplierColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.SupplerCode
        ) {
          this.hideAndShowFavouriteViewColumn.isSupplerCodeColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.SupplierPrice
        ) {
          this.hideAndShowFavouriteViewColumn.isSupplierPriceColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.Price
        ) {
          this.hideAndShowFavouriteViewColumn.isPriceColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName === ProductFavouriteViewColumnNameString.Tax
        ) {
          this.hideAndShowFavouriteViewColumn.isTaxColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.RetailPrice
        ) {
          this.hideAndShowFavouriteViewColumn.isRetailPriceColumn = true;
          x.isDefault = true;
        }

        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.CurrentStock
        ) {
          this.hideAndShowFavouriteViewColumn.isCurrentStockColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.ReorderQuantity
        ) {
          this.hideAndShowFavouriteViewColumn.isReorderQuantityColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.ThresholdPointColumn
        ) {
          this.hideAndShowFavouriteViewColumn.isThresholdPointColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.StockValue
        ) {
          this.hideAndShowFavouriteViewColumn.isStockValueColumn = true;
          x.isDefault = true;
        }
        if (
          x.FavouriteViewColumnName ===
          ProductFavouriteViewColumnNameString.RetailValue
        ) {
          this.hideAndShowFavouriteViewColumn.isRetailValueColumn = true;
          x.isDefault = true;
        }
      });
    }
  }

  // on advance search button
  toggleAdvanceSearch() {
    this.isAdvanceSearch = !this.isAdvanceSearch;
    this.productSearchParameter.HasTrackInventory = null;
    this.productSearchParameter.IsOnline = null;
    // this.filterDropDownAccordingToBranch(this.selectedBranchesList);

    setTimeout(() => {
      if (this.isAdvanceSearch) {
        setTimeout(() => {
          this.productDateSearch?.setEmptyDateFilter();
        }, 500);


        if (this.selectProductCategory) {
          if(this.productCategories.length > 1){
          this.selectProductCategory.options.forEach((item: MatOption) => {
            if (item.viewValue == "All")
              this.allSelectToggleModel.isAllSelectedProductCategory = true;
            item.select();
          });
        }}

        if (this.selectProductBrand) {
          if(this.brands.length > 1){
          this.selectProductBrand.options.forEach((item: MatOption) => {
            if (item.viewValue == "All")
              this.allSelectToggleModel.isAllSelectedProductBrand = true;
            item.select();
          });
        }
        }

        if (this.selectProductSupplier) {
          if(this.suppliers.length > 1){
          this.selectProductSupplier.options.forEach((item: MatOption) => {
            if (item.viewValue == "All")
              this.allSelectToggleModel.isAllSelectedProductSupplier = true;
            item.select();
          });
        }
        }
      }
    }, 200);
  }

  //for all  selection
  toggleAllSelection(type) {
    switch (type) {
      // case this.Product_SearchFundamental_DropDowns.ProductBranches: {
      //   this.selectedBranchesList = [];
      //   if (this.allSelectedBranch.selected) {
      //     this.branchList.forEach((branch) => {
      //       this.selectedBranchesList.push(branch);
      //     });
      //     setTimeout(() => {
      //       this.allSelectedBranch.select();
      //       this.allSelectToggleModel.isAllSelectedBranch = true;
      //     }, 100);
      //     this.filterDropDownAccordingToBranch(this.selectedBranchesList);
      //   } else {
      //     this.filterDropDownAccordingToBranch(null);
      //   }
      //   break;
      // }

      case this.Product_SearchFundamental_DropDowns.ProductCategory: {
        this.selectedProductCategoryList = [];
        if (this.allProductCategorySelected.selected) {
          this.productCategories.forEach((branch) => {
            this.selectedProductCategoryList.push(branch);
          });
          setTimeout(() => {
            this.allProductCategorySelected.select();
            this.allSelectToggleModel.isAllSelectedProductCategory = true;
          }, 100);
        }
        break;
      }

      case this.Product_SearchFundamental_DropDowns.ProductBrand: {
        this.selectedProductBrandList = [];
        if (this.allProductBrandSelected.selected) {
          this.brands.forEach((branch) => {
            this.selectedProductBrandList.push(branch);
          });

          setTimeout(() => {
            this.allProductBrandSelected.select();
            this.allSelectToggleModel.isAllSelectedProductBrand = true;
          }, 100);
        }
        break;
      }

      case this.Product_SearchFundamental_DropDowns.ProductSupplier: {
        this.selectedProductSupplierList = [];
        if (this.allProductSupplierSelected.selected) {
          this.suppliers.forEach((branch) => {
            this.selectedProductSupplierList.push(branch);
          });
          setTimeout(() => {
            this.allProductSupplierSelected.select();
            this.allSelectToggleModel.isAllSelectedProductSupplier = true;
          }, 100);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  //for single  selection
  tosslePerOneItem(type) {
    switch (type) {
      case this.Product_SearchFundamental_DropDowns.ProductCategory: {
        if (
          this.productCategories &&
          this.allProductCategorySelected &&
          this.allProductCategorySelected.selected
        ) {
          this.allProductCategorySelected.deselect();
          this.allSelectToggleModel.isAllSelectedProductCategory =
            this.allProductCategorySelected.selected;
          return false;
        }
        if (
          this.productCategories.length ==
          this.selectedProductCategoryList.length &&
          this.productCategories.length > 1
        )
          this.allProductCategorySelected.select();
        this.allSelectToggleModel.isAllSelectedProductCategory =
          this.allProductCategorySelected.selected;
        break;
      }

      case this.Product_SearchFundamental_DropDowns.ProductBrand: {
        if (
          this.brands &&
          this.allProductBrandSelected &&
          this.allProductBrandSelected.selected
        ) {
          this.allProductBrandSelected.deselect();
          this.allSelectToggleModel.isAllSelectedProductBrand =
            this.allProductBrandSelected.selected;
          return false;
        }
        if (
          this.brands.length == this.selectedProductBrandList.length &&
          this.brands.length > 1
        )
          this.allProductBrandSelected.select();
        this.allSelectToggleModel.isAllSelectedProductBrand =
          this.allProductBrandSelected.selected;
        break;
      }

      // case this.Product_SearchFundamental_DropDowns.ProductBranches: {
      //   this.filterDropDownAccordingToBranch(this.selectedBranchesList);
      //   if (
      //     this.branchList &&
      //     this.allSelectedBranch &&
      //     this.allSelectedBranch.selected
      //   ) {
      //     this.allSelectedBranch.deselect();
      //     this.allSelectToggleModel.isAllSelectedBranch =
      //       this.allSelectedBranch.selected;
      //     return false;
      //   }
      //   if (
      //     this.branchList.length == this.selectedBranchesList.length &&
      //     this.branchList.length > 1
      //   )
      //     this.allSelectedBranch.select();
      //   this.allSelectToggleModel.isAllSelectedBranch =
      //     this.allSelectedBranch.selected;
      //   break;
      // }

      case this.Product_SearchFundamental_DropDowns.ProductSupplier: {
        if (
          this.suppliers &&
          this.allProductSupplierSelected &&
          this.allProductSupplierSelected.selected
        ) {
          this.allProductSupplierSelected.deselect();
          this.allSelectToggleModel.isAllSelectedProductSupplier =
            this.allProductSupplierSelected.selected;
          return false;
        }
        if (
          this.suppliers.length == this.selectedProductSupplierList.length &&
          this.branchList.length > 1
        )
          this.allProductSupplierSelected.select();
        this.allSelectToggleModel.isAllSelectedProductSupplier =
          this.allProductSupplierSelected.selected;
        break;
      }
      default: {
        break;
      }
    }
  }

  /* Method to reset dearch filters */
  resetSearchFilter() {
    this.productSearchParameter = new ProductSearchParameter();
    this.appPagination.resetPagination();
    if (this.isAdvanceSearch) {
      this.productDateSearch.setEmptyDateFilter();
    }
    this.productSearchParameter.FromCreationDate = null;
    this.productSearchParameter.ToCreationDate = null;
    this.isAdvanceSearch = false;
    this.isMultiBranchID();
    setTimeout(() => {
      if (this.branchSelect) {
        this.branchSelect.options.forEach((item: MatOption) => {
          if (item.viewValue == "All")
            this.allSelectToggleModel.isAllSelectedBranch = true;
          item.select();
        });
      }
      this.searchAllProducts();
    }, 400);
  }

  //reset the favourite view to the default
  onResetFavouriteView() {
    const _dialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: {
        Title: this.messages.Reset_Messages.reset_Title_Msg,
        header: this.messages.Reset_Messages.reset_Msg_Generic,
        description: this.messages.Reset_Messages.reset_Msg_Undone,
        isALertIcon: true,
      },
    });
    _dialogRef.componentInstance.confirmDelete.subscribe((isYes: boolean) => {
      if (isYes) {

        AuthService.deleteFavViewProduct();
        this._messageService.showSuccessMessage(this.messages.Success.Reset_Fav_View);
        this.showDropDownGrid = false;
        this.getFavouriteView();
      }
    });
  }

  // set the drop down values according to the branches
  // filterDropDownAccordingToBranch(selectedBranchesList) {
  //   if (this.isAdvanceSearch) {
  //     this.suppliers = [];
  //     this.brands = [];
  //     this.productCategories = [];

  //     this.selectedProductCategoryList = [];
  //     this.selectedProductBrandList = [];
  //     this.selectedProductSupplierList = [];

  //     selectedBranchesList?.forEach((element) => {
  //       this.copySuppliers?.forEach((supplier) => {
  //         supplier.BranchIDs.forEach((branchID) => {
  //           if (branchID == element.BranchID) {
  //             this.suppliers.push(supplier);
  //           }
  //         });
  //       });
  //       this.copyBrands?.forEach((brands) => {
  //         brands.BranchIDs?.forEach((branchID) => {
  //           if (branchID == element.BranchID) {
  //             this.brands.push(brands);
  //           }
  //         });
  //       });

  //       this.copyProductCategories?.forEach((brands) => {
  //         brands.BranchIDs?.forEach((branchID) => {
  //           if (branchID == element.BranchID) {
  //             this.productCategories.push(brands);
  //           }
  //         });
  //       });
  //     });

  //     this.suppliers = this.suppliers.filter(
  //       (element, i) => i === this.suppliers.indexOf(element)
  //     );
  //     this.brands = this.brands.filter(
  //       (element, i) => i === this.brands.indexOf(element)
  //     );
  //     this.productCategories = this.productCategories.filter(
  //       (element, i) => i === this.productCategories.indexOf(element)
  //     );

  //     setTimeout(() => {
  //       if (this.selectProductCategory) {
  //         this.selectProductCategory.options.forEach((item: MatOption) => {
  //           if (item.viewValue == "All")
  //             this.allSelectToggleModel.isAllSelectedProductCategory = true;
  //           item.select();
  //         });
  //       }

  //       if (this.selectProductBrand) {
  //         this.selectProductBrand.options.forEach((item: MatOption) => {
  //           if (item.viewValue == "All")
  //             this.allSelectToggleModel.isAllSelectedProductBrand = true;
  //           item.select();
  //         });
  //       }

  //       if (this.selectProductSupplier) {
  //         this.selectProductSupplier.options.forEach((item: MatOption) => {
  //           if (item.viewValue == "All")
  //             this.allSelectToggleModel.isAllSelectedProductSupplier = true;
  //           item.select();
  //         });
  //       }
  //     }, 200);
  //   }
  // }

  //Edit Price Dialog
  onEditPrice(productID: number, classficationID , appSourceTypeID) {
    const _dialog = this._dialog.open(ProductPriceComponent, {
      disableClose: true,
      panelClass: "pos-full-popup",
      data: { productID: productID, branchList: this.branchList, areaName: this.productAreaEnum.EditPricing, classficationID: classficationID ,appSourceTypeID: appSourceTypeID}
    });
    _dialog.componentInstance.isClose.subscribe((isClose: boolean) => {
      if (isClose) {
        this.searchAllProducts();
      }
    })


  }

  getProductPricingList(productID: number) {
    return new Promise<boolean>((resolve, reject) => {
      this._httpService.get(ProductApi.getDetail + productID).subscribe(data => {
        if (data && data.Result != null) {
          let productDetail = data.Result;

          this._dialog.open(ViewProductComponent, {
            disableClose: true,
            panelClass: "full-width-popup",
            data: { ...productDetail }
          });
        }
        else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace('{0}', 'Product')
          );
        }
      });
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace('{0}', 'Product')
        );
      }
    })
  }

  //view detail of Product
  openProductDetailDialog(productID) {
    this._httpService.get(ProductApi.getDetail + productID).subscribe(data => {
      if (data && data.Result != null) {
        let productDetail = data.Result;
        productDetail.isMultiBranch = this.isMultiBranch;

        this._dialog.open(ViewProductComponent, {
          disableClose: true,
          panelClass: "pos-full-popup",
          data: { ...productDetail }
        });
      }
      else {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace('{0}', 'Product')
        );
      }
    });
    (error) => {
      this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace('{0}', 'Product')
      );
    }
  }

  openVariantDialog(productID: number, IsProductVariantGenerated: boolean, classficationID: number) {
   const _dialog = this._dialog.open(ProductVariantComponent, {
      disableClose: true,
      panelClass: "pos-full-popup",
      data: { productID: productID, isProductVariantGenerate: IsProductVariantGenerated, classficationID: classficationID }
    });
    _dialog.componentInstance.isClose.subscribe((isClose: boolean) => {
      if (isClose) {
        this.searchAllProducts();
      }
    })
  }

  openInventoryDialog(productID: number, classficationID: number) {
    const _dialog = this._dialog.open(EditInventoryComponent, {
      disableClose: true,
      panelClass: "pos-full-popup",
      data: { productID: productID, branchList: this.branchList, StockAdjustmentReasons: this.StockAdjustmentReasons, classficationID: classficationID }
    });
    _dialog.componentInstance.isClose.subscribe((isClose: boolean) => {
      if (isClose) {
        this.searchAllProducts();
      }
    })
  }


  //#endregion

  /* Method to toggle the view */
  //  isMembershipToggle: boolean = false;
  //  toggledIndex: number;
  //  onToggleClick(i: number, j: number) {
  //    this.setToggleStatuses(i);
  //    this.toggledIndex = i;
  //    if(j >=0){
  //      this.productList[i].ProductVariants[j].collapse = false;
  //    }else{
  //      this.productList[i].ProductVariants[0].collapse = false;
  //    }

  //  }
  //  setToggleStatuses(i: number) {
  //   let toggledIndex = i;
  //   return toggledIndex;
  // }
}

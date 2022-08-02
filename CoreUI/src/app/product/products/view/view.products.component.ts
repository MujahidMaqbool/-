/*********************** Angular References *************************/
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SubscriptionLike } from "rxjs";

/*********************** Material References *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


/*************************** Components ***********************/
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';


/*************************** Services & Models ***********************/
// Models
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { ProductPriceAndInventoryDetailModel } from 'src/app/product/models/product.model';
// Services
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AuthService } from 'src/app/helper/app.auth.service';

/********************** Configurations *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { EnumSaleSourceType, ProductViewTabs } from 'src/app/helper/config/app.enums';
import { ProductApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_Permission_Module, ENU_Permission_Product } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'view-product-detail',
    templateUrl: './view.products.component.html'
})

export class ViewProductComponent implements OnInit {
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    // @ViewChild("appPaginationInventory") appPaginationInventoryDetail: AppPaginationComponent;

    /* Local Variables */
    isDataExists: boolean = false;

    activeTab: any;
    activeTabIndex: number = 0;
    currencyFormat: string;

    /* Model Refences */
    productWizardTabsEnum = ProductViewTabs;
    productPriceDetailModel : ProductPriceAndInventoryDetailModel =  new ProductPriceAndInventoryDetailModel();
    productPriceInventoryModel : ProductPriceAndInventoryDetailModel =  new ProductPriceAndInventoryDetailModel();

    productPricingDetail = [];
    productInventoryDetail = [];

    /* Message */
    messages = Messages;
    activityTypes = Configurations.ProductViewTabs;
    currentBranchSubscription: SubscriptionLike;
    appSourceTypeID = EnumSaleSourceType;
    allowedPages = {
      Pricing_View:false,
      Inventory_View:false,
    };

    constructor(
        @Inject(MAT_DIALOG_DATA) public productViewDetail: any,
        private dialogRef: MatDialogRef<ViewProductComponent>,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        public _authService: AuthService,
    ) { }

    ngOnInit() {
      this.setPermission();
      this.getBranchInfo();
    }

    setPermission() {
      this.allowedPages.Pricing_View = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Pricing_View);
      this.allowedPages.Inventory_View = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Product_Inventory_View);
    }

    ngOnDestroy() {
      this.currentBranchSubscription.unsubscribe();
    }
    // #region Event(s)
    getBranchInfo(){
          // get data according to selected branch
      this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe(
        (branch: DD_Branch) => {
          if (branch.BranchID) {
            this.currencyFormat = branch.CurrencySymbol;
          }
        }
      )
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    onTabChange(event: any) {
      this.activeTab = event.tab.textLabel;
      this.activeTabIndex = event.index;
      this.appPagination?.resetPagination();
      if(this.activeTabIndex  == this.productWizardTabsEnum.PricingDetails){
        this.getProductPricingDetail();
      }
      if(this.activeTabIndex  == this.productWizardTabsEnum.InventoryDetails){
        this.getProductInventoryDetail();
      }

  }
    getProductPricingDetail() {
      this.productPriceDetailModel.PageNumber = this.appPagination?.pageNumber ? this.appPagination?.pageNumber : 1 ;
      this.productPriceDetailModel.PageSize = this.appPagination?.pageSize ? this.appPagination?.pageSize : 10 ;
       this.productPriceDetailModel.ProductID = this.productViewDetail.ProductID;

        this._httpService.save(ProductApi.getProductPricingDetails, this.productPriceDetailModel).subscribe(
          (data :ApiResponse) => {
            this.isDataExists =
              data.Result != null && data.Result.length > 0 ? true : false;
            if (this.isDataExists) {
              if (data.Result.length > 0) {
                this.appPagination.totalRecords = data.TotalRecord;
                this.productPricingDetail = data.Result;
              } else {
                this.appPagination.totalRecords = 0;
              }
            } else {
              this.appPagination.totalRecords = 0;
            }
          },
          (error) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Get_Error.replace("{0}", "Product Pricing Detail")
            );
          }
        );
      }

      getProductInventoryDetail() {
        this.productPriceInventoryModel.PageNumber = this.appPagination?.pageNumber ? this.appPagination?.pageNumber : 1 ;
        this.productPriceInventoryModel.PageSize = this.appPagination?.pageSize ? this.appPagination?.pageSize : 10 ;
        this.productPriceInventoryModel.ProductID = this.productViewDetail.ProductID;

          this._httpService.save(ProductApi.getProductInventoryDetails, this.productPriceInventoryModel).subscribe(
            (data :ApiResponse) => {
              this.isDataExists =
                data.Result != null && data.Result.length > 0 ? true : false;
              if (this.isDataExists) {
                if (data.Result.length > 0) {
                    this.appPagination.totalRecords = data.TotalRecord;
                    this.productInventoryDetail = data.Result;
                } else {
                  this.appPagination.totalRecords = 0;
                }
              } else {
                this.appPagination.totalRecords = 0;
              }
            },
            (error) => {
              this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace("{0}", "Product Inventory Detail")
              );
            }
          );
        }

       /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      if(this.activeTabIndex  == this.productWizardTabsEnum.PricingDetails){
        this.getProductPricingDetail();
      }
      if(this.activeTabIndex  == this.productWizardTabsEnum.InventoryDetails){
        this.getProductInventoryDetail();
      }
    }
  }

    // #endregion

}

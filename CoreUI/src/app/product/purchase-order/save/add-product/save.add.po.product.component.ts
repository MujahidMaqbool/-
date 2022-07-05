/***Angular Imports / References */
import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';

/****Services & Models *****/
import { AuthService } from '@app/helper/app.auth.service';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ProductVariantsSearchParameter, ProductVariantItems } from "@app/product/models/purchaseOrder.model";

/***** Configurations ******/
import { PurchaseOrderApi } from '@app/helper/config/app.webapi';
import { Messages } from '@app/helper/config/app.messages';
import { MatPaginator } from '@angular/material/paginator';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';



@Component({
  selector: 'app-save-add-po-product',
  templateUrl: './save.add.po.product.component.html'
})

export class SavePurchaseItemsComponent implements OnInit {

  messages = Messages;
  isDataExists: boolean = false;
  productvariantsList: Array<ProductVariantItems> = [new ProductVariantItems()];
  selectedProductvariantsList: Array<ProductVariantItems> = [];
  productVariantSearchParameter: ProductVariantsSearchParameter = new ProductVariantsSearchParameter();
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @Output() savedProductVariants = new EventEmitter<ProductVariantItems[]>();
  

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _authService: AuthService,
    private _dialog: MatDialogService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) { }


  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    this.getProductsVariantList()
  }

  getProductsVariantList() {
    // if (!this.dialogData.supplierID) {
    //   this._messageService.showErrorMessage(this.messages.Validation.PleaseSelect.replace("{0}", "supplier"));
    //   return;
    // } else {
            let productVariantsSearchParams = JSON.parse(JSON.stringify(this.productVariantSearchParameter));
            productVariantsSearchParams.BranchID = this.dialogData.branchID;
            productVariantsSearchParams.SupplierID = this.dialogData.supplierID;
            productVariantsSearchParams.PageNumber = this.appPagination.pageNumber;
            productVariantsSearchParams.PageSize = this.appPagination.pageSize;
            if(this.dialogData.addedVariants && this.dialogData.addedVariants !="") {
              ////****send API to comma separated ID's of already added variants to Exclude those variants from List *****///
              productVariantsSearchParams.ProductVariantIDs = this.dialogData.addedVariants;
    
            }
            if(this.productVariantSearchParameter.ProductName && this.productVariantSearchParameter.ProductName.trim() !='') {
              productVariantsSearchParams.ProductName = this.productVariantSearchParameter.ProductName.trim().toLocaleLowerCase();
            }

            this._httpService.get(PurchaseOrderApi.getProductVariants, productVariantsSearchParams).subscribe((data) => {
              this.isDataExists = (data.Result != null && data.Result.length > 0) ? true : false;
              if (this.isDataExists) {
                this.productvariantsList = data.Result;
                /****Show already selected product variants as selected ******/
                if(this.selectedProductvariantsList && this.selectedProductvariantsList.length > 0) { 
                  this.productvariantsList.forEach(item => {
                    let variantExist = this.selectedProductvariantsList.find(selectedPV => selectedPV.ProductVariantID === item.ProductVariantID);
                    item.IsSelected = variantExist ? variantExist.IsSelected : false;
                  })
                }
                 /***** ========  *****/
                if (data.Result.length > 0) {
                  this.appPagination.totalRecords = data.TotalRecord;
                } else {
                  this.appPagination.totalRecords = 0;
                }
              } else {
                this.productvariantsList = [];
                this.appPagination.totalRecords = 0;
              }
            },
              (error) => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "product variants"));
              }
            );
//  }
 
  }

  addProductsToPO() {
 
    ////validate product variant
    if (this.selectedProductvariantsList.length > 0) {

      /****concat product name and variant *******/
      this.selectedProductvariantsList.forEach(p => {
        p.ProductName = (p.ProductVariantName && p.ProductVariantName !='') ? p.ProductName + ' - ' + p.ProductVariantName : p.ProductName;
      });

      this.savedProductVariants.emit(this.selectedProductvariantsList);
      this.onCloseDialog();

    } else {
      this._messageService.showErrorMessage((this.messages.Validation.Please_Select_AtLeastOne.replace("{0}", "product variant")));
      return;
    }

  }

  onVariantSelection(event, pvariant) {
    
    if(event){
      this.selectedProductvariantsList.push(pvariant);
    } else {
      ////// on un-check checkbox remove variant item from list///////
      let variantExists = this.selectedProductvariantsList.filter(item => item.ProductVariantID !== pvariant.ProductVariantID);
      if (variantExists) {
        this.selectedProductvariantsList = variantExists;
      }

    }
  }

  /****Select or Deselect All*/
  selectOrDeselectAllItems(isCheck: boolean) { 

      let already_ItemsSelectedOrDeselected = this.productvariantsList.every(item => item.IsSelected == isCheck);
      if (!already_ItemsSelectedOrDeselected) {
        this.productvariantsList.forEach(item => {
          item.IsSelected = isCheck; /// mark item as selected/checked
          this.onVariantSelection(isCheck, item);
        });
      }    

  }

  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getProductsVariantList();
    }
  }

  onCloseDialog() {
    this._dialog.close();
  }

}

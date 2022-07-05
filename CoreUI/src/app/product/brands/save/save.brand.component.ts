
import { Component, OnInit, ViewChild, EventEmitter, Output, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Messages } from '@app/helper/config/app.messages';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ProductCategoryList, SaveBrand } from '../brand.models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrandApi } from '@app/helper/config/app.webapi';
import { MatOption } from '@angular/material/core';
import { ApiResponse } from '@app/models/common.model';
import { TrimPipe } from '@app/shared/pipes/trim';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';



@Component({
  selector: "app-save-brand",
  templateUrl: "./save.brand.component.html",
})
export class SaveBrandComponent implements OnInit{

  /*********** region Local Members ****/
  @ViewChild("SaveBrandData") saveBrandData: NgForm;
  @ViewChild('allSelectedProductCategory') private allSelectedProductCategory: MatOption;
  @Output() isSaved = new EventEmitter<boolean>();

  appSourceTypeID = EnumSaleSourceType;
  messages = Messages;
  brandSaveModel: SaveBrand = new SaveBrand();
  productCategoryList: ProductCategoryList[];
  //Local
  showPrevious: boolean;
  showContinue: boolean = true;
  showError: boolean = false;
  showSave: boolean = false;
  showBranchValidation: boolean = false;
  inValidBrandName: boolean = false;
  inValidProductCategory: boolean = false;
  isDisabledSaveButton: boolean = false;
  addedproductCategoryList: any[] = [];
  selectedProductCategoryList: any[] = [];

  constructor(
    private _dialog: MatDialogRef<SaveBrandComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _trimString: TrimPipe,
    @Inject(MAT_DIALOG_DATA) public brandID: any
  ) { }

  ngOnInit(): void {
    this.getFundamental();
  }

// Close Dialouge
onCloseDialog() {
  this._dialog.close();
}

// show the validation msg
showValidation(event) {
  event = event.trim();
  if (event == "") {
    this.showError = true;
  } else {
    this.showError = false;
  }
}

trimName() {
  this.brandSaveModel.BrandName = this._trimString.transform(
    this.brandSaveModel.BrandName
  );
}

toggleAllCatSelection() {
  this.inValidProductCategory = false;
  this.selectedProductCategoryList = [];

  if (this.allSelectedProductCategory.selected) {
      this.productCategoryList.forEach(category => {
          this.selectedProductCategoryList.push(category);
      });
      setTimeout(() => {
          this.allSelectedProductCategory.select();
      }, 100);
      this.showError = false;
      this.isDisabledSaveButton = false;
  }
}

togglePerCat(all) {
  this.inValidProductCategory = false;
  if (this.allSelectedProductCategory && this.allSelectedProductCategory.selected) {
      this.allSelectedProductCategory.deselect();
  }
  if (this.productCategoryList.length == this.selectedProductCategoryList.length && this.productCategoryList.length > 1) {
      this.allSelectedProductCategory.select();
  }
  if(this.selectedProductCategoryList.length > 0){
    this.showError = false;
    this.isDisabledSaveButton = false;
  }
}

// Get Fundamentals
getFundamental() {
  this._httpService.get(BrandApi.getBrandSearchFundamentals).subscribe((respose) => {
    this.productCategoryList = respose.Result.ProductCategoryList;
    if (this.brandID > 0 && this.brandID != null) {
      this.brandSaveModel.BrandID = this.brandID;
      this.getBrandByID();
    }
  });
}

// Set Product Category
setProductCategory() {
  this.selectedProductCategoryList = [];
  if (this.productCategoryList && this.productCategoryList.length > 0) {
      this.addedproductCategoryList.forEach((categoryList) => {
          let result = this.productCategoryList.find(i => i.ProductCategoryID == categoryList.ProductCategoryID);
          if (result) {
              this.selectedProductCategoryList.push(result);
          }
      });
  }
  if (this.productCategoryList && this.productCategoryList.length > 0 && this.selectedProductCategoryList &&
    this.selectedProductCategoryList.length > 0 && this.selectedProductCategoryList.length == this.productCategoryList.length) {
      setTimeout(() => {
          this.allSelectedProductCategory.select();
      }, 100);
  }
}

// On Save Brand
onSave() {
  this.isDisabledSaveButton = true;
  this.showError = false;
  if (this.brandSaveModel.BrandName == null || this.brandSaveModel.BrandName == "" || this.brandSaveModel.BrandName == undefined ||
          this.selectedProductCategoryList == null || this.selectedProductCategoryList == undefined || this.selectedProductCategoryList.length == 0) {

        if(this.brandSaveModel.BrandName == null || this.brandSaveModel.BrandName == "" || this.brandSaveModel.BrandName == undefined){
          this.inValidBrandName = true;
          this.showError = true;
        }
        if(this.selectedProductCategoryList == null || this.selectedProductCategoryList == undefined || this.selectedProductCategoryList.length == 0){
          this.inValidProductCategory = true;
          this.showError = true;
        }

      } else {

        if (this.allSelectedProductCategory.selected) {
          this.selectedProductCategoryList = this.selectedProductCategoryList.slice(1);
        }

        this.brandSaveModel.ProductCategoryList = this.selectedProductCategoryList;
        this._httpService.save(BrandApi.saveBrand, this.brandSaveModel).subscribe((respose) => {
          if (respose.MessageCode > 0) {
            this.isSaved.emit(true);
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Brand"));
            this.onCloseDialog();
          } else if(respose.MessageCode < 0){
            this.isDisabledSaveButton = false;
            this._messageService.showErrorMessage(respose.MessageText);
          }
           else {
            this.isDisabledSaveButton = false;
            this._messageService.showErrorMessage(
              this.messages.Error.Get_Error.replace("{0}", "Brands")
            );

          }
        });
      }
}

// Get Brand By ID
getBrandByID() {
  this._httpService.get(BrandApi.getBrandByID + this.brandID).subscribe(
    (response: ApiResponse) => {
      if (response.MessageCode > 0) {
          this.brandSaveModel = response.Result;
          this.addedproductCategoryList = this.brandSaveModel.ProductCategoryList;
          this.setProductCategory();
      }
      else if(response.MessageCode < 0){
        this._messageService.showErrorMessage(response.MessageText);
        this.onCloseDialog();
      }
       else {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Brand")
        );
      }
    },
    (error) => {
      this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace("{0}", "Brand")
      );
    }
  );
}


}

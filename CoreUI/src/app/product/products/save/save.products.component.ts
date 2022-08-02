/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionLike } from "rxjs";
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

/********************* Material:Refference ********************/
import { MatStepper } from '@angular/material/stepper';
import { MatOption } from '@angular/material/core';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';

/* Models */
import { ApiResponse } from 'src/app/models/common.model';
import { ProductBranchPermissionViewModel, ProductMediaViewModel, ProductVariantBranchViewModel, SaveProductModel } from 'src/app/product/models/product.model';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { SaveProductPriceComponent } from '../product-price/save/save.product.price.component';

/**********************  Configurations *********************/
import { EnumSaleSourceType, ENU_Package, ProductAreaEnum, WizardforProduct } from 'src/app/helper/config/app.enums';
import { ProductApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { environment } from 'src/environments/environment';
import { AppUtilities } from 'src/app/helper/aap.utilities';

@Component({
  selector: "app-save-product",
  templateUrl: "./save.products.component.html",
})
export class SaveProductComponent implements OnInit {


  @ViewChild("productInformation") productInformation: NgForm;
  @ViewChild("productBranchesPermission") productBranchesPermission: NgForm;
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild('allRestrictionSelection') private allRestrictionSelection: MatOption;

  @ViewChild('saveProductPriceRef') saveProductPriceRef: SaveProductPriceComponent;

  /***********Messages*********/
  messages = Messages;

  /***********Objects*********/
  productID: number = 0;
  /*********** Local *******************/
  showProductInformationError: boolean = false;
  showSave: boolean = false;
  showContinue: boolean = true;
  showPrevious: boolean = false;
  showPricingValidation: boolean = false;
  isSaveClicked: boolean = false;
  isShowDefaultImageSetError: boolean = false;
  currentBranchSubscription: SubscriptionLike;
  packageIdSubscription: SubscriptionLike;

  isExceedPackage: boolean = false;
  package = ENU_Package;

  // ShowCommonError:boolean = false;


  ////////////////////////
  saveProductModel: SaveProductModel = new SaveProductModel();
  variantName: string;

  selectedRestrictedList: any[] = [];
  restrictedList = Configurations.RestrictList;
  brandList: any[] = [];
  productCategoryList: any[] = [];
  branchList: any[] = [];
  supplierList: any[] = [];
  taxList: any[] = [];
  measurementUnitList: any[] = [];
  classificationList = Configurations.ClassificationList;

  productAreaEnum = ProductAreaEnum;

  serverImageAddressWithBranch = environment.imageUrl;
  serverImageAddressOnlyCompany = environment.imageUrl;
  appSourceTypeID = EnumSaleSourceType;

  constructor(
    private httpImage: HttpClient,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    private _router: Router,
    private route: ActivatedRoute,
    private _matDialog: MatDialogService,

  ) {
    this.saveProductModel = new SaveProductModel();
    this.serverImageAddressOnlyCompany = this.serverImageAddressOnlyCompany.replace("{ImagePath}", AppUtilities.setCustomerImagePath());
    this.serverImageAddressWithBranch = this.serverImageAddressOnlyCompany.replace("{ImagePath}", AppUtilities.setOtherImagePath());
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
          if (packageId && packageId > 0) {
            this.setPackagePermission(packageId);
          }
      }
  );
  }

  ngOnInit() {
    // here we get the id from route
    this.route.params.subscribe((params: Params) => {
      let productID = (params["ID"])
      this.productID = Number(productID);

      this.getFundamentals();

      if (this.productID > 0) {
        this.getProductByID();
      } else{
        this.saveProductModel.HasBranchPermission = true;
      }

    });
  }

  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
    this.currentBranchSubscription?.unsubscribe();
  }

  //#region event start
  setPackagePermission(packageId: number) {
      switch (packageId) {
          case this.package.Full:
            this.isExceedPackage = true;
              break;
      }
  }
  // Purchase restriction

  toggleAllRestrictionSelection() {
    this.selectedRestrictedList = [];

    if (this.allRestrictionSelection.selected) {
      this.restrictedList.forEach(service => {
        this.selectedRestrictedList.push(service);
      });
      setTimeout(() => {
        this.allRestrictionSelection.select();
      }, 100);
    }
  }

  togglePerOneRestriction() {
    if (this.allRestrictionSelection && this.allRestrictionSelection.selected) {
      this.allRestrictionSelection.deselect();
    }
    if (this.restrictedList.length == this.selectedRestrictedList.length && this.restrictedList.length > 1) {
      this.allRestrictionSelection.select();
    }
  }

  onChangeProductInformation() {
    if (this.productInformation.valid) {
      this.showProductInformationError = false;
    }
  }

  onDeleteImage(event, arrayIndex) {
    this.isShowDefaultImageSetError = false;
    event.stopPropagation();
    this.saveProductModel.ProductMediaVM.splice(arrayIndex, 1);
  }

  onSetDefaultImage(event, arrayIndex) {
    this.isShowDefaultImageSetError = false;
    event.stopPropagation();
    if (this.saveProductModel.ProductMediaVM[arrayIndex].IsDefault == true) {
      this.saveProductModel.ProductMediaVM[arrayIndex].IsDefault = false;
    } else {
      this.saveProductModel.ProductMediaVM.forEach(media => {
        media.IsDefault = false;
      });

      this.saveProductModel.ProductMediaVM[arrayIndex].IsDefault = true;
    }

  }

  onChangeIsActive(event, branchData) {
    this.saveProductModel.ProductBranchPermissionVM.forEach((item) => {
      if (item.BranchID == branchData.BranchID) {
        item.IsOnline = false;
        item.IsHidePriceOnline = false;
        item.IsFeatured = false;
      }
    });
  }

  onChangeIsOnline(event, branchData) {
    this.saveProductModel.ProductBranchPermissionVM.forEach((item) => {
      if (item.BranchID == branchData.BranchID) {
        item.IsHidePriceOnline = false;
        item.IsFeatured = false;
      }
    });
  }

  onErrorImage(arrayIndex){
      //this.saveProductModel.ProductMediaVM[arrayIndex].ServerImageAddress = this.serverImageAddressWithBranch;
  }

  onLoadImage(event){
    //console.log('onLoadImage' + event)
  }

  //#endregion event

  //#region Image crop , set and delete region
  showImageCropperDialog(arrayIndex) {
    this.isShowDefaultImageSetError = false;
    if (this.saveProductModel.HasBranchPermission) {
      const dialogInst = this._matDialog.open(ImageEditorPopupComponent, {
        disableClose: true,
        data: {
          height: 460,
          width: 720,
          aspectRatio: 720 / 460,
          showWebCam: true
        }
      });

      dialogInst.componentInstance.croppedImage.subscribe((imgFile: string) => {
        if (imgFile && imgFile.length > 0) {
          this.concatenateImagePath(arrayIndex, imgFile);
        }
      });
  }
  }

  concatenateImagePath(arrayIndex, imgFile: string) {

    if (arrayIndex == null && imgFile && imgFile != "") {
      let productMediaViewModel = new ProductMediaViewModel();
      productMediaViewModel.IsDefault = this.saveProductModel.ProductMediaVM == null || this.saveProductModel.ProductMediaVM?.length == 0 ? true : false;
      productMediaViewModel.ImageFile = imgFile;
      productMediaViewModel.ImagePath = "";
      this.saveProductModel.ProductMediaVM.push(productMediaViewModel);
    }
    else if (imgFile && imgFile != "") {
      this.saveProductModel.ProductMediaVM[arrayIndex].ImageFile = imgFile;
      this.saveProductModel.ProductMediaVM[arrayIndex].ImagePath = "";
    }
  }
  //#endregion image

  // #region method start

  // get the product by ID
  getProductByID() {
    this._httpService.get(ProductApi.GetByID + this.productID).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.saveProductModel = response.Result;

          this.saveProductModel.HasBranchPermission = this.saveProductModel.AppSourceTypeID == this.appSourceTypeID.OnSite ? true : this.saveProductModel.HasBranchPermission;

          if(this.saveProductModel.ProductMediaVM && this.saveProductModel.ProductMediaVM.length > 0){
            this.saveProductModel.ProductMediaVM.forEach(img => {
              img.ServerImageAddress = this.serverImageAddressOnlyCompany;
            });
          }
          this.setPurchaseRestriction();
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

  setPurchaseRestriction() {
    if (this.saveProductModel.RestrictedCustomerTypeIDs) {
      var i;
      this.selectedRestrictedList = [];
      var array = this.saveProductModel.RestrictedCustomerTypeIDs.split(',');
      for (i = 0; i < array.length; ++i) {
        var result = this.restrictedList.find(m => m.value == Number(array[i]));
        if (result) {
          this.selectedRestrictedList.push(result)
        }
      }
      // check if all selected set All true
      if (this.restrictedList && this.selectedRestrictedList && this.restrictedList.length == this.selectedRestrictedList.length) {
        setTimeout(() => {
          this.allRestrictionSelection.select();
        }, 100);
      }
    }
  }

  isSetDefaultImage() {
    if (this.saveProductModel.ProductMediaVM && this.saveProductModel.ProductMediaVM.length > 0) {
      var result = this.saveProductModel.ProductMediaVM.find(i => i.IsDefault);
      if (result) {
        return true;
      } else {
        this.isShowDefaultImageSetError = true;
        return false;
      }
    } else {
      return true;
    }
  }

  // stepper next button
  onNext() {
    if (this.stepper.selectedIndex === WizardforProduct.ProductInformation) {
      if (this.productInformation.valid && this.isSetDefaultImage()) {
        this.variantName = this.productID > 0 ? null : this.saveProductModel.ProductName;
        this.showProductInformationError = false;
        this.showPrevious = true;
        this.showContinue = this.productID > 0 ? false : true;
        this.showSave = this.productID > 0 ? true : false;
        this.stepper.next();
      } else {
        this.showProductInformationError = this.productInformation.valid ? false : true;
      }
    } else if (this.stepper.selectedIndex === WizardforProduct.BranchesAndPermissions) {
        this.showProductInformationError = false;

        if(this.saveProductPriceRef?.productVariantPricingModel == null || this.saveProductPriceRef?.productVariantPricingModel.length == 0){
          this.saveProductPriceRef.preparePricingDataToShow(true, new ProductVariantBranchViewModel());
        }

        this.showPrevious = true;
        this.showContinue = false;
        this.showSave = true;
        this.stepper.next();

    }
  }

  // stepper previous button
  onPrevious() {
    this.stepper.previous();
    this.stepper.selected.editable = true;
    this.showPrevious = this.stepper.selectedIndex === WizardforProduct.ProductInformation ? false : true;
    this.showSave = false;
    this.showContinue = true;
  }

  // save the product information
  onSave() {
    if (this.productID > 0) {
        this.saveProduct();
    } else {
      if (this.checkIsPricingAdded()) {
        this.saveProduct();
      }
    }
  }

  saveProduct() {
    this.prepareDataForSave();
    this.saveProductModel.ProductBranchPermissionVM.filter(x => x.IsIncluded = true)
    this._httpService.save(ProductApi.saveProduct, this.saveProductModel).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Product"));
          this._router.navigate(['/product/products']);
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Product"));
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Save_Error.replace("{0}", "Product")
        );
      }
    );
  }

  prepareDataForSave() {
    this.saveProductModel.AppSourceTypeID = this.appSourceTypeID.OnSite;
    if (this.selectedRestrictedList && this.selectedRestrictedList.length > 0) {
      this.saveProductModel.RestrictedCustomerTypeIDs = this.listToCommaSeparatedString(this.selectedRestrictedList);
    } else {
      this.saveProductModel.RestrictedCustomerTypeIDs = "";
    }

    this.saveProductModel.ProductMediaVM = this.saveProductModel.ProductMediaVM && this.saveProductModel.ProductMediaVM.length > 0 ? this.saveProductModel.ProductMediaVM : null;

    if (this.saveProductModel.ProductMediaVM && this.saveProductModel.ProductMediaVM.length > 0) {
      this.saveProductModel.ProductMediaVM.forEach(async img => {

      });
    }

    this.saveProductModel.ProductVariantPackagingVM = this.saveProductPriceRef?.productVariantPackagingVM.SizeVolumeUnitID > 0
      || this.saveProductPriceRef?.productVariantPackagingVM.Weight
      || this.saveProductPriceRef?.productVariantPackagingVM.Length
      || this.saveProductPriceRef?.productVariantPackagingVM.Height
      || this.saveProductPriceRef?.productVariantPackagingVM.SizeVolume
      ? this.saveProductPriceRef?.productVariantPackagingVM : null;

    this.saveProductModel.ProductVariantBranchVM = [];
    this.saveProductPriceRef?.productVariantPricingModel.forEach(variant => {
      variant.ProductVariantBranchViewModel.forEach(pricing => {
        pricing.ItemTaxVM = pricing.ItemTaxVM && pricing.ItemTaxVM.length > 0 ? pricing.ItemTaxVM : null;
        pricing.CollapseItemTaxVM = null;
        pricing.SupplierID = pricing.SupplierID && pricing.SupplierID > 0 ? pricing.SupplierID : null;
        this.saveProductModel.ProductVariantBranchVM.push(pricing);
      });
    });
  }

  // Array convert into String
  listToCommaSeparatedString(arr: any) {
    var i;
    var result: string = "";
    for (i = 0; i < arr.length; ++i) {
      if (arr[i].value !== undefined) {
        result = result + arr[i].value + ((arr.length - 1) == i ? "" : ",");
      }
    }
    return result;
  }

  checkIsPricingAdded() {
    return this.saveProductPriceRef.isPricingAdded();
  }

  // get the fundamentals list
  getFundamentals() {
    this._httpService.get(ProductApi.getSaveFundamentals).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.brandList = response.Result.BrandDDVM;
          this.branchList = response.Result.BranchDDVM;
          this.supplierList = response.Result.SupplierDDVM;
          this.productCategoryList = response.Result.ProductCategoryDDVM;
          this.taxList = response.Result.TaxDDVM;
          this.measurementUnitList = response.Result.MeasurementUnitDDVM;

          if (this.productID == 0) {
            this.saveProductModel.ProductClassificationID = Number(this.classificationList[0].value);
            this.saveProductModel.ProductCategoryID = null;
            this.saveProductModel.BrandID = 0;
            this.setDefaultBranchPermissions();
          }
        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Product Fundamental")
          );
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Save_Error.replace("{0}", "Product Fundamental")
        );
      }
    );
  }

  setDefaultBranchPermissions() {
    this.saveProductModel.ProductBranchPermissionVM = [];
    this.branchList.forEach((branch) => {
      let pbp = new ProductBranchPermissionViewModel();
      pbp.BranchID = branch.BranchID;
      pbp.BranchName = branch.BranchName;
      pbp.IsActive = false;
      pbp.IsOnline = false;
      pbp.IsHidePriceOnline = false;
      pbp.IsFeatured = false;
      pbp.HasTrackInventory = false;
      pbp.IsIncluded = false;
      this.saveProductModel.ProductBranchPermissionVM.push(pbp);
    });
  }

  // #region method end

}

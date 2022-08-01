/********************** Angular Refrences *********************/
import { Component, Input, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';

/* Models */
import { DD_Branch } from 'src/app/models/common.model';
import { ProductBranchPermissionViewModel, SaveProductVariantBranchViewModel, ProductVariantPackagingViewModel, ProductVariantPricingModel, ProductVariantBranchViewModel } from 'src/app/product/models/product.model';

/********************** Configuration *********************/
import { ProductAreaEnum, ProductClassification } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';

/********************** Components *********************/
import { BulkUpdatePriceComponent } from './bulk.update.price.component';
import { SavePackagingComponent } from './packaging/packaging.component';

@Component({
  selector: 'app-save-product-price',
  templateUrl: './save.product.price.component.html'
})
export class SaveProductPriceComponent implements OnInit {

  currencySymbol: string = "";
  currencyFormat: string = "";
  /***********Messages*********/
  messages = Messages;

  @Input() productVariantPricingModel: ProductVariantPricingModel[] = new Array<ProductVariantPricingModel>();
  @Input() productVariantPackagingVM: ProductVariantPackagingViewModel = new ProductVariantPackagingViewModel();

  @Input() areaName: number;
  @Input() taxList: any[] = [];
  @Input() measurementUnitList: any[] = [];
  @Input() branchList: ProductBranchPermissionViewModel[] = new Array<ProductBranchPermissionViewModel>();
  @Input() supplierList: any[] = [];
  @Input() variantName: string;
  @Input() variantID: number;
  @Input() productClassificationID: number;
  @Input() isExceedPackage: boolean;



  productAreaEnum = ProductAreaEnum;

  showProductPricingError: boolean = false;

  currentBranchSubscription: SubscriptionLike;

  toggleStatuses: any[] = [];
  enum_Product_ClassificationType = ProductClassification;

  constructor(
    private _dialog: MatDialogService,
    private _dataSharingService: DataSharingService
  ) {

  }

  ngOnInit() {
    this.getDefaultBranch();
  }

  ngOnDestroy() {
    this.currentBranchSubscription?.unsubscribe();
  }

  async getDefaultBranch() {
    this.currentBranchSubscription =
      this._dataSharingService.currentBranch.subscribe((branch: DD_Branch) => {
        if (branch.BranchID && branch.hasOwnProperty("Currency")) {
          this.currencyFormat = branch.CurrencySymbol;
        }
      });
  }

  onCloseDialog() {
    this._dialog.close();
  }

  /* Method to toggle the tax length and view */
  onToggleClick(parentIndex, childIndex, i: number, isCallTS: boolean = false) {

    if(!isCallTS){
      this.toggleStatuses[i].collapse = !this.toggleStatuses[i].collapse;
      this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].CollapseItemTaxVM = this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].ItemTaxVM;
    } else{

      this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].CollapseItemTaxVM = [];

      if(this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].ItemTaxVM && this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].ItemTaxVM.length > 0){
        this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].CollapseItemTaxVM.push(this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].ItemTaxVM[0]);
      }

      this.toggleStatuses[i].collapse = true;
    }

  }
  onBulkUpdate(isBulkUpdate: boolean, parentIndex: number, childIndex: number) {
    this.showProductPricingError = false;
    let pricingDetail = new SaveProductVariantBranchViewModel();

    if (parentIndex != null) {
      pricingDetail = this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex];
    }

    let data = {
      taxList: isBulkUpdate ? this.taxList.filter(i => i.BranchID === 0) : this.taxList.filter(i => i.BranchID === pricingDetail.BranchID || i.BranchID === 0),
      supplierList: this.supplierList,
      areaName: this.areaName,
      pricingDetail: pricingDetail,
      currencySymbol: this.currencyFormat,
      isBulkUpdate: isBulkUpdate,
      isShowCheckBox: this.productClassificationID == this.enum_Product_ClassificationType.Variant ? true : false,
      isExceedPackage:this.isExceedPackage
    }

    const dialogref = this._dialog.open(BulkUpdatePriceComponent, {
      data: data,
      disableClose: true
    });

    dialogref.componentInstance.savePricingModel.subscribe(savePricingModel => {
      if (savePricingModel) {
        if (isBulkUpdate) {
          this.preparePricingDataToShow(isBulkUpdate, savePricingModel);
        } else if (savePricingModel && parentIndex != null) {
          this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex] = savePricingModel;

          this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].CollapseItemTaxVM = [];

          if (savePricingModel.ItemTaxVM && savePricingModel.ItemTaxVM.length > 0) {
            this.productVariantPricingModel[parentIndex].ProductVariantBranchViewModel[childIndex].CollapseItemTaxVM.push(savePricingModel.ItemTaxVM[0]);
          }
          this.onToggleClick(parentIndex, childIndex, parentIndex + childIndex, true);
        }

      }
    });
  }

  onSavePackaging() {

    let data = {
      measurementUnitList: this.measurementUnitList,
      pcakagingDetail: this.productVariantPackagingVM,
    }

    const dialogref = this._dialog.open(SavePackagingComponent, {
      data: data,
      disableClose: true
    });

    dialogref.componentInstance.savePackagingModel.subscribe(savePackagingModel => {
      if (savePackagingModel) {
        this.productVariantPackagingVM = savePackagingModel;
      }
    });
  }

  preparePricingDataToShow(isBulkUpdate: boolean, savePricingModel: ProductVariantBranchViewModel) {
    if (this.areaName == this.productAreaEnum.SaveProduct && isBulkUpdate) {

      this.productVariantPricingModel = [];

      var productVariantPricing = new ProductVariantPricingModel();
      productVariantPricing.ProductVariantName = this.variantName;
      productVariantPricing.ProductVariantID = this.variantID;
      productVariantPricing.ProductVariantBranchViewModel = [];

      this.branchList.forEach((branch) => {
          let productVariantBranch = new ProductVariantBranchViewModel();
          productVariantBranch.Barcode = savePricingModel.Barcode;
          productVariantBranch.BranchID = branch.BranchID;
          productVariantBranch.BranchName = branch.BranchName;
          productVariantBranch.ItemTaxVM = savePricingModel?.ItemTaxVM;

          productVariantBranch.CollapseItemTaxVM = [];

          if (productVariantBranch.ItemTaxVM && productVariantBranch.ItemTaxVM.length > 0) {
            productVariantBranch.CollapseItemTaxVM.push(productVariantBranch.ItemTaxVM[0]);
          }

          productVariantBranch.Price = savePricingModel.Price;
          productVariantBranch.ProductVariantID = savePricingModel.ProductVariantID;
          productVariantBranch.ProductVarientBranchID = savePricingModel.ProductVarientBranchID;
          productVariantBranch.ReorderQuantity = savePricingModel.ReorderQuantity;
          productVariantBranch.ReorderThreshold = savePricingModel.ReorderThreshold;
          productVariantBranch.SKU = savePricingModel.SKU;
          productVariantBranch.SupplierCode = savePricingModel.SupplierCode;
          productVariantBranch.SupplierID = savePricingModel.SupplierID;
          productVariantBranch.SupplierName = savePricingModel.SupplierName;
          productVariantBranch.SupplierPrice = savePricingModel.SupplierPrice;
          productVariantBranch.TotalPrice = savePricingModel.TotalPrice;

          productVariantPricing.ProductVariantBranchViewModel.push(productVariantBranch);

      });
      this.setToggleStatuses(productVariantPricing.ProductVariantBranchViewModel.length);
      this.productVariantPricingModel.push(productVariantPricing);

    }
  }

  /* Method to set the toggle Statuses */
  setToggleStatuses(length: number) {
    for (let i = 0; i < length; i++) {
      this.toggleStatuses[i] = {
        collapse: true
      };
    }
  }


  isPricingAdded(){
    var result: boolean = true;

    this.productVariantPricingModel[0].ProductVariantBranchViewModel.forEach(pricing => {
      if(pricing.Price == null || pricing.Price == undefined || pricing.Price.toString() == "") {
        result = false;
      }
    });

    this.showProductPricingError = result ? false : true;
    return result;
  }


  removeNotAddedBranchPricing() {
    // check if branch not added remove not added branch data
    if (this.areaName == this.productAreaEnum.SaveProduct && this.productVariantPricingModel && this.productVariantPricingModel.length > 0) {

      let productVariantPricingModel = new Array<ProductVariantPricingModel>();
      this.productVariantPricingModel.forEach(variant => {
        let _variant = new ProductVariantPricingModel();
        _variant.ProductVariantID = variant.ProductVariantID;
        _variant.ProductVariantName = variant.ProductVariantName;
        _variant.ProductVariantBranchViewModel = [];

        variant.ProductVariantBranchViewModel.forEach(pricing => {

          var result = this.branchList.find(br => br.BranchID == pricing.BranchID && br.IsIncluded == true);
          if (result) {
            _variant.ProductVariantBranchViewModel.push(pricing);
          }

        });
        productVariantPricingModel.push(_variant);

      });
      this.productVariantPricingModel = productVariantPricingModel;
    }
  }

}

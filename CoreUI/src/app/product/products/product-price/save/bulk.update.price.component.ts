import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductAreaEnum, PricingCheckBoxValues } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { NumberValidator } from '@app/shared/helper/number.validator';
import { ItemTaxViewModel, ProductVariantBranchViewModel } from '@app/product/models/product.model';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ProductApi } from '@app/helper/config/app.webapi';
import { ApiResponse,DD_Branch } from '@app/models/common.model';
import { SubscriptionLike as ISubscription } from "rxjs";
import { DataSharingService } from '@app/services/data.sharing.service';


@Component({
  selector: 'app-bulk-update-price',
  templateUrl: './bulk.update.price.component.html'
})
export class BulkUpdatePriceComponent implements OnInit {

  @Output() savePricingModel = new EventEmitter<ProductVariantBranchViewModel>();
  @ViewChild('allSelectedTax') private allSelectedTax: MatOption;
  @ViewChild('allSupplierTax') private allSupplierTax: MatOption;
  currentBranchSubscription: ISubscription;

  /***********Messages*********/
  messages = Messages;

  //local variables

  numberValidator: NumberValidator = new NumberValidator();

  savePricingDetail: ProductVariantBranchViewModel = new ProductVariantBranchViewModel();
  oldPricingDetail: ProductVariantBranchViewModel = new ProductVariantBranchViewModel();
  selectedTaxList: any[] = [];
  selectedSupplierList: any[] = [];
  isShowPriceError: boolean = false;

  // enums
  productAreaEnum = ProductAreaEnum;
  PricingCheckBoxValues = PricingCheckBoxValues;
  savebtnEnabled: boolean = false;
  currencyFormat: string;

  constructor(
    private _dialog: MatDialogRef<BulkUpdatePriceComponent>,
    private _taxCalculationService: TaxCalculation,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.getBranchInfo();
  }

  ngOnInit() {
    console.log(this.data)
    this.oldPricingDetail = JSON.parse(JSON.stringify(this.data.pricingDetail));
    this.savePricingDetail = this.data.pricingDetail;
    this.savePricingDetail.SupplierID = this.savePricingDetail.SupplierID ? this.savePricingDetail.SupplierID : null;
    this.setModelValues();
  }

  ngOnDestroy() {
    this.currentBranchSubscription?.unsubscribe();
  }

  getBranchInfo() {
    // get data according to selected branch
    this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe(
      (branch: DD_Branch) => {
        if (branch.BranchID) {
          this.currencyFormat = branch.CurrencySymbol;
        }
      }
    )
  }

  //#region  event

  onPriceChange(amount: number, val: string) {
    //setTimeout(() => {
      this.isShowPriceError = false;
      if (val == "price") {

        if (!amount)
          amount = 0;

        this.savePricingDetail.Price = amount;
        this.savePricingDetail.TotalPrice = this.savePricingDetail.Price;
      } else {
        this.savePricingDetail.TotalPrice = this.savePricingDetail.Price ? this.savePricingDetail.Price : 0;
      }
      this.getTotalPrice();
    //}, 10);
  }

  onSelectCheckBox(event: any) {
    this.isShowPriceError = false;
    switch (event.target.id) {
      case this.PricingCheckBoxValues.BarCode:
        this.savePricingDetail.PriceCheckBoxVM.isBarCode = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.Barcode = "";
        }
        break;
      case this.PricingCheckBoxValues.SKU:
        this.savePricingDetail.PriceCheckBoxVM.isSKU = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.SKU = "";
        }
        break;
      case this.PricingCheckBoxValues.Supplier:
        this.savePricingDetail.PriceCheckBoxVM.isSupplier = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.SupplierID = null;
        }
        break;
      case this.PricingCheckBoxValues.SupplerCode:
        this.savePricingDetail.PriceCheckBoxVM.isSupplierCode = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.SupplierCode = "";
        }
        break;
      case this.PricingCheckBoxValues.ReOrderThreshold:
        this.savePricingDetail.PriceCheckBoxVM.isRecordThreshold = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.ReorderThreshold = null;
        }
        break;
      case this.PricingCheckBoxValues.ReOrderQty:
        this.savePricingDetail.PriceCheckBoxVM.isReOrderQty = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.ReorderQuantity = null;
        }
        break;
      case this.PricingCheckBoxValues.SupplierPrice:
        this.savePricingDetail.PriceCheckBoxVM.isisSupplierPrice = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.SupplierPrice = null;
        }
        break;
      case this.PricingCheckBoxValues.Price:
        this.savePricingDetail.PriceCheckBoxVM.isPrice = event.target.checked ? true : false;
        if (!event.target.checked) {
          this.savePricingDetail.Price = null;
        }
        break;
      case this.PricingCheckBoxValues.Tax:
        if (event.target.checked) {
          this.savePricingDetail.PriceCheckBoxVM.isPrice = true;
          this.savePricingDetail.Price = this.savePricingDetail.Price >= 0 ? this.savePricingDetail.Price : null;
          this.isShowPriceError = this.savePricingDetail.Price == null ? true :  this.savePricingDetail.Price >= 0 ? false : true;
          this.savePricingDetail.PriceCheckBoxVM.isTax = event.target.checked ? true : false;
        }

        if (!event.target.checked) {
        this.isShowPriceError = this.savePricingDetail.Price == null ? true :  this.savePricingDetail.Price >= 0 ? false : true;
        this.savePricingDetail.PriceCheckBoxVM.isTax = event.target.checked ? true : false;
        this.savePricingDetail.ItemTaxVM = [];
        this.selectedTaxList = [];
        }
        break;
      default:
        break;
    }
    this.getTotalPrice();
  }

  toggleAllTaxSelection() {
    this.selectedTaxList = [];

    if (this.allSelectedTax.selected) {
      this.data.taxList.forEach(service => {
        this.selectedTaxList.push(service);
      });

      setTimeout(() => {
        this.allSelectedTax.select();
      }, 100);
    }
    this.onTaxSelectionChange();
  }

  tosslePerOneTax(all) {
    if (this.allSelectedTax && this.allSelectedTax.selected) {
      this.allSelectedTax.deselect();
    }
    if (this.data.taxList.length == this.selectedTaxList.length && this.data.taxList.length > 1) {
      this.allSelectedTax.select();
    }
    this.onTaxSelectionChange();
  }

  onTaxSelectionChange() {
    this.savePricingDetail.ItemTaxVM = [];
    if (this.data.taxList && this.data.taxList.length > 0) {
      if (this.selectedTaxList && this.selectedTaxList.length > 0) {
        this.selectedTaxList.forEach(tax => {
          if (tax.TaxID && tax.TaxID > 0) {
            var _tax = new ItemTaxViewModel()
            _tax.TaxID = tax.TaxID;
            _tax.TaxName = tax.TaxName;
            this.savePricingDetail.ItemTaxVM.push(_tax);
          }
        });
      }
    }
    this.getTotalPrice();
  }

  getTotalTaxPercentage() {
    let taxTotal = 0;
    if (this.savePricingDetail.ItemTaxVM) {
      this.savePricingDetail.ItemTaxVM.forEach(tax => {
        taxTotal += this.data.taxList.find(t => t.TaxID === tax.TaxID).TaxPercentage;
      })
    }
    return taxTotal;
  }

  getTotalPrice() {
    this.savePricingDetail.TotalPrice = this.savePricingDetail.Price ? this.savePricingDetail.Price : 0;
    if (this.data.taxList && this.data.taxList.length > 0 && this.selectedTaxList && this.selectedTaxList.length > 0) {
      this.selectedTaxList.forEach(tax => {
        let selectedVatValue: number;
        selectedVatValue = this._taxCalculationService.getTaxAmount(tax.TaxPercentage, Number(this.savePricingDetail.Price));
        this.savePricingDetail.TotalPrice = Number(this.savePricingDetail.TotalPrice) + selectedVatValue;
      });
      this.savePricingDetail.TotalPrice = this._taxCalculationService.getRoundValue(this.savePricingDetail.TotalPrice);
    }
  }

  onChangeSupplier() {
    this.savePricingDetail.SupplierName = this.savePricingDetail.SupplierID > 0 ? this.data.supplierList.find(s => s.SupplierID == this.savePricingDetail.SupplierID)?.SupplierName : "";
  }
  ////////////////////////////////////

  setModelValues() {

    if (this.savePricingDetail.Tax != undefined && this.savePricingDetail.Tax != "" && this.savePricingDetail.TaxIDs != "" && this.savePricingDetail.TaxIDs != undefined) {
      let taxNameList: any = this.savePricingDetail.Tax.split(',');
      let taxIdsList: any = this.savePricingDetail.TaxIDs.split(',');
      this.savePricingDetail.ItemTaxVM = [];
      for (let i = 0; i < taxIdsList.length; i++) {
        for (let j = 0; j < taxNameList.length; j++) {
          let TaxObj = {
            TaxID: taxIdsList[i],
            TaxName: taxNameList[j]
          }
          this.savePricingDetail.ItemTaxVM.push(TaxObj);
          break;
        }
      }
    }

    this.selectedTaxList = [];
    if (this.data.taxList && this.savePricingDetail.ItemTaxVM) {
      this.data.taxList.forEach((tax) => {
        var result = this.savePricingDetail.ItemTaxVM.find(it => it.TaxID == tax.TaxID);
        if (result)
          this.selectedTaxList.push(tax);
      });
    }

    if (this.data.taxList && this.selectedTaxList && this.selectedTaxList.length == this.data.taxList.length && this.data.taxList.length > 1) {
      setTimeout(() => {
        this.allSelectedTax.select();
      }, 100);
    }

    this.getTotalPrice();
  }

  onChangeOnlyNumbers(num, type) {
    setTimeout(() => {
      if (type == 1) {
        this.savePricingDetail.ReorderThreshold = this.numberValidator.NotAllowDecimalValue(num);
      } else {
        this.savePricingDetail.ReorderQuantity = this.numberValidator.NotAllowDecimalValue(num);
      }
    }, 10);
  }
  //#endregion event

  onClose(isSaved: boolean = false) {
    if (!isSaved && !this.data.isBulkUpdate && this.data.areaName == this.productAreaEnum.SaveProduct) {
      this.savePricingDetail = JSON.parse(JSON.stringify(this.oldPricingDetail));
      this.savePricingModel.emit(this.savePricingDetail);
    }
    this._dialog.close();
  }

  onSavePricing() {
    if (this.data.areaName == this.productAreaEnum.EditPricing) {
      this.onSaveEditPricing();
    } else {
      this.onSaveProductPricing();
    }
  }

  onSaveProductPricing() {

    if (this.savePricingDetail.Price == 0 || this.savePricingDetail.Price > 0) {
      if (!this.data.isShowCheckBox && this.data.areaName == this.productAreaEnum.SaveProduct && (this.savePricingDetail.Barcode || this.savePricingDetail.SKU)) {
        this.validateBarCodeAndSKU();
      } else {
        this.savePricingModel.emit(this.savePricingDetail);
        this.onClose(true);
      }

    } else {
      this.isShowPriceError = true;
    }
  }

  onSaveEditPricing() {
    if (!this.isShowPriceError) {
      if (!this.data.isShowCheckBox && this.data.areaName == this.productAreaEnum.SaveProduct && (this.savePricingDetail.Barcode || this.savePricingDetail.SKU)) {
        this.validateBarCodeAndSKU();
      } else {
        this.savePricingDetail.IsPriceAndTaxUpdate = this.savePricingDetail.PriceCheckBoxVM.isPrice || this.savePricingDetail.PriceCheckBoxVM.isTax ? true : false;
        this.savePricingDetail.Price = this.savePricingDetail.Price == null ? 0 : this.savePricingDetail.Price;
        this.savePricingModel.emit(this.savePricingDetail);
        this.onClose(true);
      }
    } else {
      this.isShowPriceError = true;
    }
  }

  validateBarCodeAndSKU() {
    let param = {
      branchIDs: this.savePricingDetail.BranchID,
      barcode: this.savePricingDetail.Barcode,
      Sku: this.savePricingDetail.SKU
    }
    this._httpService.save(ProductApi.validateBarcodeAndSKU, param).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.savePricingModel.emit(this.savePricingDetail);
          this.onClose(true);
        }else {
          this._messageService.showErrorMessage(response.MessageText);
        }

      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Save_Error.replace("{0}", "Product Pricing")
        );
      }
    );
  }

  isEnableSaveBtn(){
    this.savebtnEnabled = true;
  }
}

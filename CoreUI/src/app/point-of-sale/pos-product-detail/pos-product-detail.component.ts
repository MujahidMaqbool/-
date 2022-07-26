import { Component, OnInit, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { ApiResponse } from 'src/app/models/common.model';
import { PointOfSaleApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { POSProduct } from '../models/point.of.sale.model';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';

@Component({
  selector: 'app-pos-product-detail',
  templateUrl: './pos-product-detail.component.html'
})
export class PosProductDetailComponent extends AbstractGenericComponent implements OnInit {
  /*** Local Variables */
  @Output() productVariantAvailable = new EventEmitter<POSProduct>();

  isCheckAvaliblity: boolean = false;
  isOutOfStock: boolean = false;
  messages = Messages;
  serverImageAddress = environment.imageUrl;
  product: any = {};
  sortedAttributeValueIDs: any[] = [];
  sortedAttributeValues: any[] = [];
  selectedAttributeValueID: number = null;
  currencyFormat: string;
  currencySymbol: string;
  alreadyAddedVarientCount:number = 0;
  /*** Model And Collection */
  saleProductVariantAvailability: POSProduct = new POSProduct();
  itemTotalPrice:number;
  isBenefit:boolean = false;
  showError:boolean = false;

  productPlaceHolderImage = 'assets/images/placeholder-img.jpg';

  constructor(private _dialogRef: MatDialogRef<PosProductDetailComponent>,

    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _taxCalculationService: TaxCalculation,

    @Inject(MAT_DIALOG_DATA) public productData: any) { super() }

  ngOnInit(): void {

    if(this.productData.isBarCodeSearch){
      this.getBarcodeSearchProductDetail();
    }
    this.getBranchDetails();
    this.product = this.productData.product;
    if (this.product.ProductImages?.length > 0 ) {
      this.product.ProductImages[0].ServerImageAddress = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePathForCompanyOnly())
    }

    this.product.ProductAttributes = this.product.ProductAttributes.sort((a, b) => a.SortOrder - b.SortOrder);
    if(!this.productData.isBarCodeSearch){
      this.product.ProductAttributes.forEach(element => {
        element.SelectedAttributID = 0;
      });
    }
  }

  async getBranchDetails() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.Currency;
      this.currencySymbol = branch.CurrencySymbol;
    }
  }

  //#region Events

  onClose() {
    this._dialogRef.close();
  }

  onErrorImage(){
    //this.product.ProductImages[0].ServerImageAddress = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath())
  }

  // check select product varient is available or not
  onCheckProductVariantAvalibility() {

    let Params = {
      productID: this.product.ProductID,
      sortedAttributeValueIDs: this.sortedAttributeValueIDs,
      customerMembershipID: this.productData.customerMembershipID ? this.productData.customerMembershipID : null,
      customerID: this.productData.customerID ? this.productData.customerID : null
    };
    this._httpService.save(PointOfSaleApi.checkAvailability, Params)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (res.Result) {
              this.isCheckAvaliblity = true;
              this.saleProductVariantAvailability = new POSProduct()
              this.saleProductVariantAvailability = res.Result;
              this.subtractAlreadyAddedProduct();
              this.isProductHasBenefits();

            }else if(res.MessageCode == 204) {
              this._messageService.showErrorMessage(res.MessageText);
            }
            else {
              this.isOutOfStock = true;
              this.saleProductVariantAvailability = new POSProduct;
            }
          }
          else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Product'))
        }
      );
  }

  // if Products varient is already added in pos cart then minus that amount from stock amount
  subtractAlreadyAddedProduct(){
        this.alreadyAddedVarientCount = 0;
        this.productData.productCartList.forEach(element => {
          if(element.ProductVariantID ==  this.saleProductVariantAvailability.ProductVariantID){
            this.alreadyAddedVarientCount =  this.alreadyAddedVarientCount + element.Qty;
          }
      });
      this.saleProductVariantAvailability.CurrentStock = this.saleProductVariantAvailability.CurrentStock - this.alreadyAddedVarientCount;
      // if(!this.saleProductVariantAvailability.InventoryOverselling && this.saleProductVariantAvailability.CurrentStock == 0){
        if(!this.saleProductVariantAvailability.InventoryOverselling  && this.saleProductVariantAvailability.HasTrackInventory && (this.saleProductVariantAvailability.CurrentStock == 0 || this.saleProductVariantAvailability.CurrentStock !< 0)){
           this.isOutOfStock = true;
      }
      }

  // added to cart validation
  onAddToCartProduct() {
    if (this.isOutOfStock) {
      this._messageService.showErrorMessage(this.messages.Error.Item_Out_Of_Stock);
      return;
    } else {
      this.saleProductVariantAvailability.Name = this.product.ProductName;
      this.productVariantAvailable.emit(this.saleProductVariantAvailability);
      this.onClose();
    }
  }

  //  select drop down values

  onSelectAttributeValue(value , index ) {
    let productAttribute = this.product.ProductAttributes[index];
    let attribute;
    value = Number(value);

    if(value != 0 ){

    attribute = productAttribute.ProductAttributeValues.find(x => x.AttributeValueID === value);
    let existingAttribute = this.sortedAttributeValues.find(x => x.ProductAttributeID === attribute.ProductAttributeID);
    if (existingAttribute) {
      attribute.variantIndex = index;
      this.sortedAttributeValues.splice(this.sortedAttributeValues.indexOf(existingAttribute), 1, attribute);
    } else {
      attribute.variantIndex = index;
      this.sortedAttributeValues.push(attribute);
    }
    this.sortedAttributeValueIDs = this.sortedAttributeValues.map(x => x.AttributeValueID);
    }else{

     this.sortedAttributeValues = this.sortedAttributeValues.filter(i => i.variantIndex != index);
     this.sortedAttributeValueIDs = this.sortedAttributeValues.map(x => x.AttributeValueID);

    }

    // this is use only for FE
    this.product.ProductAttributes[index].SelectedAttributID = value;

    this.saleProductVariantAvailability = new POSProduct();
    this.isCheckAvaliblity = false;
    this.isOutOfStock = false;
  }

  isProductHasBenefits(){
    this.isBenefit = false;
    if(this.saleProductVariantAvailability.CustomerMembershipID > 0 && !this.saleProductVariantAvailability.IsConsumed && !this.saleProductVariantAvailability.IsBenefitsSuspended && this.saleProductVariantAvailability.IsMembershipBenefit && this.saleProductVariantAvailability.IsFree){
      this.itemTotalPrice = 0 ;
      this.isBenefit = true;
    }else if(this.saleProductVariantAvailability.CustomerMembershipID > 0 && !this.saleProductVariantAvailability.IsConsumed && !this.saleProductVariantAvailability.IsBenefitsSuspended && this.saleProductVariantAvailability.IsMembershipBenefit && !this.saleProductVariantAvailability.IsFree && this.saleProductVariantAvailability.DiscountPercentage != null){
      this.itemTotalPrice = this.getItemTotalDiscountedPrice(this.saleProductVariantAvailability.Price,this.saleProductVariantAvailability.DiscountPercentage);

      // var totalAmountExcludeTax = this.getItemTotalDiscountedPrice(this.saleProductVariantAvailability.Price,this.saleProductVariantAvailability.DiscountPercentage);
      // var itemTotalTaxAmount = this._taxCalculationService.getTaxAmount(this.saleProductVariantAvailability.TotalTaxPercentage,totalAmountExcludeTax) * 1;
      // this.itemTotalPrice = this._taxCalculationService.getRoundValue(Number(totalAmountExcludeTax) + itemTotalTaxAmount);
      this.isBenefit = true;
    }else{
      this.itemTotalPrice = this.saleProductVariantAvailability.Price;
    }
  }

  getItemTotalDiscountedPrice(
    discountedPricePerUnit,
    saleDiscountPerItemPercentage
  ) {
    if (saleDiscountPerItemPercentage > 0) {
      discountedPricePerUnit -=
        (discountedPricePerUnit / 100) * saleDiscountPerItemPercentage;
    }
    return this._taxCalculationService.getRoundValue(discountedPricePerUnit);
  }
  //#endregion

  //#region Methods

  //get bar code search product atributes ids
  getBarcodeSearchProductDetail(){
    let param = {
      productID: this.productData.posProduct.ProductID,
      barcode: this.productData.posProduct.Code
    }

    this._httpService.save(PointOfSaleApi.GetAttributesValuesByProductBarcode, param)
        .subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                  this.product.ProductAttributes.forEach((value, index) => {
                    let arrayIndex = this.product.ProductAttributes.findIndex(i => i.ProductAttributeValues.find(x => x.AttributeValueID === res.Result[index]));
                    this.onSelectAttributeValue(res.Result[index], arrayIndex);
                  });
                }
                else {
                  this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Product'))
            }
        )
  }

  //#endregion
}

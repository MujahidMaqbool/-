/********************** Angular Refrences *********************/
import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';

/********************** Material::Reference *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';


/* Models */
import { ApiResponse } from 'src/app/models/common.model';
import { InventoryAdjustStock } from 'src/app/product/models/edit.inventory.model';

/********************** Configuration *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { NumberValidator } from 'src/app/shared/helper/number.validator';

/********************** Components *********************/
import { ProductApi } from 'src/app/helper/config/app.webapi';


@Component({
  selector: 'app-bulk-update',
  templateUrl: './bulk.update.component.html'
})
export class BulkUpdateComponent implements OnInit {

  StockAdjustmentReasons: Array<any> = [];

  inventoryAdjustStock: InventoryAdjustStock = new InventoryAdjustStock();
  inValidStock: boolean;
  messages = Messages;

  StockAdjustment = Configurations.StockAdjustment;
  stockAdjustment: number = 1;
  numberValidator: NumberValidator = new NumberValidator();


  @Output()
  isSaved = new EventEmitter<boolean>();
  inValidReason: boolean;
  isSavedBtn: boolean = false;

  constructor(
    private _dialog: MatDialogRef<BulkUpdateComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public inventoryObj: any
  ) { }

  ngOnInit(): void {
    this.inventoryAdjustStock.productVariantBranchIDList = this.inventoryObj.productVariantBranchIDList;
    this.StockAdjustmentReasons = this.inventoryObj.stockAdjustmentReasons;
    this.inventoryAdjustStock.adjustmentReason = this.inventoryAdjustStock.adjustmentReason == null ? null : this.StockAdjustmentReasons[0].ReasonName;
    this.inventoryAdjustStock.currentStock = this.inventoryObj.inventoryAdjustStock.CurrentStock; //!this.inventoryObj.isBulkUpdate ? this.inventoryAdjustStock : this.inventoryObj.inventoryAdjustStock
    this.inventoryAdjustStock.newStock = this.inventoryAdjustStock.currentStock;
  }

  saveBulkUpdate() {
    this.isSavedBtn = true;
    if (this.inventoryAdjustStock.adjustStock && this.inventoryAdjustStock.adjustStock > 0 && this.inventoryAdjustStock.adjustmentReason != null) {
      let param = {
        adjustStock: this.stockAdjustment == 1 ? this.inventoryAdjustStock.adjustStock : Number("-" + this.inventoryAdjustStock.adjustStock),
        adjustmentReason: this.inventoryAdjustStock.adjustmentReason,
        productVariantBranchIDList: this.inventoryAdjustStock.productVariantBranchIDList
      }
      this.inValidStock = false;
      this.inValidReason = false;
      this._httpService.save(ProductApi.bulkUpdate, param).subscribe(
        (response: ApiResponse) => {
          if (response.MessageCode > 0) {
            this.isSaved.emit(true);
            this.onCloseDialog();
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Inventory"));
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
            this.isSavedBtn = false;
          }
        })
    } else {
      if (this.inventoryAdjustStock.adjustStock && this.inventoryAdjustStock.adjustStock > 0) {
        this.inValidStock = false;
      } else {
        this.inValidStock = true;
        this.isSavedBtn = false;

      }
      if (this.inventoryAdjustStock.adjustmentReason != null) {
        this.inValidReason = false;
      } else {
        this.inValidReason = true;
        this.isSavedBtn = false;
      }
    }

  }

  onCloseDialog() {
    this._dialog.close();
  }

  onChangeStockValue(event: any) {

    setTimeout(() => {
      this.inventoryAdjustStock.adjustStock = this.numberValidator.NotAllowDecimalValue(event);

      if (this.inventoryAdjustStock.adjustStock && this.inventoryAdjustStock.adjustStock > 0) {
        this.inValidStock = false;
      } else {
        this.inValidStock = true;
      }
      if (event === null) {
        this.inventoryAdjustStock.adjustStock = null;
        this.inventoryAdjustStock.newStock = this.inventoryAdjustStock.currentStock;
      } else {
        this.inventoryAdjustStock.newStock = 0;
        let sum = 0;
        if (this.stockAdjustment == 1) {
          sum = this.inventoryAdjustStock.currentStock + this.inventoryAdjustStock.adjustStock;
          this.inventoryAdjustStock.newStock = sum;
        } else {
          sum = this.inventoryAdjustStock.currentStock - this.inventoryAdjustStock.adjustStock;
          this.inventoryAdjustStock.newStock = sum;
        }

      }
      if (this.inventoryAdjustStock.adjustStock == null || !this.inventoryAdjustStock.adjustStock || this.inventoryAdjustStock.adjustStock == 0) {
        this.inValidStock = true;
      } else {
        this.inValidStock = false;
      }
    }, 10);

  }

  onChangeAdjustStockValue(event: any) {
    this.inventoryAdjustStock.newStock = 0;
    if (this.stockAdjustment == 1) {
      this.inventoryAdjustStock.newStock = this.inventoryAdjustStock.currentStock + this.inventoryAdjustStock.adjustStock
    } else {
      this.inventoryAdjustStock.newStock = this.inventoryAdjustStock.currentStock - this.inventoryAdjustStock.adjustStock
    }
  }

  onSelectReason() {
    this.inValidReason = this.inventoryAdjustStock.adjustmentReason == null ? true : false;
  }
}

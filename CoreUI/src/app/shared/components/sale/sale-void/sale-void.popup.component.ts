import { Component, OnInit, EventEmitter, Output, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Messages } from 'src/app/helper/config/app.messages';
import { SaleApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { SaveVoided, VoidedReasonFundamental } from 'src/app/models/sale.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

@Component({
  selector: 'app-sale-void',
  templateUrl: './sale-void.popup.component.html'
})
export class SaleVoidComponent implements OnInit {


  @ViewChild('saveVoidedFrom') saveVoidedFrom: NgForm;
  @Output() isSaved = new EventEmitter<boolean>();

  /***********Local*********/
  isOtherReasonRequired: boolean = false;
  totalDueAmount: string = "";
  currencyFormat: string;

   /***********Messages*********/
   messages = Messages;

    /***********Collection And Models*********/
    voidedReasonFundamental: VoidedReasonFundamental[] = [];
    saveVoided: SaveVoided;

  constructor(
    public dialogRef: MatDialogRef<SaleVoidComponent>,
    private _messagesService: MessageService,
    private _httpService: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {  this.saveVoided = new SaveVoided(); }

  ngOnInit() {
    this.saveVoided.SaleID = this.data.saleID;
    this.totalDueAmount = this.data.totalDueAmount;
    this.currencyFormat = this.data.branchCurrencySymbol;
    this.getVoidedFundamental();
  }

  onClose() {
    this.closePopup();
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  onModelChange() {
    this.isOtherReasonRequired = this.saveVoided.ReasonID == 14 ? true : false;
    this.saveVoided.Notes = "";
    //this.saveVoidedFrom.form.markAllAsTouched();//.controls.markAsTouched();
  }

  getVoidedFundamental() {
    this._httpService.get(SaleApi.getVoidedFundamental)
        .toPromise().then(data => {
            if (data && data.MessageCode > 0) {
                if (data.Result != null && data.Result.length > 0) {
                    this.voidedReasonFundamental = data.Result;
                    this.saveVoided.ReasonID = this.voidedReasonFundamental[0].ReasonID;
                }
                else {
                    this.voidedReasonFundamental = [];
                }
            }
            else {
                this._messagesService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "Inovice."));
            }
        });
  }

  onSave(isValid: boolean) {
    if (isValid) {
        this._httpService.save(SaleApi.saveVoidedSale, this.saveVoided)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this._messagesService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Void"));
                    this.closePopup();
                    this.isSaved.emit(true);
                } else{
                  this._messagesService.showErrorMessage(res.MessageText);
                }
            },
        err => {
            this._messagesService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Void"));
        });
    }

  }

  

}

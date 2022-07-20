import { Component, OnInit, Inject, EventEmitter, Output, ViewChild } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'src/app/services/app.message.service';
import { HttpService } from 'src/app/services/app.http.service';
import { SaleApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { BadDebtReasonFundamental, SaveBadDebt } from 'src/app/models/sale.model';
import { NgForm } from '@angular/forms';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';

@Component({
    selector: 'bad-debt',
    templateUrl: 'bad.debt.component.html'
})
export class BadDebtComponent implements OnInit {

    @ViewChild('saveBadDebt') saveBadDebtFrom: NgForm;
    @Output() isSaved = new EventEmitter<boolean>();
    /***********Local*********/
    isOtherReasonRequired: boolean = false;
    balanceAmount: string = "";
    currencyFormat: string;
    /***********Messages*********/
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;

    /***********Collection And Models*********/
    badDebtReasonFundamental: BadDebtReasonFundamental[] = [];
    saveBadDebt: SaveBadDebt;


    constructor(
        public dialogRef: MatDialogRef<BadDebtComponent>,
        private _messagesService: MessageService,
        private _httpService: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.saveBadDebt = new SaveBadDebt();
    }

    ngOnInit() {
        this.saveBadDebt.SaleID = this.data.saleID;
        this.balanceAmount = this.data.balanceAmount;
        this.currencyFormat = this.data.branchCurrencySymbol;
        this.getBadDebtFundamental();
        
    }

    onClose() {
        this.closePopup();
    }

    onModelChange() {
        this.isOtherReasonRequired = this.saveBadDebt.ReasonID == 11 ? true : false;
        this.saveBadDebt.Notes = "";
    }

    closePopup(): void {
        this.dialogRef.close();
    }

    getBadDebtFundamental() {
        this._httpService.get(SaleApi.getBadDebtFundamental)
            .toPromise().then(data => {
                if (data && data.MessageCode > 0) {
                    if (data.Result != null && data.Result.length > 0) {
                        this.badDebtReasonFundamental = data.Result;
                        this.saveBadDebt.ReasonID = this.badDebtReasonFundamental[0].ReasonID;
                    }
                    else {
                        this.badDebtReasonFundamental = [];
                    }
                }
                else {
                    this._messagesService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "Inovice."));
                }
            });
    }

    onSave(isValid: boolean) {
        if (isValid) {
            this._httpService.save(SaleApi.saveBadDebt, this.saveBadDebt)
                .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._messagesService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Write Off"));
                        this.closePopup();
                        this.isSaved.emit(true);
                    }
                    else{
                        this._messagesService.showErrorMessage(res.MessageText);
                    }
                },
                    err => {
                        this._messagesService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Write Off"));

                    });
        }

    }
}
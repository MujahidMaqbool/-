/*************** Angular References *******************/
import { Component, Inject, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/********************** START: Service & Models *********************/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { TaxApi } from '@app/helper/config/app.webapi';
import { TaxSetup } from '@app/setup/models/tax.setup.model';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { ApiResponse } from '@app/models/common.model';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';

@Component({
    selector: 'save-tax',
    templateUrl: './save.tax.component.html'
})

export class SaveTaxComponent implements OnInit {

    // #region Local Members

    @ViewChild('taxForm') taxForm: NgForm;

    @Output()
    taxSaved = new EventEmitter<boolean>();
    isFormSubmited: boolean;
    /* Messages */
    messages = Messages;

    /* Local Variables */
    pageTitle: string;
    zeroValueValidation: boolean;
    enum_AppSourceType = EnumSaleSourceType;
    isDisabledSaveButton: boolean = false;
    // #endregion 

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _taxCalculationService: TaxCalculation,
        public dialogRef: MatDialogRef<SaveTaxComponent>,
        @Inject(MAT_DIALOG_DATA) public singleTax: any
    ) { }

    ngOnInit() {
        if (this.singleTax.TaxID > 0) {
            this.pageTitle = "Tax";
        }
        else {
            this.pageTitle = "Tax";
        }
    }

    // #region Events

    onTaxValueChange() {
        this.zeroValueValidation = false;
        this.isFormSubmited = false
        this.singleTax.TaxPercentage = this._taxCalculationService.getRoundValue(this.singleTax.TaxPercentage);
        if (this.singleTax.TaxPercentage === 0 || this.singleTax.TaxPercentage > 100) {
            this.zeroValueValidation = true;
            
            this.taxForm.form.controls['TaxPercentage'].setErrors({ 'incorrect': true });
        }
    }

    onClosePopup(): void {
        this.taxSaved.emit(false);
        this.dialogRef.close();
    }

    // #endregion

    // #region Methods

    saveTax(isValid: boolean) {
        if (isValid && this.taxForm.dirty && !this.zeroValueValidation) {
            //this.taxForm. = false;
            
            this.isDisabledSaveButton = true;
            this._httpService.save(TaxApi.save, this.singleTax)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Tax"));
                        this.onClosePopup();
                        this.taxSaved.emit(true);
                    }
                    else if (response && response.MessageCode < 0) {
                        this.isDisabledSaveButton = false;
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                    else {
                        this.isDisabledSaveButton = false;
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Tax"));
                    }
                },
                    err => {
                        this.isDisabledSaveButton = false;
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Tax"));
                    }
                );
        }
    }

    // #endrgion

}
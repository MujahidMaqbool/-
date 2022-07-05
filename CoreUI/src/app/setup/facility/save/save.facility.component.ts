/********************** Angular References *********************/
import { Component, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

/********************** Angular Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Service & Models *********************/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';

/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { FacilityApi } from '@app/helper/config/app.webapi';

@Component({
    selector: 'save-facility',
    templateUrl: './save.facility.component.html',
})

export class SaveFacilityComponent {
    
    /**material References */
    @ViewChild('facilityForm') facilityForm: NgForm;
    @Output()
    facilitySaved = new EventEmitter<boolean>();

    /**Messages */
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    hasSuccess: boolean = false;
    hasError: boolean = false;

    /* Local Memebers */
    saveInProgress: boolean = false;
    pageTitle: string;


    constructor(
        private _httpService: HttpService,
        private _dialogRef: MatDialogRef<SaveFacilityComponent>,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public facilityModel: any) { }

    //#region angular hooks

    ngOnInit() {
        this.pageTitle = "Facility";
    }
    //#endregion

    // #region Events

    /**close popup */
    onClosePopup(): void {
        this._dialogRef.close();
    }

    /**trim updated facility name*/
    onFacilityNameUpdated() {
        this.facilityModel.FacilityName = this.facilityModel.FacilityName.trim();
    }

    // #endregion    

    // #region Methods    

    /**save facility, close popup and emit true for show successfully saved. */
    saveFacility(isValid: boolean) {
        this.saveInProgress = true;
        if (isValid && this.facilityForm.dirty) {
            this.hasSuccess = false;
            this.hasError = false;
            this._httpService.save(FacilityApi.save, this.facilityModel)
                .subscribe((res: any) => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Facility"));
                        this.onClosePopup();
                        this.facilitySaved.emit(true);
                    }
                    else if (res.MessageCode < 0) {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Facility"));
                        this.saveInProgress = false;
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Facility"));
                        this.saveInProgress = false;
                    }
                );
        }
    }

    // #endregion
}
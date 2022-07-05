/********************** Angular Reference ***********************/
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription } from "rxjs";
/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models ***********************/
import { StaffDocument } from "@staff/models/staff.model";
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';

/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { StaffDocumentApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';

@Component({
    selector: 'upload-staff-document',
    templateUrl: './upload.staff.document.component.html'
})

export class UploadStaffDocument implements OnInit, OnDestroy {
    @ViewChild('staffDocumentFormData') staffDocumentFormData: NgForm;

    @Output()
    documentSaved = new EventEmitter<boolean>();

    /* Local Members*/
    isDataExits: boolean = false;
    selectedImageSize: number = 0;
    isImageSizeValid = true;
    isFileAttached = false;
    staffID: number = 0;
    fileName: string;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    validationMessage: string = Messages.Validation.Info_Required;
    errorMessage: string;
    successMessage: string;

    formData: FormData = new FormData();
    staffIDSubscription: ISubscription;

    constructor(
        private _httpService: HttpService,
        private _dialogRef: MatDialogRef<UploadStaffDocument>,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public staffDocumentDataObj: StaffDocument) {
    }

    ngOnInit() {
        this.getStaffID();
    }

    ngOnDestroy() {
        this.staffIDSubscription.unsubscribe();
    }

    // #region Events 

    onSaveDocument(isValid: boolean) {
        this.saveStaffDocument(isValid);
    }

    onCloseDialog() {
        this._dialogRef.close();
        this.staffDocumentFormData.resetForm();
    }

    // #endregion

    // #region Methods

    getStaffID() {
        this.staffIDSubscription = this._dataSharingService.staffID.subscribe(staffId => {
            setTimeout(() => {
                if (this.staffID !== staffId) {
                    this.staffID = staffId
                    if (this.staffID > 0) {
                        this.staffDocumentDataObj.StaffID = this.staffID;
                    }
                }
            })
        })
    }

    saveStaffDocument(isvalid: boolean) {
        if (isvalid && this.isImageSizeValid == true && this.isFileAttached == true) {
            this.hasSuccess = false;
            this.hasError = false;
            this.formData.append('StaffDocumentID', this.staffDocumentDataObj.StaffDocumentID.toString());
            this.formData.append('AssignedToStaffID', this.staffDocumentDataObj.StaffID.toString());
            this.formData.append('StaffDocumentName', this.staffDocumentDataObj.StaffDocumentName);
            this.formData.append('Description', this.staffDocumentDataObj.Description == null ? "" : this.staffDocumentDataObj.Description);

            /*in case of want to view data in formdata*/
            //console.log( this.formData.get("StaffDocumentID"));

            this._httpService.uploadDocument(StaffDocumentApi.add, this.formData)
                .subscribe((res:ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Document"));
                        this.staffDocumentFormData.resetForm();
                        this.clearFormData();
                        this.onCloseDialog();
                        this.documentSaved.emit(true);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Document"));
                        this.clearFormData();
                        this.documentSaved.emit(false);
                    }

                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Document"));
                    this.clearFormData();
                    this.documentSaved.emit(false);
                });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Validation.File_Invalid.replace("{0}", "Staff Document"));
        }
    }

    clearFormData() {
        this.formData = new FormData();
    }

    fileChangeEvent(e: any) {
        var files = e.target.files;

        for (var j = 0; j < files.length; j++) {
            this.isFileAttached = true;
            this.fileName = files[j].name;
            var imgSize = files[j].size;
            var fileType = (files[j].name.slice(-3)).toLowerCase();
            if (fileType == "jpg" || fileType == "jpeg" || fileType == "pdf" || fileType == "png") {
                this.selectedImageSize = parseFloat((imgSize / 1024).toFixed(2))
                this.selectedImageSize = parseFloat((this.selectedImageSize / 1024).toFixed(2))
                if (this.selectedImageSize > 2) {
                    this.isImageSizeValid = false;
                    this._messageService.showErrorMessage(this.messages.Validation.File_Size_Invalid.replace("{0}", this.selectedImageSize.toString()));
                }
                else {
                    this.formData.append("file[]", files[j], files[j].name);
                    this.isImageSizeValid = true;
                    this.hasError = false;
                }
            }
            else {
                this.isImageSizeValid = false;
                this._messageService.showErrorMessage(this.messages.Validation.File_Invalid.replace("{0}", "Staff Document"));
            }
        }
    }

    // #endregion
}
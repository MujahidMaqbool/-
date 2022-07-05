/********************** Angular Reference ***********************/
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models ***********************/
import { MemberDocument } from "@customer/member/models/members.model";
import { HttpService } from '@services/app.http.service';

/********************** Common *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MemberApi } from '@app/helper/config/app.webapi';
import { MessageService } from '@app/services/app.message.service';

@Component({
    selector: 'save-member-document',
    templateUrl: './save-document.component.html'
})

export class SaveDocument implements OnInit {

    @ViewChild('memberDocumentFormData') memberDocumentFormData: NgForm;

    @Output()
    documentSaved = new EventEmitter<boolean>();

    /* Local Members*/
    isDataExits: boolean = false;
    selectedImageSize: number = 0;
    isImageSizeValid = true;
    isFileAttached = false;
    memberID: number = 0;
    fileName: string;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    validationMessage: string = Messages.Validation.Info_Required;
    errorMessage: string;
    successMessage: string;
    uploadBtn:boolean = true;

    /***********Collection And Models*********/
    statusList = Configurations.Status;
    memberDocument: MemberDocument;
    formData: FormData = new FormData();

    constructor(
        private _memberService: HttpService,
        private _dialogRef: MatDialogRef<SaveDocument>,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public memberId: number) {
        this.memberDocument = new MemberDocument();
    }

    ngOnInit() {
        this.memberDocument.CustomerID = this.memberId;
    }

    // #region events

    onCloseDialog() {
        this._dialogRef.close();
        this.memberDocumentFormData.resetForm();
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
                    this.formData.append("Files[]", files[j], files[j].name);
                    this.isImageSizeValid = true;
                    this.hasError = false;
                }
            }
            else {
                this.isImageSizeValid = false;
                this._messageService.showErrorMessage(this.messages.Validation.File_Invalid.replace("{0}", "Document"));
            }
        }
    }

    // #endregion

    // #region methods

    saveMemberDocument(isvalid: boolean) {
        if (isvalid && this.isImageSizeValid == true && this.isFileAttached == true) {
            this.hasSuccess = false;
            this.hasError = false;
            this.formData.append('CustomerID', this.memberDocument.CustomerID.toString());
            this.formData.append('DocumentName', this.memberDocument.DocumentName.toString());
            this.formData.append('Description', this.memberDocument.Description == null ? "" : this.memberDocument.Description);

            /*in case of want to view data in formdata*/
            //console.log(this.formData.get("Description"));
            this.uploadBtn = false;
            this._memberService.uploadDocument(MemberApi.saveCustomerDocument, this.formData)
                .subscribe(res => {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Document"));
                    this.memberDocumentFormData.resetForm();
                    this.clearFormData();
                    this.documentSaved.emit(true);
                    this.onCloseDialog();
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Document"));
                        this.clearFormData();
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Validation.File_Invalid.replace("{0}", "Document"));
        }
    }

    clearFormData() {
        this.formData = new FormData();
    }

    //#endregion
}

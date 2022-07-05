/* Angular References */
import { Component, Output, EventEmitter, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";

/* Services */
import { StaffApi } from "@app/helper/config/app.webapi";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";

/* Configurations */
import { Messages } from "@app/helper/config/app.messages";

@Component({
    selector: 'archivedstaff-association',
    templateUrl: './staff.unarchive.component.html'
})

export class UnArchivedStaffComponent {

    @Output() isConfirm = new EventEmitter<boolean>();

    /* Form Refrences*/
    @ViewChild('StaffFormData') staffForm: NgForm;

    constructor(
        private _router: Router,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dialogRef: MatDialogRef<UnArchivedStaffComponent>,
        @Inject(MAT_DIALOG_DATA) public staffId: number
    ) { }

    /* Messages */
    messages = Messages;

    // #region Events

    onYes() {
        this.allowToUnArchiveStaff();
    }

    onNo() {
        this.isConfirm.emit(false);
        this.closePopup();
    }

    // #endregion

    // #region Methods

    allowToUnArchiveStaff() {
        let param = {
            staffID: this.staffId
        }

        this._httpService.save(StaffApi.unArchiveStaff, param)
            .subscribe(res => {
                if (res && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace('{0}', 'Staff'));
                    this.isConfirm.emit(true);
                    this.closePopup();
                    this._router.navigate(['staff/search']);                                  
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Staff'))
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Staff'))
                }
            )
    }

    closePopup() {
        this._dialogRef.close();
    }

    // #endregion
}
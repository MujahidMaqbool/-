import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgForm } from "@angular/forms";
import { Inject } from "@angular/core";
import { EditEmail, Staff } from "../models/staff.model"
import { StaffApi } from "src/app/helper/config/app.webapi";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { Messages } from "src/app/helper/config/app.messages";
import { Output, Input } from "@angular/core";
import { EventEmitter } from "@angular/core";

@Component({
    selector: 'edit-email',
    templateUrl: './edit.email.component.html'
})

export class EditEmailComponent {

    @Input() showValidation: boolean;
    @Output()
    emailUpdated = new EventEmitter<boolean>();

    // #region Local Variables

    /* Model Reference */

    editEmailModel: EditEmail = new EditEmail();

    /* messages */
    messages = Messages;


    // #endregion

    constructor(
        private _dialogRef: MatDialogRef<EditEmailComponent>,
        private _staffApi: HttpService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public staffEmail: any) { }

    ngOnInit() {
        this.editEmailModel.OldEmail = this.staffEmail
    }

    onClose() {
        this.closePopup();
    }

    // #region Methods    

    onSave(isValid: boolean): void {
        if (isValid) {
            if (this.editEmailModel.OldEmail == this.editEmailModel.NewEmail) {

            } else {
                this._staffApi.update(StaffApi.updateStaffEmail, this.editEmailModel)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Edit Email"));
                            this.emailUpdated.emit(true);
                            this.closePopup();
                        }
                        else if (res && res.MessageCode < 0) {
                            // this._messageService.showErrorMessage(res.MessageText);
                            if (res.MessageCode == -30) {
                                this._messageService.showErrorMessage(this.messages.Error.Email_Exist.replace("{0}", "Staff"));
                            }
                            else {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Edit Email"));
                        }
                    },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Edit Email")); }
                    );
            }
        }
    }

    closePopup(): void {
        this._dialogRef.close();
    }

    trimEmail(): void {
        if (this.editEmailModel.NewEmail && this.editEmailModel.NewEmail !== '') {
            this.editEmailModel.NewEmail = this.editEmailModel.NewEmail.toLowerCase();
            this.editEmailModel.NewEmail = this.editEmailModel.NewEmail.trim();
        }
    }
    // #endregion
}  
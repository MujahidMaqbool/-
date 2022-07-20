import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgForm } from "@angular/forms";
import { Inject } from "@angular/core";
import { CustomerApi } from "src/app/helper/config/app.webapi";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { Messages } from "src/app/helper/config/app.messages";
import { Output, Input } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { EditCustomerEmail } from "src/app/models/common.model";
import { TrimPipe } from "src/app/shared/pipes/trim";

@Component({
    selector: 'edit-customer-email',
    templateUrl: './edit.customer.email.component.html'
})

export class EditCustomerEmailComponent {

    @Input() showValidation: boolean;
    @Output()
    emailUpdated = new EventEmitter<boolean>();

    // #region Local Variables

    /* Model Reference */

    editCustomerEmailModel: EditCustomerEmail = new EditCustomerEmail();

    /* messages */
    messages = Messages;


    // #endregion

    constructor(
        private _dialogRef: MatDialogRef<EditCustomerEmailComponent>,
        private _customerApi: HttpService,
        private _messageService: MessageService,
        private _trimPipe:TrimPipe,
        @Inject(MAT_DIALOG_DATA) public customerInfo: any) { }

    ngOnInit() {
        this.editCustomerEmailModel.OldEmail = this.customerInfo.customerEmail;
        this.editCustomerEmailModel.CustomerID = this.customerInfo.customerId
    }

    onClose() {
        this.closePopup();
    }

    // #region Methods  

    onSaveCustomer(isValid: boolean): void {
        if (isValid) {
            if (this.editCustomerEmailModel.OldEmail == this.editCustomerEmailModel.NewEmail) {

            } else {
                this._customerApi.update(CustomerApi.updateCustomerEmail, this.editCustomerEmailModel)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Edit Email"));
                            this.emailUpdated.emit(true);
                            this.closePopup();
                        }
                        else if (res && res.MessageCode < 0) {
                            //this._messageService.showErrorMessage(res.MessageText);
                            if (res.MessageCode == -30) {
                                this._messageService.showErrorMessage(this.messages.Error.Email_Exist.replace("{0}", "Customer"));
                            }
                            else {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                        }
                        // else {
                        //     this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Edit Email"));
                        // }
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
        if (this.editCustomerEmailModel.NewEmail && this.editCustomerEmailModel.NewEmail !== '') {
            this.editCustomerEmailModel.NewEmail = this.editCustomerEmailModel.NewEmail.toLowerCase();
            this.editCustomerEmailModel.NewEmail = this._trimPipe.transform(this.editCustomerEmailModel.NewEmail); //this.editCustomerEmailModel.NewEmail.trim();
        }
        // #endregion
    }
}
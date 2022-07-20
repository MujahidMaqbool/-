import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ENU_PaymentGateway } from 'src/app/helper/config/app.enums';
import { HttpService } from 'src/app/services/app.http.service';
import { CustomerApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { FillFormComponent } from 'src/app/shared/components/fill-form/fill.form.component';
import { MessageService } from 'src/app/services/app.message.service';
// import { FillFormComponent } from '../../fill-form/fill.form.component';
// import { MatDialogService } from '../../generics/mat.dialog.service';

@Component({
    selector: 'mandate-confirmation',
    templateUrl: 'mandate.confirmation.component.html'
})
export class MandateConfirmationDialog {

    customerId: number;
    gatewayId: number;
    gatewayName: string;
    showDirectDebitMandate: boolean;
    showCashMandate: boolean;
    showCardMandate: boolean;

    constructor(
      private _FormDialogue: MatDialogService,
      private _router: Router,
        private _httpService: HttpService,
        private _authService: AuthService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<MandateConfirmationDialog>) { }

    ngOnInit() {
        if (this.gatewayId && this.gatewayId !== ENU_PaymentGateway.Cash) {
            this.getGatewayName();
        }
    }

    onClose() {
        this.closePopup();
        this._FormDialogue.open(FillFormComponent);
    }

    getGatewayName() {
        this._httpService.get(CustomerApi.getMerchantAccountName + this.gatewayId).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.gatewayName = res.Result.Name;
                }else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            }
        )
    }

    closePopup() {
        this.dialogRef.close();
    }

}

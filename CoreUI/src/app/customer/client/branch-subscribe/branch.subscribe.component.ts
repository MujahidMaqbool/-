/********************** Angular References *********************/

import { Component, Inject, EventEmitter, Output, Input } from '@angular/core'

/********************** Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { ApiResponse } from 'src/app/models/common.model';

/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { CustomerApi } from 'src/app/helper/config/app.webapi';




@Component({
    selector: 'branch-subscribe',
    templateUrl: 'branch.subscribe.component.html'
})
export class BranchSubscribeComponent {
    @Output() isAssociated = new EventEmitter<boolean>();
    @Input() popUpMessage: string;

    customerId: number;
    messages = Messages;

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dialogRef: MatDialogRef<BranchSubscribeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onYes() {
        this.subscribeBranch();
    }

    onNo() {
        this.isAssociated.emit(false);
        this.closePopup();
    }

    subscribeBranch() {
        this._httpService.save(CustomerApi.subscribeBranch + '?email=' + this.data.email + '&IsClient=' + this.data.isClient, null)
            .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.customerId = res.MessageCode;
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace('{0}', 'Customer'));
                        this.isAssociated.emit(true);
                        this.closePopup();
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Customer'))
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Customer'))
                }
            )
    }

    closePopup() {
        this._dialogRef.close();
    }
}

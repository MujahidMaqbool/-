import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/app.http.service';
import {LeadMembershipApi } from '@app/helper/config/app.webapi';
import { Messages } from '@app/helper/config/app.messages';
import { MessageService } from '../app.message.service';
@Injectable({ providedIn: 'root' })
export class LeadService {

    messages = Messages;
    deleteDialogRef: any;

    constructor(
        private _http: HttpService,
        private _messageService: MessageService) { }

    onDeleteEnquiry(customerID: number, membershipID:number) {
        let params = {
            CustomerID: customerID,
            MembershipID: membershipID
        }
        // this.deleteDialogRef = this._dialoge.open(DeleteConfirmationComponent, { disableClose: true });
        // this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
        //     if (isConfirmDelete) {
                return new Promise<any>((resolve, reject) => {
                    this._http.delete(LeadMembershipApi.delete, params)
                        .subscribe(res => {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Enquiry"));
                                resolve(true);
                            }
                            else if (res && res.MessageCode < 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                                reject(false);
                            }
                        },
                            err => {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Enquiry"));
                            });
                });
          //  }

       // });
    }
}
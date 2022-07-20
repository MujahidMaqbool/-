import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MemberPaymentsApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';

@Component({
  selector: 'activity-log',
  templateUrl: './activity.log.popup.component.html'
})
export class ActivityLogComponent implements OnInit {
  messages = Messages;
  activityLogDetails: any;
  isActivityFound = true;
  @Input() customerMembershipPaymentID: number;
  @Input() dateFormat: string;

  constructor(
    public dialogRef: MatDialogRef<ActivityLogComponent>,
    private _memberMembershipPaymentsService: HttpService,
    private _messageService: MessageService

  ) { }

  ngOnInit(): void {
    this.getActivityLogs();
  }

  getActivityLogs() {
    let url = MemberPaymentsApi.getPaymentLog.replace("{customerMembershipPaymentID}", this.customerMembershipPaymentID.toString());
    this._memberMembershipPaymentsService.get(url)
        .subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if(response.Result && response.Result.length) {
                this.activityLogDetails = response.Result;
              } else {
                this.isActivityFound = false;
              }
            }
            else {
                this._messageService.showErrorMessage(response.MessageText);
            }
        },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Payment Activities"));
            }
        );
}

  onClose() {
    this.closePopup();
  }

  closePopup(): void {
    this.dialogRef.close();
  }

}

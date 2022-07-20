import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MemberPaymentsApi, SaleApi, MemberMembershipApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { EnumActivityLogType } from 'src/app/helper/config/app.enums';
import { Configurations } from 'src/app/helper/config/app.config';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';

@Component({
  selector: 'activity-log',
  templateUrl: './activity.log.popup.component.html'
})
export class ActivityLogComponent extends AbstractGenericComponent implements OnInit {

  messages = Messages;
  activityLogDetails: any;
  isActivityFound = true;

   //for member payment log variables
  @Input() customerMembershipPaymentID: number;

  //for invoices log variables
  @Input() saleID: number;
  // for member membership logs
  @Input() CustomerMembershipID: number;

  //common variables
  @Input() dateFormat: string;
  @Input() logType: number;

  dateTimeFormat: string = "";
  timeFormat = Configurations.TimeFormatView;

  enumActivityLog = EnumActivityLogType;
  constructor(
    public dialogRef: MatDialogRef<ActivityLogComponent>,
    private _http: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService

  ) { 
    super();
  }

  ngOnInit(): void {
    this.getCurrentBranchDetail();
  }

  async getCurrentBranchDetail() {
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;
    this.getActivityLogs();
}

  getActivityLogs() {
   
    

    if(this.logType == this.enumActivityLog.MemberPayment){
      let url = MemberPaymentsApi.getPaymentLog.replace("{customerMembershipPaymentID}", this.customerMembershipPaymentID.toString());
      this._http.get(url)
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
    } else if(this.logType == this.enumActivityLog.MemberShip){
      let url = MemberMembershipApi.readMemberMembershipActivityLog.replace("{customerMembershipID}", this.CustomerMembershipID.toString());
      this._http.get(url)
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
                  this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Activities"));
              }
          );
    }

    else{
      let url = SaleApi.getSaleLogs + this.saleID.toString();
      this._http.get(url)
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
                  this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Invoice Activities Log"));
              }
          );
    }

}

  onClose() {
    this.closePopup();
  }

  closePopup(): void {
    this.dialogRef.close();
  }

}

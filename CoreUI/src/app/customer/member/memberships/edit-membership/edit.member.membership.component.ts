/*********************** Angular References *************************/
import { Component, Inject, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';

/*********************** Material References *************************/
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';
import { DataSharingService } from '@app/services/data.sharing.service';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { HttpService } from '@app/services/app.http.service';
import { MemberMembershipApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { EditMemberMembership } from '../../models/member.membership.model';


@Component({
  selector: 'edit-member-membership',
  templateUrl: './edit.member.membership.component.html'
})

export class EditMemberMembershipComponent extends AbstractGenericComponent implements OnInit {

  @ViewChild('editMembershipDate') editMembershipDate: DateToDateFromComponent;
  @Output() isEditMembershipSaved = new EventEmitter<boolean>();

   /* Messages */
  messages = Messages;

  dateFormat: string = "";
  editMembershipMaxDate: Date;
  startDate:Date;
  endDate:Date;

  dateFromLabelName: string = "Start Date";
  dateToLabelName: string = "End Date";
  isSaveButtonDisabled: boolean = true;
  constructor(
    private dialogRef: MatDialogRef<EditMemberMembershipComponent>,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public receiveMembershipData: EditMemberMembership) {
    super();
  }

  ngOnInit() {
    this.startDate = this.receiveMembershipData.StartDate;
    this.endDate = this.receiveMembershipData.EndDate;

    this.getBranchDatePattern();
    this.editMembershipMaxDate = new Date(this.receiveMembershipData.StartDate);
  }

  // #region Event(s)

  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  reciviedDateTo($event) {

    let starDate = this.startDate.toString().split("T");
    let endDate = this.endDate.toString().split("T");

    if(starDate[0] == $event.DateFrom && endDate[0] == $event.DateTo){
      this.isSaveButtonDisabled = true;
    } else{
      this.isSaveButtonDisabled = false;
    }
    
    this.receiveMembershipData.StartDate = $event.DateFrom;
    this.receiveMembershipData.EndDate = $event.DateTo;
  }

  // #endregion Events


  // #region Method(s)

  // Save Membership method
  onSaveMembership() {
    this._httpService.save(MemberMembershipApi.getMemberMembershipEditCustomerMembership, this.receiveMembershipData)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isEditMembershipSaved.emit(true);

          this.onCloseDialog();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership"));
      });

  }

  // #endregion Method

}

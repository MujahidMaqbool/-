/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common';
/********************** Service & Models *********************/
/* Services*/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';

/* Models*/
import { LeadStatusType, SaveLeadSetting } from '@setup/models/lead.status.model';

/********************** Configurations *********************/
import { Messages } from '@app/helper/config/app.messages';
import { LeadStatusApi, LeadApi } from '@app/helper/config/app.webapi';
import { NgForm } from '@angular/forms';
import { AssignedToStaffList, LeadMembershipsList } from '@app/models/lead.membership.model';
import { ApiResponse } from '@app/models/common.model';
//import { promise } from 'protractor';

@Component({
  selector: 'lead-status',
  templateUrl: './lead.status.component.html'
})
export class LeadStatusComponent implements OnInit {

  @ViewChild('leadStatusForm') leadStatusForm: NgForm;

  /* Messages */
  messages = Messages;

  /* Model Reference */
  leadStatusType = new LeadStatusType();

  /* Collection Types */
  leadStatusTypeList: LeadStatusType[] = [];
  assignedToStaffList: AssignedToStaffList[] = [];
  leadMembershipsList: LeadMembershipsList[] = [];
  saveLeadSetting: SaveLeadSetting;


  /* Local Members */
  leadStatusTypeCopy: any;
  message: string = '';

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private rewriteUrl: Location
  ) {
    this.saveLeadSetting = new SaveLeadSetting();
  }

  ngOnInit() {
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/lead");
    for (let index = 0; index < 5; index++) {
      this.leadStatusTypeList.push(new LeadStatusType());
    }
    this.getFundamentals();
    this.getLeadSettings();
  }

  // #region Methods

  getFundamentals() {
    this._httpService.get(LeadStatusApi.getFundamentals)
      .subscribe(data => {
        if(data && data.MessageCode > 0){
        this.leadStatusTypeList = data.Result;
        this.leadStatusTypeCopy = JSON.parse(JSON.stringify(this.leadStatusTypeList));
        }else{
          this._messageService.showErrorMessage(data.MessageText)
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Status"));
        }
      );
  }


  getLeadSettings() {
    Promise.all([
      this.getLeadSettingFundamentals(),
      this.getLeadSetting()
    ]);
  }

  getLeadSettingFundamentals() {
    let params = {
      isNewLead: true
    }
    this._httpService.get(LeadApi.getFundamentals, params)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.leadMembershipsList = response.Result.MembershipList;
          this.assignedToStaffList = response.Result.StaffList;
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Setting"));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Setting"));
        });
  }

  getLeadSetting() {
    this._httpService.get(LeadStatusApi.getLeadSetting)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.saveLeadSetting = response.Result;
                    
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Setting"));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Setting"));
        });
  }

  saveLeadSettings() {
    if (this.saveLeadSetting.MembershipId > 0 ) {
      this._httpService.save(LeadStatusApi.saveLeadSetting, this.saveLeadSetting).subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.message = "Lead Setting";
          this.onSuccess();
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Setting"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Setting")); })
    }
    else {
      this._messageService.showErrorMessage(this.messages.Validation.Lead_Default_Setting);
    }

  }
  saveLeadStatus(isValid: boolean) {
    //if (isValid && this.leadStatusForm.dirty) {
    this._httpService.save(LeadStatusApi.save, this.leadStatusTypeList)
      .subscribe((res: any) => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead Status"));
          this.getFundamentals();
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Status"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Status")); });
    //}
  }

  setDefaultDropdowns() {
    // this.saveLeadSetting.MembershipId = this.lea
  }
  onSuccess() {
    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", this.message));
  }

  //reset the form
  onReset() {
    this._httpService.get(LeadStatusApi.ResetLeadSetting).subscribe((response: ApiResponse) => {
      if (response && response.MessageCode > 0) {
        this.leadStatusTypeList = response.Result.filter(x => x.LeadStatusTypeID != 6 && x.LeadStatusTypeID != 7);
      }else{
        this._messageService.showErrorMessage(response.MessageText);
      }
    });
    //  this.leadStatusTypeList = JSON.parse(JSON.stringify(this.leadStatusTypeCopy));
  }
  //#endregion
}

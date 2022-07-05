/*********************** Angular Reference *************************/
import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '@app/services/app.http.service';
import { CustomerRewardProgramApi } from '@app/helper/config/app.webapi';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { AddRewardPrograms } from '@app/models/customer.reward.programs.model';
import { ENU_RewardProgramStatusTypeName, ENU_IsTransferRewardProgram } from '@app/helper/config/app.enums';
import { FormControl } from '@angular/forms';
import { ApiResponse } from '@app/models/common.model';

@Component({
  selector: 'app-add-reward-program',
  templateUrl: './add-reward-program.component.html'
})
export class AddRewardProgramComponent implements OnInit {

  pointsBalance: FormControl = new FormControl();

 /***********Messages*********/
 messages = Messages;
 newRedemptionValue : number;
 isRefund: any = 0;
 isShowNODataMessage: boolean = false;

 customerRewardProgramsObj: AddRewardPrograms = new AddRewardPrograms();
 customerRewardProgramsList: AddRewardPrograms[] = [];
 copyReceiveData:any ={};
 enumRewardProgramStatusTypeName = ENU_RewardProgramStatusTypeName;
 enumIsTransferRewardProgram = ENU_IsTransferRewardProgram;

 @Output()
 confirmChange = new EventEmitter<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<AddRewardProgramComponent>,
    private _httpService:HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public receiveData: any
  ) { }

  ngOnInit(): void {
    this.copyReceiveData =JSON.parse(JSON.stringify(this.receiveData));
    this.enrollRewardProgram();
  }

  enrollRewardProgram() {
    this._httpService.get(CustomerRewardProgramApi.allRewardPrograms + this.receiveData.customerID)
      .subscribe((res:ApiResponse) => {
        if (res && res.MessageCode > 0 && res.Result && res.Result.length > 0) {
           this.customerRewardProgramsList = res.Result;
           this.customerRewardProgramsObj = this.customerRewardProgramsList[0];
           this.newRedemptionValue =Number((this.receiveData.pointsBalance / this.customerRewardProgramsObj.RedemptionPoints) * this.customerRewardProgramsObj.RedemptionValue);
          //  this.onChangeTransferPoints();
        }
        else if(res.MessageCode == 204){
          this.isShowNODataMessage=  true;
        }
        else if (res.MessageCode < 0) {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Enroll Reward Program"));
      });
  }

  // for flat/ line item amount change
  onIsRewardChange(entry): void {
    setTimeout(() => {
      this.isRefund = entry;
      if(entry === this.enumIsTransferRewardProgram.Yes){
        this.receiveData =JSON.parse(JSON.stringify(this.copyReceiveData));
        this.onChangeTransferPoints();
      }else if(entry === this.enumIsTransferRewardProgram.No){
          this.receiveData.pointsBalance = 0;
          this.receiveData.redemptionValue = 0;
          this.newRedemptionValue = 0;
      }
      if(this.receiveData.cutomerRewardProgramList){
        if(this.receiveData.cutomerRewardProgramList.find(rp => rp.RewardProgramStatusTypeID == ENU_RewardProgramStatusTypeName.Enrolled)){
          this.receiveData.rewardProgramStatusID = true;
        } else{
          this.receiveData.rewardProgramStatusID = false;
        }
      } else {
        this.receiveData.rewardProgramStatusID = false;
      }
    }, 100);

    //this.receiveData.rewardProgramStatusID = this.isMultiBranchCompany ? this.receiveData.rewardProgramStatusID : true;
  }
onChangeTransferPoints(){
  this.newRedemptionValue = (Number(this.receiveData.pointsBalance) / this.customerRewardProgramsObj.RedemptionPoints) * this.customerRewardProgramsObj.RedemptionValue;
  if(!Number(this.newRedemptionValue)){
    this.newRedemptionValue = 0;
  }
}

// Confirm dialouge method
onConfirm() {
  let param = {
    newRewardProgramID : this.customerRewardProgramsObj.RewardProgramID,
    oldRewardProgramID : this.receiveData.rewardProgramID,
    customerID : this.receiveData.customerID,
    transferPoints: this.receiveData.pointsBalance,
    isTransfer : this.isRefund === null ? null : this.isRefund === this.enumIsTransferRewardProgram.Yes ? true : false
  }
  this._httpService.save(CustomerRewardProgramApi.addRewardProgram, param)
    .subscribe((res:ApiResponse) => {
      if (res && res.MessageCode > 0) {
        this.confirmChange.emit(true);
        this.onCloseDialog();
      }
      else {
        this._messageService.showErrorMessage(res.MessageText);
      }
    },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Add Reward Program"));
      });

}

// Close dialouge method
onCloseDialog() {
  this._dialogRef.close();
}

}

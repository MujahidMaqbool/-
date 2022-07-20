/*********************** Angular Reference *************************/
import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/app.http.service';
import { CustomerRewardProgramApi } from 'src/app/helper/config/app.webapi';
import { AdjustRewardPointsBalance } from 'src/app/models/customer.reward.programs.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { FormControl } from '@angular/forms';
import { ApiResponse } from 'src/app/models/common.model';


@Component({
  selector: 'app-adjust-points-balance',
  templateUrl: './adjust-points-balance.component.html'
})
export class AdjustPointsBalanceComponent implements OnInit {

/***********Messages*********/
 messages = Messages;

 adjustReason: FormControl = new FormControl();
 adjustNewBalance: FormControl = new FormControl();

adjustRewardPointsBalance: AdjustRewardPointsBalance = new AdjustRewardPointsBalance();

  constructor(
    private _dialogRef: MatDialogRef<AdjustPointsBalanceComponent>,
    private _messageService: MessageService,
    private _httpService: HttpService,
    @Inject(MAT_DIALOG_DATA) public receiveData: any
  ) { }

  ngOnInit(): void {
  }

// Confirm Adjust Programs points
onAdjustPointsBalance(){
  let param = {
    CustomerRewardProgramID : this.receiveData.customerRewardProgramID,
    CustomerID : this.receiveData.customerID,
    AdjustmentReason : this.adjustRewardPointsBalance.AdjustReason,
    NewBalance : this.adjustRewardPointsBalance.AdjustNewBalance
  }
  this._httpService.save(CustomerRewardProgramApi.adjustProgram, param)
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
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Adjust Reward Points"));
      });
}

trimName(){
  this.adjustRewardPointsBalance.AdjustReason = this.adjustRewardPointsBalance.AdjustReason ? this.adjustRewardPointsBalance.AdjustReason.trim() : this.adjustRewardPointsBalance.AdjustReason;
}

// Close dialouge method
onCloseDialog() {
  this._dialogRef.close();
}

@Output()
confirmChange = new EventEmitter<boolean>();

}

// #region Imports

/********************** Angular Refrences *********************/
import { SubscriptionLike } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Configuration *********************/
import { RewardProgramActivityType, RewardProgramPurchasesType } from 'src/app/helper/config/app.enums';

/********************** Services & Models *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { RewardProgramApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { RewardProgramModel } from '../models/reward-program.model';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion

@Component({
  selector: 'app-view-reward-program',
  templateUrl: './view.component.html',
})
export class RewardViewComponent extends AbstractGenericComponent implements OnInit {
  /*********** region Local Members ****/

  /* Messages */
  messages = Messages;

  /*********** Objects *********/
  rewardProgram: RewardProgramModel = new RewardProgramModel();

  /***********Model Reference*********/
  /*********** Collections *********/
  classCount: any = [];
  productCount: any = [];
  membershipCount: any = [];
  serviceCount: any = [];

  /*********** Configurations *********/
  enum_PurchasesType = RewardProgramPurchasesType;
  enum_ActivitesEarningTypes = RewardProgramActivityType;

  /*********** locals *********/
  formsCount: number;
  branchId: number;
  membershipCoount: number;
  currencyFormat: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dataSharingService: DataSharingService,
    private dialogRef: MatDialogRef<RewardViewComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService) { super()}

  ngOnInit(): void {
    this.getCurrentBranchDetail();
    this.onViewRewardProgram();
  }

  
  async getCurrentBranchDetail() {
  
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
      this.branchId = branch.BranchID;    }

  }
  /** get the reward program details by ID**/
  onViewRewardProgram(){
    this._httpService.get(RewardProgramApi.viewRewardProgram +this.data.rewardProgramID)
    .subscribe(
        (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                if (response.Result) {
                  this.rewardProgram = response.Result;
                  this.classCount = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID ==  this.enum_PurchasesType.Class);
                  this.membershipCount = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID ==  this.enum_PurchasesType.Membership);
                  this.productCount = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID ==  this.enum_PurchasesType.Product);
                  this.serviceCount = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID ==  this.enum_PurchasesType.Service);
                  this.formsCount = this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM.length;
                }
            }
            else {
                this._messageService.showErrorMessage(response.MessageText);
            }
        },
        error => {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reward Program"))
        }
    );
}

/*Close the view dialog*/
  closeDialog(){
    this.dialogRef.close();
  }
 
}

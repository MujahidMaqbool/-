// #region Imports

/********************** Angular Refrences *********************/

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/**********************  Configurations *********************/
import { EnumSaleSourceType, ENU_Reward_Action_Progress } from '@app/helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { RewardProgramApi } from '@app/helper/config/app.webapi';

/********************** Services & Models *********************/
import { ApiResponse, DD_Branch } from '@app/models/common.model';
import { RewardProgramList, RewardProgramSearchParameter } from '../models/reward-program.model';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AuthService } from '@app/helper/app.auth.service';
import { Messages } from '@app/helper/config/app.messages';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

/**********************  Components  *************************/
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { RewardProgramDelete } from '../delete-Reward-Program-Dialog/reward.program.delete.dialog.component';
import { RewardViewComponent } from '../view/view.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

// #endregion

@Component({
  selector: 'app-reward-program-search',
  templateUrl: './reward.program.search.component.html'
})
export class SearchRewardProgramComponent extends AbstractGenericComponent implements OnInit {
  /*********** region Local Members ****/
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  /******* Messages ********/
  messages = Messages;

  /***********Model Reference*********/
  rewardProgramList: RewardProgramList[] = [];

  /*********** Local *******************/
  isDataExists: boolean = false;
  isSaveRewardProgramAllowed: boolean;
  branchID: number;

  /***********Objects Reference*********/
  rewardProgramSearchParameter: RewardProgramSearchParameter = new RewardProgramSearchParameter();

  /*********** Configurations *********/
  appSourceID = EnumSaleSourceType;
  action_Status = ENU_Reward_Action_Progress;

  constructor(
    private _dialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _router: Router,
    private _openDialog: MatDialogService,
    private _dataSharingService: DataSharingService,
    private _authService: AuthService,
  ) { super() }

  ngOnInit(): void {
    this.setPermissions();
    this.rewardProgramSearchParameter.StatusIDs = "";
    this.getCurrentBranchDetail();
  } 

 

  ngAfterViewInit() {
    this.getAllrewardProgram();
  }

  setPermissions() {
    this.isSaveRewardProgramAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.RewardProgram_Save);
  }

  // get current branch details
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchID = branch.BranchID;
    }
  }
  // view reward program
  onViewRewardProgram(rewardProgramID) {
    const dialogRef = this._dialog.open(RewardViewComponent, {
      disableClose: true,
      data: {
        rewardProgramID
      }
    });
  }

  /* pagination */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getAllrewardProgram()
    }
  }
  
  /* Method to reset search filters */
  resetSearchFilter() {
    this.rewardProgramSearchParameter = new RewardProgramSearchParameter();
    this.rewardProgramSearchParameter.StatusIDs = "";
    this.appPagination.resetPagination();
    this.getAllrewardProgram();
  }
  
  /* get reward program list */
  getAllrewardProgram() {
    let rewardSearchSearch = JSON.parse(JSON.stringify(this.rewardProgramSearchParameter));
    rewardSearchSearch.PageNumber = this.appPagination.pageNumber;
    rewardSearchSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(RewardProgramApi.searchRewardProgram, rewardSearchSearch).subscribe(
      (data) => {
        this.isDataExists =
          data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.rewardProgramList = data.Result;
          if (data.Result.length > 0) {
            this.appPagination.totalRecords = data.TotalRecord;
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this.rewardProgramList = [];

          this.appPagination.totalRecords = 0;
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Reward Program")
        );
      }
    );
  }

 
   /* Method to search all the reward program */
  searchAllRewardProgram() {
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getAllrewardProgram();
  }

  /* click event to edit the reward progrom */
  onEditRewardProgram(rewardProgramID: Number) {
    if (rewardProgramID > 0) {
      this._router.navigate([`/setup/reward-program/details/${rewardProgramID}`]);
    }
  }

  /* delete reward progrom */
  onDeleteRewardProgram(rewardProgram: any) {
    //here we check if the reward program is default then delete is not possible
    if(rewardProgram.IsDefault){
      this._messageService.showErrorMessage(this.messages.Error.Reward_Program_Default_Error);
    }else{
      const dialogRef = this._dialog.open(RewardProgramDelete, {
        disableClose: true,
      });
      dialogRef.componentInstance.terminationScheduledDate.subscribe((terminationDate: any) => {
        let params = {
          RewardProgramID: rewardProgram.RewardProgramID,
          ArchivePlanDate: terminationDate
        }
        this._httpService.save(RewardProgramApi.deleteRewardProgram, params)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                this.searchAllRewardProgram();
              }
              else {
                this._messageService.showErrorMessage(response.MessageText);
              }
            },
            error => {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reward Program"))
            }
          );
      })
    }

  }

   /* revert reward progrom */
  onRevertRewardProgram(rewardProgramID: any) {
    const dialog = this._openDialog.open(AlertConfirmationComponent);
    dialog.componentInstance.Title = this.messages.Dialog_Title.AlertRewardTermination;
    dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Revert_Program;
    dialog.componentInstance.isChangeIcon = false;
    dialog.componentInstance.showButton = true;
    dialog.componentInstance.showConfirmCancelButton = true;
    dialog.componentInstance.confirmChange.subscribe(isConfirm => {
      if (isConfirm) {
        this._httpService.save(RewardProgramApi.revertRewardProgram, rewardProgramID)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                this.searchAllRewardProgram();
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
    })
  }
  
  // calls when click on default reward program button(select and unselect)
  onDefaultRewardProgram(IsDefault, rewardProgramID) {
    const dialog = this._openDialog.open(AlertConfirmationComponent);
    if (!IsDefault) {
      dialog.componentInstance.Title = this.messages.Dialog_Title.Set_As_Default;
      dialog.componentInstance.Heading = this.messages.Confirmation.Confirmation_Program_default_heading;
      dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Program_default_Message;
    } else {
      dialog.componentInstance.Title = this.messages.Dialog_Title.Remove_As_Default;
      dialog.componentInstance.Heading = this.messages.Confirmation.Confirmation_Revert_Program_default_heading;
      dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Revert_Program_default_Message;
    }

    dialog.componentInstance.isChangeIcon = false;
    dialog.componentInstance.showButton = true;
    dialog.componentInstance.showConfirmCancelButton = true;
    dialog.componentInstance.confirmChange.subscribe(isConfirm => {
      if (isConfirm) {
        let params = {
          rewardProgramID: rewardProgramID,
          branchID: this.branchID,
          isDefault: IsDefault ? false : true,
        }
        this._httpService.save(RewardProgramApi.defaultRewardProgram, params)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                this.searchAllRewardProgram();
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
    })
  }
}


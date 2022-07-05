/*********************** Angular Reference *************************/
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

/*********************** Components *************************/
import { AddRewardProgramComponent } from './add-reward-program/add-reward-program.component';
import { AdjustPointsBalanceComponent } from './adjust-points-balance/adjust-points-balance.component';
import { Messages } from '@app/helper/config/app.messages';
import { MessageService } from '@app/services/app.message.service';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { HttpService } from '@app/services/app.http.service';
import { CustomerRewardProgramApi, PersonInfoApi } from '@app/helper/config/app.webapi';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AuthService } from '@app/helper/app.auth.service';

/********* Configurations *********** */
 import { SubscriptionLike as ISubscription } from 'rxjs';
import { Type } from '@angular/compiler';

/********************** Services & Models *********************/
/* Models */
import { RewardPrograms, CustomerBranches, CustomerRewardProgramSearchParams, AllCustomersRewardProgram, CustomersRewardPoints } from '@app/models/customer.reward.programs.model';
import { ENU_RewardProgramStatusTypeName, ENU_DateFormatName, CustomerType } from '@app/helper/config/app.enums';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { MatPaginator } from '@angular/material/paginator';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ApiResponse, DD_Branch, PersonInfo } from '@app/models/common.model';
import { Configurations } from '@app/helper/config/app.config';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ENU_Permission_ClientAndMember, ENU_Permission_Module, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search-reward-programs',
  templateUrl: './search-reward-programs.component.html'
})
export class SearchRewardProgramsComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

  /* Local */

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("rewardProgramDateSearch") rewardProgramDateSearch: DateToDateFromComponent;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  shouldGetPersonInfo: boolean = true;
  personInfoforReward : PersonInfo = new PersonInfo();
  isRewardProgramAllowed: boolean = false;
  RewardProgramEnrolledBranchID: number;
  isDataExists: boolean = false;
  isCustomerEnrolled: boolean;
  isRewardProgramList: boolean;
  currentBranchId: number;
  customerId: number;
  customerTypeId: number;
  dateFormat: string = "";///Configurations.DateFormat;
  currencyFormat: string;
  rewardProgramStatusList = Configurations.RewardProgramStatus;
  rewardProgramSearchParams = new CustomerRewardProgramSearchParams();
  rewardProgramsList: any = [];
  customerRewardProgramsObj: RewardPrograms = new RewardPrograms();

  customerRewardProgramsList: RewardPrograms[] = new Array<RewardPrograms>();

  customerBranchList: CustomerBranches[] = [];
  //rewardProgramStatusTypeList = CustomerBranches[] = [];
  customerBranchListParameter: CustomerBranches = new CustomerBranches;

  enumRewardProgramStatusTypeName = ENU_RewardProgramStatusTypeName;

  // Search Reward Programs

  allCustomersRewardProgram: AllCustomersRewardProgram;
  customersRewardPoints: CustomersRewardPoints = new CustomersRewardPoints();

  /***********Messages*********/
  messages = Messages;

  /************* Configurations ***************/
  customerIdSubscripiton: ISubscription;

  isRewardProgramSave: boolean = false;


  constructor(
    private _httpService: HttpService,
    public _authService: AuthService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    public _dataSharingService: DataSharingService,
    private route: Router,
  ) {
    super();

  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.customerId = this.route.url.split('/').length > 5 ? Number(this.route.url.split('/')[4]) : Number(this.route.url.split('/')[3]);
    this.getCurrentBranchDetail();
    this.getPersonInfo(false);

    if (this.customerId != null) {
      this.getPersonInfo(true);
    }
    //else {
       this.getFundamentals();
    //}
    this.rewardProgramDateSearch.setEmptyDateFilter();
  }

  ngOnDestroy() {
    this.customerIdSubscripiton.unsubscribe();
  }

  //#region events

  // Get Customer Info

  getPersonInfo(isCallFundamental) {
    this.customerIdSubscripiton = this._dataSharingService.activityPersonInfo.subscribe((personInfo: any) => {
      if (personInfo.CustomerID && personInfo.CustomerID > 0) {
        this.customerTypeId = personInfo.CustomerTypeID;
        if (isCallFundamental) {
          this.customerId = personInfo.CustomerID;
          //this.getFundamentals();
        }

        if (this.customerTypeId) {
          this.setPermissions();
        }
        //
        this.isRewardProgramAllowed = personInfo.RewardProgramAllowed;
        this.RewardProgramEnrolledBranchID = personInfo.RewardProgramEnrolledBranchID;
      }
    })

  }

  // Get Branch Setting
  getBranchCurrencyFormat() {

  }

  reciviedDateTo($event) {
    this.rewardProgramSearchParams.DateFrom = $event.DateFrom;
    this.rewardProgramSearchParams.DateTo = $event.DateTo;
  }

  onFromDateChange(date: any) {
    this.rewardProgramSearchParams.DateFrom = date;
  }

  onToDateChange(date: any) {
    this.rewardProgramSearchParams.DateTo = date;
  }

  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
      this.currentBranchId = branch.BranchID;
    }
  }
  setDefaultValue() {
    // this.rewardProgramSearchParams.BranchID = this.rewardProgramSearchParams.BranchID != null && this.rewardProgramSearchParams.BranchID != 0 ? this.rewardProgramSearchParams.BranchID : null;

    this.rewardProgramSearchParams.BranchID = this.customerBranchList && this.customerBranchList.length > 1 ? null : this.customerBranchList[0].BranchID;
    this.rewardProgramSearchParams.StatusID = this.rewardProgramSearchParams.StatusID != null && this.rewardProgramSearchParams.StatusID != 0 ? this.rewardProgramSearchParams.StatusID : this.rewardProgramStatusList[0].RewardProgramStatusTypeID;
  }
  //#endregion


  // Add Reward Program method
  onAddRewardProgram() {
    if (!this.isRewardProgramAllowed) {
      this._messageService.showErrorMessage(this.messages.Error.RewardProgram_Allowed);
    } else {
      const dialog = this._dialog.open(AddRewardProgramComponent, {
        disableClose: true,
        data: {
          customerID: this.customerId,
          rewardProgramID: this.customerRewardProgramsObj?.RewardProgramID,
          rewardProgramStatusID: this.customerRewardProgramsObj?.RewardProgramStatusTypeID == this.enumRewardProgramStatusTypeName.Enrolled ? true : false,
          pointsBalance: this.customersRewardPoints?.PointsBalance,
          redemptionValue: this.customersRewardPoints?.RedemptionValue,
          isRewardProgramList: this.isRewardProgramList,
          cutomerRewardProgramList: this.customerRewardProgramsList
        }
      })
      dialog.componentInstance.confirmChange.subscribe(isConfirm => {
        if (isConfirm) {
          this.getFundamentals();
          this.getLatestPersonInfo();
        }
        else {
          // this.searchClassAttendee();
        }
      })
    }
  }

  // Adjust Reward Points method
  onAdjustRewardPoints() {
    const dialog = this._dialog.open(AdjustPointsBalanceComponent, {
      disableClose: true,
      data: {
        customerID: this.customerId,
        customerRewardProgramID: this.customerRewardProgramsObj?.CustomerRewardProgramID,
        pointsBalance: this.customersRewardPoints?.PointsBalance,
      }
    })
    dialog.componentInstance.confirmChange.subscribe(isConfirm => {
      if (isConfirm) {
        this.getCustomerRewardPoints(this.customerRewardProgramsObj.CustomerRewardProgramID);
      }
      else {
        // this.searchClassAttendee();
      }
    })
  }

  // Reset method
  onRewardProgramReset() {
    this.rewardProgramSearchParams = new CustomerRewardProgramSearchParams();
    this.customerRewardProgramsObj = this.customerRewardProgramsList[0];
    this.rewardProgramSearchParams.StatusID = this.rewardProgramStatusList[0]?.RewardProgramStatusTypeID;
    this.rewardProgramDateSearch.dateToFrom.DateFrom = null;
    this.rewardProgramDateSearch.dateToFrom.DateTo = null;
    this.rewardProgramSearchParams.BranchID = this.customerBranchList && this.customerBranchList.length == 1 ? this.customerBranchList[0].BranchID : null;
    this.isCustomerEnrolled = this.customerRewardProgramsObj?.RewardProgramStatusTypeID == this.enumRewardProgramStatusTypeName.Enrolled ? true : false;
    this.appPagination.resetPagination();
    this.rewardProgramDateSearch.setEmptyDateFilter();
    this.getAllCustomerRewardProgram();

  }

  // Search method
  onRewardProgramSearch() {
    this.reciviedDateTo(this.rewardProgramDateSearch.dateToFrom);
    this.rewardProgramSearchParams.StatusID = this.rewardProgramSearchParams.StatusID != null && this.rewardProgramSearchParams.StatusID != 0 ? this.rewardProgramSearchParams.StatusID : this.rewardProgramStatusList[0].RewardProgramStatusTypeID;
    this.rewardProgramSearchParams.BranchID = this.rewardProgramSearchParams.BranchID;
    this.getAllCustomerRewardProgram();
  }

  // Get Customer Rewards Points method
  getCustomerRewardPoints(rewardId: number) {
    this._httpService.get(CustomerRewardProgramApi.customerRewardPoints + rewardId + "/" + this.customerId)
      .subscribe((res:ApiResponse) => {
        if (res && res.MessageCode > 0 ) {
          this.customersRewardPoints = res.Result;
          this.getAllCustomerRewardProgram();
        } else {
          this.customersRewardPoints = new CustomersRewardPoints();
          this.onRewardProgramReset();
          this._messageService.showErrorMessage(res.MessageText)
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', " Reward Program Points"));
        });
    this.isCustomerEnrolled = this.customerRewardProgramsObj.RewardProgramStatusTypeID == this.enumRewardProgramStatusTypeName.Enrolled ? true : false;
  }

   // on Change Rewards program
   onChangeRewardProgram() {
    this.isCustomerEnrolled = this.customerRewardProgramsObj.RewardProgramStatusTypeID == this.enumRewardProgramStatusTypeName.Enrolled ? true : false;
  }

  // Get Fundamental method
  getFundamentals() {
    this._httpService.get(CustomerRewardProgramApi.getFundamentals + this.customerId)
      .subscribe((res:ApiResponse) => {
        if (res && res.MessageCode > 0) {
          //if customer is associated with reward program
          if (res.Result?.RewardProgramsList) {
            this.customerRewardProgramsList = res.Result?.RewardProgramsList;
            this.customerRewardProgramsObj = this.customerRewardProgramsList[0];
          }

          this.isRewardProgramList = this.customerRewardProgramsList && this.customerRewardProgramsList.length > 0 ? true : false;
          this.customerBranchList = res.Result.CustomerBranches;
          this.setDefaultValue();

          if (this.customerRewardProgramsObj.CustomerRewardProgramID && this.customerRewardProgramsObj.CustomerRewardProgramID > 0) {
            this.getCustomerRewardPoints(this.customerRewardProgramsObj.CustomerRewardProgramID);
          }

          this.isCustomerEnrolled = this.customerRewardProgramsObj.RewardProgramStatusTypeID == this.enumRewardProgramStatusTypeName.Enrolled ? true : false;

        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Reward Program"));
        });

  }

  /* Get All Customer Reward Programs Method */
  getAllCustomerRewardProgram() {
    let param = {
      CustomerRewardProgramID: this.customerRewardProgramsObj.CustomerRewardProgramID,
      DateFrom: this.rewardProgramDateSearch.dateToFrom.DateFrom,
      DateTo: this.rewardProgramDateSearch.dateToFrom.DateTo,
      StatusID: this.rewardProgramSearchParams.StatusID,
      CustomerID: this.customerId,
      BranchID: this.rewardProgramSearchParams.BranchID,
      PageNumber: this.appPagination.pageNumber,
      PageSize: this.appPagination.pageSize
    }
    this._httpService.get(CustomerRewardProgramApi.viewAllCustomerRewardProgram, param).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isDataExists =
            res.Result != null && res.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            this.allCustomersRewardProgram = res.Result;
            if (res.Result.length > 0) {
              this.appPagination.totalRecords = res.TotalRecord;
            } else {
              this.appPagination.totalRecords = 0;
            }
          } else {
            this.appPagination.totalRecords = 0;
          }
          //this.setDefaultValue();
        } else {
          this._messageService.showErrorMessage(res.MessageText)
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Customer Reward Program")
        );
      }
    );
  }

  // Terminate Reward Program Method
  onTerminateRewardProgram() {
    const dialog = this._dialog.open(AlertConfirmationComponent, { disableClose: true });
    dialog.componentInstance.Title = "Terminate Reward Program";
    dialog.componentInstance.Message = "The program will be terminated and the customer will lose all accumulated points. This cannot be undone!";
    dialog.componentInstance.isChangeIcon = false;
    dialog.componentInstance.showButton = false;
    dialog.componentInstance.showConfirmCancelButton = true;
    dialog.componentInstance.confirmChange.subscribe(isConfirm => {
      if (isConfirm) {
        let param = {
          CustomerRewardProgramID: this.customerRewardProgramsObj.CustomerRewardProgramID,
          CustomerID: this.customerId
        }
        this._httpService.get(CustomerRewardProgramApi.terminateProgram, param)
          .subscribe((res:ApiResponse) => {
            if (res && res.MessageCode > 0) {
              this.getFundamentals();
            }
            else {
              this._messageService.showErrorMessage(res.MessageText);
            }
          },
            error => {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Terminate Reward Program"));
            });
      }
      else {
        // this.searchClassAttendee();
      }
    })
  }

  // Reward Program Pagination
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getAllCustomerRewardProgram();
    }
  }

  // Permissions
  setPermissions() {
    if (this.customerTypeId == CustomerType.Lead) {
      this.isRewardProgramSave = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.RewardProgram_Save);
    }
    else {
      this.isRewardProgramSave = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.RewardProgram_Save);
    }

  }

  getLatestPersonInfo() {
    this._httpService.get(PersonInfoApi.getPersonInfo + this.customerTypeId + '/' + this.customerId)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.RewardProgramEnrolledBranchID = res.Result.RewardProgramEnrolledBranchID;
        }
        else {
          this._messageService.showErrorMessage(res.MessageText)
        }
      },
        error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Person Info"))
      );
  }

}

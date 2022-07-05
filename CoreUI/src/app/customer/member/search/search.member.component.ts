/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";

/********************* Material:Refference ********************/
import { MatPaginator } from "@angular/material/paginator";
import { MatDatepicker } from "@angular/material/datepicker";

/********************** Services & Models *********************/
/* Models */
import {
  MemberSearchParameter,
  AllMembers,
} from "@customer/member/models/members.model";

/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";
import { AuthService } from "@app/helper/app.auth.service";
import { DataSharingService } from "@app/services/data.sharing.service";
/********************** Component *********************/
/* Models */
import { ViewMemberDetail } from "@customer/member/view/view.member.detail.component";
/**********************  Common *********************/
import { Configurations } from "@helper/config/app.config";
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { Messages } from "@app/helper/config/app.messages";
import { MemberApi } from "@app/helper/config/app.webapi";
import {
  ENU_Permission_Module,
  ENU_Permission_ClientAndMember,
} from "@app/helper/config/app.module.page.enums";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { ENU_DateFormatName } from "@app/helper/config/app.enums";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";
import { EmailValidatePipe } from "@app/shared/pipes/email.validate";
import { ApiResponse } from "@app/models/common.model";


@Component({
  selector: "search-member",
  templateUrl: "./search.member.component.html",
})
export class SearchMemberComponent extends AbstractGenericComponent
  implements OnInit {
  // #region Local members

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild("memberDateSearch") memberDateSearch: DateToDateFromComponent;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;


  /***********Local*********/
  // dateFrom: Date;
  // dateTo: Date;
  maxDate: Date = new Date();

  /* Messages */
  messages = Messages;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  successMessage: string;
  errorMessage: string;
  public isDataExists: boolean = false;
  isEmailValid: boolean;
  /* Collection And Models */
  statusList = Configurations.Status;
  memberSearchParameter: MemberSearchParameter;
  allMembers: AllMembers;

  membershipList: any;
  membershipStatusTypeList: any;

  /* Dialog Reference */
  deleteDialogRef: any;
  viewDialogRef: any;

  /* Pagination And Sorting */
  // totalRecords: number = 0;
  // pageSize = Configurations.DefaultPageSize;
  // pageSizeOptions = Configurations.PageSizeOptions;
  // pageNumber: number = 1;
  // pageIndex: number = 0;
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  isMemberNameOrderASC: boolean = true;
  startDateSortASC: boolean = undefined;
  sortOrder: string;
  isSearchByPageIndex: boolean = false;

  dateFormat: string = ""; //Configurations.DateFormat;

  allowedPages = {
    Save: false,
    Activities: false,
    Memberships: false,
    Payments: false,
    Invoices: false,
    Bookings: false,
  };

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _memberActionDialogue: MatDialogService,
    private _messageService: MessageService,
    private _authService: AuthService,
    private _emailValidatePipe: EmailValidatePipe,
    private _dataSharingService: DataSharingService
  ) {
    super();
    this.setPermissions();
    this.memberSearchParameter = new MemberSearchParameter();
    this.allMembers = new AllMembers();
  }

  ngOnInit() {
    this.getBranchDatePattern();
    this.getMemberSearchfundamentals();
    this.sortOrder = this.sortOrder_ASC;
  }

  ngAfterViewInit() {
    this.memberDateSearch.setEmptyDateFilter();
    this.getAllMembers();
  }

  // #region Events

  reciviedDateTo($event) {
    this.memberSearchParameter.JoiningDateFrom = $event.DateFrom;
    this.memberSearchParameter.JoiningDateTo = $event.DateTo;
  }

  onFromDateChange(date: any) {
    this.memberSearchParameter.JoiningDateFrom = date;
  }

  onToDateChange(date: any) {
    this.memberSearchParameter.JoiningDateTo = date;
  }
  // #endregion

  // #region Methods

  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(
      this._dataSharingService,
      ENU_DateFormatName.DateFormat
    );
  }

  getMemberSearchfundamentals() {
    this._httpService.get(MemberApi.searchFundamentals).subscribe((res: ApiResponse) => {
      if (res && res.MessageCode > 0) {
        this.membershipList = res.Result.MembershipList;
        this.membershipStatusTypeList = res.Result.MembershipStatusTypeList;
        this.setSearchFilters();

      } 
      else {
        this._messageService.showErrorMessage(res.MessageText);
      }
    }, error => {
      this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member fundamentals"));

    });
  }

  setPermissions() {
    this.allowedPages.Save = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.SaveMember
    );
    this.allowedPages.Activities = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Activities_View
    );
    this.allowedPages.Memberships = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Memberships_View
    );
    this.allowedPages.Payments = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Payments_View
    );
    this.allowedPages.Invoices = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.InvoiceHistory
    );
    this.allowedPages.Bookings = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.BookingHistory
    );
  }

  searchAllMembers() {
    this.memberSearchParameter.CustomerName = (<HTMLInputElement>(
      document.getElementById("member_name")
    )).value;
    this.memberSearchParameter.CardNumber = (<HTMLInputElement>(
      document.getElementById("member_card")
    )).value;
    this.memberSearchParameter.Email = (<HTMLInputElement>(
      document.getElementById("member_email")
    )).value;
    this.memberSearchParameter.MembershipID = Number(
      (<HTMLSelectElement>document.getElementById("member_membership")).value
    );
    this.memberSearchParameter.MembershipStatusTypeID = Number(
      (<HTMLSelectElement>document.getElementById("member_status")).value
    );
    this.reciviedDateTo(this.memberDateSearch.dateToFrom);
    this.memberSearchParameter.MembershipStatusTypeID = Number(
      (<HTMLSelectElement>document.getElementById("member_status")).value
    );
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    // this.appPagination.pageSize = Configurations.DefaultPageSize;
    this.getAllMembers();
  }

  getAllMembers() {
    let memberSearch = JSON.parse(JSON.stringify(this.memberSearchParameter));
    memberSearch.PageNumber = this.appPagination.pageNumber;
    memberSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(MemberApi.getAll, memberSearch).subscribe((res: ApiResponse) => {
      if (res && res.MessageCode > 0) {
        this.isDataExists =
          res.Result != null && res.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.allMembers = res.Result;
          if (res.Result.length > 0) {
            this.appPagination.totalRecords = res.TotalRecord;
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this.appPagination.totalRecords = 0;
        }
      } else {
        this._messageService.showErrorMessage(res.MessageText)
      }
    },
      (error) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Member")
        );
      }
    );
  }

  deleteMember(memberID) {
    this.deleteDialogRef = this._memberActionDialogue.open(
      DeleteConfirmationComponent,
      {
        disableClose: true,
        data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone }
      }
    );
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this._httpService
            .delete(MemberApi.delete.replace("{customerID}", memberID))
            .subscribe(
              (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                  this._messageService.showSuccessMessage(
                    this.messages.Success.Delete_Success.replace("{0}", "Member")
                  );
                  this.getAllMembers();
                } else {
                  this._messageService.showErrorMessage(res.MessageText)
                }
              },
              (err) => {
                this._messageService.showErrorMessage(
                  this.messages.Error.Delete_Error.replace("{0}", "Member")
                );
              }
            );
        }
      }
    );
  }

  resetMemberSearchFilter() {
    this.memberDateSearch.setEmptyDateFilter();
    this.memberSearchParameter.CustomerName = (<HTMLInputElement>(
      document.getElementById("member_name")
    )).value = "";
    this.memberSearchParameter.CardNumber = (<HTMLInputElement>(
      document.getElementById("member_card")
    )).value = "";
    this.memberSearchParameter.Email = (<HTMLInputElement>(
      document.getElementById("member_email")
    )).value = "";
    this.memberSearchParameter.MembershipID = (<HTMLSelectElement>(
      document.getElementById("member_membership")
    )).value = null;
    this.memberSearchParameter.MembershipStatusTypeID = (<HTMLSelectElement>(
      document.getElementById("member_status")
    )).value = null;
    this.memberSearchParameter.JoiningDateFrom = null;
    this.memberSearchParameter.JoiningDateTo = null;
    this.appPagination.pageSize = Configurations.DefaultPageSize;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getAllMembers();
  }

  openMemberDetailDialog(memberID: number) {
    this._memberActionDialogue.open(ViewMemberDetail, {
      disableClose: true,
      data: memberID,
    });
  }


  changeSorting(sortIndex: number) {
    this.memberSearchParameter.SortIndex = sortIndex;
    if (sortIndex == 1) {
      this.startDateSortASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.memberSearchParameter.SortOrder = this.sortOrder;
        this.isMemberNameOrderASC = false;
        this.getAllMembers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.memberSearchParameter.SortOrder = this.sortOrder;
        this.getAllMembers();
        this.isMemberNameOrderASC = true;
      }
    }

    if (sortIndex == 2) {
      this.isMemberNameOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.memberSearchParameter.SortOrder = this.sortOrder;
        this.startDateSortASC = false;
        this.getAllMembers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.memberSearchParameter.SortOrder = this.sortOrder;
        this.getAllMembers();
        this.startDateSortASC = true;
      }
    }
  }
  // validateEmail(): boolean {
  //   var search = (<HTMLInputElement>(document.getElementById("member_email"))).value;
  //   let regexp = new RegExp(/^([a-zA-Z0-9_\-\.]+)@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/);
  //   this.isEmailValid = regexp.test(search);
  //   return this.isEmailValid;
  // }
  validateEmail() {
    var search = (<HTMLInputElement>document.getElementById("member_email")).value;
    this.isEmailValid = this._emailValidatePipe.transform(search);
  }

  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getAllMembers();
  }

  setSearchFilters() {
    this.membershipList.splice(0, 0, {
      MembershipID: null,
      MembershipName: "All",
    });
    this.membershipStatusTypeList.splice(0, 0, {
      MembershipStatusTypeID: null,
      MembershipStatusTypeName: "All",
    });
  }

  // #endregion
}

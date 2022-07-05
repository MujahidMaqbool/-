
/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";

/********************* Material:Refference ********************/
import { MatPaginator } from "@angular/material/paginator";
import { MatDatepicker } from "@angular/material/datepicker";

/********************** Services & Models *********************/
/* Models */

import { AllCustomers, customerAllowedPages, CustomerSearchParameter } from "../models/customers.models";

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
import { Messages } from "@app/helper/config/app.messages";
import { CustomerApi, MemberApi } from "@app/helper/config/app.webapi";
import {
  ENU_Permission_Module,
  ENU_Permission_ClientAndMember,
} from "@app/helper/config/app.module.page.enums";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { ENU_DateFormatName, ENU_Package, CustomerType } from "@app/helper/config/app.enums";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";
import { EmailValidatePipe } from "@app/shared/pipes/email.validate";
import { Router } from "@angular/router";
import { CommonService } from "@app/services/common.service";
import { CustomDatePipe } from '../../../app/application-pipes/custom.date.pipe';
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { SubscriptionLike } from "rxjs";
import { CustomerBenefitsComponent } from "@app/customer-shared-module/customer-benefits/customer.benefits.component";
import { ApiResponse } from "@app/models/common.model";


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent extends AbstractGenericComponent
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
  dateToPlaceHolder: string = "Select Customer Created Date";
  dateFromPlaceHolder: string = "Select Customer Created Date";

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
  customerSearchParameter: CustomerSearchParameter;
  allCustomers: AllCustomers;

  membershipList: any;
  membershipStatusTypeList: any;
  customerTypeList: any = Configurations.CustomerTypes;
  public CustomerType = CustomerType;
  /* Dialog Reference */
  deleteDialogRef: any;
  viewDialogRef: any;

  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  isCustomerNameOrderASC: boolean = true;
  startDateSortASC: boolean = undefined;
  customerTypeSortASC: boolean = undefined;
  membershipStatusSortASC: boolean = undefined;
  endDateSortASC: boolean = undefined;
  sortOrder: string;
  isSearchByPageIndex: boolean = false;
  toggleStatuses: any[] = [];
  dateFormat: string = ""; //Configurations.DateFormat;
  package = ENU_Package;
  packageId :number;

  checkClient: boolean;
  customerType:boolean;
  allowedPages: customerAllowedPages = new customerAllowedPages();
  packageIdSubscription: SubscriptionLike;
  beneftisViewAllowedInPermission: boolean;
  benefitsViewInculdeInPackage: boolean;

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _router: Router,
    public _commonService: CommonService,
    private _customerActionDialogue: MatDialogService,
    private _messageService: MessageService,
    private _authService: AuthService,
    private _emailValidatePipe: EmailValidatePipe,
    private _dataSharingService: DataSharingService,
    public _customDate: CustomDatePipe,
    private _clientActionDialogue: MatDialogService,

  ) {
    super();
    this.setPermissions();
    this.customerSearchParameter = new CustomerSearchParameter();
    this.allCustomers = new AllCustomers();
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
          if (packageId && packageId > 0) {
            this.packageId = packageId;
            this.setPackagePermission(this.packageId);
          }
      }
  );
  }

  ngOnInit() {
    this.getBranchDatePattern();
    this.getMemberSearchfundamentals();
    this.sortOrder = this.sortOrder_ASC;
    this.customerSearchParameter.SortOrder = this.sortOrder_ASC;
  }

  ngAfterViewInit() {
    this.memberDateSearch.setEmptyDateFilter();
    this.getAllCustomers();
  }
  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
  }
  // #region Events

  /* Receive date for Customer Search Parameter */
  reciviedDate($event) {
    this.customerSearchParameter.JoiningDateFrom = $event.DateFrom;
    this.customerSearchParameter.JoiningDateTo = $event.DateTo;
  }

  // #endregion

  // #region Methods

  /* Method to get Branch Date Pattern */
  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(
      this._dataSharingService,
      ENU_DateFormatName.DateFormat
    );
  }

  /* Method to get Customer Search Fundamentals */
  getMemberSearchfundamentals() {
    this._httpService.get(MemberApi.searchFundamentals).subscribe((data) => {
      this.membershipList = data.Result.MembershipList;
      this.membershipStatusTypeList = data.Result.MembershipStatusTypeList;
      this.setSearchFilters();
    });
  }

// Delete Customer

  deleteCustomer(customerID: number,CustomerTypeID : number) {
    this.deleteDialogRef = this._customerActionDialogue.open(DeleteConfirmationComponent, { disableClose: true ,data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", CustomerType.Member == CustomerTypeID? "this Member " : "this Client ") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
            this._httpService.delete(CustomerApi.deleteCustomer + "?customerID=" + customerID)
                .subscribe((res :ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.getAllCustomers();
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", CustomerType.Member == CustomerTypeID? "Member" : "Client"));
                    }
                    else if (res && res.MessageCode < 0) {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", CustomerType.Member == CustomerTypeID? "Member" : "Client")); }
                );
        }
    })
}

  /* Method to set the Permissions for the View */
  setPermissions() {

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
    this.allowedPages.saveClient = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.SaveClient
    );
    this.allowedPages.saveMember = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.SaveMember
    );
    this.allowedPages.DeleteClient = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.DeleteClient
    );
    this.allowedPages.DeleteMember = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.DeleteMember
    );
    this.beneftisViewAllowedInPermission = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BenefitsView);
  }

  /* Method to search all the customers */
  searchAllCustomers() {
    this.reciviedDate(this.memberDateSearch.dateToFrom);
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.customerSearchParameter.SortOrder = this.sortOrder_ASC;
    this.getAllCustomers();
  }

  /* Method to get all the customers */
  getAllCustomers() {
    let customerSearch = JSON.parse(JSON.stringify(this.customerSearchParameter));
    customerSearch.PageNumber = this.appPagination.pageNumber;
    customerSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(CustomerApi.ViewAllCustomer, customerSearch).subscribe
      ((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isDataExists =
            res.Result != null && res.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            this.allCustomers = res.Result;
            this.setToggleStatuses(res.Result.length);
            if (res.Result.length > 0) {
              this.appPagination.totalRecords = res.TotalRecord;
            } else {
              this.appPagination.totalRecords = 0;
            }
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Customer")
          );
        }
      );
  }

  /* Method to reset dearch filters */
  resetSearchFilter() {
    this.memberDateSearch.setEmptyDateFilter();
    this.customerSearchParameter = new CustomerSearchParameter();
    this.customerSearchParameter.JoiningDateFrom = null;
    this.customerSearchParameter.JoiningDateTo = null;
    this.customerSearchParameter.Email =  "";
    this.customerSearchParameter.SortOrder = this.sortOrder_ASC;
    this.appPagination.resetPagination();
    this.setPackagePermission(this.packageId);
    this.getAllCustomers();
  }

  /* to open customer detail Dialog */
  openCustomerDetailDialog(customer: number, customerTypeID: number) {
      this._customerActionDialogue.open(ViewMemberDetail, {
        disableClose: true,
        data: customer,
      });
  }

  /* to edit customer detail Dialog */
  editCustomerDetail(customer: any, customerTypeID: number) {
    if (customerTypeID == 3) {
      this._router.navigate(['customer/member/details', customer.CustomerID]);
    } else {
      this._commonService.shareLeadInfo(customer);
      this._router.navigate(['customer/client/details', customer.CustomerID]);
    }
  }

  /* Method to change Sorting */
  changeSorting(sortIndex: number) {
    this.customerSearchParameter.SortIndex = sortIndex;
    if (sortIndex == 1) {
      this.startDateSortASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.isCustomerNameOrderASC = false;
        this.getAllCustomers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.getAllCustomers();
        this.isCustomerNameOrderASC = true;
      }
    }

    if (sortIndex == 2) {
      this.isCustomerNameOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.customerTypeSortASC = false;
        this.getAllCustomers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.getAllCustomers();
        this.customerTypeSortASC = true;
      }
    }
    if (sortIndex == 3) {
      this.isCustomerNameOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.membershipStatusSortASC = false;
        this.getAllCustomers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.getAllCustomers();
        this.membershipStatusSortASC = true;
      }
    }
    if (sortIndex == 4) {
      this.isCustomerNameOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.startDateSortASC = false;
        this.getAllCustomers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.getAllCustomers();
        this.startDateSortASC = true;
      }
    }
    if (sortIndex == 5) {
      this.isCustomerNameOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.endDateSortASC = false;
        this.getAllCustomers();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.customerSearchParameter.SortOrder = this.sortOrder;
        this.getAllCustomers();
        this.endDateSortASC = true;
      }
    }
  }

  /* Method to validate the Email in search parameter */
  validateEmail() {
    var search = this.customerSearchParameter.Email;
    this.isEmailValid = this._emailValidatePipe.transform(search);
  }

  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getAllCustomers();
  }

  /* Method to set the search filters */
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

  /* Method to set the toggle Statuses */
  setToggleStatuses(length: number) {
    for (let i = 0; i < length; i++) {
      this.toggleStatuses[i] = {
        collapse: true
      };
      this.resetMembershipData(i);
      this.getMemberShip(i);
    }


  }

  /* Method to get Membership on the basis of the length  */
  getMemberShip(index: number) {
    let indexedObject = this.allCustomers[index];
    let obj = indexedObject.CustomerMembershipList[0];

    if (indexedObject.CustomerMembershipList && indexedObject.CustomerMembershipList.length > 1) {
      length = indexedObject.CustomerMembershipList.length - 1;
      this.allCustomers[index].Membership[0].MembershipName.push(obj.MembershipName);
      this.allCustomers[index].Membership[0].MembershipStatusTypeName.push(obj.MembershipStatusTypeName); //+ '  (+' + length + ' others)'
      this.allCustomers[index].Membership[0].MembershipStartDate.push(this._customDate.transform(obj.MembershipStartDate, this.dateFormat));
      this.allCustomers[index].Membership[0].MembershipEndDate.push(this._customDate.transform(obj.MembershipEndDate, this.dateFormat));
    } else if (indexedObject.CustomerMembershipList && indexedObject.CustomerMembershipList.length == 1) {
      this.allCustomers[index].Membership[0].MembershipName.push(obj.MembershipName);
      this.allCustomers[index].Membership[0].MembershipStatusTypeName.push(obj.MembershipStatusTypeName);
      this.allCustomers[index].Membership[0].MembershipStartDate.push(this._customDate.transform(obj.MembershipStartDate, this.dateFormat));
      this.allCustomers[index].Membership[0].MembershipEndDate.push(this._customDate.transform(obj.MembershipEndDate, this.dateFormat));
    } else {
      // AS discussed with Fahad dashes will be replaced by Empty space
      this.allCustomers[index].Membership[0].MembershipName.push('');
      this.allCustomers[index].Membership[0].MembershipStatusTypeName.push('');
      this.allCustomers[index].Membership[0].MembershipStartDate.push('');
      this.allCustomers[index].Membership[0].MembershipEndDate.push('');
    }

  }

  /* Method to toggle the membership length and view */
  onToggleClick(i: number) {
    this.resetMembershipData(i);
    this.toggleStatuses[i].collapse = !this.toggleStatuses[i].collapse;
    if (this.toggleStatuses[i].collapse == false) {
      this.allCustomers[i].Membership = this.allCustomers[i].CustomerMembershipList;
      this.allCustomers[i].Membership.forEach(element => {
        element.MembershipStartDate = this._customDate.transform(element.MembershipStartDate, this.dateFormat);
        element.MembershipEndDate = this._customDate.transform(element.MembershipEndDate, this.dateFormat);
      });

    } else {
      this.getMemberShip(i);
    }
  }

  /* Method to reset the Membership Data for the view */
  public resetMembershipData(i) {
    this.allCustomers[i].Membership = [{}];
    this.allCustomers[i].Membership[0].MembershipName = [];
    this.allCustomers[i].Membership[0].MembershipStatusTypeName = [];
    this.allCustomers[i].Membership[0].MembershipStartDate = [];
    this.allCustomers[i].Membership[0].MembershipEndDate = [];
  }
  setPackagePermission(packageId: number) {
    this.benefitsViewInculdeInPackage =  packageId == this.package.Full || packageId == this.package.FitnessBasic || packageId == this.package.FitnessMedium ? true : false;

    switch (packageId) {

        case this.package.WellnessBasic:
          this.customerSearchParameter.CustomerTypeID = 1;
            break;

        case this.package.WellnessMedium:
          this.customerSearchParameter.CustomerTypeID = 1;
            break;

        case this.package.WellnessTop:
          this.customerSearchParameter.CustomerTypeID = 1;
            break;

        case this.package.FitnessBasic:
          this.checkClient = true;
          this.customerSearchParameter.CustomerTypeID = 3;
            break;

        case this.package.FitnessMedium:
          this.checkClient = true;
          this.customerSearchParameter.CustomerTypeID = 3;
            break;

        case this.package.Full:
          this.checkClient = true;
          this.customerType = true;
            break;

    }
  }
  onViewCustomerBenefits(clientID: number) {
    this._clientActionDialogue.open(CustomerBenefitsComponent, {
        disableClose: true,
        data: clientID,
    });
  }
  // #endregion

}

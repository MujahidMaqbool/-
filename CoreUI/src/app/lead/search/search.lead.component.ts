/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { SubscriptionLike } from 'rxjs';

/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';

/* Models */
import { LeadSearchParameter, SaveLead, LeadDetail } from "src/app/lead/models/lead.model";
import { ApiResponse } from 'src/app/models/common.model';
/**********************  Configuration *********************/
import { Configurations } from 'src/app/helper/config/app.config'
import { Messages } from 'src/app/helper/config/app.messages';
import { LeadApi } from 'src/app/helper/config/app.webapi';
import { ENU_DateFormatName, ENU_Package, LeadStatusType } from 'src/app/helper/config/app.enums';
import { CustomDatePipe } from 'src/app/application-pipes/custom.date.pipe';
import { ENU_Permission_Lead, ENU_Permission_Module } from 'src/app/helper/config/app.module.page.enums';

/**********************Component*********************/
import { ViewLeadDetailComponent } from 'src/app/lead/view/view.lead.detail.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { CustomerBenefitsComponent } from 'src/app/customer-shared-module/customer-benefits/customer.benefits.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';

@Component({
    selector: 'search-lead',
    templateUrl: './search.lead.component.html'
})

export class SearchLeadComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    /***********Angular Event*********/
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('leadDateSearch') leadDateSearch: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;


    packageIdSubscription: SubscriptionLike;

    /* configurations */
    package = ENU_Package;

    /***********Local*********/
    // dateFrom: Date;
    // dateTo: Date;
    maxDate: Date = new Date();
    dateFormat: string = '';
    benefitsViewInculdeInPackage: boolean;

    dateToPlaceHolder: String = "Select Lead Created Date";
    dateFromPlaceHolder: string = "Select Lead Created Date";

    /***********Messages*********/
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;
    isDataExists: boolean = false;

    /***********Dialog Reference*********/
    deleteDialogRef: any;
    viewDialogRef: any;

    /***********Collection And Models*********/
    salesSearchFundamental: any;
    leadGridDataObj: any;
    saveLeadDataObj: SaveLead;
    viewLeadDetailDataObj: LeadDetail[] = [];
    membershipList: any;
    leadStatusTypeList: any;
    staffList: any;
    salesSearchParameterObj = new LeadSearchParameter();
    leadSearchParameters = new LeadSearchParameter();
    leadStatusType = LeadStatusType;

    /***********Pagination And Sorting *********/
    // totalRecords: number = 0;
    // pageSize = Configurations.DefaultPageSize;
    // pageSizeOptions = Configurations.PageSizeOptions;
    // pageNumber: number = 1;
    // pageIndex: number = 0;
    sortIndex: number = 1;
    sortOrder_ASC: string = Configurations.SortOrder_ASC;
    sortOrder_DESC: string = Configurations.SortOrder_DESC;
    sortOrder: string;
    postionSortOrder: string;
    isPositionOrderASC: boolean = undefined;
    isSalesNameOrderASC: boolean = true;
    isSearchByPageIndex: boolean = false;
    toggleStatuses: any[] = [];

    allowedPages = {
        Save: false,
        Activities: false,
        BenefitsView: false,
        invoices: false,
        bookings: false,
        enquriesView: false,
        delete:false
    };

    // #endregion

    constructor(
        private _router: Router,
        private _httpService: HttpService,
        private _salesActionDilage: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        public _customDate: CustomDatePipe,
        private _staffActionDialog: MatDialogService,

    ) {
        super();
        this.saveLeadDataObj = new SaveLead();
        this.setPermissions();

    }

    // #region Events

    ngOnInit() {
        this.getBranchDatePattern();
        this.leadSearchFundamentals();
        this.sortOrder = this.sortOrder_DESC;
        // this.postionSortOrder = this.sortOrder_ASC;

        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
            (packageId: number) => {
                if (packageId && packageId > 0) {
                    this.setBenefitViewPermissions(packageId);
                }
            }
        );
    }

    ngAfterViewInit() {
        this.leadDateSearch.setEmptyDateFilter();
        this.getLead();
    }

    setBenefitViewPermissions(packageID: number) {
        this.benefitsViewInculdeInPackage = packageID == this.package.Full || packageID == this.package.FitnessBasic || packageID == this.package.FitnessMedium ? true : false;
    }

    onAddEditLead(leadID: number) {
        this._dataSharingService.shareLeadID(leadID);
        this._router.navigate(['lead/details', leadID]);
    }

    onViewLeadDetail(leadId: number) {

        this._httpService.get(LeadApi.getLeadDetail + leadId)
            .subscribe(
                (res:ApiResponse) => {
                    if(res && res.MessageCode > 0){
                    this.viewLeadDetailDataObj = res.Result;
                    this.openDialog();
                    }else{
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead")); }
            )
    }

    onViewCustomerBenefits(clientID: number) {
        this._salesActionDilage.open(CustomerBenefitsComponent, {
            disableClose: true,
            data: clientID,
        });
    }

    // onToDateChange(date: any) {
    //     setTimeout(() => {
    //         this.salesSearchParameterObj.DateTo = date; //= this._dateTimeService.convertDateObjToString(date, this.dateFormat); 07/05/2018  MM/dd/yyyy
    //     });
    // }

    // onFromDateChange(date: any) {
    //     setTimeout(() => {
    //         this.salesSearchParameterObj.DateFrom = date; //= this._dateTimeService.convertDateObjToString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy
    //     });
    // }

    reciviedDateTo($event) {
        this.salesSearchParameterObj.DateFrom = $event.DateFrom;
        this.salesSearchParameterObj.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.salesSearchParameterObj.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.salesSearchParameterObj.DateTo = date;
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
    setPermissions() {
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Save);
        this.allowedPages.Activities = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_View);
        this.allowedPages.BenefitsView = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.benefits_View);
        this.allowedPages.invoices = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.InvoiceHistory);
        this.allowedPages.bookings = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BookingHistory);
        this.allowedPages.enquriesView = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Memberships_View);
        this.allowedPages.delete = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Delete);
    }

    openDialog() {
        this._salesActionDilage.open(ViewLeadDetailComponent, {
            disableClose: true,
            data: this.viewLeadDetailDataObj,
        });
    }


    leadSearchFundamentals() {
        this._httpService.get(LeadApi.searchFundamentals)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.membershipList = res.Result.MembershipList;
                    this.leadStatusTypeList = res.Result.LeadStatusTypeList;
                    this.staffList = res.Result.StaffList;
                    this.setSearchFilters();
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace("{0}", "Lead")); });
    }

    // changeSorting() {
    //     this.isPositionOrderASC = undefined;
    //     if (this.sortOrder == this.sortOrder_ASC) {
    //         this.sortOrder = this.sortOrder_DESC;
    //         this.isSalesNameOrderASC = false;
    //         this.salesSearchParameterObj.SortOrder = this.sortOrder;
    //         this.getLead();
    //     }
    //     else {
    //         this.sortOrder = this.sortOrder_ASC;
    //         this.salesSearchParameterObj.SortOrder = this.sortOrder;
    //         this.getLead();
    //         this.isSalesNameOrderASC = true;
    //     }
    // }

    changeSorting(sortIndex: number) {
        this.salesSearchParameterObj.SortIndex = sortIndex;
        if (sortIndex == 1) {
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.salesSearchParameterObj.SortOrder = this.sortOrder;
                this.getLead();
            } else {
                this.sortOrder = this.sortOrder_ASC;
                this.salesSearchParameterObj.SortOrder = this.sortOrder;
                this.getLead();
            }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.salesSearchParameterObj.SortOrder = this.sortOrder;
                this.getLead();
            } else {
                this.sortOrder = this.sortOrder_ASC;
                this.salesSearchParameterObj.SortOrder = this.sortOrder;
                this.getLead();
            }
        }

    }

    getLead() {
        this.leadSearchParameters.PageNumber = this.appPagination.pageNumber;
        this.leadSearchParameters.PageSize = this.appPagination.pageSize;
        this.leadSearchParameters.SortIndex = this.salesSearchParameterObj.SortIndex;
        this.leadSearchParameters.SortOrder = this.salesSearchParameterObj.SortOrder;

        this._httpService.get(LeadApi.getAll, this.leadSearchParameters)
            .subscribe((res:ApiResponse) => {
                if(res && res.MessageCode > 0){
                this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (res.Result.length > 0) {
                        this.appPagination.totalRecords = res.TotalRecord;
                    }
                    else { this.appPagination.totalRecords = 0; }

                    this.leadGridDataObj = res.Result;
                    this.setToggleStatuses(res.Result.length);
                    this.isSearchByPageIndex = false;
                } else {
                    this.appPagination.totalRecords = res.TotalRecord;
                }
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead"));
                }
            );
    }

    salesSearch() {
        this.leadSearchParameters = new LeadSearchParameter();
        this.leadSearchParameters.CustomerName = this.salesSearchParameterObj.CustomerName;
        this.leadSearchParameters.MembershipID = this.salesSearchParameterObj.MembershipID;
        this.leadSearchParameters.Email = this.salesSearchParameterObj.Email;
        this.leadSearchParameters.AssignedToStaffID = this.salesSearchParameterObj.AssignedToStaffID;
        this.leadSearchParameters.DateFrom = this.salesSearchParameterObj.DateFrom;
        this.leadSearchParameters.DateTo = this.salesSearchParameterObj.DateTo;
        this.leadSearchParameters.LeadStatusTypeID = this.salesSearchParameterObj.LeadStatusTypeID;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getLead();
    }

    resetSalesSearchFilters() {
        this.leadSearchParameters = new LeadSearchParameter();
        this.leadDateSearch.setEmptyDateFilter();
        this.salesSearchParameterObj.CustomerName = "";
        this.salesSearchParameterObj.MembershipID = null;
        this.salesSearchParameterObj.AssignedToStaffID = null;
        this.salesSearchParameterObj.LeadStatusTypeID = null;
        this.salesSearchParameterObj.Email = "";
        this.appPagination.resetPagination();
        this.getLead();

    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getLead();
    }

    /* Temporary Commented as for now A Lead cannot be deleted  */

    // deleteSales(customerID: number) {
    //     this.deleteDialogRef = this._salesActionDilage.open(DeleteConfirmationComponent, { disableClose: true });
    //     this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
    //         if (isConfirmDelete) {
    //             this._httpService.delete(CustomerApi.deleteCustomer + "?customerID=" + customerID)
    //                 .subscribe(res => {
    //                     if (res && res.MessageCode > 0) {
    //                         this.getLead();
    //                         this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Lead"));
    //                     }
    //                     else if (res && res.MessageCode < 0) {
    //                         this._messageService.showErrorMessage(res.MessageText);
    //                     }
    //                 },
    //                     err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead")); }
    //                 );
    //         }
    //     })
    // }

    setSearchFilters() {
        this.membershipList.splice(0, 0, { MembershipID: null, MembershipName: "All" });
        this.staffList.splice(0, 0, { StaffID: null, StaffFullName: "All" });
        this.leadStatusTypeList.splice(0, 0, { LeadStatusTypeID: null, LeadStatusTypeFriendlyName: "All Active Enquiries" });
    }


    /* Method to get Membership on the basis of the length  */
    getMemberShip(index: number) {
        let indexedObject = this.leadGridDataObj[index];
        let obj = indexedObject.CustomerMembershipList[0];
        if (indexedObject.CustomerMembershipList && indexedObject.CustomerMembershipList.length > 1) {
            length = indexedObject.CustomerMembershipList.length - 1;
            this.leadGridDataObj[index].Membership[0].MembershipName.push(obj.MembershipName);
            this.leadGridDataObj[index].Membership[0].LeadStatusTypeFriendlyName.push(obj.LeadStatusTypeFriendlyName);
            this.leadGridDataObj[index].Membership[0].CreatedOn.push(this._customDate.transform(obj.CreatedOn, this.dateFormat));
            let assignedToStaffName = obj.AssignedToStaffName ? obj.AssignedToStaffName : 'Not Specified'
            this.leadGridDataObj[index].Membership[0].AssignedToStaffName.push(assignedToStaffName);
        } else if (indexedObject.CustomerMembershipList && indexedObject.CustomerMembershipList.length == 1) {
            this.leadGridDataObj[index].Membership[0].MembershipName.push(obj.MembershipName);
            this.leadGridDataObj[index].Membership[0].LeadStatusTypeFriendlyName.push(obj.LeadStatusTypeFriendlyName);
            this.leadGridDataObj[index].Membership[0].CreatedOn.push(this._customDate.transform(obj.CreatedOn, this.dateFormat));
            let assignedToStaffName = obj.AssignedToStaffName ? obj.AssignedToStaffName : 'Not Specified'
            this.leadGridDataObj[index].Membership[0].AssignedToStaffName.push(assignedToStaffName);
        } else {
            this.leadGridDataObj[index].Membership[0].MembershipName.push('-');
            this.leadGridDataObj[index].Membership[0].LeadStatusTypeFriendlyName.push('-');
            this.leadGridDataObj[index].Membership[0].CreatedOn.push('-');
            this.leadGridDataObj[index].Membership[0].AssignedToStaffName.push('-');
        }

    }
    setToggleStatuses(length: number) {
        for (let i = 0; i < length; i++) {
            this.toggleStatuses[i] = {
                collapse: true
            };
            this.resetMembershipData(i);
            this.getMemberShip(i);
        }


    }
    onToggleClick(i: number) {
        this.resetMembershipData(i);
        this.toggleStatuses[i].collapse = !this.toggleStatuses[i].collapse;
        if (this.toggleStatuses[i].collapse == false) {
            this.leadGridDataObj[i].Membership = this.leadGridDataObj[i].CustomerMembershipList;
            this.leadGridDataObj[i].Membership.forEach(element => {
                element.CreatedOn = this._customDate.transform(element.CreatedOn, this.dateFormat);
            });

        } else {
            this.getMemberShip(i);
        }
    }
    public resetMembershipData(i) {
        this.leadGridDataObj[i].Membership = [{}];
        this.leadGridDataObj[i].Membership[0].MembershipName = [];
        this.leadGridDataObj[i].Membership[0].LeadStatusTypeFriendlyName = [];
        this.leadGridDataObj[i].Membership[0].CreatedOn = [];
        this.leadGridDataObj[i].Membership[0].AssignedToStaffName = [];
    }
    deleteLead(Id: number) {
        const deleteDialogRef = this._salesActionDilage.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "Lead ") , description: this.messages.Delete_Messages.Del_Msg_Lead}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(LeadApi.delete + Id)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Lead"));
                                this.getLead();
                            }
                            else if (res && res.MessageCode <= 0) {
                                // this._messageService.showErrorMessage(this.messages.Error.Staff_Associated_Error.replace("{0}", "Staff"));
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead")); }
                    );
            }
        })
    }
    // #endregion
}

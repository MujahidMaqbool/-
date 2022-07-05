/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from '@angular/core';

/********************* Material:Refference ********************/
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Services & Models *********************/
/* Models */
/* Services */
import { HttpService } from '@app/services/app.http.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { Messages } from '@app/helper/config/app.messages';



/********************** Component *********************/
/* Models */
/**********************  Common *********************/
import { MemberMembershipApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { MemberMembershipBenefitsLog, MembershipBenefitActivityType, MemberMembership, MembershipBenefitsLogSearch } from '../models/member.membershipbenefitslog.model';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { Configurations } from '@app/helper/config/app.config';
import { DateTimeService } from '@app/services/date.time.service';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';


@Component({
    selector: 'membership-benefits-log',
    templateUrl: './benefits.log.component.html',
})
export class MembershipBenefitsLog extends AbstractGenericComponent implements OnInit {

    /* Local */

    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    @ViewChild('benefitLogSearchDate') benefitLogSearchDate: DateToDateFromComponent;
    memberID: number;
    shouldGetPersonInfo: boolean = false;
    isDataExists: boolean = false;


    /* Pagination  */
    totalRecords: number = 0;
    pageSize = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    previousPageSize = 0;
    pageIndex = 0;
    branchCurrentDate: Date;
    dateFormat: string = "";
    dateTimeFormat: string = "";
    timeFormat: string = "";
    dateToPlaceHolder: string = "Select Date";
    dateFromPlaceHolder: string = "Select Date";

    dateFrom = new Date();
    dateTo = new Date();

    /* Collection And Models */
    activitiesTypeList: MembershipBenefitActivityType[] = new Array<MembershipBenefitActivityType>();
    memberMembershipList: MemberMembership[] = new Array<MemberMembership>();
    memberMembershipBenefitsLog: MemberMembershipBenefitsLog[];
    membershipBenefitsLogSearch: MembershipBenefitsLogSearch = new MembershipBenefitsLogSearch();
    memberIdSubscription: ISubscription;
    _messageService: any;

    /* messages */
    messages = Messages;

    /* Collection And Models */



    constructor(
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }


    ngAfterViewInit() {
        this.benefitLogSearchDate.setEmptyDateFilter();
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateTimeFormat =  this.dateFormat + " | " + this.timeFormat;
        this.getMemberID();
        this.getFundamentals();
    }
    //#region  Methods Start

    reciviedDateTo($event) {
        this.membershipBenefitsLogSearch.DateFrom = $event.DateFrom;
        this.membershipBenefitsLogSearch.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.membershipBenefitsLogSearch.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.membershipBenefitsLogSearch.DateTo = date;
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getBenefitsLog();
    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                this.memberID = memberID;
                this.shouldGetPersonInfo = true;
            }
        });
    }

    searchBenefitsLog() {
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getBenefitsLog();
    }

    resetBenefitsLog() {
        this.benefitLogSearchDate.setEmptyDateFilter();
        this.membershipBenefitsLogSearch.CustomerMembershipID = null;
        this.membershipBenefitsLogSearch.MembershipBenefitActivityTypeID = null;
        this.appPagination.resetPagination();
        this.getBenefitsLog();
    }

    getFundamentals() {
        let params = {
            customerId: this.memberID,
        }

        this._httpService.get(MemberMembershipApi.getMemberMembershipBenefitsLogFundamentals, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.activitiesTypeList = res.Result.MembershipBenefitActivityTypeList;
                    this.memberMembershipList = res.Result.MembershipList;
                    this.membershipBenefitsLogSearch.CustomerMembershipID = null;
                    this.membershipBenefitsLogSearch.MembershipBenefitActivityTypeID = null;
                    this.getBenefitsLog();
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Benefits Log Fundamentals"));
                }
            );
    }

    getBenefitsLog() {

        let params = {
            customerId: this.memberID,
            customerMembershipID: this.membershipBenefitsLogSearch.CustomerMembershipID,
           // membershipID: this.membershipBenefitsLogSearch.CustomerMembershipID,
            membershipBenefitActivityTypeID: this.membershipBenefitsLogSearch.MembershipBenefitActivityTypeID,
            dateFrom: this.membershipBenefitsLogSearch.DateFrom ? this.membershipBenefitsLogSearch.DateFrom : '',
            dateTo: this.membershipBenefitsLogSearch.DateTo ? this.membershipBenefitsLogSearch.DateTo : '',
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
        }

        this._httpService.get(MemberMembershipApi.getMemberMembershipBenefitsLog, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.memberMembershipBenefitsLog = res.Result;
                        this.appPagination.totalRecords = res.TotalRecord;
                    }
                    else {
                        this.memberMembershipBenefitsLog = [];
                        this.appPagination.totalRecords = 0;
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }

            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Benefits Log"));
                }
            );
    }
    //#region  Methods End


}

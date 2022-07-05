/************************* Angular References ***********************************/
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
/************************* Services & Models ***********************************/
/* Models */
import {
    LeadDashboradParameter,
    SaleTourEnquiryStatus,
    EnquirySource,
    LeadActivity,
    AtivtiesSummary,
    LeadFlow,
    LeadEnquiryTour,
    LeadStatusTypeList
} from '@lead/models/lead.dashboard.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { Configurations } from '@app/helper/config/app.config';
/************************* Common ***********************************/
import { EnquirySourceType, ENU_ActivityType, LeadFlowStatusTypes, LeadStatusType, LeadStatusTypesNew } from '@helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { DateTimeService } from '@app/services/date.time.service';
import { forkJoin } from 'rxjs';
import { LeadApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { MatDatepicker } from '@angular/material/datepicker';


@Component({
    selector: 'lead-dashboard',
    templateUrl: './lead.dashboard.component.html'
})


export class LeadDashboardComponent implements OnInit {


    @ViewChild('datePickerElement') _input: ElementRef;
    DataChangeDashboard = {
        LeadFlow: 1,
        LeadSummary: 2,
        SourceofLead: 3,
        EnquiryTourTrialSale: 4,
        WhoOwnstheMostLeads: 5,
        Payment: 6,
        LeadActivities: 7
    };


    // #region Local Members
    isLeadFlowDataExists: boolean = false;
    isLeadActivitiesDataExists: boolean = false;
    issourceofLeadsDataExists: boolean = false;
    newLeadsCount: number = 0;
    wonLeadsCount: number = 0;
    lostLeadsCount: number = 0;
    allActiveEnquiriesCount: number = 0;
    equirySourceTotalCount: number = 0;
    customizeText: string = '';
    activtiesDateFrom: Date = new Date();
    dateFormat: string = 'yyyy-MM-dd';
    currentDate: Date = new Date();
    maxDate: Date = new Date();
    dateCorrect: boolean = true;
    /***********Messages*********/
    messages = Messages;

    /***********Collection And Models*********/
    enquirySourceType = EnquirySourceType;
    activityType = ENU_ActivityType;
    leadStatusType = LeadStatusType;
    leadDashBoradParameter = new LeadDashboradParameter();
    leadDashboardFundamental: any;
    enquirySourceTypeList: EnquirySource[] = [];
    leadActivityTypeList: LeadActivity[] = [];
    leadStatusTypeFriendlyViewModel: LeadStatusTypeList[] = [];
    ownLeads: any;
    sourceDayWiseFilteredList: any[] = [];
    sourceDayWise: any[] = [];
    leadFlowDashboard: LeadFlow[] = [];
    leadActivities: any[] = [];
    leadActivitySummary: AtivtiesSummary[] = [];
    saleTourEnquiryStatus: SaleTourEnquiryStatus[] = [];
    leadStatusTypeID: any[] = Configurations.LeadStatusTypeID;
    // #endregion

    constructor(
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _messageService: MessageService

    ) {
    }

    ngOnInit() {
        this.resetEnquirySourceCount();
        this.resetLeadActivitesCount();
    }

    async ngAfterViewInit() {
        //commment by rizwan changed by default date current to one month
        // this.leadDashBoradParameter.DateFrom = this._dateTimeService.convertDateObjToString(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1), this.dateFormat);
        // this.leadDashBoradParameter.DateTo = this._dateTimeService.convertDateObjToString(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0), this.dateFormat);
        let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.leadDashBoradParameter.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.leadDashBoradParameter.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.getFundamentals();
        this.getOwns();
        this.getSaleTourEnquiryStatus();
        this.onLeadFlowDateChange();
    }

    onLeadDateChange() {
        this.getOwns();

    }

    onSaleTourDateChange() {
        this.getSaleTourEnquiryStatus();
    }

    onSourceDateChange() {
        this.getEnquirySourceCountDayWise().subscribe(
            data => {
                this.issourceofLeadsDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.issourceofLeadsDataExists) {
                    this.setEnquirySourceCountDayWise(data.Result);
                }
                else {
                    this.sourceDayWise = [];
                    this.sourceDayWiseFilteredList = [];
                    this.resetEnquirySourceCount();
                    this.equirySourceTotalCount = 0;
                }
            }
        );
    }

    onActivitySummaryDateChange() {
        this.getLeadsStatus().subscribe(
            data => {
                if (data && data.Result) {
                    this.getLeadActivitySummary(data.Result);
                }
                else {
                    this.getLeadActivitySummary(data.Result);
                }
            });
    }

    onActivitiesDateChange($event) {
        if ($event != undefined) {
            this.leadDashBoradParameter.DateFrom = $event.DateFrom;
            this.leadDashBoradParameter.DateTo = $event.DateTo;
        }
        // this.activtiesDateFrom = activtiesDateFrom;
        this.getLeadActivities().subscribe(
            data => {
                if (data && data.Result) {
                    this.setActiviteisCount(data.Result);
                }
                else {
                    this.leadActivities = [];
                    this.setActiviteisCount(data.Result);
                }
            }
        );
    }

    onLeadFlowDateChange() {
        this.getLeadFlow();

    }

    onDateChange($event, dashboardID: number) {
        if ($event != undefined) {
            this.leadDashBoradParameter.DateFrom = $event.DateFrom;
            this.leadDashBoradParameter.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.LeadFlow:
                this.onLeadFlowDateChange();
                break;
            case this.DataChangeDashboard.LeadSummary:
                this.onActivitySummaryDateChange();
                break;
            case this.DataChangeDashboard.SourceofLead:
                this.onSourceDateChange();
                break;
            case this.DataChangeDashboard.WhoOwnstheMostLeads:
                this.onLeadDateChange();
                break;
            case this.DataChangeDashboard.LeadActivities:
                this.getLeadActivities();
                break;
            case this.DataChangeDashboard.EnquiryTourTrialSale:
                this.getSaleTourEnquiryStatus();
                break;

        }
    }

    checkFromDate(date: Date) {
        if (this._dateTimeService.compareTwoDates(new Date(date), new Date(this.leadDashBoradParameter.DateTo))) {
            this.onFromDateChange(date);
            this.dateCorrect = true;
        }
        else {
            this.onFromDateChange(date);
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
            this.dateCorrect = false;

        }
    }

    checkToDate(date: Date) {
        if (!this._dateTimeService.compareTwoDates(new Date(this.leadDashBoradParameter.DateFrom), new Date(date))) {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
            this.onToDateChange(date);
            this.dateCorrect = false;
        }
        else {

            this.onToDateChange(date);
            this.dateCorrect = true;
        }
    }


    onFromDateChange(date: Date) {
        this.leadDashBoradParameter.DateFrom = this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    }

    onToDateChange(date: Date) {
        this.leadDashBoradParameter.DateTo = this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    }

    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
    }


    // #region methods

    getFundamentals() {
        let getDashboardFundamentals = this.getLeadDashboardFundamental();
        let getSourceCountDayWise = this.getEnquirySourceCountDayWise();
        let getActivitiesCount = this.getLeadActivities();
        let getLeadsStatus = this.getLeadsStatus();

        forkJoin([getDashboardFundamentals, getSourceCountDayWise, getActivitiesCount, getLeadsStatus]).subscribe(
            data => {
                
                if (data[0].Result) {
                    this.enquirySourceTypeList = data[0].Result.EnquirySourceTypeList; 
                    let newSourceTypeList = [];
                    /**Remove social media (Twitter, Facebook, Instagram) from list */

                    this.enquirySourceTypeList.forEach( (item) => {
                        if (item.EnquirySourceTypeID !== this.enquirySourceType.Facebook && item.EnquirySourceTypeID !== this.enquirySourceType.Instagram && item.EnquirySourceTypeID !== this.enquirySourceType.Twitter) {
                            newSourceTypeList.push(item);
                        }
                        item.EnquirySourceCount = item.EnquirySourceCount ? item.EnquirySourceCount : 0;
                    });

                    this.enquirySourceTypeList = newSourceTypeList;        
                    this.isLeadActivitiesDataExists = data[0].Result.LeadActivityTypeList != null && data[0].Result.LeadActivityTypeList.length > 0 ? true : false;
                    this.leadActivityTypeList = data[0].Result.LeadActivityTypeList;
                    this.leadStatusTypeFriendlyViewModel = data[0].Result.LeadStatusTypeFriendlyViewModel;
                    this.updateLeadStatusProperty();
                }
                if (data[1].Result) {
                    this.setEnquirySourceCountDayWise(data[1].Result);
                }
                if (data[2].Result) {
                    this.setActiviteisCount(data[2].Result);

                }
                if (data[3].Result) {
                    this.getLeadActivitySummary(data[3].Result);
                }

                this.resetLeadActivitesCount();
                this.getLeadActivitesCountGroupedByActivity();

            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Dashboard")); }
        )
    }

    getLeadDashboardFundamental() {
        return this._httpService.get(LeadApi.getLeadDashBoardFundemental);
    }

    getLeadFlow() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo
        }

        this._httpService.get(LeadApi.getLeadFlow, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isLeadFlowDataExists = response.Result != null && response.Result.length > 0 ? true : false
                        if (this.isLeadFlowDataExists) {
                            this.leadFlowDashboard = response.Result;
                        }
                        else {
                            this.leadFlowDashboard = [];
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Flow")); }
            )

    }

    getOwns() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo
        }

        this._httpService.get(LeadApi.getOwns, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.ownLeads = response.Result;
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Owns Data")); }
            )

    }

    getSaleTourEnquiryStatus() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo,
            statusTypeID: this.leadDashBoradParameter.statusTypeID
        }

        this._httpService.get(LeadApi.getSaleTourEnquiryStatus, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.saleTourEnquiryStatus = response.Result;
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Enquiry Status")); }
            )

    }

    getEnquirySourceCountDayWise() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo
        }

        return this._httpService.get(LeadApi.getSourceDayWise, params);
    }

    getLeadActivities() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo
        }

        return this._httpService.get(LeadApi.getActivities, params);

    }

    getLeadsStatus() {
        let params = {
            fromDate: this.leadDashBoradParameter.DateFrom,
            toDate: this.leadDashBoradParameter.DateTo
        }

        return this._httpService.get(LeadApi.getActivitiesSummary, params);

    }

    getLeadActivitySummary(data: any) {
        this.newLeadsCount = 0;
        this.wonLeadsCount = 0;
        this.lostLeadsCount = 0;
        this.allActiveEnquiriesCount = 0;
        if (data) {
            this.leadActivitySummary = data;            
            this.leadActivitySummary.forEach(laSum => {
                laSum.val = laSum.TotalLead;
                if (laSum.LeadStatusTypeID == this.leadStatusType.Fresh) {
                    this.allActiveEnquiriesCount = laSum.TotalLead;
                }
                if (laSum.LeadStatusTypeID == this.leadStatusType.PerposalMade) {
                    this.newLeadsCount = laSum.TotalLead;
                }
                if (laSum.LeadStatusTypeID == this.leadStatusType.Lost) {
                    this.lostLeadsCount = laSum.TotalLead;
                }
                if (laSum.LeadStatusTypeID == this.leadStatusType.Sale) {
                    this.wonLeadsCount = laSum.TotalLead;
                }

                //   });
            })
        }
        else {
            this.leadActivitySummary = [];
        }
    }

    resetEnquirySourceCount() {
        this.equirySourceTotalCount = 0;
        this.enquirySourceTypeList.forEach(enquirySource => {
            enquirySource.EnquirySourceCount = 0;
        });
    }

    resetLeadActivitesCount() {
        this.leadActivityTypeList.forEach(activityType => {
            activityType.ActivityTypeCount = 0;
        });
    }

    getLeadActivitesCountGroupedByActivity() {
        this.resetLeadActivitesCount();
        if (this.leadActivities.length > 0) {
            this.leadActivityTypeList.forEach(leadActivityType => {
                this.leadActivities.forEach(activity => {
                    
                    switch (leadActivityType.ActivityTypeID) {
                        case this.activityType.Appointment:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.Call:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.SMS:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.Email:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.Note:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.Achievement:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                        case this.activityType.AppNotification:
                            leadActivityType.ActivityTypeCount += activity.ActivityTypeID == leadActivityType.ActivityTypeID ? activity.TotalLead : 0;
                            break;
                    }
                });

            });
        }
    }

    getLeadCountGroupedBySource() {
        this.resetEnquirySourceCount();
        
        this.enquirySourceTypeList.forEach(enquirySource => {
                       
            this.sourceDayWise.forEach(sourceCount => {
                switch (enquirySource.EnquirySourceTypeID) {
                    case this.enquirySourceType.DigitalAdvertising:
                        enquirySource.EnquirySourceCount += sourceCount.DigitalAdvertising ? sourceCount.DigitalAdvertising : 0;
                        break;
                    case this.enquirySourceType.EmailMarketing:
                        enquirySource.EnquirySourceCount += sourceCount.EmailMarketing ? sourceCount.EmailMarketing : 0;
                        break;
                    case this.enquirySourceType.Leaflets:
                        enquirySource.EnquirySourceCount += sourceCount.Leaflets ? sourceCount.Leaflets : 0;
                        break;
                    case this.enquirySourceType.Magazine:
                        enquirySource.EnquirySourceCount += sourceCount.Magazine ? sourceCount.Magazine : 0;
                        break;
                    case this.enquirySourceType.Newspaper:
                        enquirySource.EnquirySourceCount += sourceCount.Newspaper ? sourceCount.Newspaper : 0;
                        break;
                    case this.enquirySourceType.OrganicSearch:
                        enquirySource.EnquirySourceCount += sourceCount.OrganicSearch ? sourceCount.OrganicSearch : 0;
                        break;
                    case this.enquirySourceType.Referral:
                        enquirySource.EnquirySourceCount += sourceCount.Referral ? sourceCount.Referral : 0;
                        break;
                    case this.enquirySourceType.Signage:
                        enquirySource.EnquirySourceCount += sourceCount.Signage ? sourceCount.Signage : 0;
                        break;
                    case this.enquirySourceType.OtherSocialMediaPlatforms:
                        enquirySource.EnquirySourceCount += sourceCount.SocialMedia ? sourceCount.SocialMedia : 0;
                        break;
                    case this.enquirySourceType.WalkIn:
                        enquirySource.EnquirySourceCount += sourceCount.WalkIn ? sourceCount.WalkIn : 0;
                        break;
                    case this.enquirySourceType.Website:
                        enquirySource.EnquirySourceCount += sourceCount.Website ? sourceCount.Website : 0;
                        break;
                    case this.enquirySourceType.Facebook:
                        enquirySource.EnquirySourceCount += sourceCount.Facebook ? sourceCount.Facebook : 0;
                        break;
                    case this.enquirySourceType.Instagram:
                        enquirySource.EnquirySourceCount += sourceCount.Instagram ? sourceCount.Instagram : 0;
                        break;
                    case this.enquirySourceType.Twitter:
                        enquirySource.EnquirySourceCount += sourceCount.Twitter ? sourceCount.Twitter : 0;
                        break;
                    case this.enquirySourceType.WellyxCore:
                        enquirySource.EnquirySourceCount += sourceCount.WellyxCore ? sourceCount.WellyxCore : 0;
                        break;
                    case this.enquirySourceType.WellyxWidget:
                        enquirySource.EnquirySourceCount += sourceCount.WellyxWidget ? sourceCount.WellyxWidget : 0;
                        break;
                    case this.enquirySourceType.WellyxCustomerApp:
                        enquirySource.EnquirySourceCount += sourceCount.WellyxCustomerApp ? sourceCount.WellyxCustomerApp : 0;
                        break;
                }

            });
            this.equirySourceTotalCount += enquirySource.EnquirySourceCount;
        
        })
    }

    leadFlowCustomizeText(arg: any) {
        return "<span style='font-size:28px'>" + arg.item.argument + "</span><br/>";
    }

    leadActivitySummaryCustomizePoint(arg: any) {
        text: arg.LeadStatusType + ' : ' + arg.value;
        var leadStatusType = LeadStatusTypesNew;
        if (leadStatusType) {
            if (arg.data.LeadStatusTypeID == leadStatusType.Enquiry) {
                return { color: "#BDB9F8" };
            }
            if (arg.data.LeadStatusTypeID == leadStatusType.NewLead) {
                return { color: "#BCD556" };
            }
            if (arg.data.LeadStatusTypeID == leadStatusType.Lost) {
                return { color: "#F8CAA6" };
            }
            if (arg.data.LeadStatusTypeID == leadStatusType.Won) {
                return { color: "#BFE1FF" };
            }

        }

    }

    sourceOfLeadTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }

    whoOwnsMostLeadTooltip(arg: any) {
        return {
            // updated by asim mehmood
            // text: arg.point.data.StaffName + ' : ' + arg.value
            text: arg.point.data.StaffName + ' : ' + arg.value + '<br/>' + arg.point.data.Email
        };
    }
    
    SummaryLeadTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }
    bindArgumentNameandValueWithSummaryTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    
    saleTourEnquiryTooltip(arg: any) { 
        return {
        text: arg.seriesName + ' : ' + arg.value
        }      
    }

    leadEnquiryTour: LeadEnquiryTour[] = [
        { value: "1", name: "Enquiry" },
        { value: "Lost", name: "Lost" },
        { value: "Tour", name: "Tour" },
        { value: "Trial", name: "Trial"},
        { value: "Sale", name: "Sale" }
    ];

    updateLeadStatusProperty() {
        this.leadEnquiryTour.forEach(element => {
            if (element.value == this.leadStatusType.Fresh.toString()) {
                element.name = this.leadStatusTypeFriendlyViewModel[0].LeadStatusTypeFriendlyName;
                element.value = this.leadStatusTypeFriendlyViewModel[0].LeadStatusTypeFriendlyName;
            }

        });
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    setActiviteisCount(responseData: any[]) {
        this.leadActivities = responseData;
        this.getLeadActivitesCountGroupedByActivity();
    }

    setEnquirySourceCountDayWise(responseData: any[]) {
        this.sourceDayWise = responseData;
        this.sourceDayWiseFilteredList = responseData;
        this.getLeadCountGroupedBySource();
    }

    leadFlowCustomizePoint(arg: any) {
        
        var leadStatusType = LeadFlowStatusTypes;
        if (arg.data.LeadStatusTypeID == leadStatusType.Enquiry) {
            return { color: "#BCD556" }; ///Enquiry
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.NewLead) {
            return { color: "#F8CAA6" };
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.Lost) {
            return { color: "#E97C82" };
        } 
        if (arg.data.LeadStatusTypeID == leadStatusType.Won) {
            return { color: "#BFE1FF" };
        }       
        if (arg.data.LeadStatusTypeID == leadStatusType.FinalMeeting) {
            return { color: "#F6A261" };
        }
        
    }

    leadFlowCustomizeColors(arg: any) {
        
        var leadStatusType = LeadStatusTypesNew;

        if (arg.data.LeadStatusTypeID == leadStatusType.Enquiry) {
            return { color: "#BCD556" }; ///Enquiry
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.NewLead) {
            return { color: "#0FA8CF" };
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.MeetingArranged) {
            return { color: "#F8CAA6" };
        } 
        if (arg.data.LeadStatusTypeID == leadStatusType.PerposalSend ) {
            return { color: "#F96E03" };
        }       
        if (arg.data.LeadStatusTypeID == leadStatusType.FinalMeeting) {
            return { color: "#607D8B" };
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.Lost) {
            return { color: "#E97C82" };
        }
        if (arg.data.LeadStatusTypeID == leadStatusType.Won) {
            return { color: "#BFE1FF" };
        }
        
    }

    leadFlowCustomizePointTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    onStatusTypeChange(statusTypeID: number) {
        this.leadDashBoradParameter.statusTypeID = statusTypeID;
        this.getSaleTourEnquiryStatus();
      }

    // #endregion
}
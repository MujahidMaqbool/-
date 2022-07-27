// #region Imports

/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { SubscriptionLike as ISubscription } from 'rxjs';

/** Models*/
import { ServiceClient } from 'src/app/scheduler/models/service.model';
import { ActivityViewModel, CellSelectedData, LeadCallLaterActivity, MemberCallLaterActivity } from 'src/app/scheduler/models/scheduler.model';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';

/** App Messages, Configurations & Constants */
import { Configurations } from 'src/app/helper/config/app.config';
import { CustomerType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerApi, MemberActivityApi, LeadActivityApi, ClientActivityApi } from 'src/app/helper/config/app.webapi';
import { debounceTime } from 'rxjs/internal/operators';
import { DatePipe } from '@angular/common';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';

// #endregion

@Component({
    selector: 'save-scheduler-call',
    templateUrl: './save.call.component.html'
})

export class SaveSchedulerCallComponent extends AbstractGenericComponent implements OnChanges {

    // #region Local Members
    dayViewFormat: string = "";
    isShowScheduler: boolean = false;

    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;

    @ViewChild('schedulerCallFormData') schedulerCallFormData: NgForm;
    @Output() onUpdateSchedulerCallActivity = new EventEmitter<ActivityViewModel>();
    @Input() callActivityComponentCalled: boolean = false;
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() _cellDataSelection: CellSelectedData;

    /**Scope Variables */
    currentDate: Date;
    selectedStaffID: number = 0;
    isPersonMember: boolean = false;
    isShowError: boolean = false;
    isClientReadonly: boolean = false;
    isChangeStartDateEvent: boolean = true;

    /**Models & Lists */
    searchClientControl: FormControl = new FormControl();
    selectedClient: ServiceClient = new ServiceClient();
    callActivityViewModel: ActivityViewModel = new ActivityViewModel();
    leadCallLaterActivity: LeadCallLaterActivity
    memberCallLaterActivity: MemberCallLaterActivity
    staffList: any[] = [];
    memberContactReasonTypeList: any[] = [];
    clientList: ServiceClient[] = [];

    /** Angular library */
    staffDetailSubscription: ISubscription;

    /** Constants, Configurations & Messages */
    messages = Messages;
    dateFormat = Configurations.DateFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;

    isSaveButtonDisabled: boolean = false;
    // #endregion

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _dataSharingService : DataSharingService
    ) {
        super();    //implicit call for constructor
        this.isSaveButtonDisabled = false;
    }

    // #region Events

    ngOnChanges(changes: SimpleChanges): void {
        this.currentDate = new Date(this._cellDataSelection.startDate);
        if (changes.callActivityComponentCalled && changes.callActivityComponentCalled.currentValue) {
            this.getBranchDatePattern();
            this.getSearchClient();
            this.getFundamentals();
        }
    }

    onCloseSchedulerCallPopup() {
        this.onCancel.emit(true);
    }

    onSelectDate_valueChanged(startDate) {

        startDate = new Date(startDate);

        this.currentDate = startDate;

        let followupStartDateTime = new Date(this.callActivityViewModel.FollowUpStartTime),
        followupEndDateTime = new Date(this.callActivityViewModel.FollowUpEndTime);
        this.callActivityViewModel.FollowUpDate = startDate;

        setTimeout(function(){ 
            //set hours, time and second 0,0,0
            var _selectedDate = startDate;

            _selectedDate = new Date(_selectedDate.setHours(0,0,0));
            this.callActivityViewModel.FollowUpStartTime = new Date(_selectedDate.setHours(followupStartDateTime.getHours(), followupStartDateTime.getMinutes()));

            _selectedDate = new Date(_selectedDate.setHours(0,0,0));
            this.callActivityViewModel.FollowUpEndTime = new Date(_selectedDate.setHours(followupEndDateTime.getHours(), followupEndDateTime.getMinutes()));
         }, 100);
         
    }

    //for staff data chnage on one day scheduler
    onStaffChange(staffID){
        if(this.onedaySchedulerComp){
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.isShowScheduler = true;
    }

    getFundamentals() {
        this._httpService.get(SchedulerApi.getCallAppoinmentFundamental)
            .subscribe(data => {
                if (data && data.Result) {
                    this.memberContactReasonTypeList = data.Result.MemberContactReasonTypeList;
                    this.staffList = data.Result.StaffList && data.Result.StaffList.length > 0 ? data.Result.StaffList : [];
                    this.selectedStaffID = this.staffList && this.staffList.length > 0 ? this.staffList[0].StaffID : 0;
                    this.getDateOnPageLoad();

                }
                else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
            );
    }

    getSearchClient() {
        this.searchClientControl.valueChanges.pipe(debounceTime(400)).subscribe(value => {
            if (value != "" && value != null) {
                if (value.length > 2) {
                    this.getClientDetails(value);
                }
            }
            else {
                this.clearClient();
            }
        });
    }

    getClientDetails(searchText: any) {
        if (searchText && searchText != "" && typeof (searchText) === "string") {
            let url = SchedulerApi.getAllCustomer
            .replace("{request}", searchText)
            .replace("{customerTypeID}", "0")
            .replace("{skipWalkedIn}", "false")
            .replace("{isPOSSearch}", "True");

            this._httpService.get(url)
                .subscribe(response => {
                    if (response.Result != null && response.Result.length) {
                        this.clientList = response.Result;
                        this.clientList.forEach(client => {
                            client.FullName = client.FirstName + " " + client.LastName;
                        });
                        /** For getByID set Selected Client Control Value */
                        if (this._cellDataSelection.CustomerID) {
                            this.selectedClient = this.clientList.filter(c => c.CustomerID === this._cellDataSelection.CustomerID)[0]
                        }
                    }
                    else {
                        this.clientList = [];
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                });
        }
    }

    clearClient() {
        this.clientList = [];
        this.selectedClient = null;
        this.isClientReadonly = false;
        if (this.searchClientControl.value) {
            this.searchClientControl.setValue('');
        }
    }

    getSelectedClient(client: ServiceClient) {
        this.selectedClient = client;
        this.isClientReadonly = true;
        this.isPersonMember = false;
    }

    showSearchClient() {
        this.clearClient();
    }

    displayClientName(user?: ServiceClient): string | undefined {
        return user ? user.FullName : undefined;
    }

    displayClientEmail(val?: ServiceClient): string | undefined {
        return val ? val.Email : undefined;
    }

    displayClientPhone(val?: ServiceClient): string | undefined {
        return val ? val.Mobile : undefined;
    }

    startDateChangeEvent($event) {

        if ($event.value || this.isChangeStartDateEvent) {
            if ($event.previousValue) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue), this.getTimeFromDate(new Date(this.callActivityViewModel.FollowUpEndTime)));
                /** if user clear date box then, get date from user selection Date. */
                if ($event.value) {
                    this.callActivityViewModel.FollowUpEndTime = this._dateTimeService.setTimeInterval(new Date($event.value), getTimeDifference);
                }
            }

            if (this.callActivityViewModel.FollowUpStartTime) {  // if user clear start date field

                new Date(new Date(this.callActivityViewModel.FollowUpStartTime).setDate(new Date(this.callActivityViewModel.FollowUpDate).getDate()));
                new Date(new Date(this.callActivityViewModel.FollowUpStartTime).setMonth(new Date(this.callActivityViewModel.FollowUpDate).getMonth()));
                new Date(new Date(this.callActivityViewModel.FollowUpStartTime).setFullYear(new Date(this.callActivityViewModel.FollowUpDate).getFullYear()));
            }
        }
    }

    endDateChangeEvent($event) {
        if ($event.value) {
            new Date(new Date(this.callActivityViewModel.FollowUpEndTime).setDate(new Date(this.callActivityViewModel.FollowUpDate).getDate()));
            new Date(new Date(this.callActivityViewModel.FollowUpEndTime).setMonth(new Date(this.callActivityViewModel.FollowUpDate).getMonth()));
            new Date(new Date(this.callActivityViewModel.FollowUpEndTime).setFullYear(new Date(this.callActivityViewModel.FollowUpDate).getFullYear()));
        }
    }

    getDateOnPageLoad() {
        if (this._cellDataSelection.id > 0) {
            this.isChangeStartDateEvent = false;
            this.getCallByID(this._cellDataSelection.CustomerTypeID, this._cellDataSelection.CustomerID, this._cellDataSelection.id);
            this.isClientReadonly = true; // on update service, client will be readonly mode
        }
        else {
            this.isChangeStartDateEvent = true;
            this.setDefaultValuesToViewModel();
            // this.onedaySchedulerComp.staffID = this.callActivityViewModel.AssignedToStaffID;
            // this.onedaySchedulerComp.getCustomSchedulerData();
        }
    }

    getCallByID(customerTypeId: number, customerId: number, customerActivityId: number) {
        switch (customerTypeId) {
            case CustomerType.Client:
                // get lead activity
                this.getCallClientByID(customerId, customerActivityId);
                break;
            case CustomerType.Lead:
                // get lead activity
                this.getCallLeadByID(customerId, customerActivityId);
                break;
            case CustomerType.Member:
                // get member activity
                this.getCallMemberByID(customerId, customerActivityId);
                break;
        }
    }

    getCallClientByID(customerId: number, customerActivityId: number) {
        let url = ClientActivityApi.getCallLaterById.replace("{clientActivityID}", customerActivityId.toString()).replace("{clientID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfterGetCall(data);
                    this.setSelectedClient();
                }else{
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
            );
    }

    getCallMemberByID(customerId: number, customerActivityId: number) {
        let url = MemberActivityApi.getCallLaterById.replace("{memberActivityID}", customerActivityId.toString()).replace("{memberID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfterGetCall(data);
                    this.setSelectedClient();
                }else{
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
            );
    }

    getCallLeadByID(customerId: number, customerActivityId: number) {
        let url = LeadActivityApi.getCallLaterById.replace("{activityID}", customerActivityId.toString()).replace("{ownerID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfterGetCall(data);
                    this.setSelectedClient();
                }
                else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
            );
    }

    mapModelToViewModelAfterGetCall(data) {
        this.callActivityViewModel = data.Result;
        this.callActivityViewModel.CustomerActivityID = data.Result.CustomerActivityID;
        this.callActivityViewModel.CustomerID = data.Result.CustomerID;       

        //for multi time zone issue using this method
        this.callActivityViewModel.FollowUpDate = this._dateTimeService.convertStringIntoDateForScheduler(this.callActivityViewModel.FollowUpDate.toString());
        
        let startDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpStartTime, this.callActivityViewModel.FollowUpDate),
            endDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpEndTime, this.callActivityViewModel.FollowUpDate);
        this.callActivityViewModel.FollowUpStartTime = startDateTime;
        this.callActivityViewModel.FollowUpEndTime = endDateTime;
    }

    saveSchedulerCall(valid: boolean) {
        this.isSaveButtonDisabled = true;
        let startTime = this.getTimeStringFromDate(this.callActivityViewModel.FollowUpStartTime, Configurations.SchedulerTimeFormat);
        let EndTime = this.getTimeStringFromDate(this.callActivityViewModel.FollowUpEndTime, Configurations.SchedulerTimeFormat);
        this.isShowError = false;
        if (this.selectedClient && this.selectedClient.CustomerID) {
            if (valid) {
                if (this.callActivityViewModel.FollowUpStartTime && this.callActivityViewModel.FollowUpEndTime) {
                    if (startTime < EndTime) {
                        let copyCallActivityViewModel = JSON.parse(JSON.stringify(this.callActivityViewModel));
                        copyCallActivityViewModel.FollowUpDate = this._dateTimeService.convertDateObjToString(copyCallActivityViewModel.FollowUpDate, this.dateFormat);
                        copyCallActivityViewModel.FollowUpStartTime = this._dateTimeService.convertDateToTimeString(new Date(copyCallActivityViewModel.FollowUpStartTime));
                        copyCallActivityViewModel.FollowUpEndTime = this._dateTimeService.convertDateToTimeString(new Date(copyCallActivityViewModel.FollowUpEndTime));
                        copyCallActivityViewModel.CustomerTypeID = this.selectedClient.CustomerTypeID;
                        copyCallActivityViewModel.CustomerID = this.selectedClient.CustomerID;
                        copyCallActivityViewModel.CustomerActivityID = this._cellDataSelection.id;   // get for add/update
                        this.onUpdateSchedulerCallActivity.emit(copyCallActivityViewModel);
                    }
                    else {
                        this.isShowError = true;
                        this.isSaveButtonDisabled = false;
                        this.dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
                    }
                }
                else {
                    this.isShowError = true;
                    this.isSaveButtonDisabled = false;
                    this.dateTimeCompareError = Messages.Validation.Info_Required;
                }
            } else{
                this.isSaveButtonDisabled = false;
            }
        }
        else {
            this.isSaveButtonDisabled = false;
            this.searchClientControl.setValue('');
        }
    }
    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, timeFormat);
    }
    setDefaultValuesToViewModel() {
        this.callActivityViewModel = new ActivityViewModel();
        this.callActivityViewModel.CustomerActivityID = 0;
        this.callActivityViewModel.CustomerID = 0;
        this.callActivityViewModel.CustomerTypeID = 0;
        this.callActivityViewModel.Title = "";
        this.callActivityViewModel.AssignedToStaffID = this._cellDataSelection.StaffID == 0 ? this.selectedStaffID : this._cellDataSelection.StaffID;
        this.callActivityViewModel.FollowUpDate = this._cellDataSelection.startDate;
        this.callActivityViewModel.FollowUpStartTime = this._cellDataSelection.startDate;
        this.callActivityViewModel.FollowUpEndTime = this._cellDataSelection.endDate;
        this.callActivityViewModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
        this.callActivityViewModel.Description = "";
    }

    setSelectedClient() {
        /** set value to control on backend & set on front-end with selectedClient 
          * Also Trigger the getSearchClient 
         */
        this.searchClientControl.setValue(this._cellDataSelection.CustomerName);
    }

    setFormAsDirty() {
        super.markFormAsDirty(this.schedulerCallFormData);
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

    // #endregion
}
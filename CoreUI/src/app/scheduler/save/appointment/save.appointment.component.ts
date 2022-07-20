// #region Imports

/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { SubscriptionLike as ISubscription } from 'rxjs';

/** Models*/
import { ServiceClient } from 'src/app/scheduler/models/service.model';
import { ActivityViewModel, LeadAppointmentLaterActivity, MemberAppointmentLaterActivity, CellSelectedData } from 'src/app/scheduler/models/scheduler.model';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/** App Messages & Constants */
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
    selector: 'save-scheduler-appointment',
    templateUrl: './save.appointment.component.html'
})

export class SaveSchedulerAppointmentComponent extends AbstractGenericComponent implements OnChanges {

    /** Input & output Decorators */
    @ViewChild('schedulerAppointmentFormData') schedulerAppointmentFormData: NgForm;
    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;
    
    @Output() onUpdateSchedulerAppointmentActivity = new EventEmitter<ActivityViewModel>();
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() appointmentActivityComponentCalled: boolean = false;
    @Input() _cellDataSelection: CellSelectedData;

    /**Scope Variables */
    currentDate: Date;
    selectedStaffID: number = 0;
    isClientReadonly: boolean = false;
    isChangeStartDateEvent: boolean = true;
    isInvalidFollowupDate: boolean = false;
    isShowScheduler: boolean = false;

    /**Models */
    searchClientControl: FormControl = new FormControl();
    selectedClient: ServiceClient = new ServiceClient();
    appointmentActivityViewModel: ActivityViewModel = new ActivityViewModel();
    leadCallLaterActivity: LeadAppointmentLaterActivity
    memberCallLaterActivity: MemberAppointmentLaterActivity

    isPersonMember: boolean = false;
    isPersonLead: boolean = false;

    /** Lists */
    staffList: any[] = [];
    memberContactReasonTypeList: any[] = [];
    clientList: ServiceClient[] = [];

    /** Angular library */
    staffDetailSubscription: ISubscription;

    /** Configuration, Constants & Messages */
    messages = Messages;
    dateFormat = Configurations.DateFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    dateTimeCompareError : any;
    isShowError: boolean = false;
    dayViewFormat: string = "";
    isSaveButtonDisabled: boolean = false;

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _messageService: MessageService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService       
    ) {
        super();    //implicit call for constructor
        this.isSaveButtonDisabled = false;
        this.getBranchDatePattern();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.currentDate = new Date(this._cellDataSelection.startDate);
        if (changes.appointmentActivityComponentCalled && changes.appointmentActivityComponentCalled.currentValue) {
            this.getSearchClient();
            this._httpService.get(SchedulerApi.getCallAppoinmentFundamental)
                .subscribe(data => {
                    if (data && data.Result) {
                        this.memberContactReasonTypeList = data.Result.MemberContactReasonTypeList;
                        this.staffList = data.Result.StaffList && data.Result.StaffList.length > 0 ? data.Result.StaffList : [];                        
                        this.selectedStaffID = this.staffList && this.staffList.length > 0 ? this.staffList[0].StaffID : 0;
                        this.getDateOnPageLoad();
                    }else{
                        this._messageService.showErrorMessage(data.MessageText)
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
                );
        }
    }

    // #region Events

    startDateChangeEvent($event) {
        if ($event.value || this.isChangeStartDateEvent) {
            if ($event.previousValue) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue), this.getTimeFromDate(new Date(this.appointmentActivityViewModel.FollowUpEndTime)));
                /** if user clear date box then, get date from user selection Date. */
                if ($event.value) {
                    this.appointmentActivityViewModel.FollowUpEndTime = this._dateTimeService.setTimeInterval(new Date($event.value), getTimeDifference);
                }
            }
            if (this.appointmentActivityViewModel.FollowUpStartTime) {  // if user clear start date field

                new Date(new Date(this.appointmentActivityViewModel.FollowUpStartTime).setDate(new Date(this.appointmentActivityViewModel.FollowUpDate).getDate()));
                new Date(new Date(this.appointmentActivityViewModel.FollowUpStartTime).setMonth(new Date(this.appointmentActivityViewModel.FollowUpDate).getMonth()));
                new Date(new Date(this.appointmentActivityViewModel.FollowUpStartTime).setFullYear(new Date(this.appointmentActivityViewModel.FollowUpDate).getFullYear()));
            }
        }
    }

    endDateChangeEvent($event) {
        if ($event.value) {
            new Date(new Date(this.appointmentActivityViewModel.FollowUpEndTime).setDate(new Date(this.appointmentActivityViewModel.FollowUpDate).getDate()));
            new Date(new Date(this.appointmentActivityViewModel.FollowUpEndTime).setMonth(new Date(this.appointmentActivityViewModel.FollowUpDate).getMonth()));
            new Date(new Date(this.appointmentActivityViewModel.FollowUpEndTime).setFullYear(new Date(this.appointmentActivityViewModel.FollowUpDate).getFullYear()));
        }
    }

    onCloseSchedulerAppointmentPopup() {
        this.onCancel.emit(true);
    }

    //for staff data chnage on one day scheduler
    onStaffChange(staffID){
        if(this.onedaySchedulerComp){
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

    onSelectDate_valueChanged(startDate: Date) {

        startDate = new Date(startDate);

        this.currentDate = startDate;

         let today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            this.isInvalidFollowupDate = true;
        }
        else {
            this.isInvalidFollowupDate = false;
        }

        let followupStartDateTime = new Date(this.appointmentActivityViewModel.FollowUpStartTime),
            followupEndDateTime = new Date(this.appointmentActivityViewModel.FollowUpEndTime);

        this.appointmentActivityViewModel.FollowUpDate = startDate;

        //set hours, time and second 0,0,0
        var _selectedDate = startDate;
        _selectedDate = new Date(_selectedDate.setHours(0,0,0));

        this.appointmentActivityViewModel.FollowUpStartTime = new Date(_selectedDate.setHours(followupStartDateTime.getHours(), followupStartDateTime.getMinutes()));
        this.appointmentActivityViewModel.FollowUpEndTime = new Date(_selectedDate.setHours(followupEndDateTime.getHours(), followupEndDateTime.getMinutes()));
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.isShowScheduler = true;
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
            .replace("{isPOSSearch}", "True");;
            this._httpService.get(url)
                .subscribe(response => {
                    if (response.Result != null && response.Result.length) {
                        this.clientList = response.Result;
                        this.clientList.forEach(client => {
                            client.FullName = client.FirstName + " " + client.LastName;
                        });
                        /** For getByID set Selected Client Control Value */
                        if (this._cellDataSelection.CustomerID) {
                            this.selectedClient = this.clientList.filter(c => c.CustomerID === this._cellDataSelection.CustomerID)[0];
                        }
                    }
                    else {
                        this.clientList = [];
                        this._messageService.showErrorMessage(response.MessageText)
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

    getDateOnPageLoad() {
        if (this._cellDataSelection.id > 0) {
            this.isChangeStartDateEvent = false;
            this.getAppointmentByID(this._cellDataSelection.CustomerTypeID, this._cellDataSelection.CustomerID, this._cellDataSelection.id);
            this.isClientReadonly = true; // on update service, client will be readonly mode
        }
        else {
            this.isChangeStartDateEvent = true;
            this.setDefaultValuesToViewModel();
            this.onedaySchedulerComp.staffID = this.appointmentActivityViewModel.AssignedToStaffID;
            this.onedaySchedulerComp.getCustomSchedulerData();
        }
    }

    getAppointmentByID(customerTypeId: number, customerId: number, customerActivtityId: number) {
        switch (customerTypeId) {
            case CustomerType.Client:
                // get lead activity
                this.getAppointmentClientByID(customerId, customerActivtityId);
                break;
            case CustomerType.Lead:
                // get lead activity
                this.getAppointmentLeadByID(customerId, customerActivtityId);
                break;
            case CustomerType.Member:
                // get member activity
                this.getAppointmentMemberByID(customerId, customerActivtityId);
                break;
        }
    }

    getAppointmentClientByID(customerId: number, customerActivityId: number) {
        let url = ClientActivityApi.getAppointmentLaterById.replace("{clientActivityID}", customerActivityId.toString()).replace("{clientID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfter_GetAppointment(data);                   
                    this.setSelectedClient();
                }else{
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
            );
    }

    getAppointmentMemberByID(customerId: number, customerActivityId: number) {
        let url = MemberActivityApi.getAppointmentLaterById.replace("{memberActivityID}", customerActivityId.toString()).replace("{memberID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfter_GetAppointment(data);                    
                    this.setSelectedClient();
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
            );
    }

    getAppointmentLeadByID(customerId: number, customerActivityId: number) {
        let url = LeadActivityApi.getAppointmentLaterById.replace("{activityID}", customerActivityId.toString()).replace("{ownerID}", customerId.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapModelToViewModelAfter_GetAppointment(data);
                    this.setSelectedClient();
                }else{
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
            );
    }

    mapModelToViewModelAfter_GetAppointment(data) {
        this.appointmentActivityViewModel = data.Result;
        this.appointmentActivityViewModel.CustomerActivityID = data.Result.CustomerActivityID;
        this.appointmentActivityViewModel.CustomerID = data.Result.CustomerID;        

        //for multi time zone issue using this method
        this.appointmentActivityViewModel.FollowUpDate = this._dateTimeService.convertStringIntoDateForScheduler(this.appointmentActivityViewModel.FollowUpDate.toString());

        let startDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpStartTime, new Date(this.appointmentActivityViewModel.FollowUpDate)),
            endDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpEndTime, new Date(this.appointmentActivityViewModel.FollowUpDate));
        this.appointmentActivityViewModel.FollowUpStartTime = startDateTime;
        this.appointmentActivityViewModel.FollowUpEndTime = endDateTime;
    }

    saveSchedulerAppointment(valid: boolean) {
        this.isShowError = false;
        this.isSaveButtonDisabled = true;
        if (this.selectedClient && this.selectedClient.CustomerID) {
            if (valid) {
                if (this.validateDates()) {
                    let copyAppointmentActivityViewModel = JSON.parse(JSON.stringify(this.appointmentActivityViewModel));
                    let copySelectedClient = JSON.parse(JSON.stringify(this.selectedClient));
                    copyAppointmentActivityViewModel.FollowUpDate = this._dateTimeService.convertDateObjToString(copyAppointmentActivityViewModel.FollowUpDate, this.dateFormat);
                    copyAppointmentActivityViewModel.FollowUpStartTime = this._dateTimeService.convertDateToTimeString(new Date(copyAppointmentActivityViewModel.FollowUpStartTime));
                    copyAppointmentActivityViewModel.FollowUpEndTime = this._dateTimeService.convertDateToTimeString(new Date(copyAppointmentActivityViewModel.FollowUpEndTime));
                    copyAppointmentActivityViewModel.CustomerTypeID = copySelectedClient.CustomerTypeID;
                    copyAppointmentActivityViewModel.CustomerID = copySelectedClient.CustomerID;
                    copyAppointmentActivityViewModel.CustomerActivityID = this._cellDataSelection.id;   // get for add/update
                    this.onUpdateSchedulerAppointmentActivity.emit(copyAppointmentActivityViewModel);
                    //this.onCloseSchedulerAppointmentPopup();
                } else{
                    this.isSaveButtonDisabled = false;
                }
            } else{
                this.isSaveButtonDisabled = false;
            }
        } else {
            this.isSaveButtonDisabled = false;
            this.searchClientControl.setValue('');
        }
    }

    validateDates() {
        let startTime = this.getTimeStringFromDate(this.appointmentActivityViewModel.FollowUpStartTime, Configurations.SchedulerTimeFormat);
        let EndTime = this.getTimeStringFromDate(this.appointmentActivityViewModel.FollowUpEndTime, Configurations.SchedulerTimeFormat);
        let isValid = true;
        if (!this.appointmentActivityViewModel.FollowUpStartTime || this.appointmentActivityViewModel.FollowUpStartTime == null && !this.appointmentActivityViewModel.FollowUpEndTime || this.appointmentActivityViewModel.FollowUpEndTime == null ) {
            this.isShowError = true;
            isValid = false;
            this.dateTimeCompareError = Messages.Validation.Info_Required;
            return isValid;
        }
        if (startTime < EndTime) {
            this.isShowError = false;
        }
        else {
            this.isShowError = true;
            isValid = false;
            this.dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
        }

        return isValid;
    }

    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, timeFormat);
    }


    setDefaultValuesToViewModel() {

        this.appointmentActivityViewModel = new ActivityViewModel();
        this.appointmentActivityViewModel.CustomerActivityID = 0;
        this.appointmentActivityViewModel.CustomerID = 0;
        this.appointmentActivityViewModel.CustomerTypeID = 0;
        this.appointmentActivityViewModel.Title = "";
        this.appointmentActivityViewModel.AssignedToStaffID = this._cellDataSelection.StaffID == 0 ? this.selectedStaffID : this._cellDataSelection.StaffID;
        this.appointmentActivityViewModel.ContactReasonTypeID = 1;    // for Member only
        this.appointmentActivityViewModel.FollowUpDate = this._cellDataSelection.startDate;
        this.appointmentActivityViewModel.FollowUpStartTime = this._cellDataSelection.startDate;
        this.appointmentActivityViewModel.FollowUpEndTime = this._cellDataSelection.endDate;
        this.appointmentActivityViewModel.Description = "";
    }

    setSelectedClient() {

        /** set value to control on backend & set on front-end with selectedClient 
         * Also Trigger the getSearchClient 
        */
        this.searchClientControl.setValue(this._cellDataSelection.CustomerName);
    }

    setFormAsDirty() {
        super.markFormAsDirty(this.schedulerAppointmentFormData);
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

}
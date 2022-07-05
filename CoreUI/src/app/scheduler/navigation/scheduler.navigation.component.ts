import { Component, Output, EventEmitter, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { CellSelectedData } from "@scheduler/models/scheduler.model";
import { SchedulerOptions } from "@helper/config/app.config";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Scheduler } from "@app/helper/config/app.module.page.enums";
import { enmSchedulerActvityType } from "@app/helper/config/app.enums";
import { AttendeeComponent } from "@app/attendee/save-search/attendee.component";

@Component({
    selector: 'scheduler-navigation',
    templateUrl: './scheduler.navigation.component.html'
})

export class SchedulerNavigationComponent implements OnInit {

    // #region Local Members

    @Output() SaveActivity = new EventEmitter<any>();
    @Output() ReloadScheduler = new EventEmitter<boolean>();
    @Output() onClosePopup = new EventEmitter<boolean>();
    @Output() attendeActive = new EventEmitter<boolean>();
    @ViewChild('attendeeRef') attendeeRef: AttendeeComponent;

    activeTab: string;
    activityType: string;
    activityTypeID: number;
    selectedTabIndex: number = 0;
    showAllTab: boolean = false;
    showAttendee: boolean = false;

    classComponentCalled: boolean = false;
    serviceComponentCalled: boolean = false;
    blockTimeComponentCalled: boolean = false;
    callActivityComponentCalled: boolean = false;
    appointmentActivityComponentCalled: boolean = false;
    taskActivityComponentCalled: boolean = false;
    shiftActivityComponentCalled: boolean = false;
    onAttendeTab: boolean = false;

    isSaveClassAllowed: boolean = false;
    isSaveServiceAllowed: boolean = false;
    isSaveBlockTimeAllowed: boolean = false;
    isSaveCallAllowed: boolean = false;
    isSaveAppointmentAllowed: boolean = false;
    isSaveTaskAllowed: boolean = false;
    schedulerActvityType = enmSchedulerActvityType;
    isRescheduleService: boolean;
    // #endregion

    constructor(
        private _authService: AuthService,
        private dialogRef: MatDialogRef<SchedulerNavigationComponent>,
        @Inject(MAT_DIALOG_DATA) public _cellDataSelection: CellSelectedData) { }

    ngOnInit() {
        
        this.setPermissions();

        if (this._cellDataSelection.ActivityType) {
            this.activityTypeID = this._cellDataSelection.ActivityTypeID;            
            this.activeTab = this._cellDataSelection.ActivityType; /** default from selection data */
            this.showAttendee = true;
            this.isRescheduleService = this._cellDataSelection.isRescheduleService;
        }
        else {
            this._cellDataSelection.id = 0;
            this.showAllTab = true;
            this.setDefaultActiveTab();
            this.showAttendee = false;
        }
        this.alertComponentToGetFundamentals();
    }

    // #region Events

    onTabChange(event: any) {
        this.activeTab = event.tab.textLabel.replace(/\s/g, "");
        //this.activityTypeID = event.index + 1;
        this.setTabIndex();
        this.alertComponentToGetFundamentals();
        if (event.tab.textLabel == "Attendee") {
            this.onAttendeTab = true;
            //   this.attendeeRef.onTabChange();
        }
    }

    onUpdateControl(model: any) {
        this.SaveActivity.emit(model);
    }

    onReloadScheduler(isReload: boolean) {
        this.ReloadScheduler.emit(isReload);
    }


    onAttendeControl(attendeActive: boolean) {
        this.attendeActive.emit(attendeActive);
    }

    // #endregion

    // #region Methods

    setDefaultActiveTab() {
        if (this.isSaveClassAllowed) {
            this.activityTypeID = this.schedulerActvityType.class;
            this.activeTab = SchedulerOptions.SchedulerActivityType.Class;
            return;
        }
        else if (this.isSaveServiceAllowed) {
            this.activityTypeID = this.schedulerActvityType.service;
            this.activeTab = SchedulerOptions.SchedulerActivityType.Service;
            return;
        }
        else if (this.isSaveBlockTimeAllowed) {
            this.activityTypeID = this.schedulerActvityType.blockTime;
            this.activeTab = SchedulerOptions.SchedulerActivityType.BlockTime;
            return;
        }
        else if (this.isSaveCallAllowed) {
            this.activityTypeID = this.schedulerActvityType.call;
            this.activeTab = SchedulerOptions.SchedulerActivityType.Call;
            return;
        }
        else if (this.isSaveAppointmentAllowed) {
            this.activityTypeID = this.schedulerActvityType.appointment;
            this.activeTab = SchedulerOptions.SchedulerActivityType.Appointment;
            return;
        }
        else if (this.isSaveTaskAllowed) {
            this.activityTypeID = this.schedulerActvityType.task;
            this.activeTab = SchedulerOptions.SchedulerActivityType.Task;
            return;
        }
    }

    alertComponentToGetFundamentals() {
        // firstly false all, then true only one
        this.setAllComponentCalledFalse();

        switch (this.activeTab) {
            case SchedulerOptions.SchedulerActivityType.Class:
                this.classComponentCalled = true;
                break;
            case SchedulerOptions.SchedulerActivityType.Service:
                this.serviceComponentCalled = true;
                break;
            case SchedulerOptions.SchedulerActivityType.BlockTime:
                this.blockTimeComponentCalled = true;
                break;
            case SchedulerOptions.SchedulerActivityType.Call:
                this.callActivityComponentCalled = true;
                break;
            case SchedulerOptions.SchedulerActivityType.Appointment:
                this.appointmentActivityComponentCalled = true;
                break;
            case SchedulerOptions.SchedulerActivityType.Task:
                this.taskActivityComponentCalled = true;
                break;

        }
    }

    setTabIndex() {

        switch (this.activeTab) {

            case SchedulerOptions.SchedulerActivityType.Class:
                this.activityTypeID = this.schedulerActvityType.class;
                break;
            case SchedulerOptions.SchedulerActivityType.Service:
                this.activityTypeID = this.schedulerActvityType.service;
                break;
            case SchedulerOptions.SchedulerActivityType.BlockTime:
                this.activityTypeID = this.schedulerActvityType.blockTime;
                break;
            case SchedulerOptions.SchedulerActivityType.Call:
                this.activityTypeID = this.schedulerActvityType.call;
                break;
            case SchedulerOptions.SchedulerActivityType.Appointment:
                this.activityTypeID = this.schedulerActvityType.appointment;
                break;
            case SchedulerOptions.SchedulerActivityType.Task:
                this.activityTypeID = this.schedulerActvityType.task;
                break;
        }
    }

    setAllComponentCalledFalse() {
        this.classComponentCalled = false;
        this.serviceComponentCalled = false;
        this.blockTimeComponentCalled = false;
        this.callActivityComponentCalled = false;
        this.appointmentActivityComponentCalled = false;
        this.taskActivityComponentCalled = false;
        this.shiftActivityComponentCalled = false;
    }

    setPermissions() {
        this.isSaveClassAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Class);
        this.isSaveServiceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Service);
        this.isSaveBlockTimeAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.BlockTime);
        this.isSaveCallAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Call);
        this.isSaveAppointmentAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Appointment);
        this.isSaveTaskAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Task);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    // #endregion
}
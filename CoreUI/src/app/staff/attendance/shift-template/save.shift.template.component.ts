/********************** Angular References *********************/
import { Component, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/********************** START: Service & Models *********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@services/date.time.service';

/* Models */
import { ShiftTemplate } from '@staff/models/shift.template.model';

/********************** START: Common *********************/
import { Configurations } from '@helper/config/app.config'
import { Messages } from '@app/helper/config/app.messages';
import { ShiftTemplateApi } from '@app/helper/config/app.webapi';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';


@Component({
    selector: 'save-shift-template',
    templateUrl: './save.shift.template.component.html',
})

export class SaveShiftTemplateComponent extends AbstractGenericComponent {

    @ViewChild('shiftTemplateForm') shiftTemplateForm: NgForm;

    @Output()
    shiftTemplateSaved = new EventEmitter<boolean>();

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    pageTitle: string = "Shift Template";

    /* Configurations */
    dateFormat = Configurations.DateFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    timeFormat = Configurations.TimeFormat;

    /* Models Refences */

    /* Local Members */
    isStartimeValid: boolean = true;
    isEndTimeValid: boolean = true;
    staffPositionList: any[];
    schedulerStartTime: Date = new Date();
    schedulerEndTime: Date = new Date();

    constructor(
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dialogRef: MatDialogRef<SaveShiftTemplateComponent>,
        @Inject(MAT_DIALOG_DATA) public shiftTemplate: ShiftTemplate
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.getFundamentals();
        this.schedulerStartTime.setMinutes(0);
        this.schedulerEndTime.setMinutes(this.schedulerStartTime.getMinutes() + 30);

        if (this.shiftTemplate.ShiftTemplateID && this.shiftTemplate.ShiftTemplateID > 0) {
            this.schedulerStartTime = this._dateTimeService.convertTimeStringToDateTime(this.shiftTemplate.StartTime);
            this.schedulerEndTime = this._dateTimeService.convertTimeStringToDateTime(this.shiftTemplate.EndTime);
        }
        else {
            this.shiftTemplate.StartTime = this._dateTimeService.getTimeStringFromDate(this.schedulerStartTime, Configurations.TimeFormat);
            this.shiftTemplate.EndTime = this._dateTimeService.getTimeStringFromDate(this.schedulerEndTime, Configurations.TimeFormat);
        }
    }

    // #region Events 

    onShiftTemplateTimeStart(event: any) {
        this.shiftTemplate.StartTime = this._dateTimeService.getTimeStringFromDate(event.value, Configurations.TimeFormat);
    }

    onShiftTemplateTimeEnd(event: any) {
        this.shiftTemplate.EndTime = this._dateTimeService.getTimeStringFromDate(event.value, Configurations.TimeFormat);
    }

    onClosePopup(): void {
        this._dialogRef.close();
    }

    // #endregion 

    // #region Methods 

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    }
    getFundamentals() {
        this._httpService.get(ShiftTemplateApi.getFundamentals)
            .subscribe(data => {
                this.staffPositionList = data.Result.StaffPositionList;
                this.setDefaultDropdown();
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Shift Templates"));
                }
            );
    }

    setDefaultDropdown() {
        this.shiftTemplate.StaffPositionID = this.shiftTemplate.StaffPositionID && this.shiftTemplate.StaffPositionID > 0 ? this.shiftTemplate.StaffPositionID : this.staffPositionList[0].StaffPositionID;
    }

    saveShiftTemplate(isValid: boolean) {
        if (isValid && this.validateEndTime()) {
            this.hasSuccess = false;
            this.hasError = false;
            this._httpService.save(ShiftTemplateApi.save, this.shiftTemplate)
                .subscribe(res => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Shift Template"));
                        this.onClosePopup();
                        this.shiftTemplateSaved.emit(true);
                    }
                    else if (res && res.MessageCode == -30) {
                        this._messageService.showErrorMessage(this.messages.Validation.ShiftTemplate_Exist);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Shift Template"));
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Shift Template")); }
                );
        }
    }

    validateEndTime() {
        return this.isEndTimeValid = this.shiftTemplate.EndTime > (this.shiftTemplate.StartTime) && (this.shiftTemplate.StartTime !== null);
    }

    // #endregion

}
/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike } from 'rxjs';

/** Model & */
import { ClassAppointmentDetail, ClassTax, ClassCategories, ParentClasses } from 'src/app/scheduler/models/class.model';
import { CellSelectedData, RRuleData } from 'src/app/scheduler/models/scheduler.model';
import { Tax } from 'src/app/models/common.model';

/*Serivces*/
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { CommonService } from 'src/app/services/common.service';

/** Messges, Configurations & Constants */
import { Configurations, SchedulerOptions } from 'src/app/helper/config/app.config';
import { SchedulerApi } from 'src/app/helper/config/app.webapi';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { ENU_DurationType, ENU_Package, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { DxFormComponent, DxDateBoxComponent } from 'devextreme-angular';
import { DatePipe } from '@angular/common';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';


@Component({
    selector: 'save-scheduler-class',
    templateUrl: './save.class.component.html'
})

export class SaveSchedulerClassComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members
    isShowScheduler: boolean = false;
    //** Data Sharing from another Component */
    @ViewChild(DxFormComponent) devexpForm: DxFormComponent;
    @ViewChild(DxDateBoxComponent) datebox: DxDateBoxComponent;
    @ViewChild('classFormData') classFormdata: NgForm;
    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;
    @Output() onClassUpdated = new EventEmitter<ClassAppointmentDetail>();
    @Output() onReloadScheduler = new EventEmitter<boolean>();
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() _cellDataSelection: CellSelectedData;

    /** Model References */
    recurrenceRuleFormData: RRuleData = new RRuleData();
    saveClassObj: ClassAppointmentDetail = new ClassAppointmentDetail();

    copySaveClassObj: ClassAppointmentDetail = new ClassAppointmentDetail();

    /** Scope Variables */
    currentDate: Date;
    branchCurrentDate: Date = new Date();
    isImageExist: boolean = false;
    imageData64: any = "";
    imagePath: string = "";
    dateTimeType: string = "time";
    isHideStartDate: boolean = false;
    isHideEndDate: boolean = false;
    selectedStaffID: number;
    showRepeatControl: boolean = false;
    isChangeStartDateEvent: boolean = true;
    isRepeatONForEdit: boolean = false;
    isShowError: boolean = false;
    totalPrice: any = 0;
    currencyFormat: string;
    hasFacilityInPackage: boolean = false;
    showHidePriceLabel: boolean = false;
    defaultMinuteForEndTime: number = 15;
    isShowPricePerSessionError: boolean = false;

    packageIdSubscription: SubscriptionLike;

    /** Lists */
    InstructorList: any;
    FacilityList: any;
    durationTypeList: any;
    taxList: Tax[] = [];
    recurrenceExceptionList: any[] = [];
    selectedTaxList: any[] = [];
    classCategoryList: ClassCategories[];

    /** Configuration & Constants */
    messages = Messages;
    durationType = ENU_DurationType;
    package = ENU_Package;
    SchedulerStartDayHour = SchedulerOptions.SchedulerStartDayHour;
    serverImageAddress = environment.imageUrl;
    dateFormat: string = ""; //Configurations.DateFormat;
    exceptionDateFormate: string = ""; //Configurations.ExceptionDateFormat;
    dayViewFormat: string = "";
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerRRuleUntilDateFormat: string = ""; //Configurations.SchedulerRRuleUntilDateFormat;
    recurrenceExceptionDateFormat: string = ""; //Configurations.RecurrenceExceptionDateFormat;
    validationErrorMsg = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
    startTimeValidationError = Messages.Validation.StartTime_Required;
    requiredInfoErrorMsg = Messages.Validation.Info_Required;
    allowedNumberKeys = Configurations.AllowedNumberKeys;
    allowedNumberKeysForClassBooking = Configurations.AllowedNumberKeysForClassBooking;
    // Used on Front End
    private schedulerStaticStrings = new SchedulerOptions();

    isSaveButtonDisabled: boolean = false;
    IsClassWaitList:boolean;  /// To check EnableOnline waitlist in configuration
    IsWaitListMaxCount:boolean = false;  /// To check global level waitlist configuration
    // #endregion

    //** Constructor *//
    constructor(
        private _dateFilter: DatePipe,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _taxCalculationService: TaxCalculation,
        private _dataSharingService: DataSharingService,
    ) {
        super();    //implicit call for constructor
        this.isSaveButtonDisabled = false;
        this.getCurrentBranchDetail();
    }

    ngOnInit() {
        this.setCurrencyFormat();

    }

 

    // #region Events

    async getCurrentBranchDetail() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.exceptionDateFormate = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ExceptionDateFormat);
        this.schedulerRRuleUntilDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerRRuleUntilDateFormat);
        this.recurrenceExceptionDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.RecurrenceExceptionDateFormat);
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.currentDate = new Date(this._cellDataSelection.startDate);
        
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        /** Get fundamentals and Get class detail */
        this.getClassFundamentals();
        this.checkPackagePermissions();
        this.isShowScheduler = true;
    }

    startDateChangeEvent($event) {
        if ($event.value || this.isChangeStartDateEvent) {
            if ($event.previousValue) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue), this.getTimeFromDate(new Date(this.saveClassObj.EndDate)));
                /** if user clear date box then, get date from user selection Date. */
                if ($event.value) {
                    this.saveClassObj.EndDate = this._dateTimeService.setTimeInterval(new Date($event.value), getTimeDifference);
                }
            }
            if (this.saveClassObj.StartDate) {
                new Date(new Date(this.saveClassObj.StartDate).setDate(this.currentDate.getDate()));
                new Date(new Date(this.saveClassObj.StartDate).setMonth(this.currentDate.getMonth()));
                new Date(new Date(this.saveClassObj.StartDate).setFullYear(this.currentDate.getFullYear()));
            }
        }
    }

    endDateChangeEvent($event) {
        if ($event.value) {
            new Date(new Date(this.saveClassObj.EndDate).setDate(this.currentDate.getDate()));
            new Date(new Date(this.saveClassObj.EndDate).setMonth(this.currentDate.getMonth()));
            new Date(new Date(this.saveClassObj.EndDate).setFullYear(this.currentDate.getFullYear()));
        }
    }

    repeatSwitch_valueChanged() {

        setTimeout(() => {
            this.showRepeatControl = this.showRepeatControl ? false : true;
            if (this.showRepeatControl) {
                if (this.recurrenceRuleFormData.repeat == undefined) {
                    this.recurrenceRuleFormData.repeat = 'FREQ=DAILY' + ';UNTIL=' + this.branchCurrentDate.getFullYear() + ("0" + (this.branchCurrentDate.getMonth() + 1)).slice(-2)  + ("0" + this.branchCurrentDate.getDate()).slice(-2);
                }
                
                let repeatEditor: any = this.devexpForm ? this.devexpForm.instance.getEditor("repeat") : "";
                if (repeatEditor && repeatEditor._editors[0].editorOptions.items.length > 4) {
                    repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                    repeatEditor._editors[0].editorOptions.items.splice(3, 1);
                    repeatEditor._editors[0].label.text = '';
                    repeatEditor._editors[1].items[0].label.text = 'Every';
                }
                // this.devexpForm.instance.repaint();
                              
            }
        }, 100);

        //this.showRepeatControl = event.value;

    }

    onCloseSchedulerClassPopup() {

        if (this._cellDataSelection.isRecurrenceException)
            /** Reload when Edit this form is open */
            this.onReloadScheduler.emit(true);
        this.onCancel.emit(true);
    }

    onIsOnlineChange() {
        if (!this.saveClassObj.ShowOnline) {
            this.saveClassObj.IsFeatured = false;
            this.saveClassObj.IsHidePriceOnline = false;
            this.saveClassObj.IsClassWaitList = false;
        }
    }

    //for staff data chnage on one day scheduler
    onStaffChange(staffID) {
        if (this.onedaySchedulerComp) {
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

   
    onPriceChange(amount: number, val: string) {
        if (val == "price") {
            this.validatePricePerSession(amount);

            if (!amount)
                amount = 0;

            this.saveClassObj.PricePerSession = parseFloat(String(amount));
            this.totalPrice = this.saveClassObj.PricePerSession;
        } else {
            this.totalPrice = this.saveClassObj.PricePerSession ? this.saveClassObj.PricePerSession : 0;
        }
        this.getTotalPrice();
    }

    onParentClassChange(parentClassId: number) {

        var minuts: number = 0;

        this.classCategoryList.forEach(element => {
            element.ParentClassList.forEach(item => {
                if (item.ParentClassID == parentClassId && item.ClassDurationInMinutes) {
                    minuts = Number(item.ClassDurationInMinutes);
                }
            })
        });
        if (minuts > 0) {
            this.saveClassObj.EndDate = new Date(this._cellDataSelection.startDate.setMinutes(this._cellDataSelection.startDate.getMinutes() + minuts));
            this._cellDataSelection.startDate = new Date(this._cellDataSelection.startDate.setMinutes(this._cellDataSelection.startDate.getMinutes() - minuts));
        } else {
            this.saveClassObj.EndDate = new Date(this._cellDataSelection.startDate.setMinutes(this._cellDataSelection.startDate.getMinutes() + this.defaultMinuteForEndTime));
            this._cellDataSelection.startDate = new Date(this._cellDataSelection.startDate.setMinutes(this._cellDataSelection.startDate.getMinutes() - this.defaultMinuteForEndTime));
        }

    }

    onSelectDate_valueChanged(startDate: Date) {
        startDate = new Date(startDate);

        let startDateTime = new Date(this.saveClassObj.StartDate),
            endDateTime = new Date(this.saveClassObj.EndDate);

        this.currentDate = startDate;
        this.saveClassObj.StartDate = startDate;

        //set hours, time and second 0,0,0
        var _selectedDate = startDate;
        _selectedDate = new Date(_selectedDate.setHours(0, 0, 0));

        this.saveClassObj.StartDate = new Date(_selectedDate.setHours(startDateTime.getHours(), startDateTime.getMinutes()));
        this.saveClassObj.EndDate = new Date(_selectedDate.setHours(endDateTime.getHours(), endDateTime.getMinutes()));
    }

    checkStaffPay(amount: any) {
        setTimeout(() => {
            if (amount !== "." && amount !== "" && amount !== "0.") {
                if (amount.substring(0, 1) === ".") {
                    this.saveClassObj.StaffPay = Number("0" + amount);
                }
            }
        }, 10);
    }

    checkCostPrice(amount: any) {
        setTimeout(() => {
            if (amount !== "." && amount !== "" && amount !== "0.") {
                if (amount.substring(0, 1) === ".") {
                    this.saveClassObj.CostPrice = Number("0" + amount);
                }
            }
        }, 10);
    }

    onBlurStreamingLink() {
        this.saveClassObj.StreamingLink = this.saveClassObj.StreamingLink.trim();
    }

    onBlurNotes() {
        this.saveClassObj.Notes = this.saveClassObj.Notes.trim();
    }    

    // #endregion

    // #region Methods

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
    }

    setPackagePermissions(packageId: number) {
        this.hasFacilityInPackage = false;

        switch (packageId) {
            case this.package.WellnessTop:
                this.showHidePriceLabel = true;
                break;
            case this.package.FitnessMedium:
                    this.showHidePriceLabel = true;
                    break;    
            case this.package.Full:
                this.hasFacilityInPackage = true;
                this.showHidePriceLabel = true;
                break;
        }
    }

    
    calculateTaxValue(taxPercentage: number) {
        return this._taxCalculationService.getTaxAmount(taxPercentage, this.saveClassObj.PricePerSession);
    }

    getClassFundamentals(): any {
        this._httpService.get(SchedulerApi.getClassFundamentals)
            .subscribe(data => {
                if (data && data.Result) {
                    this.resetDropdownsDataSource();
                    data.Result.FacilityList && data.Result.FacilityList.length > 0 ? this.FacilityList = data.Result.FacilityList : [];
                    data.Result.StaffList && data.Result.StaffList.length > 0 ? this.InstructorList = data.Result.StaffList : [];
                    data.Result.DurationTypeList && data.Result.DurationTypeList.length > 0 ? this.durationTypeList = data.Result.DurationTypeList : [];
                    data.Result.TaxList && data.Result.TaxList.length > 0 ? this.taxList = data.Result.TaxList : [];
                    this.selectedStaffID = this.InstructorList && this.InstructorList.length > 0 ? this.InstructorList[0].StaffID : 0;
                   
                    this.classCategoryList = data.Result.ClassList;
                    this.classCategoryList.forEach(element => {
                        element.ParentClassList.forEach((item,index) => {
                            if (item.IsActive == false ) {
                                element.ParentClassList.splice(index ,1);
                            }
                        })
                    });
                    this.IsClassWaitList = data.Result.IsClassWaitListOnline;
                    this.IsWaitListMaxCount = data.Result.IsClassWaitList;
                    if (this._cellDataSelection.id == 0) {
                        this.isChangeStartDateEvent = true;
                        this.setDefaultValues();
                    }
                    if (this._cellDataSelection.id > 0) {
                        this.isChangeStartDateEvent = false;
                        this.getClassByID(this._cellDataSelection.id);
                    }
                }else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            );
    }

    getClassByID(classID: number) {
        this._httpService.get(SchedulerApi.getClassByID + classID)
            .subscribe(data => {
                if (data && data.Result) {
                    this.saveClassObj = data.Result;                   
                    this.saveClassObj.AttendeeMin = this.saveClassObj.AttendeeMin > 0 ? this.saveClassObj.AttendeeMin : undefined;
                    this.saveClassObj.AttendeeMax = this.saveClassObj.AttendeeMax > 0 ? this.saveClassObj.AttendeeMax : undefined;
                    this.saveClassObj.CostPrice = this.saveClassObj.CostPrice > 0 ? this.saveClassObj.CostPrice : undefined;
                    this.saveClassObj.StaffPay = this.saveClassObj.StaffPay > 0 ? this.saveClassObj.StaffPay : undefined;
                    this.saveClassObj.WaitListMaxCount = this.saveClassObj.WaitListMaxCount == 0 ? undefined : this.saveClassObj.WaitListMaxCount;      
                    //// when user edit deactive class. then push deactive class data to class Category List for show
                    this.classCategoryList.forEach(element => {
                        if (element.ClassCategoryID == this.saveClassObj.ClassCategoryID) {
                            var checkClassExist = element.ParentClassList.find(pc => pc.ParentClassID == this.saveClassObj.ParentClassID);
                            if (checkClassExist == null || checkClassExist == undefined) {
                                var _pc = new ParentClasses();
                                _pc.ParentClassID = this.saveClassObj.ParentClassID;
                                _pc.ParentClassName = this.saveClassObj.ClassName;
                                _pc.ClassDurationInMinutes = this._dateTimeService.getTimeDifferenceFromTimeString(this.saveClassObj.StartTime, this.saveClassObj.EndTime).toString();
                                element.ParentClassList.push(_pc);
                            }
                        }
                    });

                    //when user deactivate staff permissions then show old classes staff detail
                    if (this.InstructorList && this.InstructorList.length) {
                        var checkStaffExist = this.InstructorList.find(il => il.StaffID == this.saveClassObj.AssignedToStaffID);
                        if (checkStaffExist == null || checkStaffExist == undefined) {
                            this.InstructorList.push({
                                StaffID: this.saveClassObj.AssignedToStaffID,
                                StaffFullName: this.saveClassObj.AssignedToStaffName,
                            })
                        }
                    }

                    // this.setClassImage();
                    this.setClassFormDataByID();
                    this._dataSharingService.shareClassDetailSource(this.saveClassObj);
                }
                else {
                    this.resetClassFormData();
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Class")); }
            );
    }

    setClassFormDataByID() {

        /** set Tax */
        this.totalPrice = this.saveClassObj.PricePerSession;

        this.setVAT();
        if (this.saveClassObj.Notes) {
            //$("#class_note").collapse('show');
        }
        /** IF appointment is for recurrenceException (Edit this only),
         * then repeat controll switch should be Off */
        if (this._cellDataSelection.isRecurrenceException) {

            /** Don't  set startDate from API get By ID, Set it to Current Date,
             * because recurrenceException StartDate set it to current selected Date
             * And EndDate also should be the same*/

            this.saveClassObj.StartDate = this._dateTimeService.convertTimeStringToDateTime(this.saveClassObj.StartTime, this._cellDataSelection.startDate);
            this.saveClassObj.EndDate = this._dateTimeService.convertTimeStringToDateTime(this.saveClassObj.EndTime, this._cellDataSelection.startDate);
            this.setDateTime_AfterDragDrop_EditThis();

        } else {

            this.saveClassObj.StartDate = this._dateTimeService.convertTimeStringToDateTime(this.saveClassObj.StartTime, new Date(this.saveClassObj.StartDate));
            this.saveClassObj.EndDate = this._dateTimeService.convertTimeStringToDateTime(this.saveClassObj.EndTime, new Date(this.saveClassObj.StartDate));
            if (this.saveClassObj.RecurrenceException) {
                let strRException = this.saveClassObj.RecurrenceException.split(',');
                if (strRException) {
                    for (let index = 0; index < strRException.length; index++) {
                        // let exceptDate = this._dateTimeService.convertExceptionStringToDate(strRException[index]);
                        // const element = this._dateTimeService.convertDateObjToString(exceptDate, this.dateFormat);
                        var _date = strRException[index].substring(0, 4) + '-' + strRException[index].substring(4, 6) + '-' + strRException[index].substring(6, 8);
                        this.recurrenceExceptionList.push(_date);
                    }
                }
            }
            if (this.saveClassObj.RecurrenceRule) {
                
                // remove zone from until 
                this.recurrenceRuleFormData.repeat = super.removeZoneUntilTime(this.saveClassObj);

                this.recurrenceRuleFormData.repeat = this.saveClassObj.RecurrenceRule;
                this.showRepeatControl = true;
                let repeatEditor: any = this.devexpForm.instance.getEditor("repeat");
                if (repeatEditor._editors[0].editorOptions.items.length > 4) {
                    repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                    repeatEditor._editors[0].editorOptions.items.splice(3, 1);
                }
                // this.devexpForm.instance.repaint();
                repeatEditor._editors[0].label.text = '';
                repeatEditor._editors[1].items[0].label.text = 'Every';
                //$("#recurring_price_class").collapse('show');
            }
        }

        this.copySaveClassObj = JSON.parse(JSON.stringify(this.saveClassObj));
    }

    setVAT() {
        if (this.saveClassObj.ItemTax.length > 0) {
            this.selectedTaxList = [];

            let selectedTax = new Tax();

            this.saveClassObj.ItemTax.forEach(VAT => {
                selectedTax = this.taxList.filter(m => m.TaxID === VAT.TaxID)[0];
                this.selectedTaxList.push(selectedTax);
            });

            this.getTotalPrice();
            // this.taxList.forEach(VAT => {
            //     if (this.saveClassObj.ItemTax.filter(m => m.TaxID === VAT.TaxID).length > 0) {
            //         VAT.IsSelected = true;
            //         this.calculatePrice(VAT.TaxPercentage, true);
            //     }
            // });
        }
    }

    getTotalPrice() {
        if (this.taxList && this.taxList.length > 0) {
            //let selectedTax = this.taxList.filter(m => m.IsSelected);
            // this condition work if user rechange the price and minimum one vat selected
            this.selectedTaxList.forEach(tax => {
                let selectedVatValue: number;
                selectedVatValue = this._taxCalculationService.getTaxAmount(tax.TaxPercentage, Number(this.saveClassObj.PricePerSession));
                this.totalPrice = Number(this.totalPrice) + selectedVatValue;
            });
            this.totalPrice = this._taxCalculationService.getRoundValue(this.totalPrice);
        }
    }

    saveClass(validate: boolean) {
        this.isSaveButtonDisabled = true;
        let startTime = this.getTimeStringFromDate(this.saveClassObj.StartDate, Configurations.SchedulerTimeFormat);
        let EndTime = this.getTimeStringFromDate(this.saveClassObj.EndDate, Configurations.SchedulerTimeFormat);
        this.isShowError = false;
        this.validatePricePerSession(this.saveClassObj.PricePerSession);
        if (!this.isShowPricePerSessionError) {
            if (this.saveClassObj.FacilityID === 0) this.saveClassObj.FacilityID = null;
            //if (this.saveClassObj.ClassName && this.saveClassObj.AttendeeMin >=0 && this.saveClassObj.AttendeeMax && this.saveClassObj.AssignedToStaffID > 0) {//&& this.saveClassObj.FacilityID) {
            if (this.saveClassObj.AssignedToStaffID > 0) {//&& this.saveClassObj.FacilityID) {
                if (this.saveClassObj.StartDate && this.saveClassObj.EndDate) {
                    if (startTime < EndTime) {
                        // if (this.saveClassObj.AttendeeMin !== 0) {
                        //     if (Number(this.saveClassObj.AttendeeMin) <= Number(this.saveClassObj.AttendeeMax) || this.saveClassObj.AttendeeMax == undefined || this.saveClassObj.AttendeeMax.toString() == "") {
                        //if ((Number(this.saveClassObj.BookingStart) > 0 && this.saveClassObj.BookStartDurationTypeID > 0) || (Number(this.saveClassObj.BookingStart) == 0 || !this.saveClassObj.BookingStart)) {
                        /** validate if bookingBefore input value is typed and bookingType is not selected */
                        //if ((Number(this.saveClassObj.BookBefore) > 0 && this.saveClassObj.BookBeforeDurationTypeID > 0) || (Number(this.saveClassObj.BookBefore) == 0 || !this.saveClassObj.BookBefore)) {
                        //if ((Number(this.saveClassObj.CancelBefore) > 0 && this.saveClassObj.CancelBeforeDurationTypeID > 0) || (Number(this.saveClassObj.CancelBefore) == 0 || !this.saveClassObj.CancelBefore)) {
                        //if (this.validateBookingStartAndBookingCloseValues() && this.validateBookingAndCancellationValues()) {
                        if (this.validateAttendees()) {
                            if (this.validateDaySelected()) {
                                if (validate) {
                                    this.isShowError = false;
                                    this.validateRepeatRuleOnSave();
                                    if (!this.isShowError) {
                                        this.isShowError = false;                                     
                                       
                                        this.saveClassObj.PricePerSession = this.saveClassObj.PricePerSession == null ? 0 : this.saveClassObj.PricePerSession;
                                        this.saveClassObj.AttendeeMin = this.saveClassObj.AttendeeMin > 0 ? this.saveClassObj.AttendeeMin : 0;
                                        this.saveClassObj.AttendeeMax = this.saveClassObj.AttendeeMax > 0 ? this.saveClassObj.AttendeeMax : 0;
                                        this.saveClassObj.WaitListMaxCount = this.saveClassObj.WaitListMaxCount > 0 ? (Number(this.saveClassObj.WaitListMaxCount)) : 0;
                                        let copyClassModel = JSON.parse(JSON.stringify(this.saveClassObj));  
                                     
                                        copyClassModel.ClassID = this._cellDataSelection.id;
                                        //copyClassModel.ImageFile = this.imageData64;
                                        this.addVatListOnSave(copyClassModel);
                                        this.addRecurrence(copyClassModel);
                                        this.addRecurrenceException(copyClassModel);
                                        copyClassModel.StartTime = this._dateTimeService.getTimeStringFromDate(new Date(this.saveClassObj.StartDate));
                                        copyClassModel.EndTime = this._dateTimeService.getTimeStringFromDate(new Date(this.saveClassObj.EndDate));
                                        copyClassModel.StartDate = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
                                        //copyClassModel.ClassCode = copyClassModel.ClassCode.trim();
                                        //this.onCloseSchedulerClassPopup();
                                        this.onClassUpdated.emit(copyClassModel);
                                    } else{
                                        this.isSaveButtonDisabled = false;
                                    }
                                } else{
                                    this.isSaveButtonDisabled = false;
                                }
                            } else{
                                this.isSaveButtonDisabled = false;
                            }
                        } else{
                            this.isSaveButtonDisabled = false;
                        }
                        
                    } else {
                        this.isShowError = true;
                        this.isSaveButtonDisabled = false;
                        this.validationErrorMsg = this.messages.Validation.Endtime_Should_Greater_Than_Start_Time;
                        validate = false;
                    }
                }
                else {
                    this.isShowError = true;
                    this.isSaveButtonDisabled = false;
                    this.validationErrorMsg = this.requiredInfoErrorMsg;;
                    validate = false;
                }
            } else {
                this.isSaveButtonDisabled = false;
                validate = false;
            }
        } else {
            this.isSaveButtonDisabled = false;
            this.isShowPricePerSessionError = true;
        }

    }

    validatePricePerSession(amount: Number) {
        if (amount == undefined) {
            this.isShowPricePerSessionError = true;
            return;
        }
        this.isShowPricePerSessionError = amount < 0 || amount == undefined || amount == NaN || String(amount) == "" || String(amount) == null ? true : false;
    }

    validateAttendees() {
        
        this.isShowError = false;
        if (Number(this.saveClassObj.WaitListMaxCount) == 0 && String(this.saveClassObj.WaitListMaxCount) !== "") {
            this.isShowError = true;
            this.validationErrorMsg = Messages.Validation.WaitListCapacityError;
            return false;
        } 

       
        if ((this.saveClassObj.AttendeeMax == undefined || String(this.saveClassObj.AttendeeMax) == "") && this.saveClassObj.AttendeeMin > 0) {
            return true;
        }

        if ((this.saveClassObj.AttendeeMax == undefined || String(this.saveClassObj.AttendeeMax) == "") && (this.saveClassObj.AttendeeMin == undefined || String(this.saveClassObj.AttendeeMin) == "")) {
            return true;
        }

        if (Number(this.saveClassObj.AttendeeMin) >= Number(this.saveClassObj.AttendeeMax)) {
            this.isShowError = true;
            this.validationErrorMsg = Messages.Validation.MinMaxNumberError;
            return false;
        }
       

        return true;

    }

    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, timeFormat);
    }

    validateRepeatRuleOnSave() {
        if (this.recurrenceRuleFormData && this.recurrenceRuleFormData.repeat && this.showRepeatControl) {
            let splitRRule = this.recurrenceRuleFormData.repeat.split(';');
            if (this.recurrenceRuleFormData.repeat.toLowerCase().indexOf("until") == -1 && this.recurrenceRuleFormData.repeat.toLowerCase().indexOf("count") == -1) {
                this.validationErrorMsg = this.messages.Validation.Scheduler_Repeat_EndDate_Required_Error;
                this.isShowError = true;
            }
            if (splitRRule) {
                for (let index = 0; index < splitRRule.length; index++) {
                    const element = splitRRule[index];
                    if (element.toLowerCase().indexOf("until") > -1) {
                        let dateStringRule = element.split('=')[1];
                        let splitOnlyDatePart = dateStringRule.split('T')[0];
                        let getYearFromRRule = splitOnlyDatePart.substr(0, 4), getMonthFromRRule = splitOnlyDatePart.substr(4, 2), getDateFromRRule = splitOnlyDatePart.substr(6, 2);
                        let endRRuleDate = getYearFromRRule + '-' + getMonthFromRRule + '-' + getDateFromRRule;
                        console.log(Date.parse(endRRuleDate));
                        if (Date.parse(this.saveClassObj.StartDate.toString()) > Date.parse(endRRuleDate)) {
                            this.validationErrorMsg = this.messages.Validation.Scheduler_Repeat_EndDate_Greater_Than_SartDate;
                            this.isShowError = true;
                        } 
                        else {
                            var days = this._dateTimeService.getDaysCountFromTwoDifferentDays(this.saveClassObj.StartDate, new Date(endRRuleDate));
                            if(days > 365){
                                this.validationErrorMsg = this.messages.Validation.The_End_Repeat_Date_Of_Recurring_Must_Fall_Within_One_Year_Range;
                                this.isShowError = true;
                            }
                           
                        }
                        break;
                    } else if(element.toLowerCase().includes("count")){
                        var count = element.split('=');
                        if(Number(count[1]) > 99){
                            this.validationErrorMsg = this.messages.Validation.The_Recurring__Occurrences_Cannot_Be_Greater_Than_99;
                            this.isShowError = true;
                        }
                    }
                }
            }
        }
    }


    validateDaySelected() {
        if (this.recurrenceRuleFormData.repeat && this.recurrenceRuleFormData.repeat.includes("WEEKLY")) {
            if (this.recurrenceRuleFormData.repeat.includes("BYDAY")) {
                this.isShowError = false;
                return true;
            } else {
                this.isShowError = true;
                this.validationErrorMsg = Messages.Validation.DaySelectOfTheWeelError;
                return false;
            }
        } else {
            return true;
        }
    }
    

    validateDurationTypePeriod(durationValue, durationTypeID) {

        let returnMinutes;
        switch (durationTypeID) {

            case this.durationType.Weeks:
                returnMinutes = this._dateTimeService.convertWeeksToMinutes(durationValue);
                break;

            case this.durationType.Days:
                returnMinutes = this._dateTimeService.convertDaysToMinutes(durationValue);
                break;

            case this.durationType.Hours:
                returnMinutes = this._dateTimeService.convertHoursToMinutes(durationValue);
                break;

            case this.durationType.Minutes:
                returnMinutes = durationValue;
        }

        return returnMinutes;
    }

    addVatListOnSave(classModel: ClassAppointmentDetail) {
        classModel.ItemTax = [];

        if (this.selectedTaxList && this.selectedTaxList.length > 0) {
            this.selectedTaxList.forEach(item => {
                var saveTax = new ClassTax();
                saveTax.TaxID = item.TaxID;
                classModel.ItemTax.push(saveTax);
            });
        }
        
    }

    addRecurrence(classModel: ClassAppointmentDetail) {
        if (this.showRepeatControl) {
            classModel.RecurrenceRule = this.recurrenceRuleFormData.repeat;

            classModel.RecurrenceRule = super.changeUntilTime(classModel);
            if (classModel.ClassID != 0 && classModel.RecurrenceException) {
                classModel = super.updateRecurrenceExceptionOnEditSeries(classModel, this._dateTimeService.getTimeStringFromDate(new Date(this.saveClassObj.StartDate)));
            }
        }
        else {
            classModel.RecurrenceRule = null;
        }

    }

    addRecurrenceException(classModel: ClassAppointmentDetail) {

        if (this._cellDataSelection.isRecurrenceException) {
            /** Drag n Drop RecurrenceException Date  */
           
            var copyClassModel = JSON.parse(JSON.stringify(this.copySaveClassObj));

            let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(copyClassModel.StartDate), this.recurrenceExceptionDateFormat);
            let _gethours, _getminutes;

            var time = copyClassModel.StartTime.split(":");
            _gethours = time[0].trim();
            _getminutes = time[1].trim();

            if (_gethours.length === 1) _gethours = "0" + _gethours;
            if (_getminutes.length === 1) _getminutes = "0" + _getminutes;
            classModel.RecurrenceException = formatRecurrenceDate + "T" + _gethours + _getminutes + "00";

            classModel.IsUpdate = false;
        }
        if (classModel.ClassID && classModel.ClassID > 0 && !this._cellDataSelection.isRecurrenceException) {
            classModel.IsUpdate = true;
        }
    }

    setDefaultValues() {
        this.saveClassObj.ClassID = 0
        this.saveClassObj.ClassName = ""
        this.saveClassObj.Notes = ""
        this.saveClassObj.StartDate = new Date(this._cellDataSelection.startDate)
        this.saveClassObj.EndDate = new Date(this._cellDataSelection.endDate)
        //this.saveClassObj.AllDay = this._cellDataSelection.allDay
        this.saveClassObj.AttendeeMin = undefined;
        this.saveClassObj.AttendeeMax = undefined;
        this.saveClassObj.ShowOnline = false
        this.saveClassObj.PricePerSession = undefined;
        this.saveClassObj.AssignedToStaffID = this._cellDataSelection.StaffID == 0 ? this.selectedStaffID : this._cellDataSelection.StaffID
        /** If staff hae no permission to do Classes then stafflist is not filtered so its 0 */
        let setStaffIDWithPermission = this.InstructorList.find(x => x.StaffID == this.saveClassObj.AssignedToStaffID);
        if (!setStaffIDWithPermission) { this.saveClassObj.AssignedToStaffID = 0; }
        this.saveClassObj.FacilityID = this._cellDataSelection.FacilityID && this._cellDataSelection.FacilityID > 0 ? this._cellDataSelection.FacilityID : 0;
        if(this._cellDataSelection.FacilityID) this.saveClassObj.AssignedToStaffID = this.InstructorList[0].StaffID;
        
        this.saveClassObj.IsActive = true;
        this.saveClassObj.IsFeatured = false;
        this.saveClassObj.ParentClassID = undefined;
        this.saveClassObj.StaffPay = undefined;
        this.saveClassObj.CostPrice = undefined;
        this.saveClassObj.StreamingLink = "";
        this.saveClassObj.IsClassWaitList = false;
        this.saveClassObj.WaitListMaxCount = undefined;
    }

    setDateTime_AfterDragDrop_EditThis() {
        if (this._cellDataSelection.IsDragDrop && this._cellDataSelection.isRecurrenceException) {
            this.saveClassObj.AssignedToStaffID = this._cellDataSelection.StaffID;
            this.saveClassObj.StartDate = new Date(this._cellDataSelection.startDate);
            this.saveClassObj.EndDate = new Date(this._cellDataSelection.endDate);
        }
    }

    resetClassFormData() {
        this.classFormdata.resetForm();
    }

    resetDropdownsDataSource() {
        this.FacilityList = [];
        this.InstructorList = [];
        this.durationTypeList = [];
    }

    smallCalendarDateChange(startDate: Date) {

        // let startDateTime = new Date(this.saveClassObj.StartDate),
        //     endDateTime = new Date(this.saveClassObj.EndDate);

        // this.currentDate = startDate;
        // this.saveClassObj.StartDate = startDate;
        // this.saveClassObj.StartDate = new Date(startDate.setHours(startDateTime.getHours(), startDateTime.getMinutes()));
        // this.saveClassObj.EndDate = new Date(startDate.setHours(endDateTime.getHours(), endDateTime.getMinutes()));
    }

    
    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

    preventCharacters(event: any) {
        let index = this.allowedNumberKeys.findIndex(k => k == event.key);
        if (index < 0) {
            event.preventDefault()
        }
    }

    preventCharactersForClassBooking(event: any) {
        let index = this.allowedNumberKeysForClassBooking.findIndex(k => k == event.key);
        if (index < 0) {
            event.preventDefault()
        }
    }

    refreshDevexControls() {
        this.devexpForm.instance.repaint();
    }

    preventSpecialCharactersForClassCode(event: any) {
        let k = event.charCode;  //  k = event.keyCode;  (Both can be used)
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || k == 45 || (k >= 48 && k <= 57));
    }

    
    setCurrencyFormat() {
        
    }

    onRecurrenceValueChanged = (event: any) => {
        this.recurrenceRuleFormData.repeat = event.value;
    }
    // #endregion
}

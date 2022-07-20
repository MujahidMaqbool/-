// #region Imports

/********************** Angular Refrences *********************/
import { Component, OnInit, Input, Inject, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators';
import { SubscriptionLike } from 'rxjs';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models *********************/
/* Models */
import { AllAttendees, SaveAttendee, AttendeeClass, ClassAttendanceDetail, ClassInfo, AttendeeClassAttendance, AttendeMemberhsip, FreeClassesMemberships } from '@app/models/attendee.model';
import { AllPerson, ApiResponse, PersonInfo } from '@models/common.model';
import { ActivityPersonInfo } from '@app/models/activity.model';
import { POSSaleDetail, SaleInvoice, POSCartItem, POSClient, FreeClassBooking } from '@app/point-of-sale/models/point.of.sale.model';
import { Client } from '@app/customer/client/models/client.model';
import { WaitListViewModel, WaitListDetail } from '@app/models/waitlist.model';


/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@services/data.sharing.service';
import { DateTimeService } from '@services/date.time.service';
import { CommonService } from '@app/services/common.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AuthService } from '@app/helper/app.auth.service';

/********************** Component *********************/
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { POSPaymentComponent } from '@shared/components/sale/payment/pos.payment.component';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { CancelBookingComponent } from '@app/shared/components/cancel-booking/cancel.booking.component';
import { NoShowBookingComponent } from '@app/shared/components/noshow-booking/noshow.booking.component';
import { SaveClientPopupComponent } from '@app/customer/client/save/save.client.popup.component';
import { AttendeeNotificationComponent } from '../attendee-notification-popup/attendee.notificatin.popup.component';
import { FillFormComponent } from '@app/shared/components/fill-form/fill.form.component';
import { RedeemMembershipComponent } from '@app/shared/components/redeem-membership/redeem.membership.component';
import { MemberMemberhshipAttendance } from '@app/shared/components/member-memberhsip-attendance/member-membership-attendance';
import { WaitlistConfirmationPopupComponent } from '../waitlist-confirmation-popup/waitlist.confirmation.popup.component';
import { ClassRescheduleComponent } from '@app/shared/components/class-reschedule/class.reschedule.component';
import { SavePartialPaymentComponent } from '@app/shared/components/sale/partial-payment/save.partial.payment.component';

/**********************  Configurations *********************/
import { Configurations, SaleArea, ClassStatusName, DiscountType } from '@helper/config/app.config';
import { ENU_BookingStatusOption, ENU_BookingStatusValue, EnumBookingStatusType, ENU_ActivityType, POSItemType, CustomerType, ClassStatus, ENU_DateFormatName, MembershipStatus_Enum, ENU_CancelItemType, EnumSaleSourceType, ENU_SearchBookingStatusValue, ENU_SearchBookingStatusOption, EnumSaleStatusType, ENU_Package } from '@helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { AttendeeApi, WaitlistAPI } from '@app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';
import { element } from 'protractor';


declare var $: any;

// #endregion

@Component({
    selector: 'attendee',
    templateUrl: './attendee.component.html'
})

export class AttendeeComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    @Input() attendeetabchange: boolean;
    @Output() isAttendeeUpdated = new EventEmitter<boolean>();
    @Output() isAttendeePoupClosed = new EventEmitter<boolean>();
    @ViewChild(MemberMemberhshipAttendance) memberMemberhsip;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    /***********Messages*********/
    messages = Messages;
    timeFormat = Configurations.TimeFormatView;
    membershipStatus_Enum = MembershipStatus_Enum;
    errorMessage: string;

    /***********Dialog Reference*********/
    deleteDialogRef: any;

    /***********Local*********/
    private readonly DATE_FORMAT = "yyyy-MM-dd";
    currencyFormat: string;
    classStatus: string = "";
    classDate: string;
    isClassesExists: boolean = false;
    //bookingNotStarted: boolean = false;
    isClassAttendeeExists: boolean = false;
    isClassAttendanceDetailExists: boolean = false;
    isMemberMembershipExists: boolean = false;
    searchPerson: FormControl = new FormControl();
    personName: string = "";

    isShowGroupSMS: boolean = false;
    isShowGroupEmail: boolean = false;
    isShowGroupNotification: boolean = false;

    isAttendeeAlreadyExist: boolean = false;
    isMaxAttendeeLimit: boolean = false;
    isRescheduleAllow: boolean = false;

    isSaveClientAllowed: boolean;
    hasClassAlreadyStarted: any;

    isPurchaseRestrictionAllowed :boolean = false;

    searchByClientId: number;
    customerMembershipID: number;
    searchByClientEmail: string;
    minDate: Date;
    dateFormForView: string = "";//Configurations.DateFormat;
    dateTimeFormat: string;
    searchbookingStatus: number = ENU_SearchBookingStatusValue.AllExceptCancelled;

    purchaseRestrictionTooltip:boolean = false;

    /*********** Collections *********/
    allAttendees: AllAttendees[];
    copyAllAttendees: AllAttendees[];
    posCartItems: POSCartItem[] = [];
    allPerson: AllPerson[];
    attendeeClass: AttendeeClass[];
    attendeMemberhsip: AttendeMemberhsip[];
    freeClassMemberships: FreeClassesMemberships[];
    bookingStatusOptions: any = []
    /***********Model Reference*********/
    selectedPerson: AllPerson;
    saveAttendeeObj: SaveAttendee;
    classDetailObj: ClassAttendanceDetail = new ClassAttendanceDetail();
    saleInvoice: SaleInvoice;

    clientInfoSubscription: SubscriptionLike;
    currentBranchSubscription: SubscriptionLike;

    /*********** Configurations *********/
    personType = CustomerType;
    classBookingStatusType = EnumBookingStatusType;
    dateFormatForSearch = 'yyyy-MM-dd';
    discountType = DiscountType;
    classStatusType = ClassStatus;
    classStatusTypeName = ClassStatusName;
    activityType = ENU_ActivityType;
    bookingType = ENU_CancelItemType;
    bookingStatusValue = ENU_BookingStatusValue;
    bookingStatusOption = ENU_BookingStatusOption;
    searchBookingStatusValue = ENU_SearchBookingStatusValue;
    searchBookingStatusOption = ENU_SearchBookingStatusOption;
    SaleStatusType = EnumSaleStatusType;

    /* Subsctiptions */
    packageIdSubscription: SubscriptionLike;
    package = ENU_Package;
    isRewardProgramInPackage: boolean = false;

    // DropDown list

    searchBookingStatusOptions = [
        { BookingStatusTypeID: this.searchBookingStatusValue.All, BookingStatusTypeName: this.searchBookingStatusOption.All },
        { BookingStatusTypeID: this.searchBookingStatusValue.AllExceptCancelled, BookingStatusTypeName: this.searchBookingStatusOption.AllExceptCancelled },
        { BookingStatusTypeID: this.searchBookingStatusValue.Present, BookingStatusTypeName: this.searchBookingStatusOption.Present },
        { BookingStatusTypeID: this.searchBookingStatusValue.NoShow, BookingStatusTypeName: this.searchBookingStatusOption.NoShow },
        { BookingStatusTypeID: this.searchBookingStatusValue.Cancelled, BookingStatusTypeName: this.searchBookingStatusOption.Cancelled },
        { BookingStatusTypeID: this.searchBookingStatusValue.WaitList, BookingStatusTypeName: this.searchBookingStatusOption.WaitList },
    ];
    // #endregion

    constructor(private _httpService: HttpService,
        private _commonService: CommonService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _taxCalculationService: TaxCalculation,
        private _openDialog: MatDialogService,
        private _dialogRef: MatDialogRef<AttendeeComponent>,
        @Inject(MAT_DIALOG_DATA) public classInfo: ClassInfo,
        private _authService: AuthService,
        private _router: Router
    ) {
        super();
    }

    ngOnInit() {
        this.checkPackagePermissions();
        this.getCurrentBranchDetail();
    }

    ngOnDestroy() {
        if (this.clientInfoSubscription) {
            this.clientInfoSubscription.unsubscribe();
        }
        this.currentBranchSubscription?.unsubscribe();

        this.packageIdSubscription?.unsubscribe();
    }

    // #region Events

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
              this.setPackagePermissions(packageId);
            }
        })
    }

    setPackagePermissions(packageId: number) {
        this.isRewardProgramInPackage = false;
        switch (packageId) {

            case this.package.Full:
            this.isRewardProgramInPackage = true;
            this.isPurchaseRestrictionAllowed = true;
                break;
        }
    }

    onDateChange(date: any) {
        // this.classDate = this._dateTimeService.convertDateObjToString(event, this.dateFormatForSearch); // 07-05-2018
        // this.getAttendeeClasses();
        setTimeout(() => {
            this.classDate = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch);
            this.classInfo.ClassID = 0;
            this.classDetailObj = new ClassAttendanceDetail();
            this.allAttendees = null;
            this.isClassAttendeeExists = false;
            this.getAttendeeClasses();
        });
    }

    // call when we click on reschedule button
    openClassRescheduleDialoge(attendeeObj: AllAttendees) {
        var classDetailObj = this.classDetailObj;
        var isRewardProgramInPackage = this.isRewardProgramInPackage
        const dialogRef = this._openDialog.open(ClassRescheduleComponent, {
            disableClose: true,
            data: {
                classDetailObj,
                attendeeObj,
                isRewardProgramInPackage
            }
        });
        dialogRef.componentInstance.isReschedule.subscribe((isRescheduled: boolean) => {
            if (isRescheduled) {
                this.onClosePopup();
            }
            else {
                this.searchClassAttendee();
            }
        })
    }

    // call when we change status from booking status dropdown
    onBookingStatusChange(attendeeObj: any) {

        let cancelNoShowData = this.mapBookingStatusChangeData(attendeeObj);

        if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.NoShow) {
            /*////if "No Show" policy is ON in configuration settings and also no show fee */
            if (attendeeObj.ClassNoShowFee && attendeeObj.ClassNoShow) {
                //if class NO SHOW charges and amount paid are 0 then we only change the status
                // if (attendeeObj.ClassNoShowCharges == 0 && attendeeObj.AmountPaid == 0) {
                //     this.onlyBookingStatusChange(attendeeObj)
                // } else {
                const dialogRef = this._openDialog.open(NoShowBookingComponent, {
                    disableClose: true,
                    data: {
                        cancelNoShowData
                    }
                });
                dialogRef.componentInstance.confirm.subscribe((isConfirm: boolean) => {
                    if (isConfirm) {
                        this.searchClassAttendee();
                    }
                    else {
                        this.searchClassAttendee();
                    }
                })
                // }
            }
            else {
                this.onlyBookingStatusChange(attendeeObj)
            }
        }
        else if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.Cancelled) {
            /*////if cancellation policy is ON and Early OR Late cancellation is also ON */
            if (attendeeObj.IsClassCancellationPolicy && (attendeeObj.ClassCancellationEarly || attendeeObj.ClassCancellationLate)) {
                // after checking the cancelltion policy for class here we check the amountpaid and cancellation charges( if they both are 0 then we only change the service status)
                // if (attendeeObj.ClassCancellationLateCharges == 0 && attendeeObj.AmountPaid == 0) {
                //     this.onlyBookingStatusChange(attendeeObj)
                // }
                // else {
                const dialogRef = this._openDialog.open(CancelBookingComponent, {
                    disableClose: true,
                    data: {
                        cancelNoShowData
                    }
                });
                dialogRef.componentInstance.confirm.subscribe((isConfirm: boolean) => {
                    if (isConfirm) {
                        this.searchClassAttendee();
                    }
                    else {
                        this.searchClassAttendee();
                    }
                })
                // }
            }
            else {
                this.onlyBookingStatusChange(attendeeObj)
            }
        }

        else {
            this.onlyBookingStatusChange(attendeeObj)
        }
    }

    mapBookingStatusChangeData(attendeeObj) {
        var Data = {
            CustomerID: attendeeObj.CustomerID,
            CustomerTypeId: attendeeObj.CustomerTypeID,
            CancelbookingType: this.bookingType.Class,
            IsCancellationFeeInPercentage: attendeeObj.IsClassCancellationLateFlatFee == false ? true : false,
            IsNoShowFlatFee: attendeeObj.IsClassNoShowFlatFee == false ? true : false,
            NoShowCharges: attendeeObj.ClassNoShowCharges,
            CancellationCharges: attendeeObj.ClassCancellationLateCharges,
            OldTotalDue: attendeeObj.TotalDue,
            AmountPaid: attendeeObj.AmountPaid,
            ItemDiscountedPrice: attendeeObj.ItemDiscountedPrice,
            SaleID: attendeeObj.SaleID,
            SaleDetailID: attendeeObj.SaleDetailID,
            ItemID: attendeeObj.ItemID,
            // IsBenefitConsumed : attendeeObj.IsBenefitConsumed
            ClassNoShowBenefit: attendeeObj.ClassNoShowBenefit,
            ClassCancellationLateBenefit: attendeeObj.ClassCancellationLateBenefit,
            ClassCancellationEarlyBenefit: attendeeObj.ClassCancellationEarlyBenefit,
            CancellationLate: attendeeObj.ClassCancellationLate,
            CancellationEarly: attendeeObj.ClassCancellationEarly,
            CustomerMembershipID: attendeeObj.CustomerMembershipID > 0 ? attendeeObj.CustomerMembershipID : null,
            DiscountType:attendeeObj.CustomerMembershipID > 0 ? attendeeObj.MembershipName : "",
        }
        return Data;
    }

    //we are calling this function when cancellation policy in off in configuration and cancellation charges are zero(0)
    onlyBookingStatusChange(attendeeObj: any) {
        const dialog = this._openDialog.open(AlertConfirmationComponent);
        dialog.componentInstance.Title = this.messages.Dialog_Title.Alert;
        dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Alter_Service_Status;
        dialog.componentInstance.isChangeIcon = true;
        dialog.componentInstance.showButton = true;
        dialog.componentInstance.showConfirmCancelButton = true;
        dialog.componentInstance.confirmChange.subscribe(isConfirm => {
            if (isConfirm) {
                let params = {
                    AppSourceTypeID: EnumSaleSourceType.OnSite,
                    StatusTypeID: attendeeObj.BookingStatusTypeID,
                    CustomerID: attendeeObj.CustomerID,
                    SaleId: attendeeObj.SaleID,
                    SaleDetailID: attendeeObj.SaleDetailID,
                    CustomerBookingID: null
                }
                this._httpService.save(AttendeeApi.updateAttendeeStatus, params)
                    .subscribe(data => {
                        if (data && data.MessageCode > 0) {
                            this.searchClassAttendee();
                            if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.Cancelled) {
                                this._messageService.showSuccessMessage(this.messages.Success.Booking_Cancel_Successfully.replace("{0}", "Class"));
                            }
                            if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.NoShow) {
                                this._messageService.showSuccessMessage(this.messages.Success.Booking_NoShow_Successfully.replace("{0}", "Class"));
                            }
                        }
                        else {
                            this._messageService.showErrorMessage(data.MessageText);
                        }
                    },
                        error => {
                            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendee Classes"));
                        });
            }
            else {
                this.searchClassAttendee();
            }
        })
    }

    onSearchStatusChange() {
        let searchStatusID = (Number(this.searchbookingStatus));

        if (searchStatusID == ENU_SearchBookingStatusValue.All) {
            this.allAttendees = this.copyAllAttendees;
            this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;

        }
        else if (searchStatusID == ENU_SearchBookingStatusValue.AllExceptCancelled) {
            this.allAttendees = this.copyAllAttendees.filter((s => s.BookingStatusTypeID != ENU_SearchBookingStatusValue.Cancelled));
            this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;

        }
        else {
            this.allAttendees = this.copyAllAttendees.filter((s => s.BookingStatusTypeID === searchStatusID));
            this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;

        }
    }

    onAttendeeChange(customer: AllPerson) {
        this.selectedPerson = customer;
        this.proceedToAddAttendee();
    }
    onFocusedOut() {
        this.autocomplete.closePanel();
        this.allPerson = [];
    }
    onAddClient() {
        //if (this.bookingNotStarted == false) {
        this._dataSharingService.shareClientID(0);
        const dialogRef = this._openDialog.open(SaveClientPopupComponent, {
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(() => {
            this.clientInfoSubscription.unsubscribe();
        })

        this.clientInfoSubscription = this._dataSharingService.clientInfo.subscribe((clientInfo: Client) => {
            if (clientInfo) {
                if (clientInfo && clientInfo.Email && clientInfo.Email.length > 0) {
                    this.setClientByEmail(clientInfo.Email);
                }
                else if (clientInfo && clientInfo.CustomerID > 0) {
                    this.setClient(clientInfo.CustomerID, (clientInfo.FirstName + ' ' + clientInfo.LastName));
                }
                this._dataSharingService.shareClientInfo(null);
            }
        })
        //}
    }


    onClearSelectedClient() {
        this.selectedPerson = null;
        this.personName = undefined;
        setTimeout(() => {
            this.searchPerson.setValue(this.personName);
            this.searchPerson.updateValueAndValidity();
        });

        if (this.classInfo && this.classInfo.ClassID && this.classInfo.ClassID > 0) {
            this.getAllClassAttendees();
        }
    }

    onAttendeeSignIn(attende: AllAttendees, markAttendance: boolean) {
        if (markAttendance) {
            this.getMemberClassDetailWithOtherMemberships(attende, markAttendance);
        }
        else {
            this.markCustomerAttendance(attende.CustomerID, attende.SaleDetailID, attende.IsFree, markAttendance, attende.CustomerMembershipID);
        }
    }

    onClosePopup() {
        this._dialogRef.close();
        this.isAttendeePoupClosed.emit(true);
    }

    toggleRestrictionTooltip() {
      $(".dx-popup-content").addClass('pr-overlay');
     this.purchaseRestrictionTooltip = !this.purchaseRestrictionTooltip;
    }
    // #endregion

    // #region Methods

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol
        }
        this.dateFormForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        let timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateTimeFormat = this.dateFormForView + ' | ' + timeFormat;
        this.bookingStatusOptions = await this._commonService.setCancellationPackagePermission()
        this.isRescheduleAllow = await this._commonService.setReschedulePackagePermission();


        this.saveAttendeeObj = new SaveAttendee();
        this.setPermission();
        if (!this.classInfo) {
            this.classInfo = new ClassInfo();

            //set branch date time added by fahad for browser different time zone issue resolving
            this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            this.classInfo.ClassDate = this.minDate;
        }
        this.classDate = this._dateTimeService.convertDateObjToString(this.classInfo.ClassDate, this.dateFormatForSearch);

        this.getAttendeeClasses();

        if (this.classInfo && this.classInfo.ClassID && this.classInfo.ClassID > 0) {
            this.getClassAttendanceDetail();
            this.getAllClassAttendees();
        }

        this.searchPerson.valueChanges
            .pipe(debounceTime(200))
            .subscribe(
                searchText => {
                    if (searchText != null) {
                        if (searchText == "") {
                            this.allPerson = [];
                            this.onClearSelectedClient();
                        }
                        else if (searchText.length > 2) {
                            let isPosSearch = true;
                            this._commonService.searchClient(searchText, 0, true, isPosSearch)
                                .subscribe(
                                    response => {
                                        if (response && response.MessageCode > 0) {
                                            if (response.Result && response.Result.length > 0) {
                                                this.allPerson = response.Result;

                                                this.allPerson.forEach(person => {
                                                    person.FullName = person.FirstName;
                                                    if (person.LastName && person.LastName !== "") {
                                                        person.FullName += " " + person.LastName;
                                                    }
                                                })

                                                if (this.searchByClientId && this.searchByClientId > 0) {
                                                    this.selectedPerson = this.allPerson.filter(c => c.CustomerID === this.searchByClientId)[0];

                                                }
                                                else if (this.searchByClientEmail && this.searchByClientEmail.length > 0) {
                                                    this.selectedPerson = this.allPerson.filter(c => c.Email === this.searchByClientEmail)[0];
                                                }

                                                if (this.selectedPerson) {
                                                    this.personName = this.selectedPerson.FirstName + ' ' + this.selectedPerson.LastName;
                                                    //this.proceedToAddAttendee();
                                                    this.searchByClientId = null;
                                                }
                                            }
                                            else {
                                                this.allPerson = [];
                                            }
                                        }
                                        else {
                                            this._messageService.showErrorMessage(response.MessageText);
                                        }
                                    });
                        }
                    }
                    else {
                        this.allPerson = [];
                    }
                });

    }

    setPermission() {
        this.isSaveClientAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveClient);
    }

    setClient(clientId: number, clientName: string) {
        setTimeout(() => {
            this.personName = clientName;
            this.searchPerson.setValue(this.personName.trim());
            this.searchPerson.updateValueAndValidity();
            this.searchByClientId = clientId;
        })
    }

    setClientByEmail(clientEmail: string) {
        setTimeout(() => {
            this.searchPerson.setValue(clientEmail);
            this.searchPerson.updateValueAndValidity();
            this.searchByClientEmail = clientEmail;
        })
    }

    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FullName : undefined;
    }

    searchClassAttendee() {
        this.copyAllAttendees = [];
        this.classDetailObj.ClassID = this.classInfo.ClassID;
        this.searchbookingStatus = ENU_SearchBookingStatusValue.AllExceptCancelled;
        this.getClassAttendanceDetail();
        this.getAllClassAttendees();
    }

    mapSaveAttendeeData(customer: AllPerson) {
        this.saveAttendeeObj.CustomerID = customer.CustomerID;
        this.saveAttendeeObj.CustomerTypeID = customer.CustomerTypeID;
        this.saveAttendeeObj.ClassID = this.classDetailObj.ClassID;
        this.saveAttendeeObj.ClassStartDate = this.classDetailObj.StartDate;
    }

    getAttendeeClasses() {
        let params = {
            startDate: this.classDate
        }
        this._httpService.get(AttendeeApi.getClassesByDate, params)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.isClassesExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isClassesExists) {
                        if (this.classInfo && this.classInfo.ClassID && this.classInfo.ClassID > 0) {
                            this.attendeeClass = data.Result.filter(s => s.ParentClassIsActive != false || s.ClassID == this.classInfo.ClassID);
                        } else {
                            this.attendeeClass = data.Result.filter(s => s.ParentClassIsActive != false);
                        }

                        this.attendeeClass.forEach(element => {
                          element.StartTime = this._dateTimeService.formatTimeString(element.StartTime, this.timeFormat);
                          element.EndTime = this._dateTimeService.formatTimeString(element.EndTime, this.timeFormat);
                        })

                    }
                    else {
                        this.attendeeClass = [];
                        this.classDetailObj = new ClassAttendanceDetail();
                        this.allAttendees = null;
                        this.classInfo.ClassID = null;
                    }
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendee Classes"));
                });
    }

    getClassAttendanceDetail() {
        let url = AttendeeApi.getClassAttendanceDetail.replace("{classID}", this.classInfo.ClassID.toString())
            .replace("{classDate}", this.classDate);
        this._httpService.get(url)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        if (data.Result) {
                            this.isClassAttendanceDetailExists = true;
                            this.classDetailObj = data.Result;
                            this.classDetailObj.StartTime = this._dateTimeService.formatTimeString(this.classDetailObj.StartTime, this.timeFormat);
                            this.classDetailObj.EndTime = this._dateTimeService.formatTimeString(this.classDetailObj.EndTime, this.timeFormat);

                            this.setClassStatus();
                        }
                        else {
                            this.allAttendees = null;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendees"));
                });
    }

    setClassStatus() {
        //this.bookingNotStarted = false;
        if (this.classDetailObj.IsActive) {
            // if (this.classDetailObj.TotalAttendee === this.classDetailObj.AttendeeMax) {
            //     this.classStatus = "Full";
            // }
            // else {
            //     this.classStatus = "Open";
            // }
            switch (this.classDetailObj.Status) {
                case this.classStatusType.BuyNow:
                    this.classStatus = this.classStatusTypeName.Open;
                    break;
                case this.classStatusType.Timeout:
                    this.classStatus = this.classStatusTypeName.Timeout;
                    break;
                case this.classStatusType.Full:
                    this.classStatus = this.classStatusTypeName.Full;
                    break;
                case this.classStatusType.BookingNotStarted:
                    this.classStatus = this.classStatusTypeName.BookingNotStarted;
                    //this.bookingNotStarted = true;
                    break;
            }
        }
        else {
            this.classStatus = "Cancelled"
        }
    }

    proceedToAddAttendee() {
        if (this.classInfo.ClassID && this.classInfo.ClassID > 0) {
            this.mapSaveAttendeeData(this.selectedPerson);
            this.getAttendeesByAttendeeId().then(
                isDuplicate => {
                    if (!isDuplicate) {
                        /*
                            Disabled Book Before and Max Attendee in response to Logged Bugs
                         */
                        //if (this._classValidationsService.isClassBookingValid(this.classDetailObj)) {
                        //if (!this.checkMaxAttendee()) {
                        if (this.selectedPerson.HasMembership) {
                            this.getMemberMemberhispBenefitsDetail(this.selectedPerson);
                        }
                        else {
                            this.openDialog(this.selectedPerson, null);
                        }
                        //}
                        //else {
                        //    this._messageService.showErrorMessage(this.messages.Error.Max_Attendee_Limit);
                        //}
                        //}
                        //else {
                        //    this._messageService.showErrorMessage(this.messages.Validation.Class_BookingTime_Expired);
                        //    this.onClearSelectedClient();
                        //}
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Attendee_Already_Added);
                    }
                }
            );
        }
        else {
            this.onClearSelectedClient();
            this._messageService.showErrorMessage(this.messages.Validation.Select_Class);
        }
    }

    getAllClassAttendees() {
      this.allAttendees = null;
        this.getAttendees().subscribe(
            data => {
                if (data && data.MessageCode > 0) {
                    this.isClassAttendeeExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isClassAttendeeExists) {
                        this.allAttendees = data.Result;
                        //make hard copy for search filtering
                        this.copyAllAttendees = JSON.parse(JSON.stringify(this.allAttendees));
                        this.searchbookingStatus = ENU_SearchBookingStatusValue.AllExceptCancelled;
                        this.onSearchStatusChange();
                        //check if any user allowed then show buttons
                        this.isShowGroupSMS = this.allAttendees.filter(s => s.SMSAllowed).length > 1 ? true : false;
                        this.isShowGroupNotification = this.allAttendees.filter(s => s.AppNotificationAllowed).length > 1 ? true : false;
                        this.isShowGroupEmail = this.allAttendees.filter(s => s.EmailAllowed).length > 1 ? true : false;
                    }
                    else {
                        this.allAttendees = null;
                    }
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendees"));
            });
    }

    getAttendeesByAttendeeId(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getAttendees().toPromise().then(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.isClassAttendeeExists = data.Result != null && data.Result.length > 0 ? true : false;
                        if (this.isClassAttendeeExists) {
                            this.allAttendees = data.Result;

                            //check if any user allowed then show buttons
                            this.isShowGroupSMS = this.allAttendees.filter(s => s.SMSAllowed).length > 1 ? true : false;
                            this.isShowGroupNotification = this.allAttendees.filter(s => s.AppNotificationAllowed).length > 1 ? true : false;
                            this.isShowGroupEmail = this.allAttendees.filter(s => s.EmailAllowed).length > 1 ? true : false;
                        }
                        else {
                            this.allAttendees = null;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(data.MessageText);
                    }

                    return resolve(this.isClassAttendeeExists);
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendees"));
                    return reject(false);
                });
        })
    }

    getAttendees() {
        let attendeeId = this.selectedPerson && this.selectedPerson.CustomerID ? this.selectedPerson.CustomerID.toString() : "0";
        let url = AttendeeApi.getAllClassAttendees.replace("{classID}", this.classInfo.ClassID.toString())
            .replace("{classDate}", this.classDate)
            .replace("{attendeeID}", attendeeId);
        return this._httpService.get(url)
    }

    getMemberMemberhispBenefitsDetail(customer: AllPerson) {
        let params = {
            parentClassId: this.classDetailObj.ParentClassID,
            customerId: customer.CustomerID,
            classDate: this._dateTimeService.convertDateObjToString(this.classDetailObj.StartDate, this.DATE_FORMAT)
        }
        this._httpService.get(AttendeeApi.getMemberClassDetailWithOtherMemberships, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result && response.Result.length > 0) {
                            this.freeClassMemberships = response.Result;
                            var hasCustomerMembershipBenefits = {
                                parentClassId: this.classDetailObj.ParentClassID,
                                customerId: customer.CustomerID,
                                classDate: this._dateTimeService.convertDateObjToString(this.classDetailObj.StartDate, this.DATE_FORMAT),
                                freeClassMemberships: this.freeClassMemberships,
                                classInfo: this.classDetailObj,
                                customerMemberShipID: 0,
                                itemTypeName: 'Class'

                            }
                            const dialogRef = this._openDialog.open(RedeemMembershipComponent, {
                                disableClose: true,
                                data: hasCustomerMembershipBenefits,

                            })
                            dialogRef.componentInstance.membershipSelected.subscribe((customerMembershipId: number) => {
                                if (customerMembershipId && customerMembershipId > 0) {
                                    if (this.freeClassMemberships.length > 0) {
                                        var findSelectedMembershipBenefit = this.freeClassMemberships.find(i => i.CustomerMembershipID == customerMembershipId);
                                        if(findSelectedMembershipBenefit){
                                            this.freeClassMemberships.forEach(element => {
                                                if (element.CustomerMembershipID == customerMembershipId) {
                                                    this.onFocusedOut();
                                                    this.openDialog(customer, element);
                                                }
                                            });
                                        }else{
                                            this.onFocusedOut();
                                            this.openDialog(customer, null);
                                        }

                                    }
                                }
                                // this condition added by fahad as per discussion with sohaib bhai dated on 09/june/2021 (when customer not select membership and closed redeem popup then redierct to payment popup and show full price)
                                //as per discussion with tahir saab(17/03/2022) we are going the change the name of save button to next button and closing the pop up on close button
                                else if (customerMembershipId == null) {
                                    this.onFocusedOut();
                                    this.openDialog(customer, null);
                                }
                            })
                        }
                        else {
                            // this.freeClassMemberships = response.Result;
                            this.openDialog(customer, null);
                        }

                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Free Classes"))
                }
            );
    }

    getMemberClassDetailWithOtherMemberships(attende: AllAttendees, markAttendance: boolean) {
        let params = {
            parentClassId: this.classDetailObj.ParentClassID,
            customerId: attende.CustomerID,
            classDate: this._dateTimeService.convertDateObjToString(this.classDetailObj.StartDate, this.DATE_FORMAT)
        }
        this._httpService.get(AttendeeApi.getMemberClassDetailWithOtherMemberships, params)
            .toPromise()
            .then((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.attendeMemberhsip = response.Result;
                    this.isMemberMembershipExists = this.attendeMemberhsip && this.attendeMemberhsip.length > 1 ? true : false;
                    this.markAttendance(attende, markAttendance);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Free Classes"))
                }
            );
    }
    markAttendance(attende: AllAttendees, markAttendance: boolean) {
        if (this.isMemberMembershipExists) {
            const dialogRef = this._openDialog.open(MemberMemberhshipAttendance, {
                disableClose: true,
                data: this.attendeMemberhsip
            });
            let subse = dialogRef.componentInstance.customerMemberhsipId.subscribe((customerMemberhsipId: number) => {
                if (customerMemberhsipId > 0) {
                    this.markCustomerAttendance(attende.CustomerID, attende.SaleDetailID, attende.IsFree, markAttendance, customerMemberhsipId)
                }
                dialogRef.afterClosed().subscribe(() => {
                    subse.unsubscribe();
                })
            });
        }
        else {
            this.markCustomerAttendance(attende.CustomerID, attende.SaleDetailID, attende.IsFree, markAttendance, attende.CustomerMembershipID)
        }

    }

    openDialogForFreeClass() {
        const dialog = this._openDialog.open(AlertConfirmationComponent);

        dialog.componentInstance.Title = this.messages.Dialog_Title.Book_Free_Class;
        dialog.componentInstance.Message = this.messages.Confirmation.Book_Free_Class;
        dialog.componentInstance.confirmChange.subscribe(isConfirm => {
            if (isConfirm) {
                this.saveFreeClassBooking();
                this.onClearSelectedClient();
            }
            else {
                this.onClearSelectedClient();
            }
        })
    }

    openDialog(person: AllPerson, freeClassMemberships?: FreeClassesMemberships) {
        if (this.classStatus == this.classStatusTypeName.Full && this.classDetailObj.IsClassWaitList) {
            this.openDialogForConfirmationWaitList(person, freeClassMemberships);
        } else {
            this.prepareDataForPayment(person, freeClassMemberships);
        }
    }

    /**Add Attendee to Waitlist***/
    openDialogForConfirmationWaitList(person: AllPerson, freeClassMemberships?: FreeClassesMemberships) {

        const dialogref = this._openDialog.open(WaitlistConfirmationPopupComponent,
            {
                disableClose: true,
            });

        dialogref.componentInstance.isAddedToWailtList.subscribe((isAddedToWailtList: boolean) => {
            if (isAddedToWailtList) {
                this.saveWaitList(person, freeClassMemberships);
            } else {
                this.prepareDataForPayment(person, freeClassMemberships);
            }
        })

    }

    saveWaitList(person: AllPerson, freeClassMemberships?: FreeClassesMemberships) {

        var saveWaitListModel = new WaitListViewModel();

        saveWaitListModel.customerID = person.CustomerID;
        saveWaitListModel.itemID = this.classDetailObj.ClassID;
        saveWaitListModel.itemTypeID = POSItemType.Class;
        saveWaitListModel.startDate = this.classDate;
        saveWaitListModel.customer = null;
        saveWaitListModel.paymentMode = null;
        saveWaitListModel.waitListDetail = new Array<WaitListDetail>();

        var waitListDetail = new WaitListDetail();
        waitListDetail.customerMembershipID = freeClassMemberships && freeClassMemberships.CustomerMembershipID ? freeClassMemberships.CustomerMembershipID : null;
        waitListDetail.itemID = this.classDetailObj.ClassID;
        waitListDetail.itemTypeID = POSItemType.Class;
        waitListDetail.requestDate = this.classDate;
        waitListDetail.startTime = this.classDetailObj.StartTime;
        waitListDetail.endTime = this.classDetailObj.EndTime;

        saveWaitListModel.waitListDetail.push(waitListDetail);

        this._httpService.save(WaitlistAPI.save, saveWaitListModel).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Waitlist"));
                    this.isAttendeeUpdated.emit(true);
                    this.onClearSelectedClient();
                    this.getClassAttendanceDetail();
                    this.saveAttendeeObj = new SaveAttendee();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Waitlist"));
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Waitlist")); }
        )

    }

    onProcessPayment(classAttendeObj: AllAttendees) {
        if(classAttendeObj.BookingStatusTypeID == this.bookingStatusValue.WaitList){
            if (classAttendeObj.CustomerTypeID == CustomerType.Member ) {
                this.redeemMembershipForWaitList(classAttendeObj);
            } else {
                this.onWaitlistToProcessPayment(classAttendeObj);
            }
        } else{
            this.onProcessPartialPayment(classAttendeObj)
        }

    }

    //for unpaid or partialy paid classes
    onProcessPartialPayment(classAttendeObj: AllAttendees){
        let data = {
            saleID: classAttendeObj.SaleID,
            customerId: classAttendeObj.CustomerID
        }

        const dialogRef = this._openDialog.open(SavePartialPaymentComponent, {
            disableClose: true,
            panelClass: 'pos-full-popup',
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Invoie"));
                this.isAttendeeUpdated.emit(true);
                // this.onClearSelectedClient();
                // this.getClassAttendanceDetail();
                this.getAllClassAttendees();
                this.saveAttendeeObj = new SaveAttendee();
            }
        });
    }

    redeemMembershipForWaitList(classAttendeObj: AllAttendees) {

        var customerHasMembershipBenefits = {
            parentClassId: this.classDetailObj.ParentClassID,
            customerId: classAttendeObj.CustomerID,
            classDate: this._dateTimeService.convertDateObjToString(this.classDetailObj.StartDate, this.DATE_FORMAT),
            freeClassMemberships: this.freeClassMemberships,
            classInfo: this.classDetailObj,
            customerMemberShipID: classAttendeObj.CustomerMembershipID,
            itemTypeName: 'Class'
        }
        const redeemDialogRef = this._openDialog.open(RedeemMembershipComponent, {
            disableClose: true,
            data: customerHasMembershipBenefits,
        })

        redeemDialogRef.componentInstance.membershipSelected.subscribe((customerMembershipId: number) => {
            if(customerMembershipId > 0){
            classAttendeObj.CustomerMembershipID = customerMembershipId;
            this.onWaitlistToProcessPayment(classAttendeObj);
            }else if(customerMembershipId != -1){
            classAttendeObj.CustomerMembershipID = null;
            this.onWaitlistToProcessPayment(classAttendeObj);
            }
        })
    }

    onWaitlistToProcessPayment(classAttendeObj: AllAttendees) {

        let personInfo = new AllPerson();
        personInfo.FullName = classAttendeObj.CustomerName;
        personInfo.Mobile = classAttendeObj.Mobile;
        personInfo.Email = classAttendeObj.Email;
        personInfo.CustomerID = classAttendeObj.CustomerID;
        personInfo.CustomerTypeID = classAttendeObj.CustomerTypeID
        personInfo.CustomerTypeName = classAttendeObj.CustomerTypeName;
        personInfo.AllowPartPaymentOnCore = classAttendeObj.AllowPartPaymentOnCore;
        personInfo.IsBlocked = classAttendeObj.IsBlocked;

        if (classAttendeObj.CustomerMembershipID > 0)  {
            this._commonService.getMemberShipBenefits(POSItemType.Class, this.classDetailObj.ParentClassID, classAttendeObj.CustomerMembershipID , this._dateTimeService.convertDateObjToString(this.classDetailObj.StartDate, this.DATE_FORMAT)).subscribe((response: any) => {
                var freeClassMemberships = response.Result;
                freeClassMemberships.IsBenefitSuspended = freeClassMemberships.IsBenefitsSuspended;

                this.prepareDataForPayment(personInfo, freeClassMemberships, classAttendeObj.SaleID);
            })
        } else {
            this.prepareDataForPayment(personInfo, null, classAttendeObj.SaleID)
        }
    }

    prepareDataForPayment(person: AllPerson, freeClassMemberships?: FreeClassesMemberships, waitlistDetailId?: number) {
        let cartItem = new POSCartItem();
        let personInfo = new POSClient();
        this.posCartItems = [];

        personInfo.FullName = person.FullName;
        personInfo.Mobile = person.Mobile;
        personInfo.Email = person.Email;
        personInfo.CustomerID = person.CustomerID;
        personInfo.CustomerTypeID = person.CustomerTypeID
        personInfo.CustomerTypeName = person.CustomerTypeName;
        personInfo.AllowPartPaymentOnCore = person.AllowPartPaymentOnCore;
        personInfo.IsBlocked = person.IsBlocked;

        cartItem.ItemID = this.classDetailObj.ClassID;
        cartItem.ItemTypeID = POSItemType.Class;
        cartItem.ClassEndTime = this.classDetailObj.EndTime;
        cartItem.ClassStartDate = this.classDate;
        cartItem.ClassStartTime = this.classDetailObj.StartTime;
        cartItem.IsFree = false;
        cartItem.Name = this.classDetailObj.ClassName;
        cartItem.Price = this.classDetailObj.PricePerSession;
        cartItem.PricePerSession = this.classDetailObj.PricePerSession;

        //added by fahad after add discount tax null issue fixing
        cartItem.SelectedForPay = true;

        //Comment by fazeel ... 19/10/2020
        // cartItem.TotalTaxPercentage = freeClassMemberships != null && freeClassMemberships.IsMembershipBenefit ?
        //     !freeClassMemberships.IsConsumed && (freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null) && freeClassMemberships.IsFree ?
        //         0 : this.classDetailObj.TotalTaxPercentage : this.classDetailObj.TotalTaxPercentage;
        cartItem.TotalTaxPercentage = this.classDetailObj.TotalTaxPercentage;
        cartItem.TotalDiscount = 0;
        cartItem.ItemDiscountAmount = 0;
        cartItem.Qty = 1;

        cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty);

        // check waitlist class membership benefit
        if (waitlistDetailId > 0 && freeClassMemberships != null && freeClassMemberships.IsMembershipBenefit && !freeClassMemberships.IsBenefitSuspended &&
            (freeClassMemberships.RemainingSession > 0 || freeClassMemberships.NoLimits)) {
            cartItem.DiscountType = freeClassMemberships.MembershipName;
            cartItem.IsMembershipBenefit = freeClassMemberships.IsMembershipBenefit;
            cartItem.IsBenefitsSuspended = freeClassMemberships.IsBenefitSuspended;
            cartItem.IsFree = freeClassMemberships.IsFree;

            if (freeClassMemberships.IsFree) {
                cartItem.TotalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.NoLimits ? 0 : cartItem.PricePerSession;
                cartItem.TotalDiscount = this.classDetailObj.PricePerSession;
                cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                cartItem.CustomerMembershipID = freeClassMemberships.CustomerMembershipID;
                cartItem.Price = cartItem.TotalAmountExcludeTax;

            } else if (!freeClassMemberships.IsFree && freeClassMemberships.DiscountPercentage) {
                // let val = {
                //     PricePerSession: cartItem.PricePerSession,
                //     DiscountPercentage: freeClassMemberships.DiscountPercentage
                // }
                cartItem.DiscountPercentage = freeClassMemberships.DiscountPercentage;
                cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassMemberships.DiscountPercentage) / 100))
                cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                cartItem.TotalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.NoLimits ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
                //Comment by fazeel ... 19/10/2020
                // cartItem.TotalTaxPercentage = this.classDetailObj.TotalTaxPercentage; //this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, cartItem.TotalAmount)
                cartItem.CustomerMembershipID = freeClassMemberships.CustomerMembershipID;
                cartItem.Price = cartItem.TotalAmountExcludeTax;
            }
        } else
            //check simple booking benefit
            if (freeClassMemberships != null && freeClassMemberships.IsMembershipBenefit && !freeClassMemberships.IsBenefitSuspended &&
                (freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null)) {
                cartItem.DiscountType = freeClassMemberships.MembershipName;
                cartItem.IsMembershipBenefit = freeClassMemberships.IsMembershipBenefit;
                cartItem.IsBenefitsSuspended = freeClassMemberships.IsBenefitSuspended;
                cartItem.IsFree = freeClassMemberships.IsFree;

                if (freeClassMemberships.IsFree) {
                    cartItem.TotalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null ? 0 : cartItem.PricePerSession;
                    cartItem.TotalDiscount = this.classDetailObj.PricePerSession;
                    cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                    cartItem.CustomerMembershipID = freeClassMemberships.CustomerMembershipID;
                    cartItem.Price = cartItem.TotalAmountExcludeTax;

                } else if (!freeClassMemberships.IsFree && freeClassMemberships.DiscountPerncentage) {
                    // let val = {
                    //     PricePerSession: cartItem.PricePerSession,
                    //     DiscountPercentage: freeClassMemberships.DiscountPerncentage
                    // }
                    cartItem.DiscountPercentage = freeClassMemberships.DiscountPerncentage;
                    cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassMemberships.DiscountPerncentage) / 100))
                    cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                    cartItem.TotalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
                    //Comment by fazeel ... 19/10/2020
                    // cartItem.TotalTaxPercentage = this.classDetailObj.TotalTaxPercentage; //this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, cartItem.TotalAmount)
                    cartItem.CustomerMembershipID = freeClassMemberships.CustomerMembershipID;
                    cartItem.Price = cartItem.TotalAmountExcludeTax;
                }
            }

        cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
        cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);

        // this line added for membership benifit if benefit apply not change value "TotalAmountExcludeTax" for dicount other wise pos cart item and total due show wrong values added by Fahad dated on 13/09/2021
        cartItem.TotalAmountExcludeTax = cartItem.ItemDiscountAmount > 0 ? this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty) : cartItem.TotalAmountExcludeTax;

        this.posCartItems.push(cartItem);
        this.setSaleClassFinalData(waitlistDetailId);

        if (this.isRewardProgramInPackage) {
            this._commonService.getItemRewardPoints(POSItemType.Class, cartItem.ItemID, personInfo.CustomerID, freeClassMemberships ? freeClassMemberships?.IsFree : false, freeClassMemberships ? freeClassMemberships?.IsBenefitSuspended : false, this.posCartItems[0].CustomerMembershipID && this.posCartItems[0].CustomerMembershipID > 0 ? true : false).subscribe((response: any) => {
                cartItem.AmountSpent = response.Result.AmountSpent;
                cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ? response.Result.MemberBaseEarnPoints : 0;
                cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
                this.saleInvoice.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(personInfo, cartItem);
                this.openDialogForPayment(personInfo, freeClassMemberships, waitlistDetailId);
            })
        } else {
            this.openDialogForPayment(personInfo, freeClassMemberships, waitlistDetailId);
        }
    }

    // waitlistDetailId?: number
    openDialogForPayment(personInfo: POSClient, freeClassMemberships?: FreeClassesMemberships, waitlistDetailId?: number) {

        const dialogref = this._openDialog.open(POSPaymentComponent,
            {
                disableClose: true,
                panelClass: 'pos-full-popup',
                data: {
                    grossAmount: this.posCartItems[0].ItemDiscountAmount > 0 ? this.posCartItems[0].TotalAmountExcludeTax - this.posCartItems[0].ItemDiscountAmount : this.posCartItems[0].TotalAmountExcludeTax,
                    vatTotal: this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, this.posCartItems[0].TotalAmountExcludeTax),
                    cartItems: this.posCartItems,
                    saleInvoice: this.saleInvoice,

                    personInfo: personInfo
                }
            });

        dialogref.componentInstance.paymentStatus.subscribe((isPaid: boolean) => {
            if (isPaid) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attendee"));
                this.isAttendeeUpdated.emit(true);
                this.onClearSelectedClient();
                this.getClassAttendanceDetail();
                this.saveAttendeeObj = new SaveAttendee();
            }
            else{
              this.getAllClassAttendees();
            }
        });
    }

    saveFreeClassBooking() {
        let freeClassModel = new FreeClassBooking();
        freeClassModel.CustomerID = this.saveAttendeeObj.CustomerID;
        freeClassModel.CustomerTypeID = this.personType.Member;
        freeClassModel.ItemID = this.classDetailObj.ClassID;
        freeClassModel.StartDate = this.classDate;

        this._httpService.save(AttendeeApi.saveAttendeeFreeClass, freeClassModel).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attendee"));
                    this.isAttendeeUpdated.emit(true);
                    this.getAllClassAttendees();
                    this.getClassAttendanceDetail();
                    this.saveAttendeeObj = new SaveAttendee();
                }
                else if (res.MessageCode === -166) {
                    this._messageService.showErrorMessage(this.messages.Validation.Class_BookingTime_Expired);
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Attendee"));
                }
            }
        )
    }

    setSaleClassFinalData(waitlistDetailId?: number) {
        this.saleInvoice = new SaleInvoice();
        this.saleInvoice.ApplicationArea = SaleArea.Class;
        this.saleInvoice.SaleDetailList = [];

        this.saleInvoice.CustomerID = this.saveAttendeeObj.CustomerID;
        //this.saleInvoice.CustomerTypeID = this.saveAttendeeObj.CustomerTypeID;

        let saleItem = new POSSaleDetail();
        saleItem.ItemID = this.classDetailObj.ClassID;
        saleItem.ItemTypeID = POSItemType.Class;
        saleItem.Qty = 1;
        //saleItem.StartDate = this._dateTimeService.convertDateObjToString(new Date(this.classDetailObj.StartDate), "yyyy-MM-dd");
        saleItem.StartDate = this.classDate;
        saleItem.CustomerMembershipID = this.posCartItems[0].CustomerMembershipID;
        saleItem.ItemDiscountAmount = this.posCartItems[0].ItemDiscountAmount;

        if (waitlistDetailId) {
            saleItem.WaitListDetailID = waitlistDetailId;
        }

        this.saleInvoice.SaleDetailList.push(saleItem);

    }

    onDelete(classAttendeObj: AllAttendees) {
        if (classAttendeObj.BookingStatusTypeID == this.bookingStatusValue.WaitList) {
            this.deleteWaitListAttendee(classAttendeObj);
        } else {
            this.deleteAttendee(classAttendeObj);
        }
    }

    deleteWaitListAttendee(classAttendeObj: AllAttendees) {
        let param = {
            WaitListDetailID: classAttendeObj.SaleID,
        }

        this.deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(WaitlistAPI.deleteWaitList, param)
                    .subscribe(
                        res => {
                            if (res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Waitlist Attendee"));
                                this.getAllClassAttendees();
                                this.isAttendeeUpdated.emit(true);
                                this.getClassAttendanceDetail();
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Waitlist Attendee"));
                            }
                        },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Waitlist Attendee")); }
                    );
            }
        })
    }

    deleteAttendee(classAttendeObj: AllAttendees) {
        let attendanceModel = new AttendeeClassAttendance();
        attendanceModel.CustomerID = classAttendeObj.CustomerID;
        attendanceModel.SaleDetailID = classAttendeObj.SaleDetailID;
        attendanceModel.ClassID = this.classDetailObj.ClassID;
        attendanceModel.ClassDate = this.classDate;
        attendanceModel.IsFree = classAttendeObj.IsFree;
        attendanceModel.CustomerMembershipID = classAttendeObj.CustomerMembershipID;

        this.deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.save(AttendeeApi.deleteAttendee, attendanceModel)
                    .subscribe(
                        res => {
                            if (res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Attendee"));
                                this.getAllClassAttendees();
                                this.isAttendeeUpdated.emit(true);
                                this.getClassAttendanceDetail();
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Attendee"));
                            }
                        },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Attendee")); }
                    );
            }
        })
    }

    checkMaxAttendee() {
        if (this.classDetailObj.TotalAttendee >= this.classDetailObj.AttendeeMax) {
            this.isMaxAttendeeLimit = true;
            return true;
        }
    }

    async markCustomerAttendance(customerId: number, saleDetailID: number, isFree: boolean, markAttendance: boolean, customerMemberhsipId: number) {
        let attendanceModel = new AttendeeClassAttendance();
        attendanceModel.CustomerID = customerId;
        attendanceModel.IsAttended = markAttendance;
        attendanceModel.SaleDetailID = saleDetailID;
        attendanceModel.ClassID = this.classDetailObj.ClassID;

        //get branch current date
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        //get branch current date
        attendanceModel.ClassDate = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.DATE_FORMAT);

        // attendanceModel.IsFree = isFree;
        attendanceModel.CustomerMembershipID = customerMemberhsipId

        this._httpService.save(AttendeeApi.saveAttendeeAttendance, attendanceModel).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class Attendance"));
                    this.getClassAttendanceDetail();
                    this.isAttendeeUpdated.emit(true);
                    if (this.selectedPerson && this.selectedPerson.CustomerID > 0) {
                        this.getClassAttendanceDetail();
                        this.getAttendeesByAttendeeId()
                    }
                    else {
                        this.getAllClassAttendees();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Class Attendance"));
            }
        )
    }

    openSMSActivityDialoge(classAttendeObj: AllAttendees, isGroup: boolean) {
        if (isGroup) {
            this.openActivityDialoge(this.activityType.GroupSMS, classAttendeObj)
        } else {
            this.openActivityDialoge(this.activityType.SMS, classAttendeObj)
        }

    }

    openEmailActivityDialoge(classAttendeObj: AllAttendees, isGroup: boolean) {
        if (isGroup) {
            this.openActivityDialoge(this.activityType.GroupEmail, classAttendeObj)
        } else {
            this.openActivityDialoge(this.activityType.Email, classAttendeObj)
        }

    }

    openAppNotiActivityDialoge(classAttendeObj: AllAttendees, isGroup: boolean) {
        if (isGroup) {
            this.openActivityDialoge(this.activityType.GroupPushNotification, classAttendeObj)
        } else {
            this.openActivityDialoge(this.activityType.AppNotification, classAttendeObj)
        }

    }

    openActivityDialoge(activityTypeId: number, classAttendeObj: AllAttendees) {
        if (activityTypeId != this.activityType.GroupSMS && activityTypeId != this.activityType.GroupEmail && activityTypeId != this.activityType.GroupPushNotification) {
            let personInfo = new ActivityPersonInfo();
            personInfo.Name = classAttendeObj.CustomerName;
            personInfo.Mobile = classAttendeObj.Mobile;
            personInfo.Email = classAttendeObj.Email;
            this._dataSharingService.shareActivityPersonInfo(personInfo);
        }

        this._openDialog.open(AttendeeNotificationComponent, {
            disableClose: true,
            data: {
                activityTypeId: activityTypeId,
                customerID: classAttendeObj ? classAttendeObj.CustomerID : 0,
                customerTypeID: classAttendeObj ? classAttendeObj.CustomerTypeID : 0,
                classID: this.classInfo.ClassID,
                classDate: this.classInfo.ClassDate
            }
        });
    }

    onDownloadClassAtendeesReport() {
        var invoiceFileName: string = this.attendeeClass.find(ac => ac.ClassID == this.classInfo.ClassID).Name;

        var classStartDate = this._dateTimeService.convertDateObjToString(this.classInfo.ClassDate, this.DATE_FORMAT)
        this._httpService.get(AttendeeApi.GetClassAttendeeReport + this.classInfo.ClassID + "/" + classStartDate)
            .toPromise().then(data => {
                if (data && data.MessageCode > 0) {
                    this._commonService.createPDF(data, invoiceFileName);
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "PDF"));
                }
            });
    }

    // #endregion

    openSubmitCustomerFormDialog(customerId: number, saleDetailID: number, formStatusColor: string) {
        if (formStatusColor && (formStatusColor == 'Red' || formStatusColor == 'Yellow')) {
            const dialogRef = this._openDialog.open(FillFormComponent, {
                disableClose: true,
                data: {
                    saleDetailOrBookingID: saleDetailID,
                    customerID: customerId,
                    isSale: true,
                    dialogtype: 'ManageAttendee'
                }
            });

            dialogRef.componentInstance.onFormSubmittion.subscribe((isSubmitted: boolean) => {
                if (isSubmitted) {
                    this.getAllClassAttendees();
                }
            })
        }
    }
    onViewSale(saleNumber: string, customerId: number, classAttendeObj: AllAttendees) {


        if (saleNumber) {

            const saleReference = saleNumber.split('-');
            const saleNo = saleReference[saleReference.length - 1];

            if (classAttendeObj.CustomerTypeID == CustomerType.Lead) {
                this._router.navigate([`lead/details/${customerId}/invoice-history`], { queryParams: { saleNo } })
            } else if (classAttendeObj.CustomerTypeID == CustomerType.Client) {
                this._router.navigate([`customer/client/details/${customerId}/invoice-history`], { queryParams: { saleNo } })
            } else {
                this._router.navigate([`customer/member/details/${customerId}/invoice-history`], { queryParams: { saleNo } })
            }

            var personInfo = new PersonInfo();
            personInfo.PersonID = customerId;
            personInfo.PersonTypeID = classAttendeObj.CustomerTypeID;

            this._dataSharingService.sharePersonInfo(personInfo);

        }
    }
}

/** Angular Modules */
import { Component, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/** Services & Models */
import { AllAttendees, SaveAttendee, AttendeeClass, ClassAttendanceDetail, ClassInfo, AttendeeClassAttendance, AttendeMemberhsip, CancelationPolicyDetails } from '@app/models/attendee.model';
import { AllPerson, ApiResponse, DD_Branch } from '@models/common.model';
import { CommonService } from '@app/services/common.service';

import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@services/date.time.service';
import { DataSharingService } from '@app/services/data.sharing.service';

/**components**/
import { CancelBookingComponent } from '@app/shared/components/cancel-booking/cancel.booking.component';
import { NoShowBookingComponent } from '@app/shared/components/noshow-booking/noshow.booking.component';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { MemberMemberhshipAttendance } from '@app/shared/components/member-memberhsip-attendance/member-membership-attendance';

/** Configurations */
import { Configurations, ClassStatusName } from '@helper/config/app.config';
import { EnumBookingStatusType, ClassStatus, EnumSaleStatusType, ENU_DateFormatName, EnumSaleSourceType, ENU_CancelItemType, ENU_BookingStatusValue, ENU_BookingStatusOption, ENU_SearchBookingStatusValue, ENU_SearchBookingStatusOption, ENU_CancellationDurationType, ENU_DurationType } from '@helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { AttendeeApi } from '@app/helper/config/app.webapi';
import { ImagesPlaceholder } from '@app/helper/config/app.placeholder';
import { environment } from '@env/environment';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AppUtilities } from '@app/helper/aap.utilities';


@Component({
    selector: 'pos-class-attendance',
    templateUrl: './pos.class.attendance.component.html',
})

export class POSClassAttendanceComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Variables
    searchbookingStatus:number = ENU_SearchBookingStatusValue.All;
    canbookingStatusChange : boolean ;
    hasClassAlreadyStarted : any ;
    isEarlyCancellation : boolean = false ;
    isClassSearch: boolean = false;

    /** Scope Variables */
    classStatus: string = "";
    classSearchDate: any;
    isClassesExists: boolean = false;
    isClassAttendeeExists: boolean = false;
    isClassAttendanceDetailExists: boolean = false;
    searchText: string = '';
    currencyFormat: string;
    isMemberMembershipExists: boolean = false;

    /*********** Collections *********/
    allAttendees: AllAttendees[];
    copyAllAttendees:AllAttendees[];
    searchDropDownClasses: AttendeeClass[];
    attendeMemberhsip: AttendeMemberhsip[];
    bookingStatusOptions : any = []

    /** Models & References */
    classSearchObj: ClassInfo;
    selectedPerson: AllPerson;
    saveAttendeeObj: SaveAttendee;
    classAttendanceDetail: ClassAttendanceDetail = new ClassAttendanceDetail();
    _bookingCancelationDetail : CancelationPolicyDetails =  new CancelationPolicyDetails();


    /****** Configurations, Messges & Constants */
    private readonly DATE_FORMAT = "yyyy-MM-dd";
    //dateFormatForSearch = Configurations.NotficationDateTimeFormat
    classBookingStatusType = EnumBookingStatusType; // Used on HTML file
    serverImageAddress = environment.imageUrl;
    messages = Messages;
    timeFormat = Configurations.TimeFormatView;
    dateFormForView: string = "";//Configurations.DateFormat;
    dateTimeFormat: string;

    classStatusType = ClassStatus;
    classStatusTypeName = ClassStatusName;
    saleStatusType = EnumSaleStatusType;
    bookingType = ENU_CancelItemType;
    bookingStatusValue = ENU_BookingStatusValue;
    bookingStatusOption = ENU_BookingStatusOption;
    searchBookingStatusValue = ENU_SearchBookingStatusValue;
    searchBookingStatusOption = ENU_SearchBookingStatusOption;
    _durationType = ENU_DurationType

    //add for zone issue set branch current date in calender added by fahad
    minDate: Date = new Date();

    //  // DropDown list
    //  bookingStatusOptions = [
    //     { BookingStatusTypeID:this.bookingStatusValue.Present, BookingStatusTypeName: this.bookingStatusOption.Present },
    //     { BookingStatusTypeID:this.bookingStatusValue.NoShow, BookingStatusTypeName: this.bookingStatusOption.NoShow },
    //     { BookingStatusTypeID:this.bookingStatusValue.Cancelled, BookingStatusTypeName: this.bookingStatusOption.Cancelled},
    // ];

    searchBookingStatusOptions = [
        { BookingStatusTypeID:this.searchBookingStatusValue.All, BookingStatusTypeName: this.searchBookingStatusOption.All },
        { BookingStatusTypeID:this.searchBookingStatusValue.AllExceptCancelled, BookingStatusTypeName: this.searchBookingStatusOption.AllExceptCancelled },
        { BookingStatusTypeID:this.searchBookingStatusValue.Present, BookingStatusTypeName: this.searchBookingStatusOption.Present },
        { BookingStatusTypeID:this.searchBookingStatusValue.NoShow, BookingStatusTypeName: this.searchBookingStatusOption.NoShow},
        { BookingStatusTypeID:this.searchBookingStatusValue.Cancelled, BookingStatusTypeName: this.searchBookingStatusOption.Cancelled},
        { BookingStatusTypeID:this.searchBookingStatusValue.WaitList, BookingStatusTypeName: this.searchBookingStatusOption.WaitList},
    ];
    // #endregion

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _openDialog: MatDialogService,
        private _dialogRef: MatDialogRef<POSClassAttendanceComponent>,
        private _commonService: CommonService,

    ) {
        super();
        this.getBranchDatePattern();
    }

    /** LifeCycle Hooks */

    ngOnInit(): void {

        if (!this.classSearchObj) {
            this.classSearchObj = new ClassInfo();
        }
        this.getDefaultDataOnPageLoad();

    }



    /** Events */

    // first we check class is started or not if hasClassAlreadyStarted == false then we call the setCancellationFlag to check the class is earlyu7 cancel or late cancel
    classCancellationEarlyOrLate(allAttendees: AllAttendees[]) {
        this.hasClassAlreadyStarted = this._commonService.isClassStarted(allAttendees[0]);
        if (this.hasClassAlreadyStarted == false) {
            // if it returns true then falls in early cancellation and else late cancellation
            this.canbookingStatusChange = this.setCancelationFlag(allAttendees[0])
            this.isEarlyCancellation = this.canbookingStatusChange == true ? true :false
            // here we assign the true to canbookingStatusChange because in case of early and late cancellation we have to enable the cancel and no show button
            this.canbookingStatusChange = true ;
        }
        else {
            this.canbookingStatusChange = false
        }
    }

    onBookingStatusChange(attendeeObj: any) {

        let cancelNoShowData = this.mapBookingStatusChangeData(attendeeObj);
        //here we check if the late cancellation policy is off and we have cancelbefore and our case fall in late cancellation window then we only show this msg
        if(!this.isEarlyCancellation && !attendeeObj.ClassCancellationLate){
            this.searchClassAttendee();
            if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.NoShow) {
                this._messageService.showWarningMessage(this.messages.Generic_Messages.CancellationOrNoShowTimeHasPassed.replace('{0}', 'No Show'));
            }else{
                this._messageService.showWarningMessage(this.messages.Generic_Messages.CancellationOrNoShowTimeHasPassed.replace('{0}', 'Cancellation'));
            }
        }else{

        if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.NoShow) {
        /*////if "No Show" policy is ON in configuration settings*/
            if (attendeeObj.ClassNoShowFee) {
                //if class NO SHOW charges and amount paid are 0 then we only change the status
                if (attendeeObj.ClassNoShowCharges == 0 && attendeeObj.AmountPaid == 0) {
                    this.onlyBookingStatusChange(attendeeObj)
                } else {
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
                }
            }
            else {
                this.onlyBookingStatusChange(attendeeObj)
            }
        }
        else if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.Cancelled) {
            /*////if cancellation policy is ON and Early OR Late cancellation is also ON */
            if (attendeeObj.IsClassCancellationPolicy && (attendeeObj.ClassCancellationEarly || attendeeObj.ClassCancellationLate)) {
                // after checking the cancelltion policy for class here we check the amountpaid and cancellation charges( if they both are 0 then we only change the service status)
                if (attendeeObj.ClassCancellationLateCharges == 0 && attendeeObj.AmountPaid == 0) {
                    this.onlyBookingStatusChange(attendeeObj)
                }
                else {
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
                }
            }
            else {
                this.onlyBookingStatusChange(attendeeObj)
            }
        }

        else {
            this.onlyBookingStatusChange(attendeeObj)
        }
    }
}

   mapBookingStatusChangeData(attendeeObj){
    var Data = {
        CustomerID : attendeeObj.CustomerID,
        CustomerTypeId: attendeeObj.CustomerTypeID,
        CancelbookingType: this.bookingType.Class,
        IsCancellationFeeInPercentage: attendeeObj.IsClassCancellationLateFlatFee == false ? true : false,
        // NoShowCharges :attendeeObj.ClassNoShowCharges,
        NoShowCharges : attendeeObj.ClassNoShowCharges,
        CancellationCharges : this.isEarlyCancellation == true ? 0 : attendeeObj.ClassCancellationLateCharges,
        OldTotalDue : attendeeObj.TotalDue,
        AmountPaid : attendeeObj.AmountPaid,
        ItemDiscountedPrice : attendeeObj.ItemDiscountedPrice,
        SaleID : attendeeObj.SaleID,
        SaleDetailID :attendeeObj.SaleDetailID,
        ItemID : attendeeObj.ItemID,
        IsClassAttendance : true,
        IsEarlyCancellation : this.isEarlyCancellation == true ? true : false,
        CancellationLate : attendeeObj.ClassCancellationLate,
        CancellationEarly : attendeeObj.ClassCancellationEarly,
        EarlyCancellationText : attendeeObj.ClassCancellationEarlyDisplayText,
        LateCancellationText : attendeeObj.ClassCancellationLateDisplayText,
    }
        return Data;
}
   //we are calling this function when cancellation policy in off in configuration and cancellation charges are zero(0)
   onlyBookingStatusChange(attendeeObj:any){
    const dialog = this._openDialog.open(AlertConfirmationComponent);
    dialog.componentInstance.Title = this.messages.Dialog_Title.Alert;
    dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Alter_Service_Status;
    dialog.componentInstance.isChangeIcon = true;
    dialog.componentInstance.showButton = true;
    dialog.componentInstance.showConfirmCancelButton = true;
    dialog.componentInstance.confirmChange.subscribe(isConfirm => {
        if (isConfirm) {
            let params = {
            AppSourceTypeID : EnumSaleSourceType.OnSite,
            StatusTypeID : attendeeObj.BookingStatusTypeID,
            CustomerID : attendeeObj.CustomerID,
            SaleId : attendeeObj.SaleID,
            SaleDetailID : attendeeObj.SaleDetailID,
            CustomerBookingID : null
            }
            this._httpService.save(AttendeeApi.updateAttendeeStatus, params)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.searchClassAttendee();
                    if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.Cancelled) {
                        this._messageService.showSuccessMessage(this.messages.Success.Booking_Cancel_Successfully.replace("{0}","Class" ));
                    }
                    if (attendeeObj.BookingStatusTypeID == this.bookingStatusValue.NoShow) {
                        this._messageService.showSuccessMessage(this.messages.Success.Booking_NoShow_Successfully.replace("{0}","Class"));
                    }                }
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
onSearchStatusChange(){
    var copyAllAttendees =  JSON.parse(JSON.stringify(this.copyAllAttendees));

    if(this.searchbookingStatus == ENU_SearchBookingStatusValue.All){
        this.allAttendees = [] = copyAllAttendees;
        this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;
    }
    else if(this.searchbookingStatus == ENU_SearchBookingStatusValue.AllExceptCancelled){
        this.allAttendees = [] = copyAllAttendees.filter(( s => s.BookingStatusTypeID != ENU_SearchBookingStatusValue.Cancelled ));
        this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;
    }
    else{
        this.allAttendees = [] = copyAllAttendees.filter(( s => s.BookingStatusTypeID === this.searchbookingStatus));
        this.isClassAttendeeExists = this.allAttendees != null && this.allAttendees.length > 0 ? true : false;

    }
    if(this.allAttendees.length > 0){
    this.allAttendees.forEach(attendee => {
        if (attendee.ImagePath && attendee.ImagePath != '')
            attendee.ImagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setCustomerImagePath()) + attendee.ImagePath;
        else
            attendee.ImagePath = ImagesPlaceholder.user;
    })
}
}
    onDateChange(date: any) {
        setTimeout(() => {
            this.classSearchDate = date;
            this.classSearchObj.ClassID = 0;
            this.allAttendees = null;
            this.isClassAttendeeExists = false;
            this.isClassSearch = false;
            this.getClassesByDate();
        });
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
    }

    /** Methods */
    async getBranchDatePattern() {
        this.dateFormForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        var branchTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.bookingStatusOptions = await this._commonService.setCancellationPackagePermission()
        this.dateTimeFormat = this.dateFormForView + ' | ' + branchTimeFormat;

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    async getDefaultDataOnPageLoad() {

        //set branch date time added by fahad for browser different time zone issue resolving
        this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.classSearchObj.ClassDate = this.minDate
        this.classSearchDate = this.minDate;
        this.getClassesByDate();
    }

    getClassesByDate() {
        let params = {
            startDate: this._dateTimeService.convertDateObjToString(this.classSearchDate, this.DATE_FORMAT) // 07-05-2018 12:33
        }
        this._httpService.get(AttendeeApi.getClassesByDate, params)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.isClassesExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isClassesExists) {
                        this.searchDropDownClasses = data.Result.filter(s => s.ParentClassIsActive != false);
                    }
                    else {
                        this.searchDropDownClasses = [];
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

        let url = AttendeeApi.getClassAttendanceDetail.replace("{classID}", this.classSearchObj.ClassID.toString())
            .replace("{classDate}", this._dateTimeService.convertDateObjToString(this.classSearchDate, this.DATE_FORMAT));
        this._httpService.get(url)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        if (data.Result) {
                            this.isClassAttendanceDetailExists = true;
                            this.classAttendanceDetail = data.Result;
                            this.classAttendanceDetail.StartTime = this._dateTimeService.formatTimeString(this.classAttendanceDetail.StartTime, this.timeFormat);
                            this.classAttendanceDetail.EndTime = this._dateTimeService.formatTimeString(this.classAttendanceDetail.EndTime, this.timeFormat);

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

    getMemberClassDetailWithOtherMemberships(attende: AllAttendees, markAttendance: boolean) {
        let params = {
            parentClassId: this.classAttendanceDetail.ParentClassID,
            customerId: attende.CustomerID,
            classDate:this._dateTimeService.convertDateObjToString(new Date, this.DATE_FORMAT)
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

    setClassStatus() {
        if (this.classAttendanceDetail.IsActive) {
            // if (this.classAttendanceDetail.TotalAttendee === this.classAttendanceDetail.AttendeeMax) {
            //     this.classStatus = "Full";
            // }
            // else {
            //     this.classStatus = "Open";
            // }
            switch (this.classAttendanceDetail.Status) {
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
            }
        }
        else {
            this.classStatus = "Cancelled"
        }
    }

    getAttendees() {
        let attendeeId = this.selectedPerson && this.selectedPerson.CustomerID ? this.selectedPerson.CustomerID.toString() : "0";
        let url = AttendeeApi.getAllClassAttendees.replace("{classID}", this.classSearchObj.ClassID.toString())
            .replace("{classDate}", this._dateTimeService.convertDateObjToString(this.classSearchDate, this.DATE_FORMAT))
            .replace("{attendeeID}", attendeeId);
        return this._httpService.get(url)
    }

    getAllClassAttendees() {
        this.getAttendees().subscribe(
            data => {
                if (data && data.MessageCode > 0) {
                    this.isClassAttendeeExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isClassAttendeeExists) {
                        this.allAttendees = data.Result;

                        this.copyAllAttendees = JSON.parse(JSON.stringify(data.Result));


                        this.classCancellationEarlyOrLate(this.allAttendees)
                        this.allAttendees.forEach(attendee => {
                            if (attendee.ImagePath && attendee.ImagePath != '')
                                attendee.ImagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setCustomerImagePath()) + attendee.ImagePath;
                            else
                                attendee.ImagePath = ImagesPlaceholder.user;
                        })
                        this.searchbookingStatus = ENU_SearchBookingStatusValue.AllExceptCancelled;
                        this.onSearchStatusChange();
                    }
                    else {
                        this.allAttendees = null;
                    }
                    this.isClassSearch = true;
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendees"));
            });

    }

    searchClassAttendee() {
        this.copyAllAttendees = [];
        this.searchbookingStatus = ENU_SearchBookingStatusValue.AllExceptCancelled;

        this.classAttendanceDetail.ClassID = this.classSearchObj.ClassID;

        this.getClassAttendanceDetail();
        this.getAllClassAttendees();


    }

    async markCustomerAttendance(customerId: number, saleDetailID: number, isFree: boolean, markAttendance: boolean, customerMemberhsipId: number) {
        let attendanceModel = new AttendeeClassAttendance();
        attendanceModel.CustomerID = customerId;
        attendanceModel.IsAttended = markAttendance;
        attendanceModel.SaleDetailID = saleDetailID;
        attendanceModel.ClassID = this.classSearchObj.ClassID;
        //get branch current date
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        attendanceModel.ClassDate = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.DATE_FORMAT);
        attendanceModel.IsFree = isFree;
        attendanceModel.CustomerMembershipID = customerMemberhsipId

        this._httpService.save(AttendeeApi.saveAttendeeAttendance, attendanceModel).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class Attendance"));
                    this.getClassAttendanceDetail();
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

    getAttendeesByAttendeeId(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getAttendees().toPromise().then(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.isClassAttendeeExists = data.Result != null && data.Result.length > 0 ? true : false;
                        if (this.isClassAttendeeExists) {
                            this.allAttendees = data.Result;

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

    searchAttendee(searchText: string) {

        this.allAttendees = this.allAttendees.filter((attendee: AllAttendees) => {
            attendee.CustomerName == searchText
        })

    }

    setCancelationFlag(attendess: AllAttendees) {
            if (attendess.StartDate && attendess.StartTime && attendess.CancelBefore > 0 && attendess.CancelBeforeDurationTypeID > 0 && (attendess.ClassCancellationEarly || attendess.ClassCancellationLate)) {

                return (this.canCancelCustomerBooking(attendess)) ? attendess.CanCancelBooking = true : attendess.CanCancelBooking = false;
            }
            else {

                if (attendess.ClassCancellationEarly && attendess.ClassCancellationLate) {
                    return attendess.CanCancelBooking = true;
                }
                else if (attendess.ClassCancellationEarly && !attendess.ClassCancellationLate) {
                   return attendess.CanCancelBooking = true;
                }
                else {
                   return attendess.CanCancelBooking = false;
                }
            }
    }

    /* Method to check the validity for canceling a booking */
    canCancelCustomerBooking(attendess: AllAttendees): boolean {
            let cancelDetail = new CancelationPolicyDetails();
            cancelDetail.StartDate = attendess.StartDate;
            cancelDetail.StartTime = attendess.StartTime;
            cancelDetail.CancelBefore = attendess.CancelBefore;
            cancelDetail.CancelBeforeDurationTypeID = attendess.CancelBeforeDurationTypeID;
            return (this._commonService.isBookingCancelValid(cancelDetail)) ? true : false;
    }




}

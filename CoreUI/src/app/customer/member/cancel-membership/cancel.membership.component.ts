/****************** Angular References **********/
import { Component, Input, Output, EventEmitter, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SubscriptionLike as ISubscription } from "rxjs";

/**************** Services & Models ***************/
/* Services */
import { MemberMembershipApi } from '@app/helper/config/app.webapi';
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";

/* Models */
import { CancelMembership, CancelMembershipReasons } from "@customer/member/models/member.membership.model";
import { ApiResponse } from "@app/models/common.model";
import { Messages } from "@app/helper/config/app.messages";

/************** Configurations **************/
import { Configurations } from "@app/helper/config/app.config";
import { DataSharingService } from "@app/services/data.sharing.service";
import { DateTimeService } from "@app/services/date.time.service";
import { ENU_CancelMembershipReasons } from "@app/helper/config/app.enums";

@Component({
    selector: 'cancel-membership',
    templateUrl: './cancel.membership.component.html'
})

export class CancelMembershipComponent {
    @Input() Title: string;
    @Input() Message: string;
    hasCancellationReasons: boolean = false;
    @Output()
    confirmChange = new EventEmitter<any>();
    @Output()
    isClosedConfirmed = new EventEmitter<any>();

    customerID: number;
    cancelReasonId: number = 0;
    customerMembershipID: number;
    currentDate: Date = new Date();
    minDate: Date = new Date();
    maxDate: Date;

    /* Model References */
    cancelMembershipModel: CancelMembership = new CancelMembership();
    reasonsList: CancelMembershipReasons[] = [];

    /* Configurations */
    memberIdSubscription: ISubscription;
    dateFormat = Configurations.DateFormat;
    enu_CancelMembershipReasons = ENU_CancelMembershipReasons;

    /* Messages */
    messages = Messages;

    // #endregion

    constructor(
        private _dialogRef: MatDialogRef<CancelMembershipComponent>,
        private _memberMembershipService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        @Inject(MAT_DIALOG_DATA) public customerMembershipInfo: any) { }

    ngOnInit() {
        this.memberIdSubscription = this._dataSharingService.customerID.subscribe(customerID => {
            if (customerID > 0) {
                this.customerID = customerID;
            }
        });
        this.setCalendarMinimumDate();
        this.setMembershipConfigurations();
        this.membershipCancellationDateForAutoRoll();

        this.getMembershipCancellationReasons();
        this.onMemCancellationReasonsChange();
    }

    // #region Events

    onCancellationReasonsUpdated() {
        this.cancelMembershipModel.MembershipCancellationReason = this.cancelMembershipModel.MembershipCancellationReason.trim();
    }

    onStatusChange() {
        if (!this.cancelMembershipModel.CancelMembershipNow) {
            this.cancelMembershipModel.CancelMembershipNow = false;
        }
    }

    onMemCancellationReasonsChange() {
        if (this.enu_CancelMembershipReasons.Others == this.cancelMembershipModel.MembershipCancellationReasonTypeID) {
            this.hasCancellationReasons = true;
        }
        else {
            this.hasCancellationReasons = false;
            this.cancelMembershipModel.MembershipCancellationReason = null;
        }
    }

    onSaveCancelMembership() {
        if (this.cancelMembershipModel.MembershipCancellationReason == '' || this.cancelMembershipModel.MembershipCancellationReason == undefined && this.hasCancellationReasons) {
            this._messageService.showErrorMessage(this.messages.Error.Cancelled_Reasons);
        }
        else {
            let cancelMembership = {
                IsMembershipCancelNow: this.cancelMembershipModel.CancelMembershipNow,
                MembershipCancellationReasonTypeID: this.cancelMembershipModel.MembershipCancellationReasonTypeID,
                MembershipCancellationReason: this.cancelMembershipModel.MembershipCancellationReason ? this.cancelMembershipModel.MembershipCancellationReason : ""
            }
            if (!this.cancelMembershipModel.CancelMembershipNow) {
                this.scheduleMembershipForCancel();
                // setTimeout(() => {
                //     this.confirmChange.emit(cancelMembership);
                // });
            }
            else {
                this.cancelMembershipModel.ScheduledCancellationDate = null;
                this.confirmChange.emit(cancelMembership);
            }
            this.closePopup();
        }
    }

    onCancellationDateChange(date: any) {
        setTimeout(() => {
            this.cancelMembershipModel.ScheduledCancellationDate = date;
        });
    }

    onClose() {
        this.closePopup();
    }

    // #endregion

    // #region Methods

    getMembershipCancellationReasons() {
        this._memberMembershipService.get(MemberMembershipApi.getMembershipCancellationReasons)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.reasonsList = response.Result;
                    this.cancelMembershipModel.MembershipCancellationReasonTypeID = this.customerMembershipInfo.membershipCancellationReasonTypeID ? this.customerMembershipInfo.membershipCancellationReasonTypeID : this.reasonsList[0].MembershipCancellationReasonTypeID;
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Cancellation reasons"));
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Cancellation reasons"));
                }
            );
    }

    async setCalendarMinimumDate() {
        this.minDate = await this._dateTimeService.getBranchTomorrowDate();
        this.cancelMembershipModel.ScheduledCancellationDate = this.customerMembershipInfo.scheduledCancellationDate ? this.customerMembershipInfo.scheduledCancellationDate : this.minDate;
    }

    setMembershipConfigurations() {
        this.cancelMembershipModel.CustomerMembershipID = this.customerMembershipInfo.customerMembershipID;
        this.cancelMembershipModel.CancelMembershipNow = this.customerMembershipInfo.scheduledCancellationDate == null || this.customerMembershipInfo.scheduledCancellationDate == "" ? true : false;
        this.cancelMembershipModel.ScheduledCancellationDate = this.customerMembershipInfo.scheduledCancellationDate ? this.customerMembershipInfo.scheduledCancellationDate : this.minDate;
        this.cancelMembershipModel.MembershipCancellationReasonTypeID = this.customerMembershipInfo.membershipCancellationReasonTypeID;
        this.cancelMembershipModel.MembershipCancellationReason = this.customerMembershipInfo.membershipCancellationReason;
    }

    membershipCancellationDateForAutoRoll() {
        if (this.customerMembershipInfo.isAutoRoll == true) {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            this.maxDate = new Date(year + 5, month, day);
        } else {
            this.maxDate = this.customerMembershipInfo.membershipEndDate;
            this.maxDate = this.customerMembershipInfo.membershipEndDate ? this.customerMembershipInfo.membershipEndDate : this.cancelMembershipModel.ScheduledCancellationDate;
        }
    }

    scheduleMembershipForCancel() {
        let params = {
            customerMembershipID: this.cancelMembershipModel.CustomerMembershipID,
            customerID: this.customerID,
            scheduledCancellationDate: this._dateTimeService.convertDateObjToString(this.cancelMembershipModel.ScheduledCancellationDate, this.dateFormat),
            membershipCancellationReasonTypeID: this.cancelMembershipModel.MembershipCancellationReasonTypeID,
            membershipCancellationReason: this.cancelMembershipModel.MembershipCancellationReason ? this.cancelMembershipModel.MembershipCancellationReason : ""
        }

        this._memberMembershipService.get(MemberMembershipApi.cancelMembership, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Sch_Membership_Cancel_Success);
                    this._dataSharingService.shareCancelledMembershipStatus(true);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Scheduling Membership for cancellation")); }
            );
    }

    closePopup() {
        this._dialogRef.close();
        // this.isClosedConfirmed.emit(true);
    }

    // #endregion
}
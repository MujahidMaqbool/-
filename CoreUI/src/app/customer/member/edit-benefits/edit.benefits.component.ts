/****************** Angular References **********/
import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { HttpService } from "@app/services/app.http.service";

/**************** Services & Models ***************/
import { UpdateMemberBenefits } from "../models/member.membershipBenefits.model";
import { MemberPaymentsApi, MemberMembershipApi } from "@app/helper/config/app.webapi";
import { ApiResponse } from "@app/models/common.model";
import { MessageService } from "@app/services/app.message.service";
import { Messages } from "@app/helper/config/app.messages";
import { NumberValidator } from "@app/shared/helper/number.validator";
import { FormControl } from "@angular/forms";

/************** Configurations **************/

@Component({
    selector: 'edit-benefits',
    templateUrl: './edit.benefits.component.html'
})

export class EditBenefitsComponent {

    @Output()
    isConfirm = new EventEmitter<boolean>();

    /** models **/
    memberMembershipBenefits: UpdateMemberBenefits = new UpdateMemberBenefits();
    messages = Messages;
    benefitsRemaining: number = 0;
    benefitsAllowed: number = 0;
    isFormEdit: boolean = false;

    numberValidator: NumberValidator = new NumberValidator();
    sessionAllowed: FormControl = new FormControl();
    sessionConsumed: FormControl = new FormControl();

    // #endregion

    constructor(
        private _dialog: MatDialogService,
        private _httpService: HttpService,
        private _messagesService: MessageService,
        private _dialogRef: MatDialogRef<EditBenefitsComponent>,
        @Inject(MAT_DIALOG_DATA) public membershipBenefits: any
    ) {

    }

    ngOnInit() {
        this.memberMembershipBenefits = this.membershipBenefits;
        this.memberMembershipBenefits.MembershipTotalSessions = this.memberMembershipBenefits.MembershipTotalSessions ? this.memberMembershipBenefits.MembershipTotalSessions : 0;
        this.memberMembershipBenefits.SessionAllowed = this.memberMembershipBenefits.SessionAllowed ? this.memberMembershipBenefits.SessionAllowed : 0;
        this.memberMembershipBenefits.SessionConsumed = this.memberMembershipBenefits.SessionConsumed ? this.memberMembershipBenefits.SessionConsumed : 0;
        this.benefitsAllowed = this.memberMembershipBenefits.MembershipTotalSessions + this.memberMembershipBenefits.SessionAllowed;
        this.benefitsRemaining = this.memberMembershipBenefits.MembershipTotalSessions - this.memberMembershipBenefits.SessionConsumed;
    }

    // #region Events

    updateBenefits() {
        let param = {
            CustomerMembershipBenefitsID: this.memberMembershipBenefits.CustomerMembershipBenefitsID,
            CustomerMembershipBenefitsDetailID: this.memberMembershipBenefits.CustomerMembershipBenefitsDetailID,
            Notes: this.memberMembershipBenefits.Notes,
            SessionConsumed: this.memberMembershipBenefits.SessionConsumed == null ? 0 : this.memberMembershipBenefits.SessionConsumed,
            TotalSessions: this.memberMembershipBenefits.SessionAllowed == null ? 0 : this.memberMembershipBenefits.SessionAllowed,
            ItemTypeID: this.memberMembershipBenefits.ItemTypeID,
            ItemID: this.memberMembershipBenefits.ItemID,
            MembershipBenefitTypeID: this.memberMembershipBenefits.MembershipBenefitTypeID,
            CustomerMembershipID: this.memberMembershipBenefits.CustomerMembershipID,
            BranchID: this.memberMembershipBenefits.BranchID,            

        }
        // if (this.memberMembershipBenefits.SessionConsumed <= this.memberMembershipBenefits.SessionAllowed) {
            this._httpService.save(MemberMembershipApi.updateMemberMembershipBenefitsSession, param).subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this._messagesService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Benefits"));
                    this.isConfirm.emit(true);
                    this.onClose();
                } else {
                    this._messagesService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this.isConfirm.emit(false);
                    this._messagesService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Benefits"));
                }
            );
        // } else {
        //     this._messagesService.showErrorMessage(this.messages.Error.Consumed_Allowed_Seesion);
        // }
    }

    preventNegtiveValue(event: any) {
        return event.keyCode == 189 || event.keyCode == 110 || event.keyCode == 107 || event.keyCode == 109 || event.keyCode == 16 ? false : true;
    }

    onClose(): void {
        this._dialogRef.close();
    }

    onLeaveTextBox() {
        this.memberMembershipBenefits.SessionConsumed = this.memberMembershipBenefits.SessionConsumed != null ? this.memberMembershipBenefits.SessionConsumed : 0;
    }

    onChangePBRO(num) {
        setTimeout(() => {
            this.memberMembershipBenefits.SessionAllowed = this.numberValidator.NotAllowDecimalValue(num);
            this.benefitsAllowed = Number(this.memberMembershipBenefits.MembershipTotalSessions) + Number(this.memberMembershipBenefits.SessionAllowed);
            this.benefitsRemaining = Number(this.benefitsAllowed) - Number(this.memberMembershipBenefits.SessionConsumed);
        }, 10);

    }

    onChangeBC(num) {
        setTimeout(() => {
            this.memberMembershipBenefits.SessionConsumed = this.numberValidator.NotAllowDecimalValue(num);
            this.memberMembershipBenefits.SessionConsumed = this.memberMembershipBenefits.SessionConsumed > this.benefitsAllowed ? this.benefitsAllowed : this.memberMembershipBenefits.SessionConsumed;
            this.benefitsRemaining = Number(this.benefitsAllowed) - Number(this.memberMembershipBenefits.SessionConsumed);
        }, 10);

    }

    hasFieldsUpdated(){
        this.isFormEdit =true;
    }

    // #endregion
}
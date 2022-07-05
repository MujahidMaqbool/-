/****************** Angular References **********/
import { Component, OnInit, Inject, EventEmitter, Output, ɵConsole } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";

/**************** Services & Models ***************/

import { MemberPaymentsApi, MemberMembershipApi } from "@app/helper/config/app.webapi";
import { HttpService } from "@app/services/app.http.service";
import { ApiResponse } from "@app/models/common.model";
import { MemberBenefitsVM } from "@customer/member/models/member.membershipBenefits.model";

/************** Configurations **************/
import { ENU_BenefitsType, ENU_MemberShipBenefitsName } from "@app/helper/config/app.enums";
import { Configurations } from "@app/helper/config/app.config";
import { MessageService } from "@app/services/app.message.service";
import { Messages } from "@app/helper/config/app.messages";

@Component({
    selector: 'suspend-benefits',
    templateUrl: './suspend.benefits.component.html'
})

export class SuspendBenefitsComponent {

    @Output()
    isConfirm = new EventEmitter<boolean>();

    memberBenefitsVM: MemberBenefitsVM = new MemberBenefitsVM();
    memberMembershipBenefits: any;
    benefitsDetail = Configurations.BenefitsType;
    ENU_BenefitType = ENU_BenefitsType;
    ENU_MemberShipBenefits = ENU_MemberShipBenefitsName;
    messages = Messages;

    memberBenefitsTempVM: any = {
        SuspendMemberBenefits: []
    }

    EnforceManualSetting: boolean = false;

    constructor(
        private _dialog: MatDialogService,
        private _httpService: HttpService,
        private _messagesService: MessageService,
        private _dialogRef: MatDialogRef<SuspendBenefitsComponent>,
        @Inject(MAT_DIALOG_DATA) public customer: any
    ) { }

    ngOnInit() {
        this.getMemberBenefitsByCustomerMembership();
        this.memberBenefitsVM.SuspendBenefitType = 1;
    }

    //#region Events
    onSuspendAllBenefits() {
        this.memberBenefitsVM.memberBenefits.forEach(element => {
            element.IsBenefitsSuspended = this.memberBenefitsVM.isSuspendAll ? true : false;
        });
    }

    onChangeBenefitType() {
        this.memberBenefitsVM.memberBenefits.forEach(element => {
            element.SuspendBenefitType = this.memberBenefitsVM.SuspendBenefitType;
        });
    }

    onIsCheckIndividualBenefit() {
        for (let element of this.memberBenefitsVM.memberBenefits) {
            if (element.IsBenefitsSuspended) {
                this.memberBenefitsVM.isSuspendAll = true;
            }
            else {
                this.memberBenefitsVM.isSuspendAll = false;
                break;
            }
        }
    }



    /** Get memberMembership Benefits details **/
    getMemberBenefitsByCustomerMembership() {
        this._httpService.get(MemberMembershipApi.BenefitBenefitsByCustomerMembershipID + this.customer.MemberMembershipID).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                this.memberBenefitsVM.memberBenefits = response.Result;
                this.sortMembershipBenefits();
                this.EnforceManualSetting = this.memberBenefitsVM.memberBenefits[0].EnforceManualSetting;
                if (this.memberBenefitsVM.memberBenefits != undefined) {
                    for (let element of this.memberBenefitsVM.memberBenefits) {
                        if (element.IsBenefitsSuspended) {
                            this.memberBenefitsVM.isSuspendAll = true;
                        }
                        else {
                            this.memberBenefitsVM.isSuspendAll = false;
                            break;
                        }
                    }
                    this.memberBenefitsVM.SuspendBenefitType = this.memberBenefitsVM.isSuspendAll ? this.memberBenefitsVM.memberBenefits[0].SuspendBenefitType : this.memberBenefitsVM.SuspendBenefitType;
                }
            }else{
                this._messagesService.showErrorMessage(response.MessageText)
            }
        });
    }
    sortMembershipBenefits() {
        this.memberBenefitsVM.memberBenefits.sort(function (a, b) {
            if (a.MembershipBenefitsTypeID < b.MembershipBenefitsTypeID) { return -1; }
            if (a.MembershipBenefitsTypeID > b.MembershipBenefitsTypeID) { return 1; }
            return 0;
        });
    }
    /** Suspend Benefits **/
    onSuspendBenefits() {
        this.setBenefitsValues();
        let param = {
            EnforceManualSetting: this.EnforceManualSetting,
            SuspendMemberBenefits: this.memberBenefitsTempVM.SuspendMemberBenefits
        }
        this._httpService.save(MemberMembershipApi.suspendMemberMembershipBenefits, param).subscribe(response => {
            if (response && response.MessageCode > 0) {
                this._messagesService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Benefits"));
                this.isConfirm.emit(true);
                this.onClose();
            } else {
                this._messagesService.showErrorMessage(response.MessageText);
                this.memberBenefitsTempVM.SuspendMemberBenefits = [];
            }
        });
    }

    /** Set values of isFree and IsDiscount on benefitsTypes selection (Global and item level) **/
    setBenefitsValues() {

        this.memberBenefitsVM.memberBenefits.forEach(element => {
            if (element.MembershipBenefitsTypeID != this.ENU_MemberShipBenefits.DoorCheckIns) {
                if (element.SuspendBenefitType == this.ENU_BenefitType.All) {
                    // if (element.IsBenefitsSuspended) {
                    element.isFree = false;
                    element.isDiscount = false
                    // } else {
                    //    this.isNotAllSelected(element);
                    // }
                }
                else if (element.SuspendBenefitType == this.ENU_BenefitType.IsFree) {
                    // if (element.IsBenefitsSuspended) {
                    element.isFree = true;
                    element.isDiscount = false
                    // } else {
                    //     this.isNotAllSelected(element);
                    // }
                }
                else if (element.SuspendBenefitType == this.ENU_BenefitType.IsDiscount) {
                    // if (element.IsBenefitsSuspended) {
                    element.isFree = false;
                    element.isDiscount = true;
                    // } else {
                    //     this.isNotAllSelected(element);
                    // }
                }
            } else {
                element.isFree = false;
                element.isDiscount = false;
            }
        });

        this.memberBenefitsVM.memberBenefits.forEach(element => {
            let tempObj = {
                CustomerMembershipBenefitsID: element.CustomerMembershipBenefitsID,
                IsFree: element.isFree,
                IsDiscount: element.isDiscount,
                IsSuspendBenefit: element.IsBenefitsSuspended
            }
            this.memberBenefitsTempVM.SuspendMemberBenefits.push(tempObj);
        });
    }

    isNotAllSelected(element: any) {
        element.isFree = false;
        element.isDiscount = false;
    }

    onClose(): void {
        this._dialogRef.close();
    }

    // #endregion
}
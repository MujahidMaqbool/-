/********************** Angular References *********************/
import { Component, Inject, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { SubscriptionLike as ISubscription } from "rxjs";
/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';

/* Models */
import { LeadLostReasonModel } from '@lead/models/lead.model';

/********************** Common ***************************/
import { DataSharingService } from '@services/data.sharing.service';
import { Messages } from '@app/helper/config/app.messages';
import { LeadApi, LeadMembershipApi } from '@app/helper/config/app.webapi';
import { ENU_ModuleList } from '@app/helper/config/app.enums';
import { ApiResponse } from '@app/models/common.model';

@Component({
    selector: 'lead-lost',
    templateUrl: './lead.lost.popup.component.html'
})

export class LeadLostComponent implements OnInit, OnDestroy {

    @ViewChild('LostReasonForm') LostReasonForm: NgForm;
    @Output() isSaved = new EventEmitter<boolean>();

    /* Model References */
    moduleId = ENU_ModuleList.Lead;
    leadLostReasonList: any;
    leadLostReasonModel: LeadLostReasonModel;
    leadIDSubscription: ISubscription;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    showValidationMessage: boolean = false;

    constructor(
        private _httpService: HttpService,
        private _router: Router,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<LeadLostComponent>,
        @Inject(MAT_DIALOG_DATA) private isOnBusinessFlow: boolean) {
        this.leadLostReasonModel = new LeadLostReasonModel();
    }

    ngOnInit() {
        this.getLeadLostReasonDropdown();
        this.leadIDSubscription = this._dataSharingService.leadID.subscribe(leadID => {
            this.leadLostReasonModel.CustomerID = leadID;
        });

        this.leadIDSubscription = this._dataSharingService.membershipID.subscribe(membershipID => {
            this.leadLostReasonModel.MembershipID = membershipID;
        });
    }

    ngOnDestroy() {
        this.leadIDSubscription.unsubscribe();
    }

    // #region Events

    onLeadLostSave(isValid: boolean) {
        if (isValid) {
            this.hasSuccess = false;
            this.hasError = false;
            this._httpService.save(LeadMembershipApi.saveLeadLost, this.leadLostReasonModel)
                .subscribe((res:ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.resetForm();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead Lost"));
                        this.dialogRef.close();
                        this.isSaved.emit(true);
                        if (this.isOnBusinessFlow == false) {
                            this._router.navigate(['/lead']);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Lost"));
                    }

                },
                    err => {
                        this.isSaved.emit(false);
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Lost"));
                    }
                );
        }
    }

    // #endregion

    // #region Methods

    getLeadLostReasonDropdown() {
        this._httpService.get(LeadApi.leadLostReasonType + this.moduleId)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.leadLostReasonList = res.Result;
                    } else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
                }
            );
    }

    resetForm() {
        this.LostReasonForm.resetForm();
        setTimeout(() => {
            this.leadLostReasonModel = new LeadLostReasonModel();
        })
    }

    closePopup(): void {
        this.isSaved.emit(false);
        this.dialogRef.close();
    }

    // #endregion
}
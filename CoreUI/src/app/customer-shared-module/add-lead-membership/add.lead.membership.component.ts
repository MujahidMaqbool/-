import { Component, Output, EventEmitter, Inject } from "@angular/core";
import { LeadMembershipApi, LeadStatusApi } from "src/app/helper/config/app.webapi";
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";

import { AddLeadMembership, LeadMembershipsList, AssignedToStaffList } from "src/app/models/lead.membership.model";
import { ApiResponse, PersonInfo } from "src/app/models/common.model";
// import { FillFormComponent } from "../fill-form/fill.form.component";
// import { MatDialogService } from "../generics/mat.dialog.service";
import { CustomerType, ENU_Package } from "src/app/helper/config/app.enums";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { FillFormComponent } from "src/app/shared/components/fill-form/fill.form.component";
import { DataSharingService } from "src/app/services/data.sharing.service";

@Component({
    selector: 'add-lead-membership',
    templateUrl: 'add.lead.membership.component.html'
})

export class AddLeadMembershipComponent {
    @Output()
    isLeadMembershipSaved = new EventEmitter<any>();

    packageIdSubscription: SubscriptionLike;

    /* Messages */
    shouldGetPersonInfo: boolean = false;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;

    leadIdSubscription: ISubscription;
    personTypeInfo: PersonInfo;

    isPurchaseRestrictionAllowed :boolean = false;
    customerType = CustomerType;

    package = ENU_Package;

    isMembershipsExists: boolean;
    addLeadMembershipModel: AddLeadMembership = new AddLeadMembership();
    assignedToStaffList: AssignedToStaffList[] = [];
    existingMembershipList: LeadMembershipsList[] = [];
    existingLeadMembershipObj: LeadMembershipsList = new LeadMembershipsList();
    ErrorMessageText: any;
    enquiryTitle: string = "Add Enquiry";

    constructor(
        private _FormDialogue: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<AddLeadMembershipComponent>,
        private _router: Router,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public model: any) {
    }


    ngOnInit() {

        this.addLeadMembershipModel.CustomerID = this.model.CustomerID;
        this.addLeadMembershipModel.MemberToLead = this.model.MemberToLead;
        this.addLeadMembershipModel.IsEnquiryEdit = this.model.IsEnquiryEdit;
        if (this.addLeadMembershipModel.IsEnquiryEdit == true) {
            this.enquiryTitle = "Edit Enquiry";
            this.leadAssignToEdit();
        }
        else {
            this.leadDetailFundamentals();
        }

        if (this.model.CustomerTypeID) {
            this.personTypeInfo = new PersonInfo();
            this.personTypeInfo.PersonID = this.model.CustomerID;
            this.personTypeInfo.PersonTypeID = this.model.CustomerTypeID;
            this.shouldGetPersonInfo = true;
            this._dataSharingService.sharePersonInfo(this.personTypeInfo);
        }

        // Subscribe package ID
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
          (packageId: number) => {
            if (packageId && packageId > 0) {
              this.setPackageBasedPermissions(packageId);
            }
          }
        );
    }

    gOnDestroy() {
      this.packageIdSubscription?.unsubscribe();
    }

    // Package Based Permission
      setPackageBasedPermissions(packageID: number){
      this.isPurchaseRestrictionAllowed =  packageID == this.package.Full ? true : false;
    }

    onClosePopup(): void {
        this.dialogRef.close();
    }

    onChangeMembership(){
      this.existingLeadMembershipObj = this.existingMembershipList.find(i => i.MembershipID == this.addLeadMembershipModel.MembershipID);
    }

    leadDetailFundamentals() {
        let param = {
            customerId: this.addLeadMembershipModel.CustomerID
        }
        this._httpService.get(LeadMembershipApi.getLeadDetailFundmental, param)
            .subscribe(
                (res: ApiResponse) => {
                    if (res.MessageCode != -62 && res.MessageCode != -61) {
                        if (res && res.MessageCode > 0) {
                            this.assignedToStaffList = res.Result.StaffList;
                            this.isMembershipsExists = res.Result.MembershipList.length > 0 ? true : false;
                            this.existingMembershipList = res.Result.MembershipList;
                            this.setMembership();
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    } else {
                        this.isMembershipsExists = res.Result.MembershipList.length > 0 ? true : false;
                        this.ErrorMessageText = res.MessageText;
                    }
                },
                (error) => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Fundamentals")
                    );
                }
            )
    }

    leadAssignToEdit() {
        let param = {
            membershipID: this.model.MembershipID,
        }
        this._httpService.get(LeadMembershipApi.AssigntoEdit, param)
            .subscribe(
                (res: ApiResponse) => {
                    if (res.MessageCode != -62 && res.MessageCode != -61) {
                        if (res && res.MessageCode > 0) {
                            this.assignedToStaffList = res.Result.StaffList;
                            this.isMembershipsExists = res.Result.MembershipList.length > 0 ? true : false;
                            this.existingMembershipList = res.Result.MembershipList;
                            this.setMembership();
                        } else if(res.MessageCode == -792) {
                            this.isMembershipsExists = res.Result.MembershipList.length > 0 ? true : false;
                            this.ErrorMessageText = res.MessageText;
                            this._messageService.showErrorMessage(res.MessageText);
                        } else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    } else {
                        this.isMembershipsExists = res.Result.MembershipList.length > 0 ? true : false;
                        this.ErrorMessageText = res.MessageText;
                    }
                },
                (error) => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Assign to")
                    );
                }
            )
    }
    leadAssigntoSaveUpdate() {
        if (this.addLeadMembershipModel.IsEnquiryEdit == true) {
            this.updateLeadMembership();
        }
        else {
            this.saveLeadMembership();
        }

    }
    saveLeadMembership() {
        this._httpService.save(LeadMembershipApi.save, this.addLeadMembershipModel)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Enquiry"));
                    if (!res.Result.IsFormExists || this.addLeadMembershipModel.MemberToLead) {
                        this.isLeadMembershipSaved.emit({ isSaved: true, messageCode: res.MessageCode });
                    }
                    if (res.Result.IsFormExists) {
                        this._FormDialogue.open(FillFormComponent, {
                            disableClose: true,
                            data: {
                                customertypeId: this.customerType.Lead,
                                customerID: res.Result.CustomerID // sale ID as Customer id
                            }
                        });
                    }
                }
                else if (res && res.MessageCode == -30) {
                    this._messageService.showErrorMessage(this.messages.Validation.Lead_Membership_Exist);
                    this.isLeadMembershipSaved.emit({ isSaved: false, messageCode: res.MessageCode });
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Enquiry"));
                }

                this.onClosePopup();

            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Enquiry")); }
            );
    }
    updateLeadMembership() {
        this.addLeadMembershipModel.CustomerID = this.model.CustomerID;
        this.addLeadMembershipModel.MembershipID = this.model.MembershipID;
        this._httpService.save(LeadMembershipApi.AssignToSave, this.addLeadMembershipModel)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {

                    this.onClosePopup();
                    this.isLeadMembershipSaved.emit(true);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Enquiry")); }
            );
    }

    setMembership() {

        if (this.addLeadMembershipModel.IsEnquiryEdit == undefined) {
            if (this.isMembershipsExists) {
                this.addLeadMembershipModel.MembershipID = this.existingMembershipList[0].MembershipID;
            }

            this.addLeadMembershipModel.AssignedToStaffID = this.assignedToStaffList[0].StaffID;
        }
        else {
            if (this.addLeadMembershipModel.IsEnquiryEdit) {
                this.addLeadMembershipModel.AssignedToStaffID = this.model.AssignedToStaffID == 0 ? this.model.AssignedToStaffID = null : this.model.AssignedToStaffID = this.model.AssignedToStaffID;
                this.addLeadMembershipModel.MembershipID = this.model.MembershipID;
            }

        }

        this.onChangeMembership();

    }

}

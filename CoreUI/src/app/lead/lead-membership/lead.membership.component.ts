import { Component } from "@angular/core";
import { SubscriptionLike as ISubscription } from "rxjs";
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Configurations } from 'src/app/helper/config/app.config';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { PersonInfo } from 'src/app/models/common.model';
import { CustomerType, ENU_DateFormatName, LeadStatusType } from 'src/app/helper/config/app.enums';
import { LeadMembershipsView } from "src/app/models/lead.membership.model";
import { LeadMembershipApi } from "src/app/helper/config/app.webapi";
import { AddLeadMembershipComponent } from "src/app/customer-shared-module/add-lead-membership/add.lead.membership.component";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Lead } from "src/app/helper/config/app.module.page.enums";
//import { MembershipViewComponent } from "src/app/setup/membership/view/membership.view.component";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { MembershipViewComponent } from "src/app/shared/components/membership-view/membership.view.component";
import { LeadService } from "src/app/services/lead/lead.service";
import { DeleteConfirmationComponent } from "src/app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { Router } from "@angular/router";
import { jsonpFactory } from "@angular/http/src/http_module";

@Component({
    selector: 'lead-membership',
    templateUrl: './lead.membership.component.html'
})

export class LeadMembershipComponent extends AbstractGenericComponent {

    /* Local Variables*/
    isDataExists: boolean = false;
    totalRecords: number = 0;
    shouldGetPersonInfo: boolean = false;
    leadID: any;
    deleteDialogRef: any;
    dateFormat: string = "";//Configurations.DateFormat;

    /* Messages */
    messages = Messages;

    /* Collection And Models */
    leadMembershipsViewList: LeadMembershipsView[] = [];
    statusList = Configurations.Status;
    leadStatusType = LeadStatusType;
    leadIdSubscription: ISubscription;
    routeSub: ISubscription;
    // personInfo: PersonInfo;

    allowedPages = {
        Lead_View: false,
        Membership_Save: false,
        Membership_Delete: false

    };

    constructor(
        private _leadMembershipService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _openDialog: MatDialogService,
        private _leadService: LeadService,
        private _router: Router,
    ) {
        super();
        this.setPermissions();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.getLeadID();
    }

    ngOnDestroy() {
        this.leadIdSubscription.unsubscribe();
    }

    // #region Events

    onAddMembership() {
        const dialogref = this._openDialog.open(AddLeadMembershipComponent,
            {
                disableClose: true,
                data: {
                    CustomerID: this.leadID,
                    CustomerTypeID: CustomerType.Lead,                  
                    IsMemberToLead: false
                }
            });

        dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
            if (res.isSaved) {
                this.getLeadMemberships();
            }
        });
    }

    onViewLeadMembership(membership: any) {
        var data = {
            MembershipID: membership.MembershipID,
            CustomerMembershipID: 0
        };

        membership.CustomerMembershipID
        this._openDialog.open(MembershipViewComponent,
            {
                disableClose: true,
                data: data
            });
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    setPermissions() {
        this.allowedPages.Lead_View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.View);
        this.allowedPages.Membership_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Memberships_Save);
        this.allowedPages.Membership_Delete = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Lead_DeleteEnquiry);
    }

    getLeadID() {
        this.leadIdSubscription = this._dataSharingService.leadID.subscribe(leadID => {
            if (leadID && leadID > 0) {
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = leadID;
                // this.personInfo.PersonTypeID = CustomerType.Lead;
                this.shouldGetPersonInfo = true;

                this.leadID = leadID;
                this.getLeadMemberships();
                this._dataSharingService.shareCustomerID(leadID);
            }
        });
    }

    getLeadMemberships() {
        let params = {
            customerID: this.leadID
        }
        this._leadMembershipService.get(LeadMembershipApi.getLeadMembership, params)
            .subscribe(data => {
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (data.Result.length > 0) {
                        this.totalRecords = data.TotalRecord ? data.TotalRecord : data.Result.length;
                    }
                    else {
                        this.totalRecords = 0;
                    }
                    this.leadMembershipsViewList = data.Result;
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
                }
            );
    }

    onDeleteEnquiry(customerID: number, membershipID: number) {
        this.deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._leadService.onDeleteEnquiry(customerID, membershipID).then(isDeleted => {
                    if (isDeleted) {
                        this.getLeadMemberships();
                        if(this.totalRecords <= 1){
                            this._router.navigate(['/lead/search']);
                        }
                    }
                })
            }
        });
    }
    onEditEnquiry(leadObj :any){
        const dialogref = this._openDialog.open(AddLeadMembershipComponent,
            {
                disableClose: true,
                data: {
                    CustomerID: this.leadID,
                    CustomerTypeID: CustomerType.Lead,
                    MembershipID : leadObj.MembershipID ,
                    AssignedToStaffID : leadObj.AssignedToStaffID, 
                    CustomerMembershipID:leadObj.CustomerMembershipID,
                    IsEnquiryEdit: true ,
                    IsMemberToLead: false
                }
            });

        dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
            if (res) {
                this.getLeadMemberships();
            }
        });

    }

    // #endregion
}
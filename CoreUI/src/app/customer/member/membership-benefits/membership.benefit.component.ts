import { Component, OnInit } from "@angular/core";
import { TrimValue } from "src/app/shared/directives/trim.values.directive";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { EditBenefitsComponent } from "../edit-benefits/edit.benefits.component";
import { MemberMembershipApi, SaleApi } from 'src/app/helper/config/app.webapi';

/** Service & Models **/
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from "src/app/services/data.sharing.service";
import { MemberMembershipBenefitsSearch, MemberBenefitsViewModel, searchMembership } from "../models/member.membershipBenefits.model";
import { ApiResponse, PersonInfo, DD_Branch } from "src/app/models/common.model";
import { CustomerType, ENU_MemberShipBenefitsName, MembershipStatus_Enum, ENU_MemberShipBenefitsStatus, ENU_MobileOperatingSystem, ENU_DateFormatName } from "src/app/helper/config/app.enums";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from "src/app/helper/config/app.module.page.enums";
import { SuspendBenefitsComponent } from "src/app/customer-shared-module/suspend-benefits/suspend.benefits.component";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { MessageService } from "src/app/services/app.message.service";
import { Messages } from "src/app/helper/config/app.messages";

@Component({
    selector: "membership-benefits",
    templateUrl: "./membership.benefit.component.html"
})

export class MembershipBenefitComponent extends AbstractGenericComponent implements OnInit {

    /** Models & list **/
    memberhsipBenefit: MemberBenefitsViewModel[];
    // memberhsipBenefit: any = [];
    membershipList: any = [];
    searchMembership: searchMembership = new searchMembership;
    // personInfo: PersonInfo;

    enu_MemberShipBenefitName = ENU_MemberShipBenefitsName;
    membershipStatus_Enum = MembershipStatus_Enum;
    memberShipBenefitsStatus = ENU_MemberShipBenefitsStatus;

    /** Local Variables **/
    dateFormat: string = ""; //Configurations.DateFormat;
    memberIdSubscription: any;
    shouldGetPersonInfo: boolean = false;
    memberID: number;
    branchId: number;
    /***********Messages*********/
    messages = Messages;
    
    allowedPages = {
        BenefitsSave: false,
        BenefitsSuspend: false,
    };


    constructor(
        private _dialog: MatDialogService,
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _messageService: MessageService,

    ) {
      super();
    }


    ngOnInit() {
        this.getMemberbyID();
        this.getSearchFundamental();
        this.setPermissions();
        this.getCurrentBranchDetail();
        
    }

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
       
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.branchId = branch.BranchID;
        }
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
    }
    /** set Permission **/
    setPermissions() {
        this.allowedPages.BenefitsSave = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BenefitsSave);
        this.allowedPages.BenefitsSuspend = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BenefitsSuspend);
    }

    /** Get Member Info **/
    getMemberbyID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                this.memberID = memberID;
                this.shouldGetPersonInfo = true;
            }
        });
    }

    /** Get Search Fundamental **/
    getSearchFundamental() {

        this._httpService.get(SaleApi.getMemberMembership + this.memberID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0 && res.Result != undefined) {
                    this.membershipList = res.Result;

                    this.membershipList.forEach(membership => {

                        var device = super.getMobileOperatingSystem();
                        if (membership.MembershipName) {
                            if (membership.MembershipName.length > 25 && (device == ENU_MobileOperatingSystem.iOS || device == ENU_MobileOperatingSystem.Android || device == ENU_MobileOperatingSystem.WindowsPhone)) {
                                membership.MembershipName = membership.MembershipName.substring(0, 25) + "..";
                            } else if (membership.MembershipName.length > 80) {
                                membership.MembershipName = membership.MembershipName.substring(0, 80) + "..";
                            }
                        }

                        if (membership.BranchID == this.branchId) {
                            membership.MembershipName = membership.MembershipName;
                        }
                        else {
                            membership.MembershipName = membership.MembershipName + ' - ' + membership.BranchName;
                        }

                    });

                    this.selectedValue();
                    this.searchMembership = this.membershipList[0];
                    this.getMemberhipBenefit();
                }else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
            });
    }

    /** Get Member Membership Benefits Details**/
    getMemberhipBenefit() {
        let params = {
            CustomerMembershipID: this.searchMembership.CustomerMembershipID
        };

        this._httpService.get(MemberMembershipApi.getMemberMembershipBenefits, params).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.memberhsipBenefit = res.Result.MemberBenefits;
                this.sortMembershipBenefits();
            } else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        }, error => {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
        });
    }

    sortMembershipBenefits() {
        this.memberhsipBenefit.sort(function (a, b) {
            if (a.MembershipBenefitsTypeID < b.MembershipBenefitsTypeID) { return -1; }
            if (a.MembershipBenefitsTypeID > b.MembershipBenefitsTypeID) { return 1; }
            return 0;
        });
    }

    selectedValue() {
        this.membershipList.forEach(element => {
            let htmlData = '';
            htmlData = element.MembershipStatusTypeID == this.membershipStatus_Enum.Active ?
                '<span class="select-membership-benefit-active">' + element.MembershipStatusName + '</i>' :
                element.MembershipStatusTypeID == this.membershipStatus_Enum.Terminated ?
                    '<span class="select-membership-benefit-terminated">' + element.MembershipStatusName + '</i>' :
                    element.MembershipStatusTypeID == this.membershipStatus_Enum.Frozen ?
                        '<span class="select-membership-benefit-frozen">' + element.MembershipStatusName + '</i>' :
                        element.MembershipStatusTypeID == this.membershipStatus_Enum.Expired ?
                            '<span class="select-membership-benefit-expired">' + element.MembershipStatusName + '</i>' :
                            '<span class="select-membership-benefit-cancel">' + element.MembershipStatusName + '</i>'

            let mebershipName = element.MembershipName + htmlData;
            element.MembershipName = mebershipName;
        });
    }


    /** Suspend Benefits Dialog **/
    onSuspendBenefitDialog() {
        const dialogRef = this._dialog.open(SuspendBenefitsComponent, {
            disableClose: true,
            data: {
                MemberMembershipID: this.searchMembership.CustomerMembershipID
            }
        });
        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.getMemberhipBenefit();
            }
        });
    }

    /** Update Benefits Dialog **/
    editBenefitsDialog(membenefit: any, BenefitsType: number, isGlobalLevel: boolean) {
        const dialogRef = this._dialog.open(EditBenefitsComponent, {
            disableClose: true,
            data: {
                ItemName: isGlobalLevel ? membenefit.BenefitName : membenefit.ItemName,
                SessionAllowed: (membenefit.TotalSessions - membenefit.MembershipTotalSessions),
                SessionConsumed: membenefit.SessionConsumed,
                MembershipTotalSessions: membenefit.MembershipTotalSessions,
                Notes: membenefit.Notes,
                RollOverBenefitsOnEachInterval: membenefit.RollOverBenefitsOnEachInterval,
                ItemID: isGlobalLevel ? null : membenefit.ItemID,
                ItemTypeID: isGlobalLevel ? null : membenefit.ItemTypeID,
                CustomerMembershipBenefitsID: isGlobalLevel ? membenefit.CustomerMembershipBenefitsID : null,
                CustomerMembershipBenefitsDetailID: !isGlobalLevel ? membenefit.CustomerMembershipBenefitsDetailID : null,
                MembershipBenefitTypeID: BenefitsType,
                CustomerMembershipID: this.searchMembership.CustomerMembershipID,
                BranchID: membenefit.BranchID,

            }
        });

        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.getMemberhipBenefit();
            }
        });
    }

    /**Rreset Search filter**/
    // resetSeacrhFilter() {
    //     if (this.membershipList.length > 0) {
    //         this.memberMembershipBenefitsSearchModel.MemberMembershipID = this.membershipList[0].CustomerMembershipID;
    //         this.getMemberhipBenefit();
    //     }
    // }

}

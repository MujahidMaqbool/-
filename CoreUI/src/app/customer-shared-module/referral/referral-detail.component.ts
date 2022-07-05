/********************** Angular Refrences *********************/
import { Component, OnInit, Input } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
/********************* Material:Refference ********************/

/********************** Services & Models *********************/
/* Models */
import { MemberReferralDetails } from "@customer/member/models/member.referral.details.model";
import { PersonInfo, ApiResponse } from '@app/models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';

/**********************  Common *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MemberReferralDetailApi } from '@app/helper/config/app.webapi';
import { CustomerType } from '@app/helper/config/app.enums';
import { MessageService } from '@app/services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';

@Component({
    selector: 'referral-detail',
    templateUrl: './referral-detail.component.html'
})

export class ReferralDetailComponent implements OnInit {
    // #region Local members
    // memberID: number;
    shouldGetPersonInfo: boolean = false;
    customerType : number;
    customerID: number = 0;


    /* Messages */
    messages = Messages;
    public isDataExists: boolean = false;

    /* Collections & Model reference */
    statusList = Configurations.Status;

    memberIdSubscription: ISubscription;
    customerTypeSubscription: ISubscription;
    memberReferralDetailsList: MemberReferralDetails[];
    // personInfo: PersonInfo;

    dateFormat = Configurations.DateFormat;

    // #endregion

    constructor(
        private _memberReferralDetailsService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
    ) {
    }

    ngOnInit() {
        this.getCustomerType();
        this.getMemberID();
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
    }

    // #region methods
    getCustomerType(){
        this.customerTypeSubscription = this._dataSharingService.customerTypeID.subscribe(customerType => {
              this.customerType = customerType;
        })
    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.customerID.subscribe(customerId => {
            if (customerId > 0) {
                this.customerID = customerId;
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = this.customerID;
                // this.personInfo.PersonTypeID = this.customerType;
                this.shouldGetPersonInfo = true;
                this.getMemberReferralDetails();
            }
        });
    }

    getMemberReferralDetails() {
        this._memberReferralDetailsService.get(MemberReferralDetailApi.getCustomerReferralDetails + this.customerID)
            .subscribe((res: ApiResponse) => {
                if (res.MessageCode > 0) {
                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.memberReferralDetailsList = res.Result;
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Referral Details"));
                }
            );
    }

    // #endregion
}

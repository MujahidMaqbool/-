/********************** Angular References *********************/
import { Component, OnInit, OnDestroy , ChangeDetectorRef} from "@angular/core";

import { ActivatedRoute } from "@angular/router";
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from "@services/data.sharing.service";
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from "@app/helper/config/app.module.page.enums";
import { AuthService } from "@app/helper/app.auth.service";
import { ActivityPersonInfo } from "@app/models/activity.model";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { CustomerType } from '@helper/config/app.enums';
import { MemberNavigationComponent } from "@app/customer/member/navigation/member.navigation.component";
import { PersonInfo } from "@app/models/common.model";



@Component({
    selector: 'client-navigation',
    templateUrl: './client.navigation.component.html'
})

export class ClientNavigationComponent extends MemberNavigationComponent implements OnInit,OnDestroy {
    activityPersonInfoSubscription: ISubscription;
    clientID: number = 0;
    personInfos: ActivityPersonInfo = null;
    allowedClientPages = {
        Save: false,
        Activity: false,
        InvoiceHistory: false,
        BookingHistory: false,
        viewForm : false,
        ReferredBy: false,
        Documents: false,
        NextOfKin: false,
        Gateways: false,
        viewWaitList: false,
        ViewRewardProgram: false
    };
    countCustomerForm = {
        FormsCount: 0,
        IsMandatory: false
    };

    constructor(
        public cdRef:ChangeDetectorRef,
        public _authService: AuthService,
        public _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        public _httpService: HttpService,
        public _messageService: MessageService, ) {
        super(null, null, null, _httpService, null,null);
        this.activityPersonInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            this.personInfos = new ActivityPersonInfo();
            this.personInfos = personInfo;
        });
        this.getClientIdFromRoute();
    }

    ngOnInit() {




        this._dataSharingService.formsCountForCustomerNavigation.subscribe((customerID: number) => {
            if(customerID > 0){
                this.getFundamental(customerID);
            }
        });

        this.getFundamental(this.clientID);
    }

    ngOnDestroy() {
        this.activityPersonInfoSubscription.unsubscribe();
    }

    ngAfterViewChecked(){
        this.cdRef.detectChanges();
     }

    getClientIdFromRoute() {
        this._route.paramMap.subscribe(params => {
            this.clientID = +params.get('ClientID');
            this._dataSharingService.shareClientID(this.clientID);
            this._dataSharingService.shareCustomerID(this.clientID);
            this._dataSharingService.shareCustomerTypeID(CustomerType.Client);
            var personInfo = new PersonInfo();
            personInfo.PersonID = this.clientID;
            personInfo.PersonTypeID = CustomerType.Client;
            this._dataSharingService.sharePersonInfo(personInfo);
            this.setPermissions();
            //---Set and share personInfo for invoices---------//
        });
    }

    setPermissions() {
        this.allowedClientPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveClient);
        this.allowedClientPages.Activity = this.clientID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
        this.allowedClientPages.InvoiceHistory = this.clientID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.InvoiceHistory);
        this.allowedClientPages.BookingHistory = this.clientID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BookingHistory);
        this.allowedClientPages.viewForm = this.clientID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ViewForm);
        this.allowedClientPages.viewWaitList = this.clientID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.WaitList_View);
        this.allowedClientPages.ReferredBy = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ReferredBy);
        this.allowedClientPages.Documents = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Documents_View);
        this.allowedClientPages.NextOfKin = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.NextOfKin);
        this.allowedClientPages.Gateways = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Gateway);
        this.allowedClientPages.ViewRewardProgram = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.RewardProgram_View);
    }


}

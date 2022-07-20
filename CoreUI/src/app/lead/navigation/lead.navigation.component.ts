/********************** Angular References *********************/
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SubscriptionLike as ISubscription } from 'rxjs';

/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from "src/app/services/data.sharing.service";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Lead } from "src/app/helper/config/app.module.page.enums";
import { MemberNavigationComponent } from "src/app/customer/member/navigation/member.navigation.component";
import { HttpService } from "src/app/services/app.http.service";
import { ActivityPersonInfo } from "src/app/models/activity.model";
import { CustomerType } from "src/app/helper/config/app.enums";
import { PersonInfo } from "src/app/models/common.model";



@Component({
    selector: 'lead-navigation',
    templateUrl: './lead.navigation.component.html'
})

export class LeadNavigationComponent extends MemberNavigationComponent implements OnInit {
    leadID: number = 0;
    activityPersonInfoSubscription: ISubscription;
    personInfos: ActivityPersonInfo;
    allowedLeadPages = {
        Save: false,
        Activities: false,
        Memberships: false,
        Invoices: false,
        Bookings: false,
        viewForm : false,
        ReferredBy: false,
        Documents: false,
        NextOfKin: false,
        Gateways: false,
        ViewWaitList: false,
        ViewRewardProgram: false
    };
    countCustomerForm = {
        FormsCount : 0,
        IsMandatory: false
    };

    constructor(
        public _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        public _authService: AuthService,
        public _httpService: HttpService) {
        super(null, null, null, _httpService, null,null);


    }
    ngOnInit(){
        this.setPermissions();
        this.getLeadIdFromRoute();

        this._dataSharingService.formsCountForCustomerNavigation.subscribe((customerID: number) => {
            if(customerID > 0){
                this.getFundamental(customerID);
            }
        });

        this.activityPersonInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            this.personInfos = new ActivityPersonInfo();
            this.personInfos = personInfo;
        });
        this.getFundamental(this.leadID);
    }

    setPermissions() {
        this.allowedLeadPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Save);
        this.allowedLeadPages.Activities = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_View);
        this.allowedLeadPages.Memberships = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Memberships_View);
        this.allowedLeadPages.Invoices = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.InvoiceHistory);
        this.allowedLeadPages.ViewWaitList = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.WaitList_View);
        this.allowedLeadPages.Bookings = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BookingHistory);
        this.allowedLeadPages.viewForm = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.ViewForm);
        this.allowedLeadPages.ReferredBy = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.ReferredBy);
        this.allowedLeadPages.Documents = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Documents_View);
        this.allowedLeadPages.NextOfKin = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.NextOfKin);
        this.allowedLeadPages.Gateways = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Gateway);
        this.allowedLeadPages.ViewRewardProgram = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.RewardProgram_View);
    }

    getLeadIdFromRoute() {
        this._route.paramMap.subscribe(params => {
            this.leadID = +params.get('LeadID');
            this._dataSharingService.shareLeadID(this.leadID);
            this._dataSharingService.shareCustomerID(this.leadID);
            this._dataSharingService.shareCustomerTypeID(CustomerType.Lead);
            var personInfo = new PersonInfo();
            personInfo.PersonID = this.leadID;
            personInfo.PersonTypeID = CustomerType.Lead;
            this._dataSharingService.sharePersonInfo(personInfo);
            //---Set and share personInfo for invoices---------//
        });
    }
}

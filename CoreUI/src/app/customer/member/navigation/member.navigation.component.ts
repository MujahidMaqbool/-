
/************************ Angular References **************************/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from 'rxjs';

/********************* Material Reference *****************************/

/************************ Services & Models ***************************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { ApiResponse, PersonInfo } from 'src/app/models/common.model';

/**************************** Configurations *********************************/
import { ENU_ModuleList, CustomerType } from 'src/app/helper/config/app.enums';
import { environment } from 'src/environments/environment';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from 'src/app/helper/config/app.module.page.enums';
import { CustomerFormApi } from 'src/app/helper/config/app.webapi';

@Component({
    selector: 'member-navigation',
    templateUrl: './member.navigation.component.html'
})

export class MemberNavigationComponent implements OnInit {

    memberID: number = 0;
    moduleId = ENU_ModuleList.Member;
    serverImagePath = environment.imageUrl;
    countCustomerForm: any = {
        FormsCount: 0,
        IsMandatory: false
    };

    /* Models Refences */
    personInfo: PersonInfo;

    allowedPages = {
        Dashboard: false,
        Save: false,
        Activities: false,
        Memberships: false,
        Payments: false,
        ReferredBy: false,
        Documents: false,
        NextOfKin: false,
        Invoices: false,
        Bookings: false,
        Gateways: false,
        BenefitsView: false,
        viewForm: false,
        ViewWaitList: false,
        ViewRewardProgram: false
    };
    url: any;

    constructor(
        public _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        public _authService: AuthService,
        public _httpService: HttpService,
        public _messageService: MessageService,
        public route: Router,

    ) {
        this.personInfo = new PersonInfo();
    }

    ngOnInit() {
        this.setPermissions();
        this.personInfo.PersonTypeID = CustomerType.Member;
        this.getMemberIdFromRoute();
        // case of refresh page
        var activeRoute: string = this.route.url;
        this.getUrl(activeRoute.substring(activeRoute.lastIndexOf('/') + 1));

        this._dataSharingService.formsCountForCustomerNavigation.subscribe((customerID: number) => {
            if (customerID > 0) {
                this.getFundamental(customerID);
            }
        });

        this.getFundamental(this.memberID);

    }

    setPermissions() {
        this.allowedPages.Dashboard = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.MemberIndividualDashboard);
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveMember);
        this.allowedPages.Activities = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
        this.allowedPages.Memberships = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Memberships_View);
        this.allowedPages.Payments = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Payments_View);
        this.allowedPages.ReferredBy = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ReferredBy);
        this.allowedPages.ViewWaitList = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.WaitList_View);
        this.allowedPages.NextOfKin = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.NextOfKin);
        this.allowedPages.Invoices = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.InvoiceHistory);
        this.allowedPages.Bookings = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BookingHistory);
        this.allowedPages.Gateways = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Gateway);
        this.allowedPages.BenefitsView = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BenefitsView);
        this.allowedPages.viewForm = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ViewForm);
        this.allowedPages.Documents = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Documents_View);
        this.allowedPages.ViewRewardProgram = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.RewardProgram_View);

    }

    getMemberIdFromRoute() {
        this._route.paramMap.subscribe(params => {
            this.memberID = +params.get('MemberID');
            this._dataSharingService.shareMemberID(this.memberID);
            //---Set and share personInfo for invoices---------//
            this.personInfo.PersonID = this.memberID;
            this.personInfo.PersonTypeID = CustomerType.Member;
            this._dataSharingService.sharePersonInfo(this.personInfo);
            this._dataSharingService.shareCustomerID(this.memberID);
            this._dataSharingService.shareCustomerTypeID(CustomerType.Member);
        });
    }

    getFundamental(customerID: number): Observable<any> {
        let _url = CustomerFormApi.getAllCustomerFormFundamental + '?customerID=' + customerID;
        this._httpService.get(_url).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response && response.Result) {
                        if (response.Result.CustomerFormCount != null) {
                            this.countCustomerForm = response.Result.CustomerFormCount;
                        }
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                // this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            });
        return this.countCustomerForm;
    }

  // get url and highlighted dropdown selection
    getUrl(_url){
        this.url = _url;
    }
}

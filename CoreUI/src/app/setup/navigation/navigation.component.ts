import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { DataSharingService } from '@app/services/data.sharing.service';
import { SubscriptionLike } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit {

  url: any;
  allowedPages = {
    Company: false,
    Branch_View: false,
    StaffPosition_View: false,
    ProductCategory_View: false,
    Product_View: false,
    ServiceCategory_View: false,
    Service_View: false,
    ClassCategory_View: false,
    Class_View: false,
    Membership_View: false,
    MembershipCategory_View: false,
    Facility_View: false,
    Template_View: false,
    Automation_Template_View: false,
    Role_View: false,
    Widget: false,
    LeadStatus: false,
    ActivitiesColor: false,
    GatewayIntegration: false,
    PrinterConfig: false,
    Tax: false,
    ViewForm: false,
    RewardProgramView: false,

  }


  currentBranchSubscription: SubscriptionLike;

  constructor(private _authService: AuthService,
    private _dataSharingService: DataSharingService,public route: Router) { }

  ngOnInit() {
    this.setPermisssions();
    // case of refresh page
    var activeRoute: string = this.route.url;
    this.getUrl(activeRoute.substring(activeRoute.lastIndexOf('/') + 1));
    this.currentBranchSubscription = this._dataSharingService.updateRolePermission.subscribe(
      (isPackageUpdate: boolean) => {
        if (isPackageUpdate) {
          this.setPermisssions();
        }
      }
    )
  }

  ngOnDestroy() {
    this.currentBranchSubscription.unsubscribe();
  }

  setPermisssions() {
    this.allowedPages.Company = true;
    //this.allowedPages.Company = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Company);
    this.allowedPages.Branch_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Branch_View);
    this.allowedPages.StaffPosition_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.StaffPosition_View);
    //this.allowedPages.ProductCategory_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ProductCategory_View);
    //this.allowedPages.Product_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Product_View);
    this.allowedPages.ServiceCategory_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ServiceCategory_View);
    this.allowedPages.Service_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Service_View);
    this.allowedPages.ClassCategory_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ClassCategory_View);
    this.allowedPages.Class_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Class_View);
    this.allowedPages.Membership_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Membership_View);
    this.allowedPages.MembershipCategory_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.MembershipCategory_View);
    this.allowedPages.Facility_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Facility_View);
    this.allowedPages.Template_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Template_View);
    this.allowedPages.Automation_Template_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Automation_Template_View);
    this.allowedPages.Role_View = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Role_View);
    this.allowedPages.Widget = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Widget);
    this.allowedPages.LeadStatus = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.LeadStatus);
    this.allowedPages.ActivitiesColor = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ActivitiesColor);
    this.allowedPages.GatewayIntegration = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.GatewayIntegration);
    this.allowedPages.PrinterConfig = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.PrinterConfig);
    this.allowedPages.Tax = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Tax_View);
    this.allowedPages.ViewForm = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Form_View);
    this.allowedPages.RewardProgramView = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.RewardProgram_View);

  }

// get url and highlighted dropdown selection
  getUrl(_url) {
    this.url = _url;
  }
}

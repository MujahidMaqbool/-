/*********** Angular **********/
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
/*********** Configurations **********/
import { Configurations } from '@app/helper/config/app.config';


/*********** Components **********/

import { CancelllationPolicyComponent } from './cancelllation-policy/cancelllation-policy.component';
import { ActivitiesColorComponent } from './activities-color/activities.color.component';
import { PaymentsComponent } from './payments/payments.component';
import { WaitingListComponent } from './waiting-list/waiting-list.component';
import { BasicComponent } from './basic/basic.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ENU_ConfigurationTab } from '@app/helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { AdvancedComponent } from './advanced/advanced.component';

/*********** Models **********/

/*********** Services **********/


@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements AfterViewInit, OnInit {

  /*********** Referecnec **********/
  @ViewChild('tabGroup') tabGroup;
  @ViewChild('cancellationPolicyComp') cancellationPolicyComponent: CancelllationPolicyComponent;
  @ViewChild('activityComp') activitiesColorComponent: ActivitiesColorComponent;
  @ViewChild('paymentsComp') paymentsComponent: PaymentsComponent;
  @ViewChild('waitlistComp') waitlistComponent: WaitingListComponent;
  @ViewChild('basicComp') basicComponent: BasicComponent;
  @ViewChild('advancedComponent') advancedComponent: AdvancedComponent;


  /*********** Configurations **********/
  configurationsTypes = Configurations.ConfigurationsTypes;
  configurationsTypePath = Configurations.ConfigurationsTypePath;
  activeTab = Configurations.ConfigurationsTypes.Basic;
  eNU_ConfigurationTab = ENU_ConfigurationTab;

  /*********** Local **********/
  selectedTabIndex: number = 0;
  isExternalSave: boolean = false;
  isResetButtonShow: boolean = true;
  href: string;

  allowedPages = {
    CancellationPolicy: false,
    AdvanceSetting: false,
    SaveAdvanceSetting: false,
    ViewAdvanceSetting: false,
    WaitingList: false,
    GatewayIntegration: false,
    PrinterConfig: false,
    LeadStatus: false,
    Widget: false,
    ActivitiesColor: false,
    SaveCancellationPolicy: false,
    SaveWaitList: false,
    ViewCancellationPolicy: false,
    ViewWaitList: false,
   
  }

  constructor(public route: ActivatedRoute,
     private router: Router,
     private _authService: AuthService) { }


  ngOnInit(): void {
    this.setPermisssions();
  }

  ngAfterViewInit() {
    
    // redirect the current tab.
    this.redirectActiveTab();
    
    this.isExternalSave = true;
  }

  //#region Events

  setPermisssions() {
    this.allowedPages.CancellationPolicy = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.CancellationPolicy_View);

    this.allowedPages.AdvanceSetting = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Advanced_View);
    this.allowedPages.SaveAdvanceSetting = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Advanced_Save);
    this.allowedPages.ViewAdvanceSetting = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Advanced_View);



    this.allowedPages.WaitingList = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.WaitList_View);

    this.allowedPages.Widget = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Widget);
    this.allowedPages.LeadStatus = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.LeadStatus);
    this.allowedPages.ActivitiesColor = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ActivitiesColor);
    this.allowedPages.GatewayIntegration = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.GatewayIntegration);
    this.allowedPages.PrinterConfig = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.PrinterConfig);
    this.allowedPages.SaveWaitList = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.WaitList_Save);
    this.allowedPages.SaveCancellationPolicy = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.CancellationPolicy_Save);
    this.allowedPages.ViewWaitList = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.WaitList_View);
    this.allowedPages.ViewCancellationPolicy = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.CancellationPolicy_View);
  }

  redirectActiveTab() {
    //get the url last index value
    this.href = this.router.url;
    let url = this.href.substring(this.href.lastIndexOf('/') + 1);

    switch (url) {
      case this.configurationsTypePath.Basic:
        this.selectedTabIndex = this.eNU_ConfigurationTab.basic;
        this.activeTab = this.configurationsTypes.Basic;
        break;
        
      case this.configurationsTypePath.Advanced:
        this.selectedTabIndex = this.eNU_ConfigurationTab.Advanced;
        this.activeTab = this.configurationsTypes.Advanced;
        break;  

      case this.configurationsTypePath.CancellationPolicy:
        this.selectedTabIndex = this.eNU_ConfigurationTab.CancellationPolicy;
        this.activeTab = this.configurationsTypes.CancellationPolicy;
        break;

      case this.configurationsTypePath.WaitingList:
        this.selectedTabIndex = this.eNU_ConfigurationTab.WaitList;
        this.activeTab = this.configurationsTypes.WaitingList;
        break;

      case this.configurationsTypePath.Payments:
        this.selectedTabIndex = this.eNU_ConfigurationTab.Payments;
          this.activeTab = this.configurationsTypes.Payments;
        break;
  
      case this.configurationsTypePath.POS:
        this.selectedTabIndex = this.eNU_ConfigurationTab.Pos;
        this.activeTab = this.configurationsTypes.POS;
        break;

      case this.configurationsTypePath.Lead:
        this.selectedTabIndex = this.eNU_ConfigurationTab.Lead;
        this.activeTab = this.configurationsTypes.Lead;
        break;

      case this.configurationsTypePath.Widget:
        this.selectedTabIndex = this.eNU_ConfigurationTab.Widget;
        this.activeTab = this.configurationsTypes.Widget;
        break;

      case this.configurationsTypePath.ActivitiesColor:
        this.selectedTabIndex = this.eNU_ConfigurationTab.ActivitiesColor;
        this.activeTab = this.configurationsTypes.ActivitiesColor;
        break;

      default:
        if(url.toString().includes(this.configurationsTypePath.Payments)){
          this.selectedTabIndex = this.allowedPages.ViewWaitList && this.allowedPages.ViewCancellationPolicy ? this.eNU_ConfigurationTab.Payments
                                  : !this.allowedPages.ViewWaitList && !this.allowedPages.ViewCancellationPolicy ? 1 : 2;
          this.activeTab = this.configurationsTypes.Payments;
          break;
        }
        break;
    }

    this.getDataByActiveTab(this.activeTab);

  }


  // On Tab Change 
  onTabChange(event: any) {
    this.setPermisssions();
    this.selectedTabIndex = event.index;
    this.activeTab = event.tab.textLabel;
    this.getDataByActiveTab(this.activeTab);
  }

  // On Save
  onSave() {
    switch (this.activeTab) {
      case this.configurationsTypes.Basic: {
        this.basicComponent.savebasicBranchSetting();
        break;
      }
      case this.configurationsTypes.Advanced: {
        this.advancedComponent.saveAdvanceSetting();
        break;
      }
      case this.configurationsTypes.CancellationPolicy: {
        this.cancellationPolicyComponent.onSaveCancellationPolicy();
        break;
      }
      case this.configurationsTypes.WaitingList: {
        this.waitlistComponent.onSave();
        break;
      }
      case this.configurationsTypes.ActivitiesColor: {
        this.activitiesColorComponent.saveActivitiesColor();
        break;
      }
      case this.configurationsTypes.Payments: {
        // this.paymentsComponent.saveWidgetPaymentGatwayIntergration();
        // this.paymentsComponent.saveCheckoutGateways();
        this.paymentsComponent.onSave();
        break;
      }
    }
  }

  // On Reset 
  onReset() {
    switch (this.activeTab) {
      case this.configurationsTypes.Basic: {
        this.basicComponent.onReset();
        break;
      }
      case this.configurationsTypes.Advanced: {
        this.advancedComponent.setDefaultValues();
        break;
      }
      case this.configurationsTypes.CancellationPolicy: {
        this.cancellationPolicyComponent.onReset();
        break;
      }
      case this.configurationsTypes.WaitingList: {
        this.waitlistComponent.onReset();
        break;
      }
      case this.configurationsTypes.Payments: {
        this.paymentsComponent.resetForm();
        break;
      }
      case this.configurationsTypes.ActivitiesColor: {
        this.activitiesColorComponent.onReset();
        break;
      }
    }
  }
  //#endregion

  //#region Methods

  getDataByActiveTab(activeTab: string) {
    this.isExternalSave = false;
    switch (activeTab) {
      case this.configurationsTypes.Basic: {
        this.isResetButtonShow = true;
        this.isExternalSave = true;
        //this.basicComponent.getFundamental();
        break;
      }
      case this.configurationsTypes.Advanced: {
        this.isResetButtonShow = true;
        this.isExternalSave = true;
        break;
      }
      case this.configurationsTypes.CancellationPolicy: {
        this.isResetButtonShow = true;
        this.isExternalSave = true;
        //this.cancellationPolicyComponent.ngOnInit();
        break;
      }

      case this.configurationsTypes.WaitingList: {
        this.isResetButtonShow = true;
        this.isExternalSave = true;
        //this.waitlistComponent.ngOnInit();
        break;
      }

      case this.configurationsTypes.POS: {
        break;
      }

      case this.configurationsTypes.Lead: {
        break;
      }

      case this.configurationsTypes.Widget: {
        break;
      }

      case this.configurationsTypes.ActivitiesColor: {
        this.isExternalSave = true;
        this.isResetButtonShow = true;
        //this.activitiesColorComponent.getFundamentals();
        break;
      }

      case this.configurationsTypes.Payments: {
        this.isResetButtonShow = true;
        this.isExternalSave = true;
        //this.paymentsComponent.ngOnInit();
        break;
      }

    }
    //#end Methods region

  }
}

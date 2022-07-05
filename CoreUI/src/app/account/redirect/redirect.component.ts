import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '@app/services/app.http.service';
import { StaffApi } from '@helper/config/app.webapi';
import { Messages } from '@helper/config/app.messages';

import { MessageService } from '@app/services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';
import { StaffAuthentication } from '@app/models/common.model';
import { variables } from '@app/helper/config/app.variable';
import { DataSharingService } from '@app/services/data.sharing.service';
import { SessionService } from '@app/helper/app.session.service';
import { CustomerType, ENU_EnterPriseUrlType, ProductModulePagesEnum } from '@app/helper/config/app.enums';


@Component({
  selector: 'redirect',
  templateUrl: './redirect.component.html'
})

export class RedirectComponent {

  /* Model References */
  staffAuthentication:StaffAuthentication = new StaffAuthentication ;

  /* Local Members */
  EnterpriseAuthToken: string;
  enterPriseBranchID:string;
  copyCoreToken:string = "";

  /* Error Messages */
  hasError: boolean;
  errorMessage: string;
  messages = Messages;

  constructor(
    private _router: Router,
    private _httpService: HttpService,
    private _route: ActivatedRoute,
    private _dataSharingSrevice: DataSharingService,
    private _messageService: MessageService) {}


  ngOnInit() {

    this.getTokenFromRoute();
  }
  //getting the url from route
  getTokenFromRoute() {
    let enterPriseToken = this._route.snapshot.queryParams.ID;
    let enterPriseCompanyID = this._route.snapshot.params.CompanyID;
    let enterPriseBranchID = this._route.snapshot.params.BranchID;
    let enterPriseRouteType = this._route.snapshot.params.Type;
    let enterPrisePersonID = this._route.snapshot.params.TypeID;
    let enterPriseBranchEdit = this._route.snapshot.params.IsBranchEdit;
    let enterPriseCustomerTypeID = Number(this._route.snapshot.params.CustomerTypeID);
   //here we are checking if we have enterprise token from url and we also also have core token in local storage (means user is already logedin core then we make the copy of
   // core token )
    if(enterPriseToken != null){
      const coreToken: string = AuthService.getAccessToken();
      if (coreToken !=  null && coreToken != "") {
        this.copyCoreToken =  JSON.parse(JSON.stringify(coreToken));
      }
    }

    if (enterPriseToken && enterPriseBranchID && enterPriseRouteType) {
      this.enterpriseTokenAutheniction(enterPriseCompanyID,enterPriseToken, enterPriseBranchID, enterPriseRouteType,enterPrisePersonID,enterPriseCustomerTypeID,enterPriseBranchEdit)
    }
  }


  enterpriseTokenAutheniction(enterPriseCompanyID,enterPriseToken,enterPriseBranchID,enterPriseRouteType,enterPrisePersonID,enterPriseCustomerTypeID,enterPriseBranchEdit) {

   if(enterPriseToken != undefined && enterPriseBranchID != undefined){
    AuthService.setAccessToken(enterPriseToken);
    this.staffAuthentication.CoreAuthToken =  this.copyCoreToken == null || this.copyCoreToken == "" ? null : this.copyCoreToken;;
    this.staffAuthentication.EnterpriseAuthToken = enterPriseToken;
    this.staffAuthentication.BranchID = Number(enterPriseBranchID);
      this._httpService.save(StaffApi.staffAuthenication ,this.staffAuthentication).subscribe(
      (data) => {
        if (data && data.Result) {
          localStorage.setItem(variables.CompanyID, enterPriseCompanyID);
          this.sharedCompanyID(Number(enterPriseCompanyID));
          AuthService.setAccessToken(data.Result.access_token);
          localStorage.setItem(variables.BranchID, enterPriseBranchID);
          SessionService.setBranchID(this.staffAuthentication.BranchID);
          this.requestedEnterPriseUrlEdit(enterPriseRouteType,enterPrisePersonID,this.staffAuthentication.BranchID,enterPrisePersonID,enterPriseCustomerTypeID,enterPriseBranchEdit);
        }
        else{
          AuthService.logout();

          this._router.navigateByUrl('/');
        }
      },
      (error) => {
        AuthService.logout();

        this._router.navigateByUrl('/');
        this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace("{0}", "login")
        );
      }
    );
   }
  }

  requestedEnterPriseUrlEdit(enterPriseRouteType,enterPrisePersonID,BranchID,requiredID,enterPriseRedirectTypeID,enterPriseBranchEdit){
    let urlTobeEdit;
    if(enterPriseRouteType && (enterPrisePersonID > 0 || BranchID > 0)){

      switch (Number(enterPriseRouteType)) {
        case (ENU_EnterPriseUrlType.Branch): {
          if(enterPriseBranchEdit == 'true'){
          urlTobeEdit = '/setup/branch/save/'+BranchID;
          }
          else{
            urlTobeEdit = '/';
          }
          break;
        }
        case (ENU_EnterPriseUrlType.Staff): {
          urlTobeEdit = '/staff/details/'+requiredID;
          break;
        }
        case(ENU_EnterPriseUrlType.Product):{

          if(enterPriseRedirectTypeID == ProductModulePagesEnum.Supplier){
          urlTobeEdit = '/product/suppliers/details/'+requiredID;
          }
          else if(enterPriseRedirectTypeID == ProductModulePagesEnum.Attribute){
           urlTobeEdit = '/product/attributes';
           this.sharedAttributeID(requiredID);
          }
          else if (enterPriseRedirectTypeID == ProductModulePagesEnum.PurchaseOrder) {
            urlTobeEdit = '/product/purchase-order/details/'+ requiredID;            
          }
          else if(enterPriseRedirectTypeID == ProductModulePagesEnum.Brand){
            urlTobeEdit = '/product/brands';
            this.sharedBrandID(requiredID);
           }
          else if(enterPriseRedirectTypeID == ProductModulePagesEnum.Products){
            urlTobeEdit = '/product/products';
          }
          else if(enterPriseRedirectTypeID == ProductModulePagesEnum.Category){
            urlTobeEdit = '/product/categories';
            this.sharedCategoryID(requiredID);

          }
          break;
        }
        case (ENU_EnterPriseUrlType.Setup_Tax): {

          urlTobeEdit = '/setup/taxes'+ "?TaxID="+ requiredID;
          break;
        }
        case (ENU_EnterPriseUrlType.Customer): {
          if(enterPriseRedirectTypeID == CustomerType.Client){
            urlTobeEdit = '/customer/client/details/'+requiredID;
          }
          else if(enterPriseRedirectTypeID == CustomerType.Member){
            urlTobeEdit = '/customer/member/details/'+requiredID;

          }
          else {
            urlTobeEdit = '/lead/details/'+requiredID;
          }
          break;
        }
      }
      this._router.navigateByUrl(urlTobeEdit);
    }
  }


  sharedCompanyID(companyID){
    this._dataSharingSrevice.shareCompanyID(companyID);
  }
  sharedAttributeID(attributeID) {
    this._dataSharingSrevice.shareAttributeID(attributeID);
  } 
  sharedBrandID(brandID) {
    this._dataSharingSrevice.shareBrandID(brandID);
  }
  sharedCategoryID(CategoryID) {
    this._dataSharingSrevice.shareCategoryID(CategoryID);
  }

  showErrorMessage(message: string) {
    this.hasError = true;
    this.errorMessage = message;
  }

  // #endregion
}

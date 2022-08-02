/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

/********************** Services & Models *********************/

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { SupplierBranch, SupplierViewModel } from '../../models/supplier.models';
import { ApiResponse } from 'src/app/models/common.model';

/**********************  Components *********************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/********************** Configurations *********************/
import { EnumSaleSourceType, SupplierValidation } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { SupplierApi } from 'src/app/helper/config/app.webapi';


@Component({
  selector: "app-save-supplier",
  templateUrl: "./save.supplier.component.html",
})
export class SaveSupplierComponent extends AbstractGenericComponent implements OnInit{

  @ViewChild("SupplierInformation") supplierInformation: NgForm;

  /***********Messages*********/
  messages = Messages;

  /***********Objects*********/
  supplierValidationENUM = SupplierValidation;
  branchInfo :SupplierBranch = new SupplierBranch();
  supplierObj: SupplierViewModel = new SupplierViewModel();
  countryList: [];
  titleList = [];

  /*********** Local *******************/
  errorMsg: string = "";
  showError: boolean = false;
  defaultCountry: string;
  isSaveClicked: boolean = false;
  supplierID: number = 0;
  appSourceTypeID = EnumSaleSourceType;
  isActive: boolean = true;

  constructor(
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    super();
    // this.getCompanyDetails();
    this.getCurrentBranchDetail();
    this.getSaveFundamentals();
  }

  ngOnInit(): void {
    // here we get the id from route
    this.route.params.subscribe((params: Params) => {
      let supplierID = params["ID"];
      this.supplierID = Number(supplierID);
      if (this.supplierID > 0) {
        this.getSupplierByID();
      }
    });
  }

   // #region method start

  /* get branch details */
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("ISOCode")) {
      this.defaultCountry = branch.ISOCode.toLowerCase();
      this.getBranchInfo(branch.BranchID)
    }
  }

  /* get company details */
  // async getCompanyDetails() {
  //   const company = await super.getCompanyDetail(this._dataSharingService);
  //   if (company) {
  //     this.supplierObj.CountryID  = company.CountryID;
  //   }
  // }

  // show the validation msg
  showValidation(event, supplierInformation: NgForm, supplierValidationType) {
    event = event.trim();
    if (supplierValidationType == this.supplierValidationENUM.SupplierName) {
      if (event == "") {
        this.showError = true;
        this.errorMsg = Messages.Validation.Info_Required;
      } else {
        this.showError = false;
        this.errorMsg = "";
      }
    } else if ((supplierValidationType = this.supplierValidationENUM.Email)) {
      if (supplierInformation.controls.email?.errors) {
        this.errorMsg = Messages.Validation.Email_Invalid;
      } else {
        this.errorMsg = "";
      }
    }
  }

  // get the branch info
  getBranchInfo(BranchID : number){
    this.branchInfo.BranchID = BranchID;
    this.branchInfo.IsIncluded = true;
    this.branchInfo.IsActive = this.isActive;
    this.supplierObj.SupplierBranchVM.push(this.branchInfo);

  }

  // get the fundamentals list
  getSaveFundamentals() {
    this._httpService.get(SupplierApi.getfundamentals).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.countryList = response.Result.CountryList;
          this.titleList = response.Result.TitleList;
        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Supplier")
          );
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Supplier")
        );
      }
    );
  }

  //check the validation and then save supplier info
  onSave(supplierInformation: NgForm) {
    if (this.supplierInformation.valid) {
      this.showError = false;
      this.saveSupplierInformation();
    } else {
      this.getErrorMessage(supplierInformation);
    }
  }

  // get the supplier by ID
   getSupplierByID() {
      this._httpService
        .get(SupplierApi.getSupplierByID + this.supplierID)
        .subscribe(
          (response: ApiResponse) => {
            if (response.MessageCode > 0) {
              this.supplierObj = response.Result;
              let filteredBranch = this.supplierObj.SupplierBranchVM.filter(i => i.BranchID == this.branchInfo.BranchID);
              this.isActive = filteredBranch[0].IsActive;
            }
            else if(response.MessageCode < 0){
              this._messageService.showErrorMessage(response.MessageText);
              this._router.navigate(["/product/suppliers"]);
            }
             else {
              this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace("{0}", "Supplier")
              );
            }
          },
          (error) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Get_Error.replace("{0}", "Supplier")
            );
          }
        );
    }

  // error showing
  getErrorMessage(supplierInformation: NgForm) {
    if (supplierInformation.invalid) {
      if (supplierInformation.controls.supplierName?.errors) {
        this.errorMsg = Messages.Validation.Info_Required;
        this.showError = true;
      } else if (supplierInformation.controls.email?.errors) {
        this.errorMsg = Messages.Validation.Email_Invalid;
      } else {
        this.errorMsg = Messages.Validation.Phone_Invalid;
      }
    } else {
      this.errorMsg = "";
    }
  }

  // save the supplier information
  saveSupplierInformation() {
    this.isSaveClicked = true;
    this.supplierObj.SupplierBranchVM = this.supplierObj.SupplierBranchVM.filter(i => i.BranchID == this.branchInfo.BranchID);
    this.supplierObj.SupplierBranchVM[0].IsActive = this.isActive;
    this._httpService.save(SupplierApi.saveSupplier, this.supplierObj)
      .subscribe(
        (response: ApiResponse) => {
          if (response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Save_Success.replace("{0}", "Supplier")
            );
            this._router.navigate(["/product/suppliers"]);
          }else if(response.MessageCode < 0){
            this._messageService.showErrorMessage(response.MessageText);
            this._router.navigate(["/product/suppliers"]);
          }
           else {
            this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Supplier"));
            this.isSaveClicked = false;
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Supplier")
          );
          this.isSaveClicked = false;
        }
      );
  }
}
   // #region method End

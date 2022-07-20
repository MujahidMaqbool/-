import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";

/********************** Angular References *********************/
import { Component, OnInit, ViewChild, OnDestroy, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription } from "rxjs";
/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from "src/app/services/data.sharing.service";
import { HttpService } from "src/app/services/app.http.service";

/* Models */
import { MemberNextOfKin } from "src/app/models/next.of.kin.model";

/********************** Common *********************/
import { Messages } from "src/app/helper/config/app.messages";
import {
  MemberNextOfKinApi,
  CompanyDetailsApi,
} from "src/app/helper/config/app.webapi";
import { ApiResponse, CompanyInfo } from "src/app/models/common.model";
import { MessageService } from "src/app/services/app.message.service";
import { CompanyDetails } from "src/app/setup/models/company.details.model";

@Component({
  selector: "next-of-kin",
  templateUrl: "./next-of-kin.component.html",
})
export class NextOfKinComponent
  extends AbstractGenericComponent
  implements OnInit, OnDestroy {
  // #region Local definitions
  @ViewChild("memberNextOfKinForm") nextOfKinForm: NgForm;
  defaultCountry: string;

  /* Model Refrences*/
  public memberNextOfKin: MemberNextOfKin = new MemberNextOfKin();
  public companyDetails: CompanyDetails = new CompanyDetails();

  /* Local Members */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  errorMessage: string;
  successMessage: string;
  messages = Messages;
  customerID: number;
  customerType: number;
  titleList = ["Mr", "Ms", "Mrs", "Miss", "Mx"];
  nextOfkinModelCopy: any;
  shouldGetPersonInfo: boolean = false;
  memberIdSubscription: ISubscription;
  customerTypeIdSubscription: ISubscription;
  hascurrencyFormated: boolean = false;
  currencyFormat: string;

  /***********Collection & Models*********/
  // personInfo: PersonInfo;
  relationshipTypeList: any[] = [];
  countryList: any[];
  stateList: any[];
  stateListByCountryId: any[];
  cityList: any[];
  cityListByStateId: any[];

  // #endregion

  constructor(
    private _nextofKinService: HttpService,
    private _httpService: HttpService,
    public _dataSharingService: DataSharingService,
    private _messageService: MessageService
  ) {
    super();
  }

  ngOnInit() {
    this.getCurrentBranchDetail();
    this.getCustomerType();
    this.getNextOfKinFundamentals();
    this.getCompanyDetails();
  }
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("ISOCode")) {
      this.defaultCountry = branch.ISOCode.toLowerCase();
    }
  }
  ngOnDestroy() {
    this.memberIdSubscription.unsubscribe();
    this.customerTypeIdSubscription.unsubscribe();
  }

  // #region events

  onCountryChange(countryId: number) {
    // this.getStatesByCountryId(countryId);
    // if (this.stateListByCountryId && this.stateListByCountryId.length > 0) {
    //     /* If No StateCountyID is set, then set First StateCounty from StateCounty list*/
    //     this.memberNextOfKin.StateCountyID = (this.memberNextOfKin.StateCountyID && this.memberNextOfKin.StateCountyID > 0) ? this.memberNextOfKin.StateCountyID : this.stateListByCountryId[0].StateCountyID;
    // }
  }

  // #endregion

  // #region methods

  saveNextOfKin(isValid: boolean) {
    if (isValid && this.nextOfKinForm.dirty) {
      this.hasSuccess = false;
      this.hasError = false;
      this.memberNextOfKin.CustomerID = this.customerID;
      this.memberNextOfKin.Email = this.memberNextOfKin.Email.toLowerCase();
      this._nextofKinService
        .save(MemberNextOfKinApi.save, this.memberNextOfKin)
        .subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {

              this.getMemberNextOfKin(this.memberNextOfKin.CustomerID);
              this.nextOfkinModelCopy = Object.assign({}, this.memberNextOfKin);
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace("{0}", "Next of Kin")
              );
            } else {
              this._messageService.showErrorMessage(res.MessageText);
            }
          },
          (err) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace("{0}", "Next of Kin")
            );
          }
        );
    }
  }

  getStatesByCountryId(countryId: number) {
    if (this.stateList && this.stateList.length > 0) {
      this.stateListByCountryId = this.stateList.filter(
        (c) => c.CountryID == countryId
      );
    }
  }

  getCitiesByStateId(stateId: number) {
    if (this.cityList && this.cityList.length > 0) {
      this.cityListByStateId = this.cityList.filter(
        (c) => c.StateCountyID == stateId
      );
    }
  }

  setDefaultDropdowns() {
    /* If there is no Title is selected, then select the first value from list  */
    this.memberNextOfKin.Title =
      !this.memberNextOfKin.Title || this.memberNextOfKin.Title === "0"
        ? undefined
        : this.memberNextOfKin.Title;

    /* If there is no relationship title is selected, then select the first value from list  */
    //this.memberNextOfKin.RelationshipTypeID = (this.memberNextOfKin.RelationshipTypeID && this.memberNextOfKin.RelationshipTypeID > 0) ? this.memberNextOfKin.RelationshipTypeID : this.relationshipTypeList[0].RelationshipTypeID;


    // this.memberNextOfKin.CountryID = (this.memberNextOfKin.CountryID && this.memberNextOfKin.CountryID > 0) ? this.memberNextOfKin.CountryID : this.countryList[0].CountryID;
    // this.onCountryChange(this.memberNextOfKin.CountryID);
  }

  getNextOfKinFundamentals() {
    this._nextofKinService.get(MemberNextOfKinApi.getFundamentals).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.countryList = res.Result.CountryList;
          this.stateList = res.Result.StateCountyList;
          this.relationshipTypeList = res.Result.RelationshipTypeList;
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (error) =>
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        )
    );
  }

  getCustomerType() {
    this.customerTypeIdSubscription = this._dataSharingService.customerTypeID.subscribe(
      (customerType) => {
        setTimeout(() => {
          this.customerType = customerType;
        });
      }
    );
  }

  getMemberID() {
    this.memberIdSubscription = this._dataSharingService.customerID.subscribe(
      (memberId) => {
        setTimeout(() => {
          if (this.customerID !== memberId) {
            this.customerID = memberId;
            //set PersonID and PersonTypeID for personInfo
            // this.personInfo = new PersonInfo();
            // this.personInfo.PersonID = this.customerID;
            // this.personInfo.PersonTypeID = this.customerType;
            this.shouldGetPersonInfo = true;
            this.getMemberNextOfKin(this.customerID);
          }
        });
      }
    );
  }

  getMemberNextOfKin(memberID: number) {
    this._nextofKinService.get(MemberNextOfKinApi.get + memberID).subscribe(
      (res:ApiResponse) => {
        if (res && res.Result) {
          this.memberNextOfKin = res.Result;
          //this.memberNextOfKin.StateCountyID = this.memberNextOfKin.StateCountyID == null ? undefined : this.memberNextOfKin.StateCountyID;
          this.setDefaultDropdowns();
          this.nextOfkinModelCopy = Object.assign({}, this.memberNextOfKin);
          this.hascurrencyFormated = true;
           /* If No Country ID is set, then set First Country from country list*/
           this.memberNextOfKin.CountryID = !this.memberNextOfKin.CountryID
           ? undefined
           : this.memberNextOfKin.CountryID;
        } else {
          this.nextOfKinForm.resetForm();
          this.memberNextOfKin = new MemberNextOfKin();
          this.memberNextOfKin.CustomerID = this.customerID;
          this.hascurrencyFormated = true;
          this.setDefaultDropdowns();
          /* If No Country ID is set, then set First Country from country list*/
          this.memberNextOfKin.CountryID = !this.memberNextOfKin.CountryID
          ? this.companyDetails.CountryID
          : this.memberNextOfKin.CountryID;
        }
      },
      (error) =>
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Next of Kin")
        )
    );
  }

  resetForm() {
    if (this.memberNextOfKin.CustomerKinID > 0) {
      this.memberNextOfKin = Object.assign({}, this.nextOfkinModelCopy);
      this.memberNextOfKin.CountryID = !this.memberNextOfKin.CountryID
      ? undefined
      : this.memberNextOfKin.CountryID;
    } else {
      this.nextOfKinForm.resetForm();
      setTimeout(() => {
        this.setDefaultDropdowns();
        /* If No Country ID is set, then set First Country from country list*/
        this.memberNextOfKin.CountryID = !this.memberNextOfKin.CountryID
        ? this.companyDetails.CountryID
        : this.memberNextOfKin.CountryID;
      });
    }
  }

  async getCompanyDetails() {

    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyDetails = company;
      this.getMemberID();

    }
    
  }

  // #endregion
}

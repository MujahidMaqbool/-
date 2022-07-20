import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
/********************** Angular References *********************/
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription } from "rxjs";
/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { AuthService } from 'src/app/helper/app.auth.service';

/* Models */
import { NextOfKin } from 'src/app/models/next.of.kin.model';
import { PersonInfo, DD_Branch, ApiResponse } from 'src/app/models/common.model';

/********************** Common *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { NextOfKinApi } from 'src/app/helper/config/app.webapi';
import { PersonType } from 'src/app/helper/config/app.enums';
import { Configurations } from 'src/app/helper/config/app.config';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'staff-next-of-kin',
    templateUrl: './staff.next.of.kin.component.html'
})

export class StaffNextOfKinComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    @ViewChild('nextOfKinForm') nextOfKinForm: NgForm;

    isBackToSearchAllowed: boolean = false;

    /* Local Members */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    errorMessage: string;
    successMessage: string;
    messages = Messages;
    staffID: number = 0;
    nextOfkinModelCopy: any;
    defaultCountry: string;
    shouldGetPersonInfo: boolean = false;
    hascurrencyFormated: boolean = false;
    currencyFormat: string;

    /* Collection Types */
    personType: PersonType;
    personInfo: PersonInfo;
    relationshipTypeList: any[] = [];
    titleList = [];
    countryList: any[];
    stateList: any[];
    stateListByCountryId: any[];
    cityList: any[];
    cityListByStateId: any[];

    /* Model Refrences*/
    staffIDSubscription: ISubscription;
    public nextOfKin: NextOfKin = new NextOfKin();
   
    // #endregion

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
    ) {super(); }

    ngOnInit() {
       this.getCurrentBranchDetail();
        this.getNextOfKinFundamentals();
        this.getStaffID();

        this.isBackToSearchAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.View);
    }
    async getCurrentBranchDetail(){
        const branch =  await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("ISOCode")) {
            this.defaultCountry = branch.ISOCode.toLowerCase();
            this.hascurrencyFormated = true;
          }
      }
    ngOnDestroy() {
        this.staffIDSubscription.unsubscribe();
    }

    // #region Events

    onCountryChange(countryId: number) {
        // this.getStatesByCountryId(countryId);
        // if (this.stateListByCountryId && this.stateListByCountryId.length > 0) {
        //     /* If No StateCountyID is set, then set First StateCounty from StateCounty list*/
        //     this.nextOfKin.StateCountyID = (this.nextOfKin.StateCountyID && this.nextOfKin.StateCountyID > 0) ? this.nextOfKin.StateCountyID : this.stateListByCountryId[0].StateCountyID;
        // }
    }

    // #endregion

    // #region methods

    getNextOfKinFundamentals() {
        this._httpService.get(NextOfKinApi.getFundamentals).subscribe(
            (data:ApiResponse) => {
                if (data && data.MessageCode > 0) {
                    this.relationshipTypeList = data.Result.RelationshipTypeList;
                    this.countryList = data.Result.CountryList;
                    this.stateList = data.Result.StateCountyList;
                    this.cityList = data.Result.CityList;
                    this.titleList = data.Result.TitleList;
                    this.nextOfkinModelCopy = Object.assign({}, this.nextOfKin);
                }else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            error => this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error),
        );
    }

    getStaffID() {
        this.staffIDSubscription = this._dataSharingService.staffID.subscribe(staffId => {
            setTimeout(() => {
                if (this.staffID !== staffId) {
                    this.staffID = staffId
                    //set PersonID and PersonTypeID for personInfo
                    this.personInfo = new PersonInfo();
                    this.personInfo.PersonID = this.staffID;
                    this.shouldGetPersonInfo = true;
                    this.getNextOfKin(this.staffID);

                }
            })
        })
    }

    getNextOfKin(StaffID: number) {
        this._httpService.get(NextOfKinApi.get + StaffID)
            .subscribe(
                (data: ApiResponse)=> {
                    if (data && data.MessageCode > 0 && data.MessageCode != 204) {
                        this.nextOfKin = data.Result;
                        this.nextOfkinModelCopy = Object.assign({}, this.nextOfKin);
                        this.hascurrencyFormated = true;
                    }
                    else {
                        this.nextOfKinForm.resetForm();
                        this.nextOfKin = new NextOfKin();
                        this.nextOfKin.AssignedToStaffID = this.staffID;
                        this.hascurrencyFormated = true;
                        //this._messageService.showErrorMessage(data.MessageText);
                      
                    }
                    this.setDefaultDropdowns();
                },
                error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Next of Kin"))
            );
    }

    getStatesByCountryId(countryId: number) {
        if (this.stateList && this.stateList.length > 0) {
            this.stateListByCountryId = this.stateList.filter(c => c.CountryID == countryId);
        }
    }

    getCitiesByStateId(stateId: number) {
        if (this.cityList && this.cityList.length > 0) {
            this.cityListByStateId = this.cityList.filter(c => c.StateCountyID == stateId);
        }
    }

    saveNextOfKin(isValid: boolean) {
        if (isValid && this.nextOfKinForm.dirty) {
            this.hasSuccess = false;
            this.hasError = false;
            this.nextOfKin.AssignedToStaffID = this.staffID;
            this.nextOfKin.Email = this.nextOfKin.Email.toLowerCase();
            this._httpService.save(NextOfKinApi.save, this.nextOfKin)
                .subscribe((res:ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.getNextOfKin(this.nextOfKin.AssignedToStaffID);
                        this.nextOfkinModelCopy = Object.assign({}, this.nextOfKin);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Next of Kin"));
                        this.nextOfKinForm.resetForm(this.nextOfKin);
                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Next of Kin"));
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Next of Kin")); }
                );
        }
    }

    setDefaultDropdowns() {
        this.nextOfKin.Title = this.nextOfKin?.Title && this.nextOfKin?.Title !== '' ? this.nextOfKin.Title : this.titleList[0];
        this.nextOfKin.RelationshipTypeID = this.nextOfKin?.RelationshipTypeID && this.nextOfKin?.RelationshipTypeID > 0 ? this.nextOfKin.RelationshipTypeID : this.relationshipTypeList[0].RelationshipTypeID;

        /* If No Country ID is set, then set First Country from country list*/
        this.nextOfKin.CountryID = (this.nextOfKin?.CountryID && this.nextOfKin?.CountryID > 0) ? this.nextOfKin?.CountryID : undefined;
        //this.onCountryChange(this.nextOfKin.CountryID);
    }

    resetForm() {
        if (this.nextOfKin.StaffKinID > 0) {
            this.nextOfKin = Object.assign({}, this.nextOfkinModelCopy);
        } else {
            this.nextOfKinForm.resetForm();
        }
    }

    // #endregion

}

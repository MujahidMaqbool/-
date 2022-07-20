// #region Definitions

/********************** Angular References *********************/
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, Inject } from '@angular/core';
/********************** Services & Models *********************/
/* Models */

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { ApiResponse, CustomerBillingAddress, DD_Branch } from 'src/app/models/common.model';
import { variables } from 'src/app/helper/config/app.variable';
import { NgForm, FormControl } from '@angular/forms';
import { CustomerApi, CompanyDetailsApi, BranchApi } from 'src/app/helper/config/app.webapi';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaveMemberMembershipPopup } from '../add-member-membership/save-membership-popup/save.member.membership.popup';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { CustomerType } from 'src/app/helper/config/app.enums';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion

@Component({
    selector: 'customer-billing-address',
    templateUrl: './customer.billing.address.component.html'
})

export class CustomerShippingAddress extends AbstractGenericComponent implements OnInit, AfterViewInit {
    @ViewChild('BillingAddress') memberForm: NgForm;
    @Output() customerBAddress = new EventEmitter<CustomerBillingAddress>();
    customerBillingAddress: CustomerBillingAddress = new CustomerBillingAddress();
    @Output() onCancel = new EventEmitter<boolean>()
    searchState: FormControl = new FormControl();
    @Input() countryList: any[];
    stateList: any = [];
    stateListCopy: any[];


    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    hascurrencyFormated: boolean = false;
    currencyFormat: any;
    defaultCountry: any;
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    companyDetails: any;
    stateCountyCodeRequired: boolean = false;

    constructor(
        public _httpService: HttpService,
        public _messageService: MessageService,
        private _dialog: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _router: Router,
        private _dialogRef: MatDialogRef<CustomerShippingAddress>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            super();
    }

    ngOnInit() {

        this.customerBillingAddress.CustomerId = typeof this.data === 'object' ? this.data.customerID : this.data;
        // this.countryList = JSON.parse(localStorage.getItem(variables.CountryList));
        this.getCurrentBranchDetail();
        this.getBranchFundamentals().then(response => {
            if (response) {
                this.getCompanyDetails();
            }
        });
    }

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.Currency.toLowerCase().substring(0, branch.Currency.length - 1);
            this.hascurrencyFormated = true;
        }
    }
    
    getBranchFundamentals() {
        return new Promise((resolve, reject) => {
            this._httpService.get(BranchApi.getBranchFundamentals).subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.countryList = res.Result.CountryList;
                        this.stateList = res.Result.StateCountyList;
                        if (this.countryList.length > 0) {
                            //this.setDefaultDropdowns();
                        }
                        return resolve(true);
                    } else {
                        this._messageService.showErrorMessage(res.MessageText)
                    }
                },
                (error) => {
                    this._messageService.showErrorMessage(
                        this.messages.Error.Dropdowns_Load_Error
                    );
                    return reject(false);
                }
            );
        })
    }
    async getCompanyDetails() {
        const company = await super.getCompanyDetail(this._dataSharingService);
        if (company) {
            this.companyDetails = company;
            this.customerBillingAddress.CountryID = this.companyDetails.CountryID;
            const selectedCountry = this.countryList.find(x => x.CountryID == this.customerBillingAddress.CountryID);
            this.customerBillingAddress.isStateCounty = selectedCountry.CountryID == 2 ? true : false;
            if (selectedCountry !== undefined) {
                this.customerBillingAddress.CountryName = selectedCountry.CountryName;
            }
        }

    }

    ngAfterViewInit() {

        this.searchState.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length >= 2) {
                    if (typeof (searchText) === "string") {
                        this.stateListCopy = this.filter(searchText)
                    }
                }
                else {
                    this.stateListCopy = JSON.parse(JSON.stringify(this.stateList));
                }
            });
    }

    // filtered list on front end  side
    filter(value: string): any {
        const filterValue = value.toLowerCase();
        if (filterValue.length == 2) {
            return this.stateList.filter(state => {
                return state.StateCountyCode.toLowerCase().indexOf(filterValue) === 0;
            });
        } else {
            return this.stateList.filter(state => {
                return state.StateCountyName.toLowerCase().indexOf(filterValue) === 0;
            });
        }
    }
    /**set default dropdown value.If No Country ID is set, then set First Country from country list*/
    setDefaultDropdowns() {
        //this.customerBillingAddress.CountryID = this.countryList[0].CountryID;
        const selectedCountry = this.countryList.find(x => x.CountryID == this.customerBillingAddress.CountryID);
        if (selectedCountry !== undefined) {
            this.customerBillingAddress.CountryName = selectedCountry.CountryName;
        }
    }
    onClose(): void {
        this.onCancel.emit(true);
        this._dialogRef.close();
    }

    // this function just call in case of gocard less call from save.member.membership.popup.ts files
    onSaveDialoButtong(): void {
        this.onCancel.emit(false);
        this._dialogRef.close();
    }

    @Input()
    public set customerAddress(customerAddress: any) {
        this.customerBillingAddress = customerAddress;
    }

    @Input()
    public set isFormSubmitted(isFormSubmitted: boolean) {
        if (isFormSubmitted) {
            this.customerBAddress.emit(this.customerBillingAddress);
        }
    }

    @Input()
    public set currencyInfoforBillingAddress(currencyInfoforBillingAddress: any) {
        if (currencyInfoforBillingAddress) {
            this.hascurrencyFormated = currencyInfoforBillingAddress.hascurrencyFormated;
            this.currencyFormat = currencyInfoforBillingAddress.currencyFormat;
            this.defaultCountry = currencyInfoforBillingAddress.defaultCountry;
        }
    }

    onSave(isValid: boolean) {
        if (isValid) {
            if (this.customerBillingAddress.CountryID == 2) {
                if (this.isSelecctedStateCounty()) {
                    this.saveCustomerBillingAddress();
                } else {
                    this.stateCountyCodeRequired = true;
                }
            } else {
                this.saveCustomerBillingAddress();
            }
        }
    }

    saveCustomerBillingAddress() {
        if (this.customerBillingAddress.CustomerId && this.customerBillingAddress.CustomerId > 0) {
            this._httpService.save(CustomerApi.updateCustomerBillingAddress, this.customerBillingAddress)
                .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Billing Address"));

                        if (this.data?.isPayTabsIntegrated) {
                            this._dataSharingService.shareCustomerBillingAddress(this.customerBillingAddress);
                        }
                        else {
                            if (!this.data?.isGoCardLess || this.data?.isGoCardLess == undefined) {
                                this.openLeadWon();
                            }
                        }
                        if (!this.data?.isGoCardLess || this.data?.isGoCardLess == undefined) {
                            this.onClose();
                        } else {
                            this.onSaveDialoButtong();
                        }
                    }
                    else if (res && res.MessageCode < 0) {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Billing Address"));
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Billing Address"));
                    }
                );
        }
        else {
            if (this.data?.isPayTabsIntegrated) {
                this._dataSharingService.shareCustomerBillingAddress(this.customerBillingAddress);
                this.onClose();
            }
        }
    }

    isSelecctedStateCounty() {
        let isValidState = false;
        let state = this.stateList.filter(x => x.StateCountyName == this.customerBillingAddress.StateCountyName && x.StateCountyCode == this.customerBillingAddress.StateCountyCode).length > 0 ? true : false;
        if (state && this.customerBillingAddress.CountryID == 2) {
            isValidState = true;
        };
        return isValidState;
    }

    openLeadWon() {
        const dialogref = this._dialog.open(SaveMemberMembershipPopup,
            {
                disableClose: true,
                data: {
                    CustomerID: this.data?.customerID,
                    CustomerTypeID: CustomerType.Client
                }
            });

        dialogref.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this._router.navigate(['customer/member/details/' + this.data?.customerID]);
            }
        });
    }
    // on change country 
    onChangeSelectedCountry() {
        const selectedCountry = this.countryList.find(x => x.CountryID == this.customerBillingAddress.CountryID);
        if (selectedCountry !== undefined) {
            this.customerBillingAddress.CountryName = selectedCountry.CountryName;
        }
    }

    // get selected state list
    getSelectedState(state: any, address: any) {
        // this.selectedState = state;
        this.customerBillingAddress.StateCountyName = this.stateList.filter(stat => stat.StateCountyName == state)[0].StateCountyName;
        this.customerBillingAddress.StateCountyCode = this.stateList.filter(stat => stat.StateCountyName == state)[0].StateCountyCode;
        this.stateCountyCodeRequired = false;
    }
}
import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { CustomerAddress, AllStateList } from "@app/models/common.model";
import { NgForm, ControlContainer, FormControl } from "@angular/forms";
import { AddressType } from "@app/helper/config/app.enums";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { Messages } from "@app/helper/config/app.messages";
import { CompanyDetails } from "@app/setup/models/company.details.model";
import { debounceTime } from "rxjs/operators";
import { Observable, SubscriptionLike } from "rxjs";
import { DataSharingService } from "@app/services/data.sharing.service";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";

@Component({
  selector: "app-address",
  templateUrl: "./address.component.html",
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class AddressComponent extends AbstractGenericComponent implements OnChanges, AfterViewInit {
  @Input() customerAddressList: CustomerAddress[] = [];
  @Input() stateList: any[];
  @Input() popupMode: boolean = false;
  stateListCopy: any[];

  @Input() countryList: any[];
  @Input() defaultCountry: string;
  @Input() tabIndex: string;
  @Input() isMember: boolean;
  @Input() customerID: number;
  @Output() isCustomerAddressRequire = new EventEmitter<boolean>();
  isSameBillingAddress: boolean = false;
  isSameShippingAddress: boolean = false;
  isBillingAddressRequired = false;
  isShippingAddressRequired = false;
  homeFieldsRequired = false;
  messages = Messages;
  isHomeAddressRequired = false;
  stateName: string = '';
  searchState: FormControl = new FormControl();
  searchState2: FormControl = new FormControl();
  searchState3: FormControl = new FormControl();
  allStateList: any[];
  searchStateFilter: Observable<any>;
  customerAddressSubscription: SubscriptionLike;
  addressTypes = AddressType;
  companyDetails: CompanyDetails = new CompanyDetails();
  selectedState: string;
  constructor(
    public _dataSharingService: DataSharingService,
  ) { super() }

  ngOnInit() {

    this.customerAddressSubscription = this._dataSharingService.isExistCountyCodeName.subscribe(
      (customerList: any) => {
        for (let index = 0; index < customerList.length; index++) {
          this.customerAddressList[index].isRequiredCOuntyCode = customerList[index].isRequiredCOuntyCode;
        }
      }
    );
  }

  ngAfterViewInit() {
    this.getCompanyDetails();

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
    this.searchState2.valueChanges
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
    this.searchState3.valueChanges
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

  ngOnDestroy() {
    this.customerAddressSubscription.unsubscribe();
  }

  // filter state county (with full state name or 2digit state code)
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

  // get selected county name and code and required field false
  getSelectedState(state: AllStateList, address: any) {
    address.StateCountyName = this.stateList.filter(stat => stat.StateCountyName == state)[0].StateCountyName;
    address.StateCountyCode = this.stateList.filter(stat => stat.StateCountyName == state)[0].StateCountyCode;
    address.isRequiredCOuntyCode = true;
    this.isCustomerAddressRequire.emit(false);
  }


  // on key press value change
  onKeypressStatCountry(address, value: any, type: number) {
    setTimeout(() => {

      if (this.companyDetails.CountryID == 2 && address.CountryID == 2) {

        address.isShowCountyCode = true;
        if (type === 1) {
          if (this.searchState.value == "" || address.StateCountyName == "" || this.searchState.value == null) {
            address.StateCountyName = "";
            address.isRequiredCOuntyCode = true;
            this.isCustomerAddressRequire.emit(false);
          }
        } else if (type === 2) {
          if (this.searchState2.value == "" || address.StateCountyName == "" || this.searchState2.value == null) {
            address.StateCountyName = "";
            address.isRequiredCOuntyCode = true;
            this.isCustomerAddressRequire.emit(false);
          }
        } else if (type === 3) {
          if (this.searchState3.value == "" || address.StateCountyName == "" || this.searchState3.value == null) {
            address.StateCountyName = "";
            address.isRequiredCOuntyCode = true;
            this.isCustomerAddressRequire.emit(false);
          }
        }

         if(address.StateCountyName == "" || address.StateCountyName == undefined){
           if (this.companyDetails.CountryID == 2 && address.CountryID == 2) {
             address.isShowCountyCode = this.isMember ? true : false;
           } else {
            address.isShowCountyCode = false;
           }
         }

        if (this.stateList && this.stateList?.length > 0) {
          address.StateCountyCode = this.stateList.find(st => st.StateCountyName.toString().toLowerCase() == address.StateCountyName.toString().toLowerCase())?.StateCountyCode;
        }

        if ((address.StateCountyCode == undefined || address.StateCountyCode == "") && address.StateCountyName) {
          address.isRequiredCOuntyCode = false;

          if (type === 1 && this.isSameBillingAddress) {
            this.customerAddressList.find(a => a.AddressTypeID == 2).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyCode = address.StateCountyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyName = address.StateCountyName;
          }

          if (type === 1 && this.isSameShippingAddress) {
            this.customerAddressList.find(a => a.AddressTypeID == 3).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyCode = address.StateCountyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyName = address.StateCountyName;
          }
        } else {
          if (type === 1 && this.isSameBillingAddress) {
            this.customerAddressList.find(a => a.AddressTypeID == 2).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyCode = address.StateCountyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyName = address.StateCountyName;
          }

          if (type === 1 && this.isSameShippingAddress) {
            this.customerAddressList.find(a => a.AddressTypeID == 3).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyCode = address.StateCountyCode;
            this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyName = address.StateCountyName;
          }
        }

        if (this.customerAddressList.filter(a => a.isRequiredCOuntyCode == false)?.length == 3) {
          this.isCustomerAddressRequire.emit(false);
        }
      } else {
        address.StateCountyCode = address.StateCountyName;
        //address.isShowCountyCode = false;
        if (type === 0 && address.AddressTypeID == 1 && this.isSameBillingAddress) {
          this.customerAddressList.find(a => a.AddressTypeID == 2).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
          this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyCode = address.StateCountyCode;
          this.customerAddressList.find(a => a.AddressTypeID == 2).StateCountyName = address.StateCountyName;
        }

        if (type === 0 && address.AddressTypeID == 1 && this.isSameShippingAddress) {
          this.customerAddressList.find(a => a.AddressTypeID == 3).isRequiredCOuntyCode = address.isRequiredCOuntyCode;
          this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyCode = address.StateCountyCode;
          this.customerAddressList.find(a => a.AddressTypeID == 3).StateCountyName = address.StateCountyName;
        }
      }
      this.setSameAsAddressIndicator();
    });
  }

  onClearDate() {
    this.selectedState = '';
  }


  async getCompanyDetails() {
    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyDetails = company;
      this._dataSharingService.shareCountryID(this.companyDetails.CountryID);
      this.setAddressList();
    }
  }

  setAddressList() {

    if (this.customerAddressList && this.customerAddressList.length < 3) {
      for (let i = 1; i <= 3; i++) {
        if (
          !this.customerAddressList.some(
            (address) => address.AddressTypeID === i
          )
        ) {
          let address: CustomerAddress = new CustomerAddress(i);
          address.CountryID = this.companyDetails.CountryID;
          address.isShowCountyCode = this.isMember ? this.companyDetails.CountryID == 2 && address.CountryID == 2 ? true : false : false;
          this.setCountryName(address);
          this.customerAddressList.push(address);
        }
      }
      this.customerAddressList.sort(
        (a, b) => a.AddressTypeID - b.AddressTypeID
      );
    } else if (this.customerID == 0) {
      this.customerAddressList.forEach((address) => {
        address.CountryID = this.companyDetails.CountryID;
        address.isShowCountyCode = this.isMember ? this.companyDetails.CountryID == 2 && address.CountryID == 2 ? true : false : false;
        this.setCountryName(address);
      });
    }

    this.setSameAsAddressIndicator();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.customerAddressList &&
      changes.customerAddressList.previousValue !=
      changes.customerAddressList.currentValue
    ) {
      this.setAddressList();
    }
  }

  /** Set addresses when changed home address*/
  onAddressChange(address: CustomerAddress, isCountryChanged = false) {
    if (address.AddressTypeID == this.addressTypes.HomeAddress && this.isSameBillingAddress) {
      this.setCustomerAddress(this.addressTypes.BillingAddress, this.isSameBillingAddress);
    }
    if (address.AddressTypeID == this.addressTypes.HomeAddress && this.isSameShippingAddress) {
      this.setCustomerAddress(this.addressTypes.ShippingAddress, this.isSameShippingAddress);
    }
    address.isShowCountyCode = this.isMember ? this.companyDetails.CountryID == 2 && address.CountryID == 2 ? true : false : false;
    if (isCountryChanged) {
      address.isShowCountyCode = this.companyDetails.CountryID == 2 && address.CountryID == 2 ? true : false;
      address.StateCountyCode = this.companyDetails.CountryID == 2 ? "" : address.StateCountyCode;
      this.setCountryName(address);
    }
    this.setSameAsAddressIndicator();
  }

  setCountryName(address) {
    if (this.countryList && this.countryList.length) {
      address.CountryName = this.countryList.find(
        (country) => country.CountryID === address.CountryID
      )?.CountryName;
    }
  }

  isObjectEmpty(obj) {
    for (var key in obj) {
      if (
        key !== "AddressTypeID" &&
        key !== "CountryID" &&
        key !== "CountryName" &&
        key !== "CountryCode"
      ) {
        if (
          !!obj[key] &&
          obj[key] !== null &&
          obj[key] != "" &&
          obj[key] != undefined
        ) {
          return false;
        }
      }
    }
    return true;
  }


  /** Address varification agast home address*/
  varifyAddress(
    address: CustomerAddress,
    homeAddress: CustomerAddress
  ): boolean {
    if (this.isObjectEmpty(address)) {
      return false;
    }
    if (
      address.CountryID == homeAddress.CountryID &&
      address.StateCountyName == homeAddress.StateCountyName &&
      address.Address1 == homeAddress.Address1 &&
      address.Address2 == homeAddress.Address2 &&
      address.CityName == homeAddress.CityName &&
      address.PostalCode == homeAddress.PostalCode
    ) {
      return true;
    } else {
      return false;
    }
  }

  /** Get address validation */
  getValidationIndicator(address: CustomerAddress): boolean {
    if (
      address.AddressTypeID == this.addressTypes.HomeAddress &&
      !address.Address1 &&
      !address.CityName &&
      !address.StateCountyName &&
      !address.Address2 &&
      !address.PostalCode
    ) {
      return false;
    } else if (
      address.AddressTypeID !== this.addressTypes.HomeAddress &&
      !address.Address1 &&
      !address.CityName &&
      !address.StateCountyName &&
      !address.Address2 &&
      !address.PostalCode &&
      !address.Mobile
    ) {
      return false;
    } else {
      return true;
    }
  }

  /** Set sameasaddresss checkbox handling */
  setSameAsAddressIndicator() {
    let homeAddress: CustomerAddress = this.customerAddressList.find(
      (address) => address.AddressTypeID === this.addressTypes.HomeAddress
    );
    this.customerAddressList.forEach((address) => {
      if (address.AddressTypeID == this.addressTypes.BillingAddress) {
        this.isSameBillingAddress = this.varifyAddress(address, homeAddress);
      }
      if (address.AddressTypeID == this.addressTypes.ShippingAddress) {
        this.isSameShippingAddress = this.varifyAddress(address, homeAddress);
      }
      address.isShowCountyCode = this.isMember ? this.companyDetails.CountryID == 2 && address.CountryID == 2 ? true : false : false;
    });
  }

  /** Set customer addresses when sameAsAddress handling */
  sameAsAddressHandler(address: CustomerAddress) {
    if (address.AddressTypeID == this.addressTypes.BillingAddress && this.isSameBillingAddress) {
      this.setCustomerAddress(address.AddressTypeID, this.isSameBillingAddress);
    }
    if (address.AddressTypeID == this.addressTypes.ShippingAddress && this.isSameShippingAddress) {
      this.setCustomerAddress(
        address.AddressTypeID,
        this.isSameShippingAddress
      );
    }

    this.isCustomerAddressRequire.emit(false);
  }

  /** Set customer address agast home address*/
  setCustomerAddress(addressTypeID: number, addressIndicator: boolean) {
    let homeAddress: CustomerAddress = this.customerAddressList.find(
      (address) => address.AddressTypeID === this.addressTypes.HomeAddress
    );
    for (const index in this.customerAddressList) {
      if (
        this.customerAddressList[index].AddressTypeID == addressTypeID &&
        addressIndicator
      ) {
        this.customerAddressList[index].CountryID = homeAddress.CountryID;
        this.customerAddressList[index].StateCountyName =
          homeAddress.StateCountyName;
        this.customerAddressList[index].StateCountyCode = homeAddress.StateCountyCode;
        this.customerAddressList[index].isRequiredCOuntyCode = homeAddress.isRequiredCOuntyCode;
        this.customerAddressList[index].Address1 = homeAddress.Address1;
        this.customerAddressList[index].Address2 = homeAddress.Address2;
        this.customerAddressList[index].CityName = homeAddress.CityName;
        this.customerAddressList[index].PostalCode = homeAddress.PostalCode;
      }
    }
  }
}

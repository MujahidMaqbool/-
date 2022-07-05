// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/internal/operators";

/********************** Services & Models *********************/
/* Models */
import { AllPerson, ApiResponse } from "@app/models/common.model";

/* Services */

import { CommonService } from "@app/services/common.service";
import { MessageService } from "@app/services/app.message.service";
import { CustomerType } from "@app/helper/config/app.enums";
/********************** Common & Customs *********************/

// #endregion 


@Component({
    selector: 'customer-search',
    templateUrl: './customer.search.component.html'
})

export class CustomerSearchComponent implements OnInit {
    // #region  Local Members

    /* Local Members */
    showClearCustomer: boolean;
    customerType: number = 0;
    customerTypePlaceHolder: string = '';
    person: string;
    searchPerson: FormControl = new FormControl();
    showClearCustomerInput : string = '';
    allPerson: AllPerson[];
    @Output() notifyCustomerID: EventEmitter<number> = new EventEmitter();
    @Input() customerTypeID: number;

    // #endregion 

    /***********Class Constructor*********/
    constructor(private _messageService: MessageService,
        private _commonService: CommonService) {
    }


    ngOnInit() {
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this.customerType = this.customerTypeID ? this.customerTypeID : 0;
                        this._commonService.searchClient(searchText, this.customerType)
                            .subscribe(
                                (response: ApiResponse) => {
                                    if (response && response.MessageCode > 0) {
                                        if (response.Result != null && response.Result.length) {
                                            this.allPerson = response.Result;
                                            this.allPerson.forEach(person => {
                                                person.FullName = person.FirstName + " " + person.LastName;
                                            });
                                        }
                                        else {
                                            this.allPerson = [];
                                        }
                                    } else {
                                        this._messageService.showErrorMessage(response.MessageText);
                                    }

                                });
                    }
                }
                else {
                    this.allPerson = [];
                    if (typeof (searchText) === "string") this.clearCustomerID();
                }
            });
    }

    // #region Events 

    onClearCustomer() {
        this.showClearCustomerInput = '';
        this.resetCustomerName();
    }

    setPlaceHolder(customerTypeId: any) {
        switch (customerTypeId) {
            case customerTypeId = CustomerType.Client:
                this.customerTypePlaceHolder = "Client Name"
                break;
            case customerTypeId = CustomerType.Lead:
                this.customerTypePlaceHolder = "Lead Name"
                break;
            case customerTypeId = CustomerType.Member:
                this.customerTypePlaceHolder = "Member Name"
                break;
            default:
                break;
        }
    }

    // #endregion



    // #region Methods 

    clearCustomerID() {
        this.notifyCustomerID.emit(0);
    }

    getSelectedClient(person: AllPerson) {
        this.showClearCustomer = true;
        this.notifyCustomerID.emit(person.CustomerID);
    }

    displayCustomerName(user?: AllPerson): string | undefined {
        return user ? user.FullName : undefined;
    }

    resetCustomerName() {
        setTimeout(() => {
            this.searchPerson.setValue('');
        })
        this.showClearCustomer = false;
    }

    // #endregion

}
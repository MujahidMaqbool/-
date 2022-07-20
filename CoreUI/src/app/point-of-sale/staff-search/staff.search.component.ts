// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/internal/operators";
/********************** Material References *********************/

/********************** Services & Models *********************/
/* Models */
import { AllStaff, ApiResponse } from "src/app/models/common.model";

/* Services */
import { CommonService } from "src/app/services/common.service";
import { MessageService } from "src/app/services/app.message.service";

/********************** Common & Customs *********************/

// #endregion 


@Component({
    selector: 'staff-search-autocomplete',
    templateUrl: './staff.search.component.html'
})

export class StaffSearchAutoCompleteComponent implements OnInit {
    // #region  Local Members

    @Output() notifyStaffID: EventEmitter<number> = new EventEmitter();

    showClearStaff: boolean;
    searchPerson: FormControl = new FormControl();
    allStaff: AllStaff[];


    // #endregion 

    /***********Class Constructor*********/
    constructor(private _commonService: CommonService,
        private _messageService: MessageService) {

    }

    ngOnInit() {
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchStaff(searchText)
                            .subscribe(
                                (response: ApiResponse) => {
                                    if (response && response.MessageCode > 0) {
                                        if (response.Result != null && response.Result.length) {
                                            this.allStaff = response.Result;
                                            this.allStaff.forEach(staff => {
                                                staff.FullName = staff.FirstName + " " + staff.LastName;
                                            });
                                        }
                                        else {
                                            this.allStaff = [];
                                        }
                                    }
                                    else {
                                        this._messageService.showErrorMessage(response.MessageText);
                                    }

                                });
                    }
                }
                else {
                    this.allStaff = [];
                    if (typeof (searchText) === "string") this.clearStaffID();
                }
            });
    }


    // #region Events 

    onClearStaff() {
        this.resetStaffName();
    }

    // #endregion

    // #region Methods 
    clearStaffID() {
        this.notifyStaffID.emit(0);
    }

    getSelectedStaff(person: AllStaff) {
        this.showClearStaff = true;
        this.notifyStaffID.emit(person.StaffID);
    }

    displayStaffName(user?: AllStaff): string | undefined {
        return user ? user.FullName : undefined;
    }

    resetStaffName() {
        setTimeout(() => {
            this.searchPerson.setValue('');
        })
        this.showClearStaff = false;
    }

    // #endregion

}
// #region Imports

/********************** Angular Refrences *********************/

import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { SubscriptionLike } from "rxjs";

/********************* Material:Refference ********************/
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';

/********************** Configuration *********************/
import { RewardProgramActivitiesEarningRuleExceptionResultViewModel, RewardProgramActivityExceptionRuleModel } from '../../models/reward-program.model';

/********************** Services & Models *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { RewardProgramApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

// #endregion

@Component({
    selector: 'app-add-exception-form',
    templateUrl: './add.form-exception.save.component.html',
})
export class SaveAddExceptionFormComponent implements OnInit {
    /*********** region Local Members ****/

    @ViewChild('allSelectedItemTypeList') private allSelectedItemTypeList: MatOption;
    @ViewChild('selectItem') selectItem: MatSelect;
    @Output() exceptionList = new EventEmitter<any>();

    /*********** Forms ****/
    searchItem: FormControl = new FormControl();

    /***********Messages*********/
    messages = Messages;

    /***********Model Reference*********/
    /*********** Collections ********/

    gridTableList: RewardProgramActivitiesEarningRuleExceptionResultViewModel[] = new Array<RewardProgramActivitiesEarningRuleExceptionResultViewModel>();
    allExceptionItemTypeList:any= [];
    selectedItemTypeList: RewardProgramActivityExceptionRuleModel[] = [];
    searchItemTypeList : RewardProgramActivityExceptionRuleModel[] = [];
    copySearchItemTypeList:RewardProgramActivityExceptionRuleModel[] = [];

    /*********** Local *******************/
    isAllItemsSelected: Boolean = false;
    isShowErrorMessage: boolean = false;
    isDeleteExemptedbtnDisabled : boolean = false;
    isSelectAllItemTypes: Boolean = false;
    currentBranchSubscription: SubscriptionLike;
    branchId: number;
    currencyFormat:string;
    itemName: string;


    constructor(
        private dialogRef: MatDialogRef<SaveAddExceptionFormComponent>,
        private _httpService: HttpService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.searchItem.valueChanges
            .pipe(debounceTime(200))
            .subscribe(searchText => {
                if (searchText != null) {
                    if (searchText == "") {
                        this.addExceptionListSearchByName();
                    }
                    if (typeof (searchText) === "string" && searchText.length >= 1) {
                        let trimedValue = searchText.trim();
                        this.copySearchItemTypeList = this.filterItem(trimedValue);
                    }
                }
                else {
                    this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.searchItemTypeList));
                }
            });
        this.getRewardProgramFormExceptionList();
    }

    /* Filter item for autocomplete search */
    filterItem(value: string): any {
        const filterValue = value.toLowerCase();
        return this.searchItemTypeList.filter(item => {
            return item.FormName.toLowerCase().search(filterValue) !== -1;
        });
    }

    /* call when click on search button */
    onSearchClick(searchValue) {
        let trimedValue ;
        if (typeof (searchValue) === "string" && searchValue.length >= 1) {
            trimedValue = searchValue.trim();
        }
        else if(typeof (searchValue) === "object"){
            trimedValue = searchValue.FormName.trim();
        }
            var filteredItemObj = this.filterItem(trimedValue);
            if (filteredItemObj.length == 0) {
                this.gridTableList = [];
            }
            this.gridTableList = [];
            filteredItemObj.forEach(element => {
                this.getSearchedItem(element);
            });
    }

    //call this function when search by name string is empty
    addExceptionListSearchByName() {
        this.searchItemTypeList.forEach((gridListData) => {
            var result = this.gridTableList.find(i => i.FormID == gridListData.FormID)
            if (!result) {
                let gridTableobj = new RewardProgramActivitiesEarningRuleExceptionResultViewModel;
                gridTableobj.FormName = gridListData.FormName;
                gridTableobj.FormID = gridListData.FormID;
                gridTableobj.ClientEarnedPoints = gridListData.ClientEarnedPoints;
                gridTableobj.LeadEarnedPoints = gridListData.LeadEarnedPoints;
                gridTableobj.MemberEarnedPoints = gridListData.MemberEarnedPoints;
                gridTableobj.IsSelected = false;
                gridTableobj.BranchID = gridListData.FormBranchID;
                gridTableobj.IsActive = gridListData.IsActive;
                this.gridTableList.push(JSON.parse(JSON.stringify(gridTableobj)));
            }
        });
        this.searchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));
        this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));
        this.sortExceptionList();
    }

    // get the list of forms
    getRewardProgramFormExceptionList() {
        this._httpService.get(RewardProgramApi.getRewardProgramExceptionForms)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result && response.Result.length > 0) {
                            this.allExceptionItemTypeList = response.Result;
                            this.isEditExceptionList();
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Exception List"))
                }
            );
    }

    //ReEdit From Core
    isEditExceptionList() {
        if (this.data.exceptionList.length > 0) {
            this.gridTableList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.selectedItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.searchItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));

            setTimeout(() => {
                if (this.selectItem) {
                    this.selectItem.options.forEach((item: MatOption) => {
                        var result = this.gridTableList.find(i => i.FormID == item?.value.FormID);
                        if (result) {
                            // if (item.value.FormID == result.FormID)
                            //     item.select()
                        }
                    });
                }

            }, 400);

            if (this.gridTableList.length > 0) {
                this.gridTableList.forEach((i) => {
                    if (i.IsSelected == true) {
                        i.IsSelected = false;
                    }
                })
            }

            if (this.selectedItemTypeList.length == this.allExceptionItemTypeList.length) {
                setTimeout(() => {
                    if (this.selectItem) {
                        this.selectItem.options.forEach((item: MatOption) => {
                            // if (item.viewValue == "All")
                            //     item.select()
                        });
                    }
                }, 400);
            }

        }
    }

    //region main search 
    //for All selection
    onSelectAllItemType() {
        if (this.allSelectedItemTypeList.selected) {
            this.selectedItemTypeList = [];
            this.allExceptionItemTypeList.forEach(branch => {
                this.selectedItemTypeList.push(branch);
            });
            setTimeout(() => {
                this.allSelectedItemTypeList.select();
            }, 100);
            this.isAllItemsSelected = true;

        } else {
            this.isAllItemsSelected = false;
            this.selectedItemTypeList = [];
            this.allSelectedItemTypeList.deselect();
        }
    }

    //for single selections
    onToggleItemTypeSelect() {

        if (this.allSelectedItemTypeList && this.allSelectedItemTypeList.selected) {
            this.allSelectedItemTypeList.deselect();
            this.isAllItemsSelected = false;
            return;
        }
        if (this.allExceptionItemTypeList.length == this.selectedItemTypeList.length) {
            this.allSelectedItemTypeList.select();
            this.isAllItemsSelected = true;
            return;
        }
    }
    // end main search region

    /** Add exception list in grid  **/ 
    onAddExceptionListInGrid() {
        //add new item
        if (this.selectedItemTypeList.length == 0) {
            this.isDeleteExemptedbtnDisabled = false;
        }
        this.selectedItemTypeList.forEach((gridListData: any) => {
            if (gridListData != 0) {
                var result = this.gridTableList.find(i => i.FormID == gridListData.FormID)
                if (!result) {
                    let gridTableobj = new RewardProgramActivitiesEarningRuleExceptionResultViewModel;
                    gridTableobj.FormName = gridListData.FormName;
                    gridTableobj.FormID = gridListData.FormID;
                    gridTableobj.ClientEarnedPoints = 0;
                    gridTableobj.LeadEarnedPoints = 0;
                    gridTableobj.MemberEarnedPoints = 0;
                    gridTableobj.IsSelected = false;
                    gridTableobj.BranchID = gridListData.FormBranchID;
                    gridTableobj.IsActive = true;
                    this.gridTableList.push(JSON.parse(JSON.stringify(gridTableobj)));
                }
            }
        })

        // var removedItemIndex = [];
        // //remove unselected item
        // this.gridTableList.forEach((item, index) => {
        //     var result = this.selectedItemTypeList.find(i => i.FormID == item.FormID);
        //     if (!result) {
        //         removedItemIndex.push(item.FormID);
        //     }
        // })

        // removedItemIndex.forEach((id) => {
        //     this.gridTableList = this.gridTableList.filter(i => i.FormID != id);
        // })

        this.sortExceptionList();

        var isAnyItemNotSelected: boolean = this.gridTableList.some(i => i.IsSelected == false);
        if (isAnyItemNotSelected) {
            this.isSelectAllItemTypes = false;
        }
        this.searchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));
        this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));

        this.selectedItemTypeList = [];
    }

    /** Sort exception list in grid  **/ 
    sortExceptionList() {
        this.gridTableList.sort((a, b) => a.FormName.localeCompare(b.FormName, 'es', { sensitivity: 'base' }));
    }

    /* on click except button and assign them 0 value*/  
    onExcemptClick() {
        if (this.gridTableList.length > 0) {
            this.gridTableList.forEach((data) => {
                if (data.IsSelected == true) {
                    data.ClientEarnedPoints = 0;
                    data.MemberEarnedPoints = 0;
                    data.LeadEarnedPoints = 0;
                }
            })
        }
    }

    /* call when click on search button */
    getSearchedItem(event: RewardProgramActivitiesEarningRuleExceptionResultViewModel) {
        var result = this.gridTableList.find(i => i.FormID == event.FormID)
        if (!result) {
            let gridTableobj = new RewardProgramActivitiesEarningRuleExceptionResultViewModel;
            gridTableobj.FormName = event.FormName;
            gridTableobj.FormID = event.FormID;
            gridTableobj.ClientEarnedPoints = event.ClientEarnedPoints;
            gridTableobj.LeadEarnedPoints = event.LeadEarnedPoints;
            gridTableobj.MemberEarnedPoints = event.MemberEarnedPoints;
            gridTableobj.IsSelected = event.IsSelected;
            gridTableobj.IsActive = event.IsActive;
            this.gridTableList.push(gridTableobj);
        }
        if (result != undefined) {
            this.gridTableList = this.gridTableList.filter(i => i.FormID == result.FormID);
        }
    }
    
    /* delete all selected items */  
    onDeleteAllClick() {
        let selectedItemList = this.gridTableList.filter(c => c.IsSelected == true);
        this.gridTableList = this.gridTableList.filter(c => c.IsSelected != true);

        if(selectedItemList.length > 0){
            selectedItemList.forEach((selectedItem)=>{
            this.searchItemTypeList = this.searchItemTypeList.filter(i => i.FormID != selectedItem.FormID)
            });
         }

        this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.searchItemTypeList));
        this.isDeleteExemptedbtnDisabled = false;
        this.isSelectAllItemTypes = false;
    }

    /** close exception list dialog **/ 
    closeDialog() {
        this.dialogRef.close();
    }

    /** check empty field validation **/ 
    onValidationCheck() {
        this.gridTableList.forEach((gridTable) => {
            var result = this.searchItemTypeList.find((i => i.FormID == gridTable.FormID));
            if (result) {
                result.ClientEarnedPoints = gridTable.ClientEarnedPoints;
                result.MemberEarnedPoints = gridTable.MemberEarnedPoints;
                result.LeadEarnedPoints = gridTable.LeadEarnedPoints;
            }
        });
        setTimeout(() => {
            var isAnyMemberEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.MemberEarnedPoints.toString() == "");
            var isAnyClientEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.ClientEarnedPoints.toString() == "");
            var isAnyLeadEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.LeadEarnedPoints.toString() == "");

            if (isAnyMemberEarnedPointsIsNUll || isAnyClientEarnedPointsIsNUll || isAnyLeadEarnedPointsIsNUll) {
                this.isShowErrorMessage = true;
            }
            if (!isAnyMemberEarnedPointsIsNUll && !isAnyClientEarnedPointsIsNUll && !isAnyLeadEarnedPointsIsNUll) {
                this.isShowErrorMessage = false;
            }
        }, 500);
    }

    onItemTypeSelectionChange() {
        var isSelected = this.gridTableList.filter(mc => mc.IsSelected);
        this.isDeleteExemptedbtnDisabled = isSelected && isSelected.length > 0 ? true : false;
        this.isSelectAllItemTypes = isSelected && isSelected.length == this.gridTableList.length ? true : false;
    }

    onAllItemTypeSelectionChange(event: any) {
        this.gridTableList.forEach(element => {
            element.IsSelected = event;
        });
        if (this.gridTableList.length > 0) {
            this.isDeleteExemptedbtnDisabled = event;
        }
    }

    // display the item name in autocomplete search
    displayItemName(item?: RewardProgramActivityExceptionRuleModel): string | undefined {
        return item ? typeof (item) === "object" ? item.FormName : item : undefined;
    }

    /** Delete single item **/ 
    onDeleteItem(index: any ,data:any) {
        this.gridTableList.splice(index, 1);

        var result = this.searchItemTypeList.findIndex(c => c.FormID == data.FormID);
        if(result > -1){
            this.searchItemTypeList.splice(result ,1);
            this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.searchItemTypeList));
        }
        if (this.gridTableList.length == 0) {
            this.isDeleteExemptedbtnDisabled = false;
            this.isSelectAllItemTypes = false;
        }
        var isAllListSelected = this.gridTableList.find(i => i.IsSelected == false);
        if (typeof isAllListSelected !== 'undefined') {
            this.isSelectAllItemTypes = false;
        } else {
            this.isSelectAllItemTypes = false;

        }
        var isDisableDelelteAllExemptbtn: boolean = this.gridTableList.some(i => i.IsSelected == true);
        if (isDisableDelelteAllExemptbtn) {
            this.isDeleteExemptedbtnDisabled = true;
        } else {
            this.isDeleteExemptedbtnDisabled = false;
        }
    }

    /** Emit the final list to save reward program on save click **/ 
    onSave() {
        this.onValidationCheck();
        if (!this.isShowErrorMessage) {
            this.exceptionList.emit(this.gridTableList);
            this.closeDialog();
        }
    }
}

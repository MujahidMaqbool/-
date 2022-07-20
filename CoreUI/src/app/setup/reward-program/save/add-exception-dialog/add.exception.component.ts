// #region Imports
/********************** Angular Refrences *********************/
import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SubscriptionLike } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/********************* Material:Refference ********************/
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';

/********************** Services & Models *********************/
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { HttpService } from 'src/app/services/app.http.service';
import { RewardProgramEarningRuleExceptionResultViewModel, RewardProgramExceptionRuleModel } from '../../models/reward-program.model';

/********************** Components *********************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/**********************  Configurations *********************/
import { EarnedRuleItemType, RewardProgramPurchasesType } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { RewardProgramApi } from 'src/app/helper/config/app.webapi';

// #endregion

@Component({
    selector: 'app-add-exception',
    templateUrl: './add.exception.component.html',
})
export class SaveAddExceptionComponent  extends AbstractGenericComponent implements OnInit {
    /*********** region Local Members ****/
    @Output() exceptionList = new EventEmitter<any>();
    @ViewChild('allSelectedItemTypeList') allSelectedItemTypeList: MatOption;
    @ViewChild('selectItem') selectItem: MatSelect;

    /***********Messages*********/
    messages = Messages;

    /***********Angular Forms*********/
    searchItem: FormControl = new FormControl();

    /***********Model Reference*********/
    /*********** Collections ********/
    selectedItemTypeList: RewardProgramExceptionRuleModel[] = new Array<RewardProgramExceptionRuleModel>();
    gridTableList: RewardProgramEarningRuleExceptionResultViewModel[] = new Array<RewardProgramEarningRuleExceptionResultViewModel>();
    allExceptionItemTypeList: RewardProgramExceptionRuleModel[] = [];
    searchItemTypeList: RewardProgramExceptionRuleModel[] = [];
    copySearchItemTypeList: RewardProgramExceptionRuleModel[] = [];

    /*********** Local *******************/
    enum_PurchasesType = RewardProgramPurchasesType;
    itemTypeName: string = "";
    itemName: string;
    enumEarnedRuleItemType = EarnedRuleItemType;
    selectedSearchItem: any;
    showErrorAmountSpent: boolean = false;
    showErrorBenefittedEarnedPoints: boolean = false;
    showErrorLeadEarnedPoints: boolean = false;
    showErrorClientEarnedPoints: boolean = false;
    showErrorMemberEarnedPoints: boolean = false;
    isShowErrorMessage: boolean = false;
    isSelectAllItemTypes: Boolean = false;
    isDeleteExemptedbtnDisabled: boolean = false;
    currencyFormat: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private dialogRef: MatDialogRef<SaveAddExceptionComponent>
    ) {        
        super();
      }

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

        this.getRewardProgramExceptionList(this.data.itemTypeID);
        this.setItemTypeName();
        this.getCurrentBranchDetail();
       
    }

    /* get branch details */
    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
      }

    /* Filter item for autocomplete search */
    filterItem(value: string): any {
        const filterValue = value.toLowerCase();
        return this.searchItemTypeList.filter(item => {
            return item.ItemName.toLowerCase().search(filterValue) !== -1;
        });
    }
     
    /* call when click on search button */
    onSearchClick(searchValue) {
        let trimedValue ;
        if (typeof (searchValue) === "string" && searchValue.length >= 1) {
            trimedValue = searchValue.trim();
        }
        else if(typeof (searchValue) === "object"){
            trimedValue = searchValue.ItemName.trim();
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

    //ReEdit
    isEditExceptionList() {
        if (this.data.exceptionList.length > 0) {
            this.gridTableList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.selectedItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.searchItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));
            this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.data.exceptionList));

            setTimeout(() => {
                if (this.selectItem) {
                    this.selectItem.options.forEach((item: MatOption) => {
                        var result = this.gridTableList.find(i => i.ItemID == item?.value.ItemID);
                        if (result) {
                            // if (item.value.ItemID == result.ItemID)
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

    //call this function when search by name string is empty
    addExceptionListSearchByName() {
        this.searchItemTypeList.forEach((gridListData) => {
            var result = this.gridTableList.find(i => i.ItemID == gridListData.ItemID)
            if (!result) {
                let gridTableobj = new RewardProgramEarningRuleExceptionResultViewModel;
                gridTableobj.AmountSpent = gridListData.AmountSpent;
                gridTableobj.ItemName = gridListData.ItemName;
                gridTableobj.ItemID = gridListData.ItemID;
                gridTableobj.BenefittedEarnedPoints = gridListData.BenefittedEarnedPoints;
                gridTableobj.ClientEarnedPoints = gridListData.ClientEarnedPoints;
                gridTableobj.LeadEarnedPoints = gridListData.LeadEarnedPoints;
                gridTableobj.MemberEarnedPoints = gridListData.MemberEarnedPoints;
                gridTableobj.IsSelected = false;
                gridTableobj.BranchID = gridListData.ItemBranchID;
                gridTableobj.IsActive = gridListData.IsActive;
                gridTableobj.ItemTypeID = this.data.itemTypeID;
                this.gridTableList.push(JSON.parse(JSON.stringify(gridTableobj)));
            }
        });
        this.searchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));
        this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.gridTableList));
        this.sortExceptionList();
    }

    /* display the name of item according to item type ID */
    setItemTypeName() {
        if (this.data.itemTypeID == this.enum_PurchasesType.Class) {
            this.itemTypeName = "Class"
        } else if (this.data.itemTypeID == this.enum_PurchasesType.Service) {
            this.itemTypeName = "Service"
        } else if (this.data.itemTypeID == this.enum_PurchasesType.Product) {
            this.itemTypeName = "Product"
        } else if (this.data.itemTypeID == this.enum_PurchasesType.Forms) {
            this.itemTypeName = "Form"
        } else {
            this.itemTypeName = "Membership"
        }
    }
    
    /* here we get the list of exception list and filter that list according to item type ID */
    getRewardProgramExceptionList(itemTypeID) {
        this._httpService.get(RewardProgramApi.getRewardProgramExceptions + itemTypeID)
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

        } else {
            this.selectedItemTypeList = [];
            this.allSelectedItemTypeList.deselect();
        }
    }

    //for single selections
    onToggleItemTypeSelect() {
        if (this.allSelectedItemTypeList && this.allSelectedItemTypeList.selected) {
            this.allSelectedItemTypeList.deselect();
            return;
        }
        if (this.allExceptionItemTypeList.length == this.selectedItemTypeList.length) {
            this.allSelectedItemTypeList.select();
            return;
        }
    }

    /* get the search item*/  
    getSearchedItem(event: RewardProgramEarningRuleExceptionResultViewModel) {
        var result = this.gridTableList.find(i => i.ItemID == event.ItemID);
        if (!result) {
            let gridTableobj = new RewardProgramEarningRuleExceptionResultViewModel;
            gridTableobj.AmountSpent = event.AmountSpent;
            gridTableobj.ItemName = event.ItemName;
            gridTableobj.ItemID = event.ItemID;
            gridTableobj.BenefittedEarnedPoints = event.BenefittedEarnedPoints;
            gridTableobj.ClientEarnedPoints = event.ClientEarnedPoints;
            gridTableobj.LeadEarnedPoints = event.LeadEarnedPoints;
            gridTableobj.MemberEarnedPoints = event.MemberEarnedPoints;
            gridTableobj.IsSelected = event.IsSelected;
            gridTableobj.BranchID = event.BranchID;
            gridTableobj.ItemTypeID = this.data.itemTypeID;
            gridTableobj.IsActive = event.IsActive;
            this.gridTableList.push(gridTableobj);
        };
        if (result != undefined) {
            this.gridTableList = this.gridTableList.filter(i => i.ItemID == result.ItemID);
        }
    }
    // display the item name in autocomplete search
    displayItemName(item?: RewardProgramExceptionRuleModel): string | undefined {
        return item ? typeof (item) === "object" ? item.ItemName : item : undefined;
    }

    // select all item in list 
    onAllItemTypeSelectionChange(event: any) {
        this.gridTableList.forEach(element => {
            element.IsSelected = event;
        });
        if (this.gridTableList.length > 0) {
            this.isDeleteExemptedbtnDisabled = event;
        }
    }

    // select single item in list
    onItemTypeSelectionChange() {
        var isSelected = this.gridTableList.filter(mc => mc.IsSelected);
        this.isDeleteExemptedbtnDisabled = isSelected && isSelected.length > 0 ? true : false;
        this.isSelectAllItemTypes = isSelected && isSelected.length == this.gridTableList.length ? true : false;
    }

    /* on click except button and assign them 0 value*/  
    onExcemptClick() {
        if (this.gridTableList.length > 0) {
            this.gridTableList.forEach((data) => {
                if (data.IsSelected == true) {
                    data.AmountSpent = 0;
                    data.ClientEarnedPoints = 0;
                    data.MemberEarnedPoints = 0;
                    data.LeadEarnedPoints = 0;
                    data.BenefittedEarnedPoints = 0;
                }
            })
        }
    }
    
     /* delete all selected items */  
     onDeleteAllClick() {
        let selectedItemList = this.gridTableList.filter(c => c.IsSelected == true);
        this.gridTableList = this.gridTableList.filter(c => c.IsSelected != true);
        if(selectedItemList.length > 0){
           selectedItemList.forEach((selectedItem)=>{
           this.searchItemTypeList = this.searchItemTypeList.filter(i => i.ItemID != selectedItem.ItemID)

           });
        }
        this.copySearchItemTypeList = JSON.parse(JSON.stringify(this.searchItemTypeList));

        this.isDeleteExemptedbtnDisabled = false;
        this.isSelectAllItemTypes = false;
    }
    
    /** Add exception list in grid  **/ 
    onAddExceptionListInGrid() {
        //add new item
        if (this.selectedItemTypeList.length == 0) {
            this.isDeleteExemptedbtnDisabled = false;
        }
        this.selectedItemTypeList.forEach((gridListData: any) => {
            if (gridListData != 0) {
                var result = this.gridTableList.find(i => i.ItemID == gridListData.ItemID)
                if (!result) {
                    let gridTableobj = new RewardProgramEarningRuleExceptionResultViewModel;
                    gridTableobj.AmountSpent = 0;
                    gridTableobj.ItemName = gridListData.ItemName;
                    gridTableobj.ItemID = gridListData.ItemID;
                    gridTableobj.BenefittedEarnedPoints = 0;
                    gridTableobj.ClientEarnedPoints = 0;
                    gridTableobj.LeadEarnedPoints = 0;
                    gridTableobj.MemberEarnedPoints = 0
                    gridTableobj.IsSelected = false;
                    gridTableobj.BranchID = gridListData.ItemBranchID;
                    gridTableobj.IsActive = true;
                    gridTableobj.ItemTypeID = this.data.itemTypeID;
                    this.gridTableList.push(JSON.parse(JSON.stringify(gridTableobj)));
                }
            }
        })

        // var removedItemIndex = [];
        // //remove unselected item
        // this.gridTableList.forEach((item, index) => {
        //     var result = this.selectedItemTypeList.find(i => i.ItemID == item.ItemID);
        //     if (!result) {
        //         removedItemIndex.push(item.ItemID);
        //         // this.gridTableList.splice(index, 1);
        //     }
        // })

        // removedItemIndex.forEach((id) => {
        //     this.gridTableList = this.gridTableList.filter(i => i.ItemID != id);
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
        this.gridTableList.sort((a, b) => a.ItemName.localeCompare(b.ItemName, 'es', { sensitivity: 'base' }));
    }

    /** Delete single item **/ 
    onDeleteItem(index: any , data :RewardProgramEarningRuleExceptionResultViewModel) {
        this.gridTableList.splice(index, 1);
        var result = this.searchItemTypeList.findIndex(c => c.ItemID == data.ItemID);
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

    /** close exception list dialog **/ 
    closeDialog() {
        this.dialogRef.close();
    }

    /** Emit the final list to save reward program on save click **/ 
    onSave() {
        this.onValidationCheck();
        if (!this.isShowErrorMessage) {
            this.exceptionList.emit(this.gridTableList);
            this.closeDialog();
        }
    }

    /** check empty field validation **/ 
    onValidationCheck() {
        this.gridTableList.forEach((gridTable) => {
            var result = this.searchItemTypeList.find((i => i.ItemID == gridTable.ItemID));
            if (result) {
                result.AmountSpent = gridTable.AmountSpent;
                result.BenefittedEarnedPoints = gridTable.BenefittedEarnedPoints;
                result.ClientEarnedPoints = gridTable.ClientEarnedPoints;
                result.MemberEarnedPoints = gridTable.MemberEarnedPoints;
                result.LeadEarnedPoints = gridTable.LeadEarnedPoints;
            }
        });
        setTimeout(() => {
            var isAnyAmountSpentIsNUll: boolean = this.gridTableList.some(i => i.AmountSpent.toString() == "");
            var isAnyMemberEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.MemberEarnedPoints.toString() == "");
            if (this.data.itemTypeID != this.enum_PurchasesType.Membership) {
                var isAnyClientEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.ClientEarnedPoints.toString() == "");
                var isAnyLeadEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.LeadEarnedPoints.toString() == "");
                var isAnyBenefittedEarnedPointsIsNUll: boolean = this.gridTableList.some(i => i.BenefittedEarnedPoints.toString() == "");
            }
            if (isAnyAmountSpentIsNUll || isAnyMemberEarnedPointsIsNUll || isAnyClientEarnedPointsIsNUll || isAnyLeadEarnedPointsIsNUll || isAnyBenefittedEarnedPointsIsNUll) {
                this.isShowErrorMessage = true;
            }
            if (!isAnyAmountSpentIsNUll && !isAnyMemberEarnedPointsIsNUll && !isAnyClientEarnedPointsIsNUll && !isAnyLeadEarnedPointsIsNUll && !isAnyBenefittedEarnedPointsIsNUll) {
                this.isShowErrorMessage = false;
            }
        }, 500);
    }
}

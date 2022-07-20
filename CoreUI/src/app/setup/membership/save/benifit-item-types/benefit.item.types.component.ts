/********************** Angular References *********************************/
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatOption } from '@angular/material/core';
/********************* Material:Refference ********************/

/********************** Service & Models *********************/
/* Services */
import { MessageService } from 'src/app/services/app.message.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
/* Models */
import { MemberShipBenifitSearchFilter } from 'src/app/models/common.model';
import { MembershipItemsBenefits, AddMembershipItemsBenefits } from 'src/app/setup/models/membership.model';
/********************** Component *********************************/
import { AddItemTypeComponent } from '../add-item-type/add.item.type.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** Common *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_MemberShipBenefitDurations, ENU_MemberShipItemTypeName } from 'src/app/helper/config/app.enums';
import { AddProductComponent } from '../add-product/add.product.component';


@Component({
    selector: 'benefit-item-types',
    templateUrl: './benefit.item.types.component.html',
})

export class BenefitItemTypesComponent implements OnInit {

    /* Messages */
    messages = Messages;
    itemTypeNameForMessage: string = "";
   
    /* Local Members */
    showValidation: boolean = false;
    isSelectAllItemTypes: Boolean = false;
    isDeleteAttButtonDisabled: boolean = true;

    @Input() itemTypeName: string = "";
    @Input() membershipBranchList: any[];
    @Input() itemTypeHeading: string = "";
    @Input() ItemTypeID: ENU_MemberShipItemTypeName;
    @Input() BenefitItemList: MembershipItemsBenefits[];
    @Input() filterMembershipItemTypeList: MembershipItemsBenefits[];
    @ViewChild('allItemsSelection') private allItemsSelection: MatOption;

    branchSpecificBenefitItemList: MembershipItemsBenefits[];
    membershipCategoryList: any[] = [];
    selectedItemsList: any[] = [] ;
 
    /* Models Refences */
    deleteDialogRef: any;
    searchParam = new MemberShipBenifitSearchFilter();
    addMembershipItemsBenefits: AddMembershipItemsBenefits = new AddMembershipItemsBenefits();

    /* Configurations */
    enuMemberShipItemTypeName = ENU_MemberShipItemTypeName;
    enuMemberShipBenefitDurations = ENU_MemberShipBenefitDurations;
 
    constructor(
        private _messageService: MessageService,
        private _deleteAllItemTypeActionDialogue: MatDialogService,
        public _saveItemTypeMembershipActionDialog: MatDialogService,
        ) { }

    ngOnInit() {
        this.filterMembershipItemTypeList = this.BenefitItemList;
        this.searchParam =  new MemberShipBenifitSearchFilter();
        switch(this.ItemTypeID) {
            case this.enuMemberShipItemTypeName.Class:
              //this.itemTypeName = "Class";
              this.itemTypeNameForMessage = "Class(es)";
              this.itemTypeHeading = "Classes"
              break;
            case this.enuMemberShipItemTypeName.Service:
                //this.itemTypeName = "Service";
                this.itemTypeNameForMessage = "Service(s)";
                this.itemTypeHeading = "Services"
              break;
            default:
                //this.itemTypeName = "Product";
                this.itemTypeNameForMessage = "Product(s)";
                this.itemTypeHeading = "Products";
        }
    }

    ngAfterViewInit() {
        this.sortBenefitItemTypes();
    }

    // #region Events

    onSaveMembershipItemType(item) {
        this.onReset();
         let addMembershipItemsBenefits = new AddMembershipItemsBenefits();
       addMembershipItemsBenefits.MembershipItemsBenefit = new MembershipItemsBenefits();

        if(item.ItemID > 0){
            addMembershipItemsBenefits.MembershipItemsBenefit = this.filterMembershipItemTypeList.find(mib => mib.ItemID == item.ItemID && mib.BranchID == item.BranchID);
            addMembershipItemsBenefits.MembershipItemsBenefit.IsEdit = true;
        } else{
            addMembershipItemsBenefits.MembershipItemsBenefit.ItemTypeID = this.ItemTypeID;
        }

        addMembershipItemsBenefits.MembershipBranchList = this.membershipBranchList;
        addMembershipItemsBenefits.SelectedMembershipItemsBenefits = this.BenefitItemList
        && this.BenefitItemList.length > 0 ? this.BenefitItemList : [];

        var dialogRef: any;
        if(addMembershipItemsBenefits.MembershipItemsBenefit.ItemTypeID == this.enuMemberShipItemTypeName.ProductVariant){

                dialogRef = this._saveItemTypeMembershipActionDialog.open(AddProductComponent, {
                disableClose: true,
                panelClass: 'pos-full-popup',
                data: addMembershipItemsBenefits,
            });


        } else{
                dialogRef = this._saveItemTypeMembershipActionDialog.open(AddItemTypeComponent, {
                disableClose: true,
                data: addMembershipItemsBenefits,
            });
        }
    
        dialogRef.componentInstance.savedItemType.subscribe((savedItemType: MembershipItemsBenefits[]) => {
            if (savedItemType && savedItemType.length > 0) {
                var addedItemType = savedItemType;
                if(addedItemType[0].IsEdit){
                this.BenefitItemList.forEach(membershipItem => {
                    if(membershipItem.ItemID == addedItemType[0].ItemID && membershipItem.BranchID == addedItemType[0].BranchID){
                        membershipItem.IsFree = addedItemType[0].IsFree;
                        membershipItem.NoLimits = addedItemType[0].NoLimits;
                        membershipItem.DiscountPercentage = addedItemType[0].DiscountPercentage;
                        membershipItem.DurationTypeID = addedItemType[0].DurationTypeID;
                        membershipItem.TotalSessions = addedItemType[0].TotalSessions;
                    }
                });
                } else{
                    if(this.BenefitItemList && this.BenefitItemList.length > 0){
                    addedItemType.forEach(membershipItemType => {
                        this.BenefitItemList.push(membershipItemType);
                        });
                    } else{
                    this.BenefitItemList = addedItemType;
                    }
                }
                this.filterMembershipItemTypeList = this.BenefitItemList;
                this.sortBenefitItemTypes();
            }
        });
    }

    onBranchChange(id: number) {
       this.branchSpecificBenefitItemList = this.BenefitItemList.filter(bi => bi.BranchID == id);
       this.membershipCategoryList = this.BenefitItemList.filter(bi => bi.BranchID == id);

       this.membershipCategoryList = this.branchSpecificBenefitItemList.filter((thing, i, arr) => {
            return arr.indexOf(arr.find(t => t.ItemCategoryID === thing.ItemCategoryID)) === i;
        });

       //get unique records for services
       if(this.ItemTypeID == this.enuMemberShipItemTypeName.Service){
            this.branchSpecificBenefitItemList = this.branchSpecificBenefitItemList.filter((thing, i, arr) => {
                                                        return arr.indexOf(arr.find(t => t.ServiceID === thing.ServiceID)) === i;
                                                    });
        }
        this.searchParam.CategoryID = 0;
        this.toggleAllItemsSelection(true);
    }

    onCategoryChange(id: number) {
        if(id > 0){
            this.branchSpecificBenefitItemList = this.BenefitItemList.filter(bi => bi.BranchID == this.searchParam.BranchID && bi.ItemCategoryID == id);
        } else{
            this.branchSpecificBenefitItemList = this.BenefitItemList.filter(bi => bi.BranchID == this.searchParam.BranchID);
        }
        if(this.branchSpecificBenefitItemList && this.branchSpecificBenefitItemList.length > 1){
            this.toggleAllItemsSelection(true);
        } else{
            this.selectedItemsList = [];12212
            this.branchSpecificBenefitItemList.forEach(item => {
                this.selectedItemsList.push(item);
            });
        }
            
     }
	
	onReset() {
        this.showValidation = false;
        this.onResetData();
        this.searchParam =  new MemberShipBenifitSearchFilter();
        this.branchSpecificBenefitItemList = [];
        this.filterMembershipItemTypeList = this.BenefitItemList;
        this.selectedItemsList = [];
       
    }

    onSearch(){
        this.onResetData();
        this.showValidation = false; 
        
        if(this.searchParam.BranchID == 0 && this.searchParam.CategoryID == 0 && this.selectedItemsList.length == 0 ){
            this.filterMembershipItemTypeList = this.BenefitItemList;

        } else if (this.searchParam.BranchID > 0 && this.searchParam.CategoryID == 0 && this.selectedItemsList.length > 0) {
            let result = (this.allItemsSelection.selected && this.selectedItemsList[0] == 0) ? this.selectedItemsList.shift() : this.selectedItemsList; /// remove 0 (All value) index from array
            this.filterMembershipItemTypeList =  this.selectedItemsList;
            
        } 
         else if(this.searchParam.BranchID > 0 && this.searchParam.CategoryID == 0 && this.selectedItemsList.length == 0) {
             this.filterMembershipItemTypeList = this.BenefitItemList.filter(i => i.BranchID == this.searchParam.BranchID);
         } 
         else if(this.searchParam.BranchID > 0 && this.searchParam.CategoryID > 0 && this.selectedItemsList.length == 0) {                   
                   this.filterMembershipItemTypeList = this.BenefitItemList.filter(i => i.BranchID == this.searchParam.BranchID && i.ItemCategoryID == this.searchParam.CategoryID); 
         } 
        else if(this.searchParam.BranchID > 0 && this.searchParam.CategoryID > 0 && this.selectedItemsList.length > 0) {
            let result = (this.allItemsSelection.selected && this.selectedItemsList[0] == 0) ? this.selectedItemsList.shift() : this.selectedItemsList; /// remove 0 (All value) index from array
            this.filterMembershipItemTypeList = this.selectedItemsList;
                
        }


    }

    onResetData(){
        this.isSelectAllItemTypes = false;
        this.isDeleteAttButtonDisabled = true;
        this.filterMembershipItemTypeList.forEach(item => {
            item.IsSelected = false;
        });        
    }

    onDeleteItemType(item){
        if(item.ItemID > 0){

            this.filterMembershipItemTypeList = this.filterMembershipItemTypeList.filter(x => x !== item);
            this.BenefitItemList = this.BenefitItemList.filter(x => x !== item);
            
            if(!this.filterMembershipItemTypeList || (this.filterMembershipItemTypeList && this.filterMembershipItemTypeList.length == 0)){
                this.isSelectAllItemTypes = false;
                this.isDeleteAttButtonDisabled = true;
            }
        
            //this._messageService.showSuccessMessage(this.messages.Success.MemberShip_Benefit_Item_Type_Delete.replace('{0}', this.itemTypeName));
        } else{

            this.deleteDialogRef = this._deleteAllItemTypeActionDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
            this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this.BenefitItemList = this.BenefitItemList.filter(x => {
                        return x.IsSelected != true;
                    })
                    this.isSelectAllItemTypes = false;
                    this.isDeleteAttButtonDisabled = true;
                    this.filterMembershipItemTypeList = this.BenefitItemList;
                    this.onReset();
                    //this._messageService.showSuccessMessage(this.messages.Success.MemberShip_Benefit_Item_Type_Delete.replace('{0}', this.itemTypeNameForMessage));
                }
            })
        }
        this.sortBenefitItemTypes();
    }

    onAllItemTypeSelectionChange(event: any) {
        this.isDeleteAttButtonDisabled = event ? false : true;
        this.filterMembershipItemTypeList.forEach(element => {
            element.IsSelected = event;
        });
    }

    onItemTypeSelectionChange() {
      var isSelected = this.filterMembershipItemTypeList.filter(mc => mc.IsSelected);
      this.isDeleteAttButtonDisabled = isSelected && isSelected.length > 0 ? false : true;
      this.isSelectAllItemTypes = isSelected && isSelected.length == this.filterMembershipItemTypeList.length ? true : false;
    }

    //#endregion

    // #region Method

    sortBenefitItemTypes(){
        this.filterMembershipItemTypeList.sort((oldRelease, newRelease) => {
            const BranchName = oldRelease.BranchName.localeCompare(newRelease.BranchName);
            const ItemName = oldRelease.ItemName.localeCompare(newRelease.ItemName);
          
            return BranchName || ItemName;
          })
    }

    /// Items selection
    togglePerOneItem() {
        
        if (this.allItemsSelection && this.allItemsSelection.selected) {
            this.allItemsSelection.deselect();
            return false;
        }
        if (this.branchSpecificBenefitItemList.length == this.selectedItemsList.length && this.branchSpecificBenefitItemList.length > 1) {
            this.allItemsSelection.select();
        }
    }

    toggleAllItemsSelection(isChangeCategory: boolean = false) {

        this.selectedItemsList = [];

        if(isChangeCategory){
            setTimeout(() => {
                this.allItemsSelection?.select();
    
                if (this.allItemsSelection?.selected && this.branchSpecificBenefitItemList.length > 1) {
                    this.branchSpecificBenefitItemList.forEach(item => {
                        this.selectedItemsList.push(item);
                    });
                    
                } else if(this.branchSpecificBenefitItemList.length == 1){
                    this.branchSpecificBenefitItemList.forEach(item => {
                        this.selectedItemsList.push(item);
                    });
                }
            }, 100);
        } else {
            if (this.allItemsSelection.selected) {
                this.branchSpecificBenefitItemList.forEach(item => {
                    this.selectedItemsList.push(item);
                });
                setTimeout(() => {
                    this.allItemsSelection.select();
                }, 60);
                
            } else {
                this.selectedItemsList = [];
            }
           
        }
        
       
    }

    //#endregion
}
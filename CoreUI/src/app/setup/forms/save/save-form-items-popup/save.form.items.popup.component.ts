/********************* Angular References ********************/
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { HttpService } from '@app/services/app.http.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FundamentalsItems, Items } from '@app/setup/models/custom.form.model';
import { ENU_CustomFormItemType } from '@app/helper/config/app.enums';

/********************** Services & Model *********************/

@Component({
    selector: 'form-items',
    templateUrl: './save.form.items.popup.component.html'
})

export class FormItemsComponent implements OnInit {

    @Output() onItemsSelect = new EventEmitter<FundamentalsItems[]>();    

    isAllItems: boolean = false;

    itemTypeHeading: string = "";

    /* Configurations */
    enuItemType = ENU_CustomFormItemType;
    
    constructor(
        public _dialogRef: MatDialogRef<FormItemsComponent>,
        @Inject(MAT_DIALOG_DATA) public fundamentalsItemList: FundamentalsItems[]
    ) { }

    ngOnInit() {
        var itemTypeID: number = this.fundamentalsItemList[0].ItemTypeID;

        switch(itemTypeID) {
            case this.enuItemType.Class:
              this.itemTypeHeading = "Classes"
              break;
            case this.enuItemType.Service:
                this.itemTypeHeading = "Services"
              break;
            default:
                this.itemTypeHeading = "Products";
        }
    }

    onAllItemsChange(isAllItems: boolean) {
        this.setAllItems(isAllItems);
    }

    onSetAllItemsInCategory(isSelectAll: boolean, categoryId: number) {
        this.setAllItemsInCategory(isSelectAll, categoryId);
    }

    onSelect() {
        this.onItemsSelect.emit(this.fundamentalsItemList);
        this.onClosePopup();
    }

    onClosePopup() {
        this.closePopup();
    }

    // #endregion    

    // #region Methods

    setAllItems(isAllItems: boolean) {
        this.isAllItems = !isAllItems;
        this.fundamentalsItemList.forEach(category => {            
            category.ItemList.forEach(item => { 
                item.IsSelected = isAllItems;
            });
        });
    }

    setAllItemsInCategory(isSelectAll: boolean, categoryId: number) {
        let selectedCategory = this.fundamentalsItemList.find(sc => sc.CategoryID === categoryId);
        if (selectedCategory && selectedCategory.ItemList && selectedCategory.ItemList.length > 0) {
            selectedCategory.ItemList.forEach(item => {
                item.IsSelected = isSelectAll;
            });
        }
    }

    closePopup() {
        this._dialogRef.close();
    }

   
} 
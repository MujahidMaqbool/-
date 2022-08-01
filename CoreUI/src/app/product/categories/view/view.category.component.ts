/********************** Angular Refrences *********************/
import { Component, OnInit, Inject } from '@angular/core';

/********************** Material::Reference *********************/
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/********************** Configuration *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { EnumSaleSourceType } from 'src/app/helper/config/app.enums';

/********************** Components *********************/
import { ViewComponent } from 'src/app/setup/automation-template/view/view.component';

@Component({
  selector: 'app-view-product-category',
  templateUrl: './view.category.component.html'
})
export class ViewCategoryComponent implements OnInit {

  messages = Messages;
  catrgoryObj: any = {};
  enumAppSourceType = EnumSaleSourceType;
  constructor(
    private _dialog: MatDialogRef<ViewComponent>,
    @Inject(MAT_DIALOG_DATA) public ProductCategory: any
  ) { }

  ngOnInit(): void {
    this.catrgoryObj = this.ProductCategory;
  }

  onCloseDialog() {
    this._dialog.close();
  }

}

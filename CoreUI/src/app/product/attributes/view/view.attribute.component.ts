import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';

@Component({
  selector: 'app-view-attribute',
  templateUrl: './view.attribute.component.html'
})
export class ViewAttributeComponent implements OnInit {

  /* Local Variables */
  isDataExists: boolean = false;
  enumAppsourceTypeID = EnumSaleSourceType;

  constructor(
    private _dialog: MatDialogRef<ViewAttributeComponent>,
    @Inject(MAT_DIALOG_DATA) public attributeViewDetail: any
  ) { }

  ngOnInit(): void {


  }

  onCloseDialog() {
    this._dialog.close();
  }

}
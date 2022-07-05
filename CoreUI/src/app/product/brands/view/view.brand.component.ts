/*********************** Angular References *************************/
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';



@Component({
    selector: 'view-brand-detail',
    templateUrl: './view.brand.component.html'
})

export class ViewBrandComponent implements OnInit {


  appSourceTypeID = EnumSaleSourceType;

    constructor(
      private dialogRef: MatDialogRef<ViewBrandComponent>,
      @Inject(MAT_DIALOG_DATA) public brandViewDetail: any
    ) { }

    ngOnInit() {
    }

    // Close Dialouge
    onCloseDialog() {
      this.dialogRef.close();
    }


}

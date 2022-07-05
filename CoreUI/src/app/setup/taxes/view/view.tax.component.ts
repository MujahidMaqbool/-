/*********************** Angular References *************************/
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';



@Component({
  selector: 'view-tax-detail',
  templateUrl: './view.tax.component.html'
})

export class ViewTaxComponent implements OnInit {
  enumAppSourceType = EnumSaleSourceType;
  constructor(
    private dialogRef: MatDialogRef<ViewTaxComponent>,
    @Inject(MAT_DIALOG_DATA) public taxViewDetail: any
  ) { }

  ngOnInit() {
  }

  // Close Dialouge
  onCloseDialog() {
    this.dialogRef.close();
  }


}

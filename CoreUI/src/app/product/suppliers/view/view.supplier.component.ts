// #region Imports

/*********************** Angular References *************************/
import { Component, Inject, OnInit } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**********************  Configurations *********************/
import { EnumSaleSourceType } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';

// #region Imports End


@Component({
  selector: "view-supplier-detail",
  templateUrl: "./view.supplier.component.html",
})
export class ViewSupplierComponent implements OnInit {
  /* Local Variables */
  isDataExists: boolean = false;
  appSourceTypeID = EnumSaleSourceType;

  /* Message */
  messages = Messages;

  constructor(
    private dialogRef: MatDialogRef<ViewSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public supplierViewDetail: any
  ) {}

  ngOnInit() {
    this.isDataExists =
      this.supplierViewDetail.SupplierBranchVM &&
      this.supplierViewDetail.SupplierBranchVM.length > 0
        ? true
        : false;
  }

  //#Start method region

  // close dialog
  onCloseDialog() {
    this.dialogRef.close();
  }

}
  //#End method region

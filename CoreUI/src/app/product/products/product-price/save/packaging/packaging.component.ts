import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MeasurementUnitType } from '@app/helper/config/app.enums';
import { ProductVariantPackagingViewModel } from '@app/product/models/product.model';

@Component({
  selector: 'app-packaging',
  templateUrl: './packaging.component.html'
})
export class SavePackagingComponent implements OnInit {

  @ViewChild("productPackagingForm") productPackagingForm: NgForm;

  unitList: any[] = [];  
  weightUnitList: any[] = [];
  dimensionsUnitList: any[] = [];

  @Output() savePackagingModel = new EventEmitter<ProductVariantPackagingViewModel>();

  savePackagingDetail: ProductVariantPackagingViewModel = new ProductVariantPackagingViewModel();
  oldPackagingDetail: ProductVariantPackagingViewModel = new ProductVariantPackagingViewModel();

  enumMeasurementUnitType = MeasurementUnitType;
  dimensionUnitName: string = "";
  weighrUnitName: string = "";

  constructor(
    private _dialog: MatDialogRef<SavePackagingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.savePackagingDetail = new ProductVariantPackagingViewModel();

    this.oldPackagingDetail = this.data?.pcakagingDetail ? JSON.parse(JSON.stringify(this.data?.pcakagingDetail)): this.savePackagingDetail;
    
    this.unitList = this.data.measurementUnitList.filter(mu => mu.MeasurementUnitTypeID == this.enumMeasurementUnitType.SizeOrVolume);
    this.weightUnitList = this.data.measurementUnitList.filter(mu => mu.MeasurementUnitTypeID == this.enumMeasurementUnitType.Weight);
    this.dimensionsUnitList = this.data.measurementUnitList.filter(mu => mu.MeasurementUnitTypeID == this.enumMeasurementUnitType.Dimension);
    
    this.dimensionUnitName = this.data.measurementUnitList.find(mu => mu.MeasurementUnitTypeID == this.enumMeasurementUnitType.Dimension)?.UnitName;
    this.weighrUnitName = this.data.measurementUnitList.find(mu => mu.MeasurementUnitTypeID == this.enumMeasurementUnitType.Weight)?.UnitCode;    

    this.savePackagingDetail = this.data.pcakagingDetail == undefined || this.data.pcakagingDetail == undefined? this.savePackagingDetail : this.data.pcakagingDetail;
    this.savePackagingDetail.SizeVolumeUnitID = this.savePackagingDetail.SizeVolumeUnitID ? this.savePackagingDetail.SizeVolumeUnitID : null;
    this.savePackagingDetail.DimensionUnitID = this.savePackagingDetail.DimensionUnitID && this.savePackagingDetail.DimensionUnitID > 0 ? this.savePackagingDetail.DimensionUnitID : null;
    this.savePackagingDetail.WeightUnitID = this.savePackagingDetail.WeightUnitID && this.savePackagingDetail.WeightUnitID > 0 ? this.savePackagingDetail.WeightUnitID : null;
  }

  onClose(isSaved: boolean = false) {
    // if(!isSaved){
    //   this.savePackagingDetail = JSON.parse(JSON.stringify(this.oldPackagingDetail));
    //   this.savePackagingModel.emit(this.savePackagingDetail);
    // }
    this._dialog.close();
  }

  onSavePackaging(){
    this.savePackagingModel.emit(this.savePackagingDetail);
    this.onClose(true);
  }

}

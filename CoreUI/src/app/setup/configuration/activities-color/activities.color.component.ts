/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { NgForm } from '@angular/forms';
import {Location} from '@angular/common';
/********************** Service & Models *********************/
/* Services*/
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models*/
import { SchedulerActivityColor } from 'src/app/setup/models/activity.color.model';
import { ApiResponse } from 'src/app/models/common.model';

/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerActivityColorApi } from 'src/app/helper/config/app.webapi';
import { ENU_SchedulerActivityType, ENU_Package } from 'src/app/helper/config/app.enums';
import { map } from 'rxjs/internal/operators';

@Component({
  selector: 'activities-color',
  templateUrl: './activities.color.component.html',
})

export class ActivitiesColorComponent implements OnInit {

  @ViewChild('activitiesClrForm') activitiesClrForm: NgForm;

  /* Messages */
  messages = Messages;

  /* Model Reference */
  packageIdSubscription: SubscriptionLike;

  schActivityColorList: SchedulerActivityColor[];

  /* Local Members */
  schActivityClrCopy: any;
  disableSaveButton: boolean = true;

  hasClassInPackage: boolean;
  hasServiceInPackage: boolean;

  activityColorType = ENU_SchedulerActivityType;
  package = ENU_Package;

  constructor(private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private rewriteUrl: Location
  ) { }

  ngOnInit() {
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/actvities-color");
    this.getFundamentals();
  }

  ngOnDestroy() {
    if (this.packageIdSubscription) {
      this.packageIdSubscription.unsubscribe();
    }
  }

  setPackagePermissions(packageId: number) {
    this.hasClassInPackage = true;
    this.hasServiceInPackage = true;
    switch (packageId) {
      case this.package.WellnessBasic:
      case this.package.WellnessMedium:
      case this.package.WellnessTop:
        this.hasClassInPackage = false;
        break;
      case this.package.FitnessBasic:
      case this.package.FitnessMedium:
        this.hasServiceInPackage = false;
        break;
    }
    this.setShowProperty();
  }

  setSaveButtonStatus() {
    this.disableSaveButton = true;
    if (JSON.stringify(this.schActivityClrCopy) != JSON.stringify(this.schActivityColorList)) {
      this.disableSaveButton = false;
    }
  }

  getFundamentals() {
    return this._httpService.get(SchedulerActivityColorApi.getFundamentals)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.schActivityColorList = res.Result ? res.Result : [];
          this.checkPackageId();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler Activity Color"));
        }
      );
  }

  checkPackageId() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.setPackagePermissions(packageId);
      }
    });
  }
  
  setShowProperty() {
    this.schActivityColorList.forEach((colorType: SchedulerActivityColor) => {
      if (colorType.SchedulerActivityTypeID === this.activityColorType.Class) {
        colorType.showForSave = this.hasClassInPackage;
      }
      else if (colorType.SchedulerActivityTypeID === this.activityColorType.Service) {
        colorType.showForSave = this.hasServiceInPackage;
      }
      else {
        colorType.showForSave = true;
      }
    })
    this.schActivityClrCopy = JSON.parse(JSON.stringify(this.schActivityColorList))
    this.setSaveButtonStatus();
  }

  saveActivitiesColor() {
    let modelForSave = JSON.parse(JSON.stringify(this.schActivityColorList));
    // delete showForSave
    modelForSave.map(function(color: SchedulerActivityColor){delete color.showForSave; return color;});
    this._httpService.save(SchedulerActivityColorApi.save, modelForSave)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Scheduler Activity Color"));
          this.setSaveButtonStatus();
          this.getFundamentals();
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Scheduler Activity Color")); });
  }

  // Reset the form
  onReset() {
    this.getFundamentals();
  //  this.schActivityColorList = Object.assign([], this.schActivityClrCopy);
  }
}
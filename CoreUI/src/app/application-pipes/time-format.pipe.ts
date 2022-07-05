import { Pipe, PipeTransform } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { DataSharingService } from '@app/services/data.sharing.service';
import { DD_Branch } from '@app/models/common.model';

@Pipe({
  name: 'branchTimeFormat'
})
export class TimeFormatPipe implements PipeTransform {
  public showFormat = false;
  currentBranchSubscription: SubscriptionLike;
  constructor(
    private _dataSharingService: DataSharingService,
  ) {
    this.getBranchFormat();
  }

  ngOnDestroy() {
    this.currentBranchSubscription?.unsubscribe();
  }

  transform(time: any) {
    if (time != undefined && time != '' && this.showFormat == true) {
      let hour = (time.split(':'))[0]
      let min = (time.split(':'))[1]
      let part = hour >= 12 ? 'PM' : 'AM';
      min = (min + '').length == 1 ? `0${min}` : min;
      hour = hour > 12 ? hour - 12 : hour;
      hour = (hour + '').length == 1 ? `0${hour}` : hour;
      hour = hour == '00' ? 12 : hour;
      return `${hour}:${min} ${part}`
    } else if (time != undefined && time != '' && this.showFormat == false) {
      let hour = (time.split(':'))[0]
      let min = (time.split(':'))[1]
      return `${hour}:${min}`
    }

  }

  async getBranchFormat() {
    return this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe((branch: DD_Branch) => {
      if (branch) {
        this.showFormat = branch.BranchTimeFormat12Hours;
      }
    })
  }
 
  public convert24Hoursto12HoursFormat(time: any) {
    if (time != null && time != "") {
      var hours = Number(time.match(/^(\d+)/)[1]);
      var minutes = Number(time.match(/:(\d+)/)[1]);
      var AMPM = time.match(/\s(.*)$/)[1];
      if (AMPM == "PM" && hours < 12) hours = hours + 12;
      if (AMPM == "AM" && hours == 12) hours = hours - 12;
      var sHours = hours.toString();
      var sMinutes = minutes.toString();
      if (hours < 10) sHours = "0" + sHours;
      if (minutes < 10) sMinutes = "0" + sMinutes;
      return `${sHours}:${sMinutes}`
    }
  }
}

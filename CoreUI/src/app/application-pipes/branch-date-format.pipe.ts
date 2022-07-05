import { Pipe, PipeTransform } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DataSharingService } from '@app/services/data.sharing.service';
import { DD_Branch } from '@app/models/common.model';


@Pipe({
  name: 'branchDateFormat'
})
export class BranchDateFormatPipe implements PipeTransform {
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

  transform(date: any, format: string = 'yyyy-MM-dd') {
    if (date) {
      date = date && date.toString().indexOf('Z') > 0 ? new Date(date.toString().split('Z')[0]) : date;
      let splittedDate = (date.split(' '))[0]
      let time = this.convert12HoursFormatto24Hours(date.split(' ')[1]);
      if (time) {
        const formattedDate = new DatePipe('en-US').transform(splittedDate, format);
        return `${formattedDate} ${time}`;
      } else {
        return new DatePipe('en-US').transform(splittedDate, format);
        // return `${splittedDate}`;
      }
    }
  }

  async getBranchFormat() {
    return this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe((branch: DD_Branch) => {
      if (branch) {
        this.showFormat = branch.BranchTimeFormat12Hours;
      }
    })
  }

  public convert12HoursFormatto24Hours(time: any) {
    if (time != null && time != "" && this.showFormat == true) {
      let hour = (time.split(':'))[0]
      let min = (time.split(':'))[1]
      let part = hour >= 12 ? 'PM' : 'AM';
      min = (min + '').length == 1 ? `0${min}` : min;
      hour = hour > 12 ? hour - 12 : hour;
      hour = (hour + '').length == 1 ? `0${hour}` : hour;
      return `${hour}:${min} ${part}`
    } else if (time != undefined && time != '' && this.showFormat == false) {
      let hour = (time.split(':'))[0]
      let min = (time.split(':'))[1]
      return `${hour}:${min}`
    }
  }
}

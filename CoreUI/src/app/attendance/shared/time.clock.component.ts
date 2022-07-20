import { Component, HostListener, OnInit } from '@angular/core';
import { Configurations } from 'src/app/helper/config/app.config';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { DD_Branch, ApiResponse } from 'src/app/models/common.model';
import { HomeApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { SessionService } from 'src/app/helper/app.session.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName, ENU_MobileOperatingSystem } from 'src/app/helper/config/app.enums';
@Component({
    selector: "time-clock",
    templateUrl: "./time.clock.component.html"
})

export class TimeClockComponent extends AbstractGenericComponent implements OnInit {


    clock: string;
    todayDate: string;
    branchId: number;
    timeFormat = Configurations.TimeFormat;
    currentDate: Date = new Date();
    currentBranchTime: any;
    /* Collection Types */
    branchList: DD_Branch[] = [];
    clockTimeDateFormat: string = "";

    constructor(private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _messagesService: MessageService, ) {
            super();
            this.getBranchDatePattern(); 
    }

    // #region Listener start
    // when branch change auto refresh page and set selected branch
    @HostListener('window:focus', ['$event'])
    onFocus(event: FocusEvent): void {
        if(this.branchList && this.branchList.length > 1){
            if( this.branchId &&  this.branchId !== SessionService.getBranchID()){
                location.reload();
            }
        }
    }
    // #region Listener end

    ngOnInit() {
        this.getFundamentals();
        //Runs the enclosed function on a set interval.
        setInterval(() => {
            this.setDefaultBranch();
        }, 60000) // Updates the time every 60 second.
       /// setTimeout(() => alert("never happens"), 1000);
    }

    async getBranchDatePattern() {
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.clockTimeDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ClockTimeDateFormat);
        this.updateDateTime();
    }

    getFundamentals() {
        this._httpService.get(HomeApi.getFundamentals).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                if (res && res.Result) {
                    if (res.Result.CompanyInfo) {
                        this._dataSharingService.shareCompanyInfo(res.Result.CompanyInfo);
                        this._dataSharingService.shareCompanyLoaded(true);
                        this.branchList = res.Result.BranchList;
                        this.setDefaultBranch();
                    }
                }
            }
            else {
                this._messagesService.showErrorMessage(res.MessageText);
            }
        });
             
    }

    async setDefaultBranch() {
        if (this.branchList && this.branchList.length > 0) {
            let branch = this.getBranchFromList();
            this.branchId = branch.BranchID;
            SessionService.setBranchID(this.branchId);
            this._dataSharingService.shareCurrentBranch(branch);
            this._dataSharingService.shareBranchLoaded(true);

            var device = super.getMobileOperatingSystem();

            if(device == ENU_MobileOperatingSystem.iOS || device == ENU_MobileOperatingSystem.DesktopSafari){
                this.currentBranchTime = this._dateTimeService.getCurrentDateTimeForIOSDevices();
            } else{
                this.currentBranchTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            }

            this.updateDateTime();
        }
    }

    getBranchFromList(): DD_Branch {
        let branch = null;
        let branchId = SessionService.getBranchID();

        if (branchId || branchId <= 0) {
            branch = this.branchList.find((g) => g.BranchID == branchId);
            if (!branch) {
              branch = this.branchList[0];
            }
            // branch = this.branchList[].BranchID = branchId;
        } else {
            branch = this.branchList.find((b) => b.BranchID === this.branchId);
            if (!branch) {
                branch = this.branchList[0];
            }
        }

        // if (branchId || branchId <= 0) {
        //     branch = this.branchList[0];
        // }
        // else {
        //     branch = this.branchList.find(b => b.BranchID === this.branchId);
        //     if (!branch) {
        //         branch = this.branchList[0];
        //     }
        // }

        return branch;
    }


    updateDateTime() {
        this.clock = this._dateTimeService.getTimeStringFromDate(this.currentBranchTime, this.timeFormat);
        this.todayDate = this._dateTimeService.convertDateObjToString(this.currentBranchTime, this.clockTimeDateFormat);
    }
}

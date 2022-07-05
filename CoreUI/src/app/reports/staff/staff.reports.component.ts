/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators';

/********************** Services & Models *********************/
/* Models */
import { StaffReportSearchParameter, PriorityType } from '@reports/models/staff.reports.model';
import { AllStaff, ApiResponse } from '@models/common.model';

/* Services */
import { MessageService } from '@services/app.message.service';
import { HttpService } from '@services/app.http.service';
import { CommonService } from '@app/services/common.service';
/**********************  Common *********************/
import { Configurations } from '@helper/config/app.config'
import { Messages } from '@helper/config/app.messages';
import { StaffApi, StaffActivityApi } from '@app/helper/config/app.webapi';
import { DateTimeService } from '@app/services/date.time.service';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ReportName, FileType } from '@app/helper/config/app.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Report } from '@app/helper/config/app.module.page.enums';

@Component({
  selector: 'staff-report',
  templateUrl: './staff.reports.component.html'
})

export class StaffReportsComponent implements OnInit {

  allowedPages = {
    AllStaffReport: false,
    StaffDetailReport: false,
    StaffActivitiesReport: false,
    StaffClockTimeReport: false,
    ScheduleGlanceReport: false,
    StaffTaskReport: false
  };


  @ViewChild('staffClockTimeToFromDateComoRef') staffClockTimeToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('staffActivtiesToFromDateComoRef') staffActivtiesToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('staffScheduleAtGlanceToFromDateComoRef') staffScheduleAtGlanceToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('staffReportToFromDateComoRef') staffReportToFromDateComoRef: DateToDateFromComponent;
  // #region Local references

  /* Local Members */

  staffActivitiesdateFrom: Date;
  staffActivitiesdateTo: Date;

  staffClockTimedateFrom: Date;
  staffClockTimedateTo: Date;
  scheduleatGlancedateFrom: Date;
  scheduleatGlancedateTo: Date;
  dateFormat: string = 'yyyy-MM-dd';
  pdfFileName: string = "";
  currentDate: Date = new Date();
  clearScheduleAtGlanceInput: string = "";
  clearStaffActivtiesInput: string = "";
  personName: string = "";
  clearStaffDetailInput: string = "";
  clearStaffTaskInput: string = "";
  /* Messages */
  messages = Messages;

  /* Models Refences */
  fileType = FileType;
  reportName = ReportName;
  staffPositionList: any;
  statusList: any;
  allPerson: AllStaff[];
  priorityTypeList: PriorityType[];
  staffReportSearchParameter = new StaffReportSearchParameter();
  searchPerson: FormControl = new FormControl();

  /* Configurations */
  activityList = Configurations.StaffActivityList;//.filter(x => x.value != 6);

  // #endregion

  constructor(private _httpService: HttpService,
    private _commonService: CommonService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService, private _authService: AuthService) {

      this.getBranchSetting();
  }

  ngOnInit() {
    this.setPermissions();
    this.getStaffSearchFundamentals();
    this.getTaskFundamentals();
    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchStaff(searchText).subscribe(response => {
              if (response.Result != null && response.Result.length) {
                this.allPerson = response.Result;
              }
              else {
                this.staffReportSearchParameter.StaffID = 0;
                this.allPerson = [];
              }
            });
          }
        }
        else {
          this.allPerson = [];
        }
      });
  }

  // #region Events

  onToDateChange(date: Date) {
    this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
  }

  onFromDateChange(date: Date) {
    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
  }

  onClearDate() {
    this.staffReportSearchParameter.StaffID = 0;
    this.clearStaffDetailInput = '';
    this.clearStaffActivtiesInput = '';
    this.clearScheduleAtGlanceInput = '';
    this.clearStaffTaskInput = '';
  }


  // #endregion

  // #region Methods

  async getBranchSetting(){
    this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
      this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat)
  }

  resetStaffClockTimeFilters() {
    this.staffClockTimeToFromDateComoRef.resetDateFilter();
    this.staffReportSearchParameter.StaffPositionID = 0;
    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.staffClockTimeToFromDateComoRef.dateFrom, this.dateFormat);
    this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.staffClockTimeToFromDateComoRef.dateTo, this.dateFormat);
    //this.resetDateToFrom();

  }

  resetScheduleatGlanceFilters() {
    this.staffScheduleAtGlanceToFromDateComoRef.resetDateFilter();
    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.staffScheduleAtGlanceToFromDateComoRef.dateFrom, this.dateFormat);
    this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.staffScheduleAtGlanceToFromDateComoRef.dateTo, this.dateFormat);
    this.staffReportSearchParameter.StaffID = null;
    this.clearScheduleAtGlanceInput = "";
    //this.resetDateToFrom();

  }

  getStaffSearchFundamentals() {
    this._httpService.get(StaffApi.searchFundamentals)
      .subscribe((res:ApiResponse) => {
        if(res && res.MessageCode > 0){
        this.staffPositionList = res.Result.StaffPositionList;
        this.statusList = res.Result.StatusList;
        this.staffReportSearchParameter.IsActive = null;
        this.setDropdownDefaultValue();
        }else{
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); });
  }

  getTaskFundamentals() {
    this._httpService.get(StaffActivityApi.getTaskFundamentals).subscribe(
      (res:ApiResponse) => {
        // Set fundamentals
        if(res && res.MessageCode > 0){
        if (res && res.Result) {
          this.priorityTypeList = res.Result.PriorityTypeList;
        }
      }else{
        this._messageService.showErrorMessage(res.MessageText);
      }
      },
      err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
    )
  }
  // #region AllStaffReports

  exportAllStaffReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      isActive: this.staffReportSearchParameter.IsActive, //? true : false,
      staffPositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID


    }

    this._httpService.get(StaffApi.getAllStaffReport, params).subscribe((allStaffData: any) => {

      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(allStaffData, this.reportName.AllStaff);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(allStaffData, this.reportName.AllStaff);
      };
    });
  }

  viewAllStaffReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      isActive: this.staffReportSearchParameter.IsActive,// ? true : false,
      staffPositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID
    }

    this._httpService.get(StaffApi.getAllStaffReport, params).subscribe((allStaffData: any) => {
      this._commonService.viewPDFReport(allStaffData);
    });
  }

  // #endregion

  // #region StaffDetailReports

  exportStaffDetailReport() {
    if (!this.staffReportSearchParameter.StaffID || this.staffReportSearchParameter.StaffID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Staff"));
    } else {
      this._httpService.get(StaffApi.getStaffDetailReport + this.staffReportSearchParameter.StaffID)
        .subscribe((staffDetailData: any) => {
          this._commonService.createPDF(staffDetailData, this.reportName.StaffDetails);
          // var link = document.createElement("a");
          // link.setAttribute("href", "data:application/pdf;base64," + staffDetailData.Result);
          // //ExportExcel    ExportPDF     ExportCSV
          // link.setAttribute("download", "StaffDetailReport.pdf");
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);
        })
    }
  }

  viewStaffDetailReport(fileType: number) {
    if (!this.staffReportSearchParameter.StaffID || this.staffReportSearchParameter.StaffID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Staff"));
    } else {
      let params = {
        fileFormatTypeID: fileType,
        staffID: this.staffReportSearchParameter.StaffID
      }

      if (!this.staffReportSearchParameter.StaffID || this.staffReportSearchParameter.StaffID == 0) {
        this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Staff"));
      } else {
        this._httpService.get(StaffApi.getStaffDetailReport + this.staffReportSearchParameter.StaffID)
          .subscribe((staffDetailData: any) => {
            this._commonService.viewPDFReport(staffDetailData);
          })
      }
    }
  }

  // #endregion

  // #region StaffactivitiesReports

  exportAllStaffctivitiesReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.staffReportSearchParameter.StaffID > 0 ? this.staffReportSearchParameter.StaffID : null,
      activityTypeID: this.staffReportSearchParameter.ActivityTypeID == 0 ? null : this.staffReportSearchParameter.ActivityTypeID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }
    // if (!this.staffReportSearchParameter.StaffID || this.staffReportSearchParameter.StaffID == 0) {
    //   this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Staff"));
    // } else {
      this._httpService.get(StaffApi.getAllStaffActivitiesReport, params).subscribe((staffActvtiesData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(staffActvtiesData, this.reportName.StaffActivities);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(staffActvtiesData, this.reportName.StaffActivities);
        };

      })
    //}
  }

  viewExportAllStaffActivitiesReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.staffReportSearchParameter.StaffID > 0 ? this.staffReportSearchParameter.StaffID : null,
      activityTypeID: this.staffReportSearchParameter.ActivityTypeID == 0 ? null : this.staffReportSearchParameter.ActivityTypeID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }
    // if (!this.staffReportSearchParameter.StaffID || this.staffReportSearchParameter.StaffID == 0) {
    //   this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Staff"));
    // } else {
      this._httpService.get(StaffApi.getAllStaffActivitiesReport, params)
        .subscribe(
          (allStaffData: any) => {
            this._commonService.viewPDFReport(allStaffData);
          })
    //}
  }

  resetStaffActivitiesFilters() {
    this.staffActivtiesToFromDateComoRef.resetDateFilter();
    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.staffActivtiesToFromDateComoRef.dateFrom, this.dateFormat);
    this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.staffActivtiesToFromDateComoRef.dateTo, this.dateFormat);
    this.staffReportSearchParameter.ActivityTypeID = 0;
    //this.resetDateToFrom();
    this.clearStaffActivtiesInput = "";
    this.allPerson = [];
  }

  // #endregion

  // #region StaffAttendacneReports

  exportAllStaffTimeSheetReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffpositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }

    this._httpService.get(StaffApi.getAllStaffClockTimeReport, params).subscribe((staffClockTimeData: any) => {
      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(staffClockTimeData, this.reportName.StaffClockTime);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(staffClockTimeData, this.reportName.StaffClockTime);
      };

    })
  }


  viewAllStaffTimeSheetReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffpositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }
    this._httpService.get(StaffApi.getAllStaffClockTimeReport, params)
      .subscribe(
        (allStaffData: any) => {
          this._commonService.viewPDFReport(allStaffData);
        });
  }

  exportScheduleatGlanceReport(fileType: number) {
    //if (this.clearScheduleAtGlanceInput != "") {
      let params = {
        fileFormatTypeID: fileType,
        staffID: this.staffReportSearchParameter.StaffID > 0 ? this.staffReportSearchParameter.StaffID : null,
        dateFrom: this.staffReportSearchParameter.DateFrom,
        dateTo: this.staffReportSearchParameter.DateTo
      }
      if(this.staffReportSearchParameter.StaffID > 0){
        this._httpService.get(StaffApi.getScheduleGlanceReport, params).subscribe((scheduleAtGlanceData: any) => {
          if (fileType == this.fileType.PDF) {
            this._commonService.createPDF(scheduleAtGlanceData, this.reportName.ScheduleAtGlance);
          }
          if (fileType == this.fileType.Excel) {
            this._commonService.createExcel(scheduleAtGlanceData, this.reportName.ScheduleAtGlance);
          };
        })
      } else{
        this._messageService.showErrorMessage(this.messages.Error.SelectStaff);
      }
      
    //}
    // else {
    //   this._messageService.showErrorMessage(this.messages.Error.SelectStaff);
    // }

  }

  viewScheduleatGlanceReport(fileType: number) {
   if (this.clearScheduleAtGlanceInput != "") {
      let params = {
        fileFormatTypeID: fileType,
        staffID: this.staffReportSearchParameter.StaffID > 0 ? this.staffReportSearchParameter.StaffID : null,
        dateFrom: this.staffReportSearchParameter.DateFrom,
        dateTo: this.staffReportSearchParameter.DateTo
      }
      this._httpService.get(StaffApi.getScheduleGlanceReport, params)
        .subscribe(
          (allStaffData: any) => {
            this._commonService.viewPDFReport(allStaffData);
          })
    }
    else {
      this._messageService.showErrorMessage(this.messages.Error.SelectStaff);
    }
  }

  exportStaffTaskReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.staffReportSearchParameter.StaffID == 0 ? null : this.staffReportSearchParameter.StaffID,
      staffPositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }
    this._httpService.get(StaffApi.getViewAllStaffTaskReport, params).subscribe((viewAllStaffTaskData: any) => {
      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(viewAllStaffTaskData, this.reportName.StaffTask);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(viewAllStaffTaskData, this.reportName.StaffTask);
      };

    })
  }


  viewStaffTaskReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.staffReportSearchParameter.StaffID == 0 ? null : this.staffReportSearchParameter.StaffID,
      staffPositionID: this.staffReportSearchParameter.StaffPositionID == 0 ? null : this.staffReportSearchParameter.StaffPositionID,
      dateFrom: this.staffReportSearchParameter.DateFrom,
      dateTo: this.staffReportSearchParameter.DateTo
    }
    this._httpService.get(StaffApi.getViewAllStaffTaskReport, params)
      .subscribe(
        (viewAllStaffTaskData: any) => {
          this._commonService.viewPDFReport(viewAllStaffTaskData);
        })
  }

  resetAllStaffFilters() {
    this.staffReportSearchParameter.StaffPositionID = 0;
    this.staffReportSearchParameter.IsActive = null;
  }


  resetAllStaffTaskFilters() {
    this.staffReportToFromDateComoRef.resetDateFilter();
    this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.staffReportToFromDateComoRef.dateFrom, this.dateFormat);
    this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.staffReportToFromDateComoRef.dateTo, this.dateFormat);
    this.staffReportSearchParameter.StaffID = null;
    this.staffReportSearchParameter.StaffPositionID = 0;
    this.clearStaffTaskInput = "";
  }

  // #endregion

  getSelectedStaff(person: AllStaff) {
    if (person != null && person.StaffID != null) {
      this.staffReportSearchParameter.StaffID = person.StaffID;
    }
    else {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Staff"));
    }

  }

  displayClientName(user?: AllStaff): string | undefined {
    return user ? user.FirstName + ' ' + user.LastName : undefined;
  }

  reciviedDateTo($event) {
    this.staffReportSearchParameter.DateFrom = $event.DateFrom;
    this.staffReportSearchParameter.DateTo = $event.DateTo;
  }

  setDropdownDefaultValue() {
    this.staffPositionList.splice(0, 0, { StaffPositionID: 0, StaffPositionName: "All", IsActive: true });
  };

  // resetDateToFrom() {
  //   this.staffReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
  //     this.staffReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
  // }


  setPermissions() {
    this.allowedPages.AllStaffReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllStaffReport);
    this.allowedPages.ScheduleGlanceReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ScheduleGlanceReport);
    this.allowedPages.StaffActivitiesReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffActivitiesReport);
    this.allowedPages.StaffClockTimeReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffClockTimeReport);
    this.allowedPages.StaffDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffDetailReport);
    this.allowedPages.StaffTaskReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffTaskReport);
  }

  onNameChange(memberName: any) {
    if (memberName.length < 3) {
      this.staffReportSearchParameter.StaffID = 0;
    }
  }

  //#endregion
}
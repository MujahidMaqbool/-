import { NgForm } from "@angular/forms";
import { DD_Branch } from "@app/models/common.model";
import { ENU_CountryFormat, ENU_DateFormat, ENU_CountryBaseDateFormatName, ENU_MobileOperatingSystem } from "@app/helper/config/app.enums";
import { DataSharingService } from "@app/services/data.sharing.service";
import { SubscriptionLike as ISubscription } from 'rxjs';
import { Configurations } from "@app/helper/config/app.config";
import { CompanyDetails } from "@app/setup/models/company.details.model";

export abstract class AbstractGenericComponent {

    branchDetail: DD_Branch;
    companyDetail: CompanyDetails;

    isBranchLoadedInSubscription: ISubscription;
    isCompanyLoadedInSubscription: ISubscription;

    /**
     * @Param: FormInstance
     * @ParamType:  NgForm
     * @Summary: Mark your form instance as dirty
     */
    markFormAsDirty(formInstance: NgForm): void {

        if (formInstance.form.pristine) {
            formInstance.form.markAsDirty();
        }
    }

    /**
     * @Param: Devextreme startDate event, ModelEntTime
     * @ParamType:  event component, Date object
     * @Summary: Make endTime duration according to startTime
     */
    changeEndTimeDuration(event, modelEndTime) {
        if (event.previousValue) {
            let currentStartDate = new Date(event.value),
                previousStartDate = new Date(event.previousValue),
                endDateValue = new Date(modelEndTime),
                duration = endDateValue.getTime() - previousStartDate.getTime();
            modelEndTime = new Date(currentStartDate.getTime() + duration).toISOString();
        }
        return modelEndTime;
    }

    /**
     * 
     * @param: 1st input parameter is string for char control 
     * @param: 2nd parameter is for string length how much length you want to display on your container
     * @summary: returns the string with appended dots.
     */

    fixedCharacterLength(name: string, charLength) {
        return name.length > charLength ?
            name.substring(0, charLength - 3) + ".." :
            name;
    }

    /**
     * 
     * @param: 1st input parameter is string for color 
     * @param: 2nd parameter is for how much point you want to light the color
     * @summary: returns the light color.
     */

    changeLightColor(col: any, p: number) {

        const R = parseInt(col.substring(1, 3), 16);
        const G = parseInt(col.substring(3, 5), 16);
        const B = parseInt(col.substring(5, 7), 16);
        const curr_total_dark = (255 * 3) - (R + G + B);

        // calculate how much of the current darkness comes from the different channels
        const RR = ((255 - R) / curr_total_dark);
        const GR = ((255 - G) / curr_total_dark);
        const BR = ((255 - B) / curr_total_dark);

        // calculate how much darkness there should be in the new color
        const new_total_dark = ((255 - 255 * (p / 100)) * 3);

        // make the new channels contain the same % of available dark as the old ones did
        const NR = 255 - Math.round(RR * new_total_dark);
        const NG = 255 - Math.round(GR * new_total_dark);
        const NB = 255 - Math.round(BR * new_total_dark);

        const RO = ((NR.toString(16).length === 1) ? "0" + NR.toString(16) : NR.toString(16));
        const GO = ((NG.toString(16).length === 1) ? "0" + NG.toString(16) : NG.toString(16));
        const BO = ((NB.toString(16).length === 1) ? "0" + NB.toString(16) : NB.toString(16));

        return "#" + RO + GO + BO;
    }

    updateRecurrenceExceptionOnEditSeries(copyClassModel: any, startTime: string) {
        let recurrenceExceptionString = '';
        let recurrenceExceptionArray: any[];
        let _gethours, _getminutes;
        var time = startTime.split(":");
        _gethours = time[0].trim();
        _getminutes = time[1].trim();
        if (_gethours.length === 1) _gethours = "0" + _gethours;
        if (_getminutes.length === 1) _getminutes = "0" + _getminutes;

        if (copyClassModel.RecurrenceException.includes(',')) {
            recurrenceExceptionArray = copyClassModel.RecurrenceException.split(",");
            recurrenceExceptionArray.forEach((element, i) => {
                var splitbeforeTime = element.split("T");
                recurrenceExceptionString = recurrenceExceptionString + splitbeforeTime[0] + "T" + _gethours + _getminutes + "00";
                recurrenceExceptionArray.length == i + 1 ? recurrenceExceptionString : recurrenceExceptionString = recurrenceExceptionString + ",";
            });
        }
        else {
            var splitbeforeTime = copyClassModel.RecurrenceException.split("T");
            recurrenceExceptionString = recurrenceExceptionString + splitbeforeTime[0] + "T" + _gethours + _getminutes + "00";
        }
        copyClassModel.RecurrenceException = recurrenceExceptionString;
        return copyClassModel
    }

     // add by default 23:59:59 time in RecurrenceRule Untill (added by Fahad dated on 20-04-2021)
     changeUntilTime(copyClassModel: any){
        try{
            if(copyClassModel.RecurrenceRule.includes("UNTIL")){
                var data = copyClassModel.RecurrenceRule.split(";");
                var recurrenceRule = ""; 
                data.forEach(value => {
                    if (value.includes("UNTIL")) {
                        var splitUntil = value.split("=");
                        var splitTime = splitUntil[1].split("T");
                        var combineChanged = splitUntil[0] + "=" + splitTime[0] + "T" + "235959Z";
                        recurrenceRule = recurrenceRule ? recurrenceRule + ";" + combineChanged : combineChanged;
                    } else{
                        recurrenceRule = recurrenceRule ? recurrenceRule + ";" + value : value;
                    }
                })
                copyClassModel.RecurrenceRule = recurrenceRule;
            }
            return copyClassModel.RecurrenceRule;
        } catch(ex){
            return copyClassModel.RecurrenceRule;
        }
    }

    // remove zone from until (use this method to avoid time zone issue) added by Fahad dated on 20-04-2021
    removeZoneUntilTime(copyClassModel: any){
        try{
            if(copyClassModel.RecurrenceRule.includes("UNTIL")){
                var data = copyClassModel.RecurrenceRule.split(";");
                var recurrenceRule = ""; 
                data.forEach(value => {
                    if (value.includes("UNTIL")) {
                        var splitUntil = value.split("Z");
                      
                        recurrenceRule = recurrenceRule ? recurrenceRule + ";" + splitUntil[0] : splitUntil[0];
                    } else{
                        recurrenceRule = recurrenceRule ? recurrenceRule + ";" + value : value;
                    }
                })
                copyClassModel.RecurrenceRule = recurrenceRule;
            }
            return copyClassModel.RecurrenceRule;
        } catch(ex){
            return copyClassModel.RecurrenceRule;
        }
    }


    /**
     * 
     * @param: 1st parameter is DataSharingService for get selected branch detail
     * @summary: returns active branch details.
     */
    getBranchDetail(_dataSharingService: DataSharingService) {
        var result = new DD_Branch();// = "";
        return new Promise<DD_Branch>((resolve, reject) => {
            this.isBranchLoadedInSubscription = _dataSharingService.isBranchLoaded.subscribe(
                (isLoaded: boolean) => {
                    if (isLoaded) {
                        _dataSharingService.currentBranch.subscribe(async (branchResponse) => {
                            this.branchDetail = await branchResponse;
                            result = this.branchDetail
                                resolve(await result);
                            });
                    }
            });
        });
    }

     /**
     * 
     * @param: 1st parameter is DataSharingService for get company detail
     * @summary: returns company details.
     */
      getCompanyDetail(_dataSharingService: DataSharingService) {
        var result = new CompanyDetails();
        return new Promise<CompanyDetails>((resolve, reject) => {
            this.isCompanyLoadedInSubscription = _dataSharingService.isCompanyLoaded.subscribe(
                (isLoaded: boolean) => {
                    if (isLoaded) {
                        _dataSharingService.companyInfo.subscribe(async (CompanyResponse) => {
                            this.companyDetail = await CompanyResponse;
                            result = this.companyDetail
                                resolve(await result);
                            });
                    }
            });
        });
    }
    /**
     * /**
     * 
     * @param: 1st parameter is DataSharing Service Instance for getting info about isPartial Paymnet Allowed Check 
     * @summary: returns bit True or false.
     */
    isPartPaymentAllow(_dataSharingService: DataSharingService) {
      let  isPartialPaymentAllow :boolean;
        return new Promise<boolean>((resolve, reject) => {
                        _dataSharingService.isPartPaymentAllow.subscribe(async (isAllowPart) => {
                            isPartialPaymentAllow = await isAllowPart;
                                resolve(await isPartialPaymentAllow);
                            });
        });
    }

    /**
     * 
     * @param: 1st parameter is DataSharingService for get selected branch detail
     * @param: 2nd parameter is for pattern
     * @summary: returns the format pattern.
     */
    getBranchDateFormat(_dataSharingService: DataSharingService, formatName: string) {
        var result: string = "";
    //added by fahad dated on 18-02-2021 this code get format id from browser
        return new Promise<string>((resolve, reject) => {
           
            var dateFormatID: number = this.getDateFormatID();
            if (dateFormatID && dateFormatID && dateFormatID == ENU_CountryFormat.US) {
                let enuNameForUS = "US" + formatName;
                switch (enuNameForUS) {
                    case ENU_CountryBaseDateFormatName.USDateFormat:
                        result = ENU_DateFormat.USDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USLongDateFormat:
                        result = ENU_DateFormat.USLongDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USSchedulerTooltipDateFormat:
                        result = ENU_DateFormat.USSchedulerTooltipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USExceptionDateFormat:
                        result = ENU_DateFormat.USExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USSchedulerDateFormatDayView:
                        result = ENU_DateFormat.USSchedulerDateFormatDayView;
                        break;
                    case ENU_CountryBaseDateFormatName.USSchedulerDateFormatWeekViewTo:
                        result = ENU_DateFormat.USSchedulerDateFormatWeekViewTo;
                        break;
                    case ENU_CountryBaseDateFormatName.USSchedulerRRuleUntilDateFormat:
                        result = ENU_DateFormat.USSchedulerRRuleUntilDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USDateFormatForSave:
                        result = ENU_DateFormat.USDateFormatForSave;
                        break;
                    case ENU_CountryBaseDateFormatName.USDateTimeFormat:
                        result = ENU_DateFormat.USDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USNotficationDateTimeFormat:
                        result = ENU_DateFormat.USNotficationDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USReceiptDateFormat:
                        result = ENU_DateFormat.USReceiptDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USRecurrenceExceptionDateFormat:
                        result = ENU_DateFormat.USRecurrenceExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USDashboardDateFormat:
                        result = ENU_DateFormat.USDashboardDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USSchedulerStaffShiftToolTipDateFormat:
                        result = ENU_DateFormat.USSchedulerStaffShiftToolTipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USDateFormatforBooked:
                        result = ENU_DateFormat.USDateFormatforBooked;
                        break;
                    case ENU_CountryBaseDateFormatName.USAttendnaceformat:
                        result = ENU_DateFormat.USAttendnaceformat;
                        break;
                    case ENU_CountryBaseDateFormatName.USDashBoardLastVisitDateFormat:
                        result = ENU_DateFormat.USDashBoardLastVisitDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USClockTimeDateFormat:
                        result = ENU_DateFormat.USClockTimeDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USShiftForeCastDateFormat:
                        result = ENU_DateFormat.USShiftForeCastDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.USDateFormatforReturingClient:
                        result = ENU_DateFormat.USDateFormatforReturingClient;
                        break;
                    default:
                        result = ENU_DateFormat.USDateFormat;
                        break;
                }
                resolve(result);
            }
            else if(dateFormatID && dateFormatID && dateFormatID == ENU_CountryFormat.CH) {
                let enuNameForCH = "CH" + formatName;
                switch (enuNameForCH) {
                    case ENU_CountryBaseDateFormatName.CHDateFormat:
                        result = ENU_DateFormat.CHDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHLongDateFormat:
                        result = ENU_DateFormat.CHLongDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHSchedulerTooltipDateFormat:
                        result = ENU_DateFormat.CHSchedulerTooltipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHExceptionDateFormat:
                        result = ENU_DateFormat.CHExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHSchedulerDateFormatDayView:
                        result = ENU_DateFormat.CHSchedulerDateFormatDayView;
                        break;
                    case ENU_CountryBaseDateFormatName.CHSchedulerDateFormatWeekViewTo:
                        result = ENU_DateFormat.CHSchedulerDateFormatWeekViewTo;
                        break;
                    case ENU_CountryBaseDateFormatName.CHSchedulerRRuleUntilDateFormat:
                        result = ENU_DateFormat.CHSchedulerRRuleUntilDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDateFormatForSave:
                        result = ENU_DateFormat.CHDateFormatForSave;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDateTimeFormat:
                        result = ENU_DateFormat.CHDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHNotficationDateTimeFormat:
                        result = ENU_DateFormat.CHNotficationDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHReceiptDateFormat:
                        result = ENU_DateFormat.CHReceiptDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHRecurrenceExceptionDateFormat:
                        result = ENU_DateFormat.CHRecurrenceExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDashboardDateFormat:
                        result = ENU_DateFormat.CHDashboardDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHSchedulerStaffShiftToolTipDateFormat:
                        result = ENU_DateFormat.CHSchedulerStaffShiftToolTipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDateFormatforBooked:
                        result = ENU_DateFormat.CHDateFormatforBooked;
                        break;
                    case ENU_CountryBaseDateFormatName.CHAttendnaceformat:
                        result = ENU_DateFormat.CHAttendnaceformat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDashBoardLastVisitDateFormat:
                        result = ENU_DateFormat.CHDashBoardLastVisitDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHClockTimeDateFormat:
                        result = ENU_DateFormat.CHClockTimeDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHShiftForeCastDateFormat:
                        result = ENU_DateFormat.CHShiftForeCastDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.CHDateFormatforReturingClient:
                        result = ENU_DateFormat.CHDateFormatforReturingClient;
                        break;
                    default:
                        result = ENU_DateFormat.CHDateFormat;
                        break;
                }
                resolve(result);
            }
            else {
                let enuNameForUK = "UK" + formatName;
                switch (enuNameForUK) {
                    case ENU_CountryBaseDateFormatName.UKDateFormat:
                        result = ENU_DateFormat.UKDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKLongDateFormat:
                        result = ENU_DateFormat.UKLongDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKSchedulerTooltipDateFormat:
                        result = ENU_DateFormat.UKSchedulerTooltipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKExceptionDateFormat:
                        result = ENU_DateFormat.UKExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKSchedulerDateFormatDayView:
                        result = ENU_DateFormat.UKSchedulerDateFormatDayView;
                        break;
                    case ENU_CountryBaseDateFormatName.UKSchedulerDateFormatWeekViewTo:
                        result = ENU_DateFormat.UKSchedulerDateFormatWeekViewTo;
                        break;
                    case ENU_CountryBaseDateFormatName.UKSchedulerRRuleUntilDateFormat:
                        result = ENU_DateFormat.UKSchedulerRRuleUntilDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDateFormatForSave:
                        result = ENU_DateFormat.UKDateFormatForSave;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDateTimeFormat:
                        result = ENU_DateFormat.UKDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKNotficationDateTimeFormat:
                        result = ENU_DateFormat.UKNotficationDateTimeFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKReceiptDateFormat:
                        result = ENU_DateFormat.UKReceiptDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKRecurrenceExceptionDateFormat:
                        result = ENU_DateFormat.UKRecurrenceExceptionDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDashboardDateFormat:
                        result = ENU_DateFormat.UKDashboardDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKSchedulerStaffShiftToolTipDateFormat:
                        result = ENU_DateFormat.UKSchedulerStaffShiftToolTipDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDateFormatforBooked:
                        result = ENU_DateFormat.UKDateFormatforBooked;
                        break;
                    case ENU_CountryBaseDateFormatName.UKAttendnaceformat:
                        result = ENU_DateFormat.UKAttendnaceformat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDashBoardLastVisitDateFormat:
                        result = ENU_DateFormat.UKDashBoardLastVisitDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKClockTimeDateFormat:
                        result = ENU_DateFormat.UKClockTimeDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKShiftForeCastDateFormat:
                        result = ENU_DateFormat.UKShiftForeCastDateFormat;
                        break;
                    case ENU_CountryBaseDateFormatName.UKDateFormatforReturingClient:
                        result = ENU_DateFormat.UKDateFormatforReturingClient;
                        break;
                    default:
                        result = ENU_DateFormat.UKDateFormat;
                        break;
                }
                resolve(result);
            }
        });

        //commented by fahad dated on 18-02-2021 this code get formate id from backend branch wise
        // return new Promise<string>((resolve, reject) => {
        //     this.isBranchLoadedInSubscription = _dataSharingService.isBranchLoaded.subscribe(
        //         (isLoaded: boolean) => {
        //             if (isLoaded) {
        //                 _dataSharingService.currentBranch.subscribe(async (branchResponse) => {
        //                     this.branchDetail = await branchResponse;
        //                     if (this.branchDetail && this.branchDetail.DateFormatID && this.branchDetail.DateFormatID == ENU_CountryFormat.US) {
        //                         let enuNameForUS = "US" + formatName;
        //                         switch (enuNameForUS) {
        //                             case ENU_CountryBaseDateFormatName.USDateFormat:
        //                                 result = ENU_DateFormat.USDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USSchedulerTooltipDateFormat:
        //                                 result = ENU_DateFormat.USSchedulerTooltipDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USExceptionDateFormat:
        //                                 result = ENU_DateFormat.USExceptionDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USSchedulerDateFormatDayView:
        //                                 result = ENU_DateFormat.USSchedulerDateFormatDayView;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USSchedulerDateFormatWeekViewTo:
        //                                 result = ENU_DateFormat.USSchedulerDateFormatWeekViewTo;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USSchedulerRRuleUntilDateFormat:
        //                                 result = ENU_DateFormat.USSchedulerRRuleUntilDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDateFormatForSave:
        //                                 result = ENU_DateFormat.USDateFormatForSave;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDateTimeFormat:
        //                                 result = ENU_DateFormat.USDateTimeFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USNotficationDateTimeFormat:
        //                                 result = ENU_DateFormat.USNotficationDateTimeFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USReceiptDateFormat:
        //                                 result = ENU_DateFormat.USReceiptDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USRecurrenceExceptionDateFormat:
        //                                 result = ENU_DateFormat.USRecurrenceExceptionDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDashboardDateFormat:
        //                                 result = ENU_DateFormat.USDashboardDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USSchedulerStaffShiftToolTipDateFormat:
        //                                 result = ENU_DateFormat.USSchedulerStaffShiftToolTipDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDateFormatforBooked:
        //                                 result = ENU_DateFormat.USDateFormatforBooked;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USAttendnaceformat:
        //                                 result = ENU_DateFormat.USAttendnaceformat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDashBoardLastVisitDateFormat:
        //                                 result = ENU_DateFormat.USDashBoardLastVisitDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USClockTimeDateFormat:
        //                                 result = ENU_DateFormat.USClockTimeDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USShiftForeCastDateFormat:
        //                                 result = ENU_DateFormat.USShiftForeCastDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.USDateFormatforReturingClient:
        //                                 result = ENU_DateFormat.USDateFormatforReturingClient;
        //                                 break;
        //                             default:
        //                                 result = ENU_DateFormat.USDateFormat;
        //                                 break;
        //                         }
        //                         resolve(await result);
        //                     }
        //                     else {
        //                         let enuNameForUK = "UK" + formatName;
        //                         switch (enuNameForUK) {
        //                             case ENU_CountryBaseDateFormatName.UKDateFormat:
        //                                 result = ENU_DateFormat.UKDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKSchedulerTooltipDateFormat:
        //                                 result = ENU_DateFormat.UKSchedulerTooltipDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKExceptionDateFormat:
        //                                 result = ENU_DateFormat.UKExceptionDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKSchedulerDateFormatDayView:
        //                                 result = ENU_DateFormat.UKSchedulerDateFormatDayView;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKSchedulerDateFormatWeekViewTo:
        //                                 result = ENU_DateFormat.UKSchedulerDateFormatWeekViewTo;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKSchedulerRRuleUntilDateFormat:
        //                                 result = ENU_DateFormat.UKSchedulerRRuleUntilDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDateFormatForSave:
        //                                 result = ENU_DateFormat.UKDateFormatForSave;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDateTimeFormat:
        //                                 result = ENU_DateFormat.UKDateTimeFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKNotficationDateTimeFormat:
        //                                 result = ENU_DateFormat.UKNotficationDateTimeFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKReceiptDateFormat:
        //                                 result = ENU_DateFormat.UKReceiptDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKRecurrenceExceptionDateFormat:
        //                                 result = ENU_DateFormat.UKRecurrenceExceptionDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDashboardDateFormat:
        //                                 result = ENU_DateFormat.UKDashboardDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKSchedulerStaffShiftToolTipDateFormat:
        //                                 result = ENU_DateFormat.UKSchedulerStaffShiftToolTipDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDateFormatforBooked:
        //                                 result = ENU_DateFormat.UKDateFormatforBooked;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKAttendnaceformat:
        //                                 result = ENU_DateFormat.UKAttendnaceformat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDashBoardLastVisitDateFormat:
        //                                 result = ENU_DateFormat.UKDashBoardLastVisitDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKClockTimeDateFormat:
        //                                 result = ENU_DateFormat.UKClockTimeDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKShiftForeCastDateFormat:
        //                                 result = ENU_DateFormat.UKShiftForeCastDateFormat;
        //                                 break;
        //                             case ENU_CountryBaseDateFormatName.UKDateFormatforReturingClient:
        //                                 result = ENU_DateFormat.UKDateFormatforReturingClient;
        //                                 break;
        //                             default:
        //                                 result = ENU_DateFormat.UKDateFormat;
        //                                 break;
        //                         }
        //                         resolve(await result);
        //                     }

        //                 });
        //             }
        //         }
        //     );
        // });
    }

    private getDateFormatID(){
        var userLang = navigator.language;

        var dateFormatID: number = ENU_CountryFormat.Default;

        // get coutry browser language code from this link: http://download.geonames.org/export/dump/countryInfo.txt

        if(userLang == 'en-US' || userLang == 'en-CA' || userLang == 'fr-CA' || userLang == 'en-AS'
            || userLang == 'en-KY' || userLang == 'en-GH'|| userLang == 'en-GU'|| userLang == 'ch-GU'
            || userLang == 'en-KE' || userLang == 'sw-KE'||  userLang == 'en-MH'
            || userLang == 'ch-MP' || userLang == 'en-MP'|| userLang == 'es-PA'
            || userLang == 'en-PH' || userLang == 'en-AS'|| userLang == 'en-AS'|| userLang == 'en-AS'
            || userLang == 'en-PR'|| userLang == 'es-PR'|| userLang == 'fr-TG'){
            dateFormatID = ENU_CountryFormat.US;
        } 
        else if(userLang == 'zh-CN' || userLang == 'hu-HU' || userLang == 'ko-KP' || userLang == 'ko-KR'
        || userLang == 'zh-TW'){
            dateFormatID = ENU_CountryFormat.CH;
        }
        else{
            dateFormatID = ENU_CountryFormat.UK;
        }
        return dateFormatID;
    }

    /**
     * 
     * @param: 1st parameter is DataSharingService for get selected branch detail
     * @summary: returns the format pattern.
     */
    getBranchTimeFormat(_dataSharingService: DataSharingService) {
        var result: string = "";

        return new Promise<string>((resolve, reject) => {
            this.isBranchLoadedInSubscription = _dataSharingService.isBranchLoaded.subscribe(
                (isLoaded: boolean) => {
                    if (isLoaded) {
                        _dataSharingService.currentBranch.subscribe((branchResponse) => {
                            this.branchDetail = branchResponse;
                            if (this.branchDetail) {
                                if (this.branchDetail.BranchTimeFormat12Hours === true) {
                                    result = Configurations.SchedulerTimeFormatWithFormat;
                                } else {
                                    result = Configurations.SchedulerTimeFormat;
                                }
                                resolve(result);
                            }

                        });
                    }
                }
            );
        });
    }

    getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return ENU_MobileOperatingSystem.WindowsPhone;
        }

        if (/android/i.test(userAgent)) {
            return ENU_MobileOperatingSystem.Android;
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent)) { //&& !window.MSStream
            return ENU_MobileOperatingSystem.iOS;
        }

        //Desktop Safari
        const uA = navigator.userAgent;
        const vendor = navigator.vendor;
        if (/Safari/i.test(uA) && /Apple Computer/.test(vendor) && !/Mobi|Android/i.test(uA)) {
            return ENU_MobileOperatingSystem.DesktopSafari;
        }

        return ENU_MobileOperatingSystem.unknown;
    }

}
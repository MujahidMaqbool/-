/********************** Angular Reference ***********************/
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
/********************** Common *********************/
import { Configurations } from '@helper/config/app.config';
import { DataSharingService } from './data.sharing.service';
import { DD_Branch } from '@app/models/common.model';

import * as moment from 'moment-timezone';
import { ENU_DatePickerFormat } from '@app/helper/config/app.enums';

@Injectable({ providedIn: 'root' })
export class DateTimeService {

    /* Model Refrences*/
    private readonly _FORMATE_WITHOUT_ZONE = 'YYYY-MM-DDTHH:mm:ss';

    private readonly DATE_FORMATE_WITHOUT_ZONE = 'YYYY-MM-DD';
    private _currentBranch: DD_Branch;

    constructor(private _dateFilter: DatePipe,
        private _dataSharingService: DataSharingService) {
        this._dataSharingService.currentBranch.subscribe(
            (branch: DD_Branch) => {
                if (branch) {
                    this._currentBranch = branch;
                }
            }
        )
    }

    //#region Public Methods

    /**
        * @whatItDoes Get Current Date according to Branch Time Zone.
        * @Returns "Date Time object"
    */
    getCurrentDate() {
        let date = moment().utc();
        return date.tz(this._currentBranch.TimeZone);
    }

    /**
        * @whatItDoes Get Today's Date without Time (Hours, Minutes, Seconds will be 0).
        * @Returns "moment start of the day object"
    */
    getStartOfDay() {
        let date = moment().utc();
        return moment(date).startOf("day").format();
    }

    /**
        * @whatItDoes Get Current Date according to Branch Time Zone.
        * @Returns "Date Time object"
    */
    getCurrentDateTime(date?: any) {
        let dateObj;
        if (date) dateObj = moment(date).utc();
        else dateObj = moment().utc();

        if (this._currentBranch.TimeZone)
            return dateObj.tz(this._currentBranch.TimeZone).format();
        else
            return dateObj.format();
    }

    /**
        * @whatItDoes Get Current Date according to Branch Time Zone.
        * @Returns "Date Time object"
    */
   getCurrentDateTimeForIOSDevices(date?: any) {
        let dateObj;
        if (date) dateObj = moment(date).utc();
        else dateObj = moment().utc();

        var dateTime = moment.tz(dateObj, this._currentBranch.TimeZone);
        return dateTime.format();
    }

    /**
        * @whatItDoes Get Current Date and time according to Branch Time Zone. not included T Z +
        * @Returns "Date Time object"
    */
   getCurrentDateTimeForDScheduler() {
        let dateObj = moment().utc();
        return dateObj.tz(this._currentBranch.TimeZone).format("YYYY/MM/DD HH:mm:ss");
    }

    /**
        * @whatItDoes Get Current Date and time according to Branch Time Zone. not included T Z +
        * @Returns "Date Time object"
    */
    getCurrentDateTimeAcordingToBranch() {

        // this._dataSharingService.isBranchLoaded.subscribe(
        //     (isBranchLoad: boolean) => {
        //         if (isBranchLoad) {
        //             let dateObj = moment().utc();
        //             return new Date(dateObj.tz(this._currentBranch.TimeZone).format("YYYY/MM/DD HH:mm:ss"));
        //         }
        //     }
        // )
        let result;
        return new Promise<Date>((resolve, reject) => {
            this._dataSharingService.isBranchLoaded.subscribe(
                async (isLoaded: boolean) => {
                    if (isLoaded) {
                        let dateObj = moment().utc();
                        result = new Date(dateObj.tz(this._currentBranch.TimeZone).format("YYYY/MM/DD HH:mm:ss"));
                        resolve(await result);
                    }
            });
        });
     
    }

    /**
        * @whatItDoes Date And Time without zone information.
        * @Returns "DateTime string without Timezone"
    */
    getDateTimeWithoutZone(date: any) {
        return moment(date).format(this._FORMATE_WITHOUT_ZONE);
    }


    getDateWithoutZone(date: any) {
        return moment(date).format(this.DATE_FORMATE_WITHOUT_ZONE);
    }
    /**
        * @whatItDoes Coverts a DateTime object into Time string according 
        * to provided format.
        * @dateValue: DateTime object from where you want to pick time
        * @timeFormat: Time format string, ususally defined in VoyagerConfigurations.TimeFormat
        * {@example DateTimeService.getTimeStringFromDate(new Date(), 'HH:mm')}
        * @Returns "23:15"
    */

    getTimeStringFromDate(dateValue: Date, timeFormat?: string) {
        if (!timeFormat) {
            timeFormat = Configurations.TimeFormat;
        }
        return this._dateFilter.transform(dateValue, timeFormat);
    }

    /**
        * @whatItDoes Coverts a DateTime object into Date string according 
        * to provided format.
        * @dateValue: DateTime object from where you want to pick date
        * @dateFormat: Date format string, ususally defined in VoyagerConfigurations.DateFormat
        * {@example DateTimeService.convertDateToString(new Date(), 'dd-MM-yyyy')}
        * @Returns "02-Oct-2018"
    */

    convertDateObjToString(dateValue: Date, dateFormat: string) {
        // if(dateFormat && dateFormat.includes("-")){
        //     dateFormat = dateFormat.replace("-", "/");
        //     var result = this._dateFilter.transform(dateValue, dateFormat);
        //     return result.replace("/", "-");
        // } else{
            return this._dateFilter.transform(dateValue, dateFormat);
        // }
    }

     /**
        * @Alert Use only for schedular
        * @whatItDoes Coverts a DateTime object into Date string according 
        * to provided format for multi time zone not change date for schedular.
        * @dateValue: DateTime object from where you want to pick date
        * @dateFormat: Date format string, ususally defined in VoyagerConfigurations.DateFormat
        * {@example DateTimeService.convertDateToString(new Date(), 'dd-MM-yyyy')}
        * @Returns "02-Oct-2018"
    */
    convertDateObjToStringNotChangeDate(dateValue: Date, dateFormat: string){
        return moment(dateValue).format(dateFormat);
    }

    /**
        * @whatItDoes Coverts 12 hours time to 24 hours Time based on AM/PM.
        * @time: 12 Hours Time 05:00 PM
        * {@example DateTimeService.convertToTwentyFourHours('05:00 PM')}
        * @Returns 17:00
    */

    convertToTwentyFourHours(timeValue: string) {
        let timeArry = timeValue.split(" ");
        let time = timeArry[0];
        let timeMark = timeArry[1];
        let isPMTime = timeMark && timeMark != "" && timeMark.toUpperCase() === "PM";
        let timeArr = time.split(":");
        let hours = parseInt(timeArr[0]);
        let minutes = parseInt(timeArr[1]);

        hours = isPMTime && hours < 12 ? (hours + 12) : hours;

        return hours + ":" + minutes;
    }

    /**
        * @whatItDoes Coverts a Time string into DateTime object.
        * @time: 24 Hours Time value e.g. 23:14:00 or 23:14
        * @dateObj: Optional Date object. If you want to set time 
        * to some specific date object then provide this parameter
        * otherwise time will be set to today date
        * {@example DateTimeService.convertTimeStringToDateTime('23:14:00', yourDateObj)}
        * @Returns DateTime object
    */

    convertTimeStringToDateTime(time: string, dateObj?: any) {
        let date = new Date();
        if (dateObj) {
            date = new Date(dateObj);
        }

        let timeArr = time.split(":"), timeSeconds = 0;
        if (parseInt(timeArr[2])) {
            timeSeconds = parseInt(timeArr[2]);
        }
        date.setHours(parseInt(timeArr[0]), parseInt(timeArr[1]), timeSeconds);

        return date
    }

     /**
        * @Alert Use only for schedular
        * @whatItDoes Coverts a string object into   DateTime string.
        * @dateValue: string object
        * {@example DateTimeService.convertStringIntoDateForScheduler(2020-12-18T00:00:00Z)}
        * @Returns Date object = Wed Oct 03 2018 13:13:56 GMT+0500
        * different time zone issue fixing
    */

    convertStringIntoDateForScheduler(date: string){

        let _date = new Date(date);
        var _dateNumber = _date.setTime( _date.getTime() + _date.getTimezoneOffset()*60*1000 );
        _date = new Date(_dateNumber);

        return _date;
    }

    /**
        * @whatItDoes Coverts a DateTime object into   Time string.
        * @dateValue: Date object
        * {@example DateTimeService.convertDateToTimeString(Wed Oct 03 2018 13:13:56 GMT+0500)}
        * @Returns Time String = 13:13
    */

    convertDateToTimeString(dateValue: Date) {

        return dateValue.getHours() + ":" + dateValue.getMinutes();
    }

    /**
        * @whatItDoes Gets difference in number of minutes from two time strings.
        * @timeStart: Start Time value e.g. 23:14:00 or 23:14
        * @timeEnd: End Time value e.g. 23:20:00 or 23:20
        * {@example DateTimeService.getTimeDifferenceFromTimeString('23:14:00', '23:20:00')}
        * @Returns 6
    */

    getTimeDifferenceFromTimeString(timeStart: string, timeEnd: string): number {
        let minutes = 0

        var startDate = new Date("2/16/2018 " + timeStart);
        var endDate = new Date("2/16/2018 " + timeEnd);

        /*
            EndDateTime - StartDateTime = Milliseconds
            Milliseconds Divide by 1000 to convert in Seconds
            Seconds Divide by 60 to convert in Minutes
            Then parseInt to get Whole Number in minutes
        */

        minutes = parseInt((((endDate.getTime() - startDate.getTime()) / 1000) / 60).toString());

        return minutes

    }


    /**
        * @whatItDoes Coverts a Time string into default format or
        * or provided format.
        * @timeString: Time string you want to format
        * @timeFormat?: Time format string, ususally defined in VoyagerConfigurations.TimeFormatView
        * {@example DateTimeService.formatTimeString("23:15", 'hh:mm a')}
        * @Returns "11:15 PM"
    */

    formatTimeString(timeString: string, timeFormat?: string) {
        // try catch added by fahad when pos classes load and called this method not working in ipad 
        try{
            let date = this._dateFilter.transform(new Date(), Configurations.DateFormat)
            if (!timeFormat) {
                timeFormat = Configurations.TimeFormatView;
            }
            return this._dateFilter.transform(date + ' ' + timeString, timeFormat);
        } catch(ex){
            return timeString;
        }
    }

    /**
        * @whatItDoes: Coverts a number into Hours & Muinutes
        * @number: number should be greater than 60
        * {@example DateTimeService.convertNumberToHoursMins(65)}
        * @Returns "01:05 split this string[0] = hours & string[1] = minutes "
    */
    convertNumberToHoursMinutes(number) {
        let _number = Number(number);
        if (_number >= 60) {
            var hours = Math.floor(_number / 60);
            var minutes = _number % 60;
            return hours + " hour(s) " + (minutes > 0 ? minutes + " minute(s)" : "");
        }
    }

    /**
        * @whatItDoes: Get Next day date object
        * @Returns "Date Time Object of tomorrow date"
    */
    getTomorrowDate() {
        let today = new Date();
        // Convert Today to Tomorrow
        today.setDate(today.getDate() + 1);
        return today;
    }
    async getBranchTomorrowDate() {
        let today = await this.getCurrentDateTimeAcordingToBranch();
        let date = new Date(today);
        date.setDate(date.getDate() + 1);
        return date;
    }

    /**
       * @whatItDoes: Checks if toDate is Greater Than or Equal to fromDate 
       * @Returns "True or False "
   */
    compareTwoDates(fromDate:Date, toDate:Date) {
        if (fromDate <= toDate)
            return true;
        else false
    }

    checkMembershipEndDate(serviceBookingDate:Date, memerbshipEndDate:Date) {
        if (serviceBookingDate <= memerbshipEndDate)
            return true;
        else false
    }

    /**
      * @whatItDoes: add minutes to Date
      * @Returns "DateTime with interval "
    */

    setTimeInterval(startDateTime: Date, interval?: number) {
        interval = interval && interval > 0 ? interval : 15;
        let endTime = startDateTime.getMinutes() + interval;
        startDateTime.setMinutes(endTime)
        return startDateTime;
    }

    /**
        * @whatItDoes : Compare current time with booking time to check if booking is allowed
        * @maxBookingTime: Max DateTime to make bookings
        * {@example DateTimeService.isBookingTimeValid(65)}
        * @Returns "True or False"
    */
    isBookingTimeValid(maxBookingTime: any) {
        let currentDateTime = moment(this.getCurrentDate()).format(this._FORMATE_WITHOUT_ZONE);
        maxBookingTime = moment(maxBookingTime).format(this._FORMATE_WITHOUT_ZONE);
        if (maxBookingTime >= currentDateTime)
            return true;
        else false
    }

    /**
        * @whatItDoes : convert the given number of weeks into minutes
        * {@example DateTimeService.convertWeeksToMinutes(4)}
        * @Returns "Numbers in Weeks"
    */
    convertWeeksToMinutes(numberOfWeeks: number) {
        let retValue: number;
        retValue = this.convertWeekToDays(numberOfWeeks);
        retValue = this.convertDaysToHours(retValue);
        retValue = this.convertHoursToMinutes(retValue);
        return retValue;
    }


    /**
        * @whatItDoes : convert the given number of days into Minutes
        * {@example DateTimeService.convertDaysToMinutes(4)}
        * @Returns "Numbers in Days"
    */
    convertDaysToMinutes(numberOfDays: number) {
        let retValue: number;
        retValue = this.convertDaysToHours(numberOfDays);
        retValue = this.convertHoursToMinutes(retValue);
        return retValue;
    }

    /**
        * @whatItDoes : convert the given number of days into hours
        * {@example DateTimeService.convertDaysToHours(4)}
        * @Returns "Numbers in days"
    */
    convertDaysToHours(numberOfDays: number) {
        if (numberOfDays && numberOfDays > 0)
            return numberOfDays * 24;
        else return 0;
    }

    /**
        * @whatItDoes : convert the given number of weeks into days
        * {@example DateTimeService.convertWeekToDays(4)}
        * @Returns "Numbers in hours"
    */
    convertWeekToDays(numberOfWeeks: number) {
        if (numberOfWeeks && numberOfWeeks > 0)
            return numberOfWeeks * 7;
        else return 0;
    }

    /**
        * @whatItDoes : convert the given number of weeks into days
        * {@example DateTimeService.convertHoursToMinutes(4)}
        * @Returns "Numbers in hours"
    */
    convertHoursToMinutes(numberOfHours: number) {
        if (numberOfHours && numberOfHours > 0)
            return numberOfHours * 60;
        else return 0;
    }

    /**
        * @whatItDoes : Add Working Days to Provided date
        * @date: Date Time Object in which you want to add Working days
        * @days: Number of Days to Add
        * {@example DateTimeService.addWorkDays(date, 4)}
        * @Returns "Date Time Object with added days"
    */
    addWorkDays(date, days) {
        if (isNaN(days)) {
            //console.log("Value provided for \"days\" was not a number");
            return
        }
        if (!(date instanceof Date)) {
            //console.log("Value provided for \"startDate\" was not a Date object");
            return
        }
        // Get the day of the week as a number (0 = Sunday, 1 = Monday, .... 6 = Saturday)
        var dow = date.getDay();
        var daysToAdd = parseInt(days);
        // If the current day is Sunday add one day
        if (dow == 0)
            daysToAdd++;
        // If the start date plus the additional days falls on or after the closest Saturday calculate weekends
        if (dow + daysToAdd >= 6) {
            //Subtract days in current working week from work days
            var remainingWorkDays = daysToAdd - (5 - dow);
            //Add current working week's weekend
            daysToAdd += 2;
            if (remainingWorkDays > 5) {
                //Add two days for each working week by calculating how many weeks are included
                daysToAdd += 2 * Math.floor(remainingWorkDays / 5);
                //Exclude final weekend if remainingWorkDays resolves to an exact number of weeks
                if (remainingWorkDays % 5 == 0)
                    daysToAdd -= 2;
            }
        }
        date.setDate(date.getDate() + daysToAdd);
        return date;
    }

    /**
        * @whatItDoes : convert the given exception string to Date
        * {@example DateTimeService.convertHoursToMinutes('20190609')}
        * @Returns "Date"
    */
    convertExceptionStringToDate(exception: string) {
        let strException = exception; let retDate: Date = new Date();
        if (strException) {
            let splitOnlyDatePart = strException.split('T')[0];
            let getYearFromException = splitOnlyDatePart.substr(0, 4), getMonthFromException = splitOnlyDatePart.substr(4, 2), getDateFromException = splitOnlyDatePart.substr(6, 2);
            retDate = new Date(getYearFromException + '-' + getMonthFromException + '-' + getDateFromException);
        }
        return retDate;
    }

    /**
        * @whatItDoes : Gets name of the day from given date
        * {@example DateTimeService.getDayNameFromDate('2017-06-28T00:00:00')}
        * @Returns "Wednesday"
    */
    getDayNameFromDate(date: any) {
        return moment(date).format('dddd');
    }

     /**
        * @whatItDoes : Gets days count from given two different days
        * {@example DateTimeService.sdvsdv('2017-06-28T00:00:00', '2017-07-28T00:00:00')}
        * @Returns "30"
    */
    getDaysCountFromTwoDifferentDays(date1, date2){
        var startDate = moment(date1, "DD.MM.YYYY");
        var endDate = moment(date2, "DD.MM.YYYY");

         return endDate.diff(startDate, 'days');
    }

    // #endregion


    // #zone region added by fahad write some method for resolved chnaged zone issue dated 28/01/2021

     /**
        * @whatItDoes : remove zone in date time string
        * {@example }
        * @Returns ""
    */
    removeZoneFromDateTime(date: any) {
        return date && date.toString().indexOf('Z') > 0 ? new Date(date.toString().split('Z')[0]) : date
    }

    // #zone region added by fahad write some method for resolved changed zone issue dated and time 16/08/2021

     /**
        * @whatItDoes : ste time according to branch zone
        * {@example }
        * @Returns ""
    */
    ConvertDateTimeAccordingBranchZone(date: any) {
        return date ? moment.tz(date, this._currentBranch.TimeZone) : date;
    }

     /**
        * @whatItDoes : get browser date format
        * {@example }
        * @Returns "yyy-mm-dd"
    */
    getDatePickerFormat(){
        var userLang = navigator.language;

        var datePickerFormat: string = ENU_DatePickerFormat.UK;

        // get coutry browser language code from this link: http://download.geonames.org/export/dump/countryInfo.txt

        if(userLang == 'en-US' || userLang == 'en-CA' || userLang == 'fr-CA' || userLang == 'en-AS'
            || userLang == 'en-KY' || userLang == 'en-GH'|| userLang == 'en-GU'|| userLang == 'ch-GU'
            || userLang == 'en-KE' || userLang == 'sw-KE'||  userLang == 'en-MH'
            || userLang == 'ch-MP' || userLang == 'en-MP'|| userLang == 'es-PA'
            || userLang == 'en-PH' || userLang == 'en-AS'|| userLang == 'en-AS'|| userLang == 'en-AS'
            || userLang == 'en-PR'|| userLang == 'es-PR'|| userLang == 'fr-TG'){
            datePickerFormat = ENU_DatePickerFormat.US;
        } 
        else if(userLang == 'zh-CN' || userLang == 'hu-HU' || userLang == 'ko-KP' || userLang == 'ko-KR'
        || userLang == 'zh-TW'){
            datePickerFormat = ENU_DatePickerFormat.CH;
        }
       
        return datePickerFormat;
    }

    

    // #endregion

}
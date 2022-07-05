import { Injectable } from "@angular/core";

import { ClassAttendanceDetail } from "@app/models/attendee.model";
import { ENU_DurationType } from "@app/helper/config/app.enums";
import { DateTimeService } from "./date.time.service";

@Injectable({ providedIn: 'root' })

export class ClassValidations {

    private _classDetailObj: ClassAttendanceDetail;
    private _durationType = ENU_DurationType;

    constructor(private _dateTimeService: DateTimeService) {

    }

    public isClassBookingValid(classDetail: ClassAttendanceDetail): boolean {
        let isBookingValid = false;

        this._classDetailObj = classDetail;
        if (this._classDetailObj.BookBefore && this._classDetailObj.BookBeforeDurationTypeID) {
            switch (this._classDetailObj.BookBeforeDurationTypeID) {
                case this._durationType.Days: {
                    isBookingValid = this._validateBookBeforeDays();
                    break;
                }
                case this._durationType.Hours: {
                    isBookingValid = this._validateBookBeforeHours();
                    break;
                }
                case this._durationType.Minutes: {
                    isBookingValid = this._validateBookBeforeMinutes();
                    break;
                }
                case this._durationType.Weeks: {
                    isBookingValid = this._validateBookBeforeWeeks();
                    break;
                }
            }
        }
        else {
            isBookingValid = true;
        }
        return isBookingValid;
    }

    private _validateBookBeforeWeeks() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._classDetailObj.StartTime);
        var startDate = this._dateTimeService.convertTimeStringToDateTime(classStartTime, new Date(this._classDetailObj.StartDate));
        var maxBookingBeforeDate = new Date(JSON.parse(JSON.stringify(startDate)));
        maxBookingBeforeDate.setDate(startDate.getDate() - (this._classDetailObj.BookBefore * 7));

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeDate);
    }

    private _validateBookBeforeDays() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._classDetailObj.StartTime);
        var startDate = this._dateTimeService.convertTimeStringToDateTime(classStartTime, new Date(this._classDetailObj.StartDate));
        var maxBookingBeforeDate = new Date(JSON.parse(JSON.stringify(startDate)));
        maxBookingBeforeDate.setDate(startDate.getDate() - this._classDetailObj.BookBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeDate);
    }

    private _validateBookBeforeHours() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._classDetailObj.StartTime);
        var startTime = this._dateTimeService.convertTimeStringToDateTime(classStartTime, this._classDetailObj.StartDate);
        var maxBookingBeforeTime = new Date(JSON.parse(JSON.stringify(startTime)));
        maxBookingBeforeTime.setHours(startTime.getHours() - this._classDetailObj.BookBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeTime);
    }

    private _validateBookBeforeMinutes() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._classDetailObj.StartTime);
        var startTime = this._dateTimeService.convertTimeStringToDateTime(classStartTime, this._classDetailObj.StartDate);
        var maxBookingBeforeTime = new Date(JSON.parse(JSON.stringify(startTime)));
        maxBookingBeforeTime.setMinutes(startTime.getMinutes() - this._classDetailObj.BookBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeTime);
    }
}


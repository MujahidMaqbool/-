import { Pipe, PipeTransform } from "@angular/core";
import * as moment from 'moment';

@Pipe({ name: "timeFormatter" })
export class TimeFormatterPipe implements PipeTransform {

    // Time separator symbol (e.g. ':')
    private timeSeparator: string;

    // Default length of Time
    // Currently set for 4 (i.e. 2 digits for Hours and 2 digits for minutes)
    // Change it to 6 if you want to include seconds
    private defaultTimeLength: number;

    constructor() {
        this.timeSeparator = ":";
        this.defaultTimeLength = 4;
    }

    transform(value: string): string {
        let time = (value || "");
        // if length of Time string is greater than 'defaultTimeLength' 
        // then only return first characters upto 'defaultTimeLength' 
        //time.indexOf(this.timeSeparator) < 0 && 
        time = time.indexOf(this.timeSeparator) > 0 ? time.substring(0, 5) : time.length > this.defaultTimeLength ? time.substring(0, 4) : time;

        // add 'timeSeparator' after each 2 digits
        time = time.replace(/\B(?=(\d{2})+(?!\d))/g, this.timeSeparator);
        time = time.length === this.defaultTimeLength ? "0" + time : time;
        return time;
    }

    parse(value: string): string {
        let time = (value || "");
        // remove 'timeSeparator' from string
        time = time.replace(new RegExp(this.timeSeparator, "g"), "");

        return time;
    }
}
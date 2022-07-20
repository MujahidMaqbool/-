import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { interval, SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTimeService } from 'src/app/services/date.time.service';
@Component({
    selector: 'booking-start-timer',
    templateUrl: './booking.start.timer.component.html'
})
export class BookingStartTimerComponent implements OnInit, OnDestroy {
    @Input() bookingStartTime: string;
    @Output() onBookingAvailable = new EventEmitter<boolean>();

    public diff: number;
    public days: number = 0;
    public hours: any = 0;
    public minutes: any = 0;
    public seconds: any = 0;

    private timerSubscription: SubscriptionLike;

    constructor(private _dateTimeService: DateTimeService) { }

    ngOnInit() {
        if (this.bookingStartTime.indexOf('Z') > 0) {
            this.bookingStartTime = this.bookingStartTime.split('Z')[0];
        }
        this.getTimeDifference();
        this.getRemainingTime();

        let timer = interval(1000).pipe(
            map((x) => {
                this.getTimeDifference();
            }));

        this.timerSubscription = timer.subscribe((x) => {
            this.getRemainingTime();
        })
    }

    ngOnDestroy() {
        this.timerSubscription.unsubscribe();
    }

    getTimeDifference() {
        let currentBranchTime = this._dateTimeService.getDateTimeWithoutZone(this._dateTimeService.getCurrentDate());
        this.diff = Date.parse(this.bookingStartTime) - Date.parse(currentBranchTime);
    }

    getRemainingTime() {
        if (this.diff < 0) {
            this.onBookingAvailable.emit(true);
        }
        this.days = this.getDays(this.diff);
        this.hours = this.getHours(this.diff);
        this.minutes = this.getMinutes(this.diff);
        this.seconds = this.getSeconds(this.diff);
    }

    getDays(t) {
        return Math.floor(t / (1000 * 60 * 60 * 24));
    }

    getHours(t) {
        let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        return hours < 10 ? "0" + hours.toString() : hours;
    }

    getMinutes(t) {
        let _minutes = Math.floor((t / 1000 / 60) % 60);
        return _minutes < 10 ? "0" + _minutes.toString() : _minutes;
    }

    getSeconds(t) {
        let _seconds = Math.floor((t / 1000) % 60);
        return _seconds < 10 ? "0" + _seconds.toString() : _seconds;
    }
}
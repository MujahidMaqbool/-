import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
import { TimeFormatterPipe } from "../pipes/time.formatter";

@Directive({ selector: "[timeControl]" })
export class TimeControlDirective implements OnInit {

    private el: any;

    constructor(
        private elementRef: ElementRef,
        private timeFormatter: TimeFormatterPipe
    ) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
        this.el.value = this.timeFormatter.transform(this.el.value);
    }

    @HostListener("focus", ["$event.target.value"])
    onFocus(value: string) {
        /*
            Uncomment Below line if you want to remove time separater (:) on focus
        */

        //this.el.value = this.timeFormatter.parse(value); // opossite of transform
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value: string) {
        // Format time (e.g. HH:mm)
        this.el.value = this.timeFormatter.transform(value);
    }
}
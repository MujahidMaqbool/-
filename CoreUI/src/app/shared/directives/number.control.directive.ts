import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";

@Directive({ selector: "[numberControl]" })
export class NumberControlDirective implements OnInit {

    private el: any;
    private readonly DOT = ".";
    private allowedKeys: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "ArrowRight", "ArrowLeft", "Backspace", "Delete", "Tab", "ArrowUp","ArrowDown"];

    constructor(
        private elementRef: ElementRef,
    ) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
        //this.el.value = this.timeFormatter.transform(this.el.value);
    }

    @HostListener("keydown", ["$event"])
    preventCharacters(event: any) {
        let index = this.allowedKeys.findIndex(k => k == event.key);
        if (index < 0) {
            event.preventDefault()
        }
        else if(index === this.allowedKeys.findIndex(k => k === this.DOT)) {
            if (this.el.value.indexOf(this.DOT) > -1) {
                event.preventDefault();
            }
        }
    }
}
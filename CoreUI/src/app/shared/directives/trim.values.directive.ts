import { Directive, ViewContainerRef, Renderer2, ElementRef, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[trim-value]',
})
export class TrimValue {
    constructor(
        public viewContainerRef: ViewContainerRef,
        private renderer: Renderer2,
        private elementRef: ElementRef,
        private ngModel: NgModel
    ) { }

    @HostListener("blur")
    onBlur() {
        let value = this.ngModel.model;

        if (value) {
            value = value.trim();
            this.renderer.setProperty(
                this.elementRef.nativeElement, "value", value);
            this.renderer.setAttribute(
                this.elementRef.nativeElement, "value", value);
            this.ngModel.update.emit(value);
        }
    }
}
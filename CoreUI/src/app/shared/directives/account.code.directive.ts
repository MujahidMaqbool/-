import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { SEPADashAfterDigit } from 'src/app/models/cutomer.gateway.models';

@Directive({
  selector: '[accountCodeDirective]'
})
export class AccountCodeDirective {
  constructor(private el: ElementRef) {
  }

  @Input('accountCodeDirective') digits: SEPADashAfterDigit[];

  @HostListener('keyup')
  keyPressed() {
    if (this.el.nativeElement.value != null && (this.digits.length > 0 && this.digits[0].AccountCodeDigit != null)) {
      if (this.el.nativeElement.value.length > this.digits[0].AccountCodeDigit) {
        this.digits.forEach(element => {
          if (element.SpaceRequired) {
            if (this.el.nativeElement.value.charAt(element.AccountCodeDigit) !== " " && this.el.nativeElement.value.length > (element.AccountCodeDigit != null && element.AccountCodeDigit)) {
              this.el.nativeElement.value = this.el.nativeElement.value.substring(0, element.AccountCodeDigit) + " " + this.el.nativeElement.value.substring(element.AccountCodeDigit, this.el.nativeElement.value.length);
            }
          }
          else {
            if (this.el.nativeElement.value.charAt(element.AccountCodeDigit) !== '-' && this.el.nativeElement.value.length > element.AccountCodeDigit) {
              this.el.nativeElement.value = this.el.nativeElement.value.substring(0, element.AccountCodeDigit) + '-' + this.el.nativeElement.value.substring(element.AccountCodeDigit, this.el.nativeElement.value.length);
            }
          }

        });

      }
    }
  }
}

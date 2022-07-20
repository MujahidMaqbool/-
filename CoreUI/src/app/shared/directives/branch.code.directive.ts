import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { SEPADashAfterDigit } from 'src/app/models/cutomer.gateway.models';

@Directive({
  selector: '[branchCodeDirective]'
})
export class BranchCodeDirective {
  constructor(private el: ElementRef) {
  }

  @Input('branchCodeDirective') digits: SEPADashAfterDigit[];

  @HostListener('keyup')
  keyPressed() {
    if (this.el.nativeElement.value != null && (this.digits.length > 0 && this.digits[0].BranchCodeDigit != null)) {
      this.digits.forEach(element => {
        if (this.el.nativeElement.value.charAt(element.BranchCodeDigit) !== '-' && this.el.nativeElement.value.length > (element.BranchCodeDigit != null && element.BranchCodeDigit)) {
          this.el.nativeElement.value = this.el.nativeElement.value.substring(0, element.BranchCodeDigit) + '-' + this.el.nativeElement.value.substring(element.BranchCodeDigit, this.el.nativeElement.value.length);
        }
      });
    }
  }
}

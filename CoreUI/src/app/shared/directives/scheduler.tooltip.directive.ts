import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[tooltip-host]',
})
export class SchedulerTooltipDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

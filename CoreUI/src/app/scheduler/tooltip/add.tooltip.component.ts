import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, Type, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { SchedulerDataSource } from '@scheduler/models/scheduler.model';
import { SchedulerOptions } from '@helper/config/app.config';

import { ClassTooltipComponent } from './class.tooltip';
import { ServiceTooltipComponent } from './service.tooltip';
import { BlockTimeTooltipComponent } from './blocktime.tooltip';
import { CallTooltipComponent } from './call.tooltip';
import { AppointmentTooltipComponent } from './appointment.tooltip';
import { TaskTooltipComponent } from './task.tooltip';

import { SchedulerTooltipDirective } from '@app/shared/directives/scheduler.tooltip.directive';
import { enmSchedulerActvityType } from '@app/helper/config/app.enums';

@Component({
    selector: 'app-add-tooltip-component',
    template: `
                <ng-template tooltip-host></ng-template>
            `
})

export class AdTooltipComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() schedulerData: SchedulerDataSource;
    @Input() isDropdownTooltip: boolean;
    @Output() editActivity = new EventEmitter<any>();
    @Output() deleteActivity = new EventEmitter<any>();
    @Output() closeActivity = new EventEmitter<any>();
    @Output() rescheduleActivity = new EventEmitter<any>();
    @Output() manageAttendeeActivity = new EventEmitter<any>();
    @ViewChild(SchedulerTooltipDirective) tooltipHost: SchedulerTooltipDirective;
    schedulerOptions: SchedulerOptions;
    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnInit() {
    }
    ngAfterViewInit() {
        this.loadComponent();
    }
    ngOnDestroy() {
    }

    loadComponent() {
        switch (this.schedulerData.ActivityTypeID) {
            case enmSchedulerActvityType.class:
                this.createDynamicTooltipComponent(ClassTooltipComponent);
                break;
            case enmSchedulerActvityType.service:
                this.createDynamicTooltipComponent(ServiceTooltipComponent);
                break;
            case enmSchedulerActvityType.blockTime:
                this.createDynamicTooltipComponent(BlockTimeTooltipComponent);
                break;
            case enmSchedulerActvityType.call:
                this.createDynamicTooltipComponent(CallTooltipComponent);
                break;
            case enmSchedulerActvityType.appointment:
                this.createDynamicTooltipComponent(AppointmentTooltipComponent);
                break;
            case enmSchedulerActvityType.task:
                this.createDynamicTooltipComponent(TaskTooltipComponent);
                break;
        }
    }

    createDynamicTooltipComponent(tooltipType: Type<any>) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(tooltipType);
        let viewContainerRef = this.tooltipHost.viewContainerRef;
        viewContainerRef.clear();
        let componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = this.schedulerData;
        componentRef.instance.isDropdownTooltip = this.isDropdownTooltip;

        componentRef.instance.edit.subscribe(data => {
            this.editActivity.emit(data);
        })
        
        componentRef.instance.delete.subscribe(data => {
            this.deleteActivity.emit(data);
        })

        componentRef.instance.close.subscribe(data => {
            this.closeActivity.emit(data);
        })

        if (this.schedulerData.ActivityTypeID === enmSchedulerActvityType.service ) {
            componentRef.instance.reschedule.subscribe(data => {            
                this.rescheduleActivity.emit(data);
            })
        }

        if (this.schedulerData.ActivityTypeID === enmSchedulerActvityType.class ) {
            componentRef.instance.manageAttendee.subscribe(data => {
                this.manageAttendeeActivity.emit(data);
            });
        }
    }
}
import { SchedulerOptions } from '@helper/config/app.config';
import { SchedulerDataSource } from '@scheduler/models/scheduler.model';
import { ENU_ActivityType, enmSchedulerActvityType } from '@helper/config/app.enums';
import { DateTimeService } from '@app/services/date.time.service';

export class DataSourceModelMapper {

    constructor(private _dateTimeService: DateTimeService) { }

    public GetMapperModel(dataList: any, currentView) {

        return new mapDataToModel(this._dateTimeService).changeHandler(dataList, currentView);
    }
}

/**
 * map model
 */
export class mapDataToModel {

    private schedulerStaticStrings = new SchedulerOptions();

    private schedulerDataSourceList: SchedulerDataSource[] = [];

    activityType =ENU_ActivityType;

    constructor(private _dateTimeService: DateTimeService) { }

    changeHandler(data: any, currentView) {

        if (data && data.Result) {

            data = data.Result;

            if (data.ClassList) {
                data.ClassList.forEach(item => {
                    let objSchedulerModel = new SchedulerDataSource();
                    objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.Class;
                    objSchedulerModel.ActivityTypeID = enmSchedulerActvityType.class;
                    objSchedulerModel.id = item.id;
                    objSchedulerModel.text = item.text;
                    objSchedulerModel.ClassCode = item.ClassCode;
                    objSchedulerModel.IsActive = item.IsActive;
                    objSchedulerModel.description = item.description;
                    objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));    // implement Time Zone
                    objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                    objSchedulerModel.Price = item.PricePerSession;
                    objSchedulerModel.EnrolledAttendee = item.EnrolledAttendee;
                    let timeDuration = this._dateTimeService.getTimeDifferenceFromTimeString(objSchedulerModel.startDate.split('T')[1], objSchedulerModel.endDate.split('T')[1]);
                    objSchedulerModel.Duration = timeDuration > 60 ? this._dateTimeService.convertNumberToHoursMinutes(timeDuration) : timeDuration + " min(s)";
                    objSchedulerModel.allDay = item.allDay;
                    objSchedulerModel.StaffID = item.AssignedToStaffID;
                    objSchedulerModel.StaffFullName = item.AssignedToStaffName;
                    objSchedulerModel.FacilityName = item.FacilityName;
                    objSchedulerModel.FacilityID = item.FacilityID;
                    objSchedulerModel.StaffPositionID = item.StaffPositionID;
                    objSchedulerModel.StaffPositionName = item.StaffPositionName;
                    objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
                    objSchedulerModel.recurrenceRule = item.recurrenceRule;
                    objSchedulerModel.recurrenceException = item.recurrenceException;
                    objSchedulerModel.CreatedByName = item.CreatedByName;
                    objSchedulerModel.IsDragable = item.IsDragable;
                  
                    this.schedulerDataSourceList.push(objSchedulerModel);
                });
            }
            if (data.SaleServiceList) {
                data.SaleServiceList.forEach(item => {
                    let objSchedulerModel = new SchedulerDataSource();
                    objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.Service;
                    objSchedulerModel.ActivityTypeID = enmSchedulerActvityType.service;
                    objSchedulerModel.id = item.id;
                    objSchedulerModel.SaleTypeID = item.SaleTypeID;
                    objSchedulerModel.SaleTypeName = item.SaleTypeName;
                    objSchedulerModel.SaleStatusTypeID = item.SaleStatusTypeID;
                    objSchedulerModel.SaleSourceTypeID = item.SaleSourceTypeID;
                    objSchedulerModel.SaleStatusTypeName = item.SaleStatusTypeName;
                    objSchedulerModel.BookingStatusTypeID = item.BookingStatusTypeID;
                    objSchedulerModel.BookingStatusTypeName = item.BookingStatusTypeName;

                    //objSchedulerModel.BookingID = item.BookingID;
                    objSchedulerModel.ServiceID = item.ServiceID;
                    objSchedulerModel.ServicePackageID = item.ServicePackageID;
                    objSchedulerModel.CleaningTimeInMinute = item.CleaningTimeInMinute;
                    objSchedulerModel.Price = item.Price;
                    objSchedulerModel.text = item.text;
                    objSchedulerModel.description = item.description;
                    objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                    objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                    let timeDuration = this._dateTimeService.getTimeDifferenceFromTimeString(objSchedulerModel.startDate.split('T')[1], objSchedulerModel.endDate.split('T')[1]);
                    objSchedulerModel.Duration = timeDuration > 60 ? this._dateTimeService.convertNumberToHoursMinutes(timeDuration) : timeDuration + " min(s)";
                    //objSchedulerModel.startDate = item.startDate;
                    //objSchedulerModel.endDate = item.endDate;
                    objSchedulerModel.allDay = false;
                    objSchedulerModel.recurrenceRule = "";
                    objSchedulerModel.StaffID = item.AssignedToStaffID;
                    objSchedulerModel.StaffFullName = item.AssignedToStaffName;
                    objSchedulerModel.FacilityName = item.FacilityName;
                    objSchedulerModel.FacilityID = item.FacilityID;
                    objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
                    objSchedulerModel.CustomerID = item.CustomerID;
                    objSchedulerModel.CustomerName = item.CustomerName;
                    objSchedulerModel.CustomerEmail = item.Email;
                    objSchedulerModel.CustomerMobile = item.Mobile;
                    objSchedulerModel.CreatedByName = item.CreatedByName;
                    objSchedulerModel.CreatedOn = item.CreatedOn;
                    objSchedulerModel.IsServiceReschedule = item.IsServiceReschedule;

                    /** memebship benefit */
                    objSchedulerModel.DiscountedPrice = item.DiscountedPrice;
                    objSchedulerModel.IsMembershipBenefit = item.IsMembershipBenefit;

                    /** partial payment */
                    objSchedulerModel.IsSale = item.IsSale;
                    
                    this.schedulerDataSourceList.push(objSchedulerModel);
                });
            }
            if (data.StaffBlockTimeList) {
                data.StaffBlockTimeList.forEach(item => {
                    let objSchedulerModel = new SchedulerDataSource();
                    objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.BlockTime;
                    objSchedulerModel.ActivityTypeID = enmSchedulerActvityType.blockTime;
                    objSchedulerModel.id = item.id;
                    objSchedulerModel.text = "Block Time";
                    objSchedulerModel.description = item.description;
                    objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                    objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                    objSchedulerModel.StaffID = item.AssignedToStaffID;
                    objSchedulerModel.StaffFullName = item.AssignedToStaffName;
                    objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
                    objSchedulerModel.recurrenceRule = item.recurrenceRule;
                    objSchedulerModel.recurrenceException = item.recurrenceException;
                    objSchedulerModel.CreatedByName = item.CreatedByName;
                    // if (item.recurrenceException) {
                    //     let _gethours = new Date(item.startDate).getHours().toString(), _getminutes = new Date(item.startDate).getMinutes().toString();
                    //     if (_gethours.length === 1) _gethours = "0" + _gethours;
                    //     if (_getminutes.length === 1) _getminutes = _getminutes + "0";
                    //     objSchedulerModel.recurrenceException = item.recurrenceException + "T" + _gethours + _getminutes + "00";
                    // }
                    this.schedulerDataSourceList.push(objSchedulerModel);
                });
            }
            if (data.ActivityList) {
                data.ActivityList.forEach(item => {
                    switch (item.ActivityTypeID) {
                        case this.activityType.Call:
                            this.mapCallList(item);
                            break;
                        case this.activityType.Appointment:
                            this.mapAppointmentList(item);
                            break;
                        case this.activityType.Task:
                            this.mapTaskList(item);
                            break;
                    }
                });
            }
            
            if (data.StaffShiftIntervalList && currentView !== this.schedulerStaticStrings.GetSchedulerStaticString.Month) {
                data.StaffShiftIntervalList.forEach(item => {
                    //remove this condition after backend implementation added by fahad
                    if(item.startDate.toString().includes('00:00:00') && item.endDate.toString().includes('00:00:00'))
                    {
                        
                    }else{
                        let objSchedulerModel = new SchedulerDataSource();
                        objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.ShiftInterval;
                        objSchedulerModel.text = item.text;
                        objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                        objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                        objSchedulerModel.StaffID = item.id;
                        objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
                        objSchedulerModel["disabled"] = true;   // For drag/drop/resize editing = false
                        this.schedulerDataSourceList.push(objSchedulerModel);
                    }
                });
            }
        }
        return this.schedulerDataSourceList;
    }

    mapCallList(item) {

        let objSchedulerModel = new SchedulerDataSource();
        objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.Call;
        objSchedulerModel.id = item.id;
        objSchedulerModel.text = item.text;
        objSchedulerModel.description = item.description;
        objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
        objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
        objSchedulerModel.allDay = item.allDay;
        objSchedulerModel.recurrenceRule = item.recurrenceRule;
        objSchedulerModel.StaffID = item.AssignedToStaffID;
        objSchedulerModel.StaffFullName = item.AssignedToStaffName;
        objSchedulerModel.ActivityTypeID = item.ActivityTypeID;
        objSchedulerModel.CustomerTypeID = item.CustomerTypeID;
        objSchedulerModel.CustomerID = item.CustomerID;
        objSchedulerModel.CustomerName = item.CustomerName;
        objSchedulerModel.CustomerEmail = item.Email;
        objSchedulerModel.CustomerMobile = item.Mobile;
        objSchedulerModel.MarkAsDone = item.MarkedAsDone;
        objSchedulerModel.CreatedByName = item.CreatedByName;
        objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
        this.schedulerDataSourceList.push(objSchedulerModel);
    }

    mapAppointmentList(item) {

        let objSchedulerModel = new SchedulerDataSource();
        objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.Appointment;
        objSchedulerModel.id = item.id;
        objSchedulerModel.text = item.text;
        objSchedulerModel.description = item.description;
        objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
        objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
        objSchedulerModel.allDay = item.allDay;
        objSchedulerModel.recurrenceRule = item.recurrenceRule;
        objSchedulerModel.ActivityTypeID = item.ActivityTypeID;
        objSchedulerModel.StaffID = item.AssignedToStaffID;
        objSchedulerModel.StaffFullName = item.AssignedToStaffName;
        objSchedulerModel.CustomerTypeID = item.CustomerTypeID;
        objSchedulerModel.CustomerID = item.CustomerID;
        objSchedulerModel.CustomerName = item.CustomerName;
        objSchedulerModel.CustomerEmail = item.Email;
        objSchedulerModel.CustomerMobile = item.Mobile;
        objSchedulerModel.CreatedByName = item.CreatedByName;
        objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
        objSchedulerModel.MarkAsDone = item.MarkedAsDone;
        this.schedulerDataSourceList.push(objSchedulerModel);
    }

    mapTaskList(item) {

        let objSchedulerModel = new SchedulerDataSource();
        objSchedulerModel.ActivityType = SchedulerOptions.SchedulerActivityType.Task;
        objSchedulerModel.id = item.id;
        objSchedulerModel.text = item.text;
        objSchedulerModel.description = item.description;
        objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
        objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
        objSchedulerModel.allDay = item.allDay;
        objSchedulerModel.recurrenceRule = item.recurrenceRule;
        objSchedulerModel.ActivityTypeID = item.ActivityTypeID;
        objSchedulerModel.StaffID = item.AssignedToStaffID;
        objSchedulerModel.StaffFullName = item.AssignedToStaffName;
        objSchedulerModel.SchedulerActivityTypeColor = item.SchedulerActivityTypeColor;
        objSchedulerModel.MarkAsDone = item.MarkedAsDone;
        objSchedulerModel.CreatedByName = item.CreatedByName;
        objSchedulerModel.PriorityTypeName = item.PriorityTypeName;
        this.schedulerDataSourceList.push(objSchedulerModel);
    }
}



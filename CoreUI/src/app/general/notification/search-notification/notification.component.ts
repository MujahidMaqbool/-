import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { ServiceNotificationDetailComponent } from '../service-notification/service.notification.details.component';
import { StaffNotificationApi } from '@app/helper/config/app.webapi';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ApiResponse } from '@app/models/common.model';
import { StaffNotificationSearch } from '@app/models/Notification.model';
import { DateTimeService } from '@app/services/date.time.service';
import { Configurations, StaffNotificationsStatus } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { ENU_NotificationTriggerCategory, ENU_EventCategoryType, ENU_DateFormatName, CustomerType, ENU_NotificationTrigger } from '@app/helper/config/app.enums';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { Router } from '@angular/router';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Home, ENU_Permission_Individual, ENU_Permission_Staff, ENU_Permission_ClientAndMember, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';
import { ViewNotificationComponent } from '../view-notification/view.notification.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { AttendeeComponent } from '@app/attendee/save-search/attendee.component';



@Component({
    selector: 'search-notification',
    templateUrl: './notification.component.html'
})

export class NotificationComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('notificationDateRef') NotificationDateRef: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;


    //Models

    staffNotificationSearch: StaffNotificationSearch = new StaffNotificationSearch();
    staffNotificationSearchFilterParams = new StaffNotificationSearch();
    notificationStatus: any = StaffNotificationsStatus.StaffNotification;
    enumEventCategory = ENU_EventCategoryType;

    staffNotificationTempVM: any = {
        IsMarkAsReadForMe: false,
        StaffNotificationIDs: "",
        Index: 0
    };

    staffNotificationIDsVM: any = {
        IsMarkAsReadForMe: false,
        StaffNotificationIDs: ""
    };

    isNotificationButtonForEveryOne: boolean = false;
    dateFormat: string = ""; //Configurations.DateFormat;
    isDataExists: boolean = false;
    isSelectAll: boolean = false;
    isSearchByPageIndex: boolean = false;
    // totalRecords: number = 0;

    branchCurrentDate: Date;

    isClassAttendanceAllowed: boolean;
    isBusinussFlowAllowed: boolean;
    isMemberPaymentAllowed: boolean;
    isStaffAttendanceAllowed: boolean;
    isStaffActivitiesViewAllowed: boolean;
    isMemberActivitiesViewAllowed: boolean;
    isClientActivitiesViewAllowed: boolean;
    isLeadActivitiesViewAllowed: boolean;
    markAsReadIndicator: boolean;

    //Filter dropDown lists
    AudienceTypesList: any = [];
    CommunicationTypeList: any = [];
    EventCategoryTypesList: any = [] = [];
    EventTypeList: any = [];
    eventTypeList: any;
    eventTypeListForSearch: any = [];

    //Grid Lists
    viewNotificationList: any = [];
    isReadForMeList: any = [];


    messages = Messages;

    constructor(
        private _dateTimeService: DateTimeService,
        private _serviceNotificationDialogue: MatDialogService,
        private _httpService: HttpService,
        private _messagesService: MessageService,
        public _router: Router,
        private _dialog: MatDialogService,
        private _authService: AuthService,
        private _dataSharingService: DataSharingService
    ) { super(); }

    ngOnInit() {
        this.setPermissions();
        this.getBranchDatePattern();
    }

    markAsReadHandling() {
        this.markAsReadIndicator = this.viewNotificationList.some(x => x.MarkAsRead == null);
    }

    setPermissions() {
        this.isNotificationButtonForEveryOne = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.NotificationForEveryOne);
        this.isClassAttendanceAllowed = this.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.ClassAttendance);
        this.isBusinussFlowAllowed = this.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BusinessFlow_View);
        this.isMemberPaymentAllowed = this.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Payments_View);
        this.isStaffAttendanceAllowed = this.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Attendance_View);
        this.isStaffActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Activity_View);
        this.isMemberActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
        this.isClientActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
        this.isLeadActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_View);
    }

    hasPagePermission(moduleId: number, pageId: number) {
        return this._authService.hasPagePermission(moduleId, pageId);
    }

    onViewServiceNotificationDetail(notiobj: any) {

        switch (notiobj.EventCategoryTypeID) {
            case ENU_NotificationTriggerCategory.Class:
                if (this.isClassAttendanceAllowed) {
                    this.openClassAttendeeForm(notiobj.ItemID, notiobj.ClassDate);
                } else {
                    this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                }
                break;
            case ENU_NotificationTriggerCategory.Service:
                this._serviceNotificationDialogue.open(ServiceNotificationDetailComponent, {
                    disableClose: true,
                    data: {
                        ServiceID: notiobj.StaffNotificationID
                    }
                });
                break;
            case ENU_NotificationTriggerCategory.Lead:
                // if (this.isBusinussFlowAllowed) {
                this._router.navigate(['/lead/details', notiobj.CustomerID, 'lead-membership']);
                // } else {
                //     this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                // }
                break;
            case ENU_NotificationTriggerCategory.Membership:
                if (this.isMemberPaymentAllowed) {
                    // this._router.navigate(['/member/details', notiobj.CustomerID, 'payments']);
                    if (
                        (notiobj.eventTypeID = ENU_NotificationTrigger.MembershipExpiry)
                        || (notiobj.eventTypeID = ENU_NotificationTrigger.MembershipIsSold)
                    ) {
                        this._router.navigate([
                            "/customer/member/details",
                            notiobj.CustomerID,

                        ]);
                    }
                    else {
                        this._router.navigate([
                            "/customer/member/details",
                            notiobj.CustomerID,
                            "payments",
                        ]);
                    }
                }
                else {
                    this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                }
                break;
            case ENU_NotificationTriggerCategory.Shift:
                if (this.isStaffAttendanceAllowed) {
                    this._router.navigate(['/staff/attendance']);
                } else {
                    this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                }
                break;
            case ENU_NotificationTriggerCategory.CustomerActivity:
                if (this.isLeadActivitiesViewAllowed && CustomerType.Lead == notiobj.ActivityCustomerTypeID) {
                    if (notiobj.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
                        || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || notiobj.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
                        this._router.navigate([
                            "/lead/details",
                            notiobj.ActivityCustomerID,
                            "bookings",
                        ]);
                    } else {
                        this._router.navigate(['/lead/details', notiobj.ActivityCustomerID, 'activities']);
                    }
                } else if (this.isClientActivitiesViewAllowed && CustomerType.Client == notiobj.ActivityCustomerTypeID) {
                    if (notiobj.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
                        || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || notiobj.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
                        this._router.navigate([
                            "/customer/client/details",
                            notiobj.ActivityCustomerID,
                            "bookings",
                        ]);
                    } else {
                        this._router.navigate(['/customer/client/details', notiobj.ActivityCustomerID, 'activities']);
                    }
                } else if (this.isMemberActivitiesViewAllowed && CustomerType.Member == notiobj.ActivityCustomerTypeID) {
                    if (notiobj.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
                        || notiobj.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || notiobj.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
                        this._router.navigate([
                            "/customer/member/details",
                            notiobj.ActivityCustomerID,
                            "bookings",
                        ]);
                    } else {
                        this._router.navigate(['/customer/member/details', notiobj.ActivityCustomerID, 'activities']);
                    }
                }
                else {
                    this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                }
                break;
            case ENU_NotificationTriggerCategory.StaffActivity:
                if (this.isStaffActivitiesViewAllowed) {
                    this._router.navigate([
                        "/staff/details",
                        notiobj.ActivityStaffID,
                        "activities",
                    ]);
                } else {
                    this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
                }
                break;
            default:
                break;
        }
    }

    viewNotificationDialog(notiobj: any) {
        const dialogRef = this._dialog.open(ViewNotificationComponent, {
            disableClose: true,
            data: {
                Title: notiobj.Title,
                Body: notiobj.Body
            }
        });
    }


    openClassAttendeeForm(classId, classDate) {
        classDate = this._dateTimeService.removeZoneFromDateTime(classDate);
        const dialogRef = this._serviceNotificationDialogue.open(AttendeeComponent, {
            disableClose: true,
            data: {
                ClassID: classId,
                ClassDate: new Date(classDate)
            }
        });
        dialogRef.componentInstance.isAttendeeUpdated.subscribe(isUpdated => {
            if (isUpdated) {
            }
        })
    }

    onChangeEventCategoryType(eventCategoryTypeID: number) {
        this.onSetEventTypes(eventCategoryTypeID);

    }

    onSetEventTypes(eventCategoryTypeID: number) {
        if (eventCategoryTypeID > 0) {
            this.eventTypeList = this.eventTypeListForSearch.filter(x => x.EventCategoryTypeID == eventCategoryTypeID);
            this.eventTypeList.splice(0, 0, { EventTypeID: 0, EventTypeName: "All", IsActive: true });
            this.staffNotificationSearch.eventTypeID = 0;
        } else {
            this.eventTypeList = this.eventTypeListForSearch;
            this.staffNotificationSearch.eventTypeID = 0;
        }
    }

    onChangeEventType(eventTypeID: number) {
        var result = this.eventTypeListForSearch.find(x => x.EventTypeID == eventTypeID);
        if (eventTypeID > 0) {
            this.staffNotificationSearch.eventCategoryTypeID = result.EventCategoryTypeID;
            //this.onSetEventTypes(this.staffNotificationSearch.eventCategoryTypeID);
        }

    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.getFundamental();
        this.getNotification();
        this.markAsReadHandling();
    }

    getTriggerCategoryName(eventCategoryTypeID) {
        return eventCategoryTypeID > 0 ? "(" + this.EventCategoryTypesList.find(x => x.EventCategoryTypeID == eventCategoryTypeID).EventCategoryTypeName + ")" : "";
    }

    //get Fundametal
    getFundamental() {
        this._httpService.get(StaffNotificationApi.getStaffNotificationFundamental).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                if (res && res.Result) {
                    res.Result.AudienceType.forEach(element => {
                        if (element.AudienceTypeID == 2) {
                            element.AudienceTypeName = "My Notifications";
                        }
                        if (element.AudienceTypeID == 3)
                            element.AudienceTypeName = "Group Notifications";
                        this.AudienceTypesList.push(element);
                    });
                    this.AudienceTypesList = res.Result.AudienceType;
                    this.CommunicationTypeList = res.Result.CommunicationType;
                    this.EventCategoryTypesList = res.Result.EventCategoryType;
                    this.eventTypeList = res.Result.EventType;
                    this.eventTypeListForSearch = res.Result.EventType;
                    this.setDefaultDrowdown();
                }
            }
            else {
                this._messagesService.showErrorMessage(res.MessageText);
            }
        });
        this.setDefaultValue();
    }

    setDefaultDrowdown() {
        this.EventCategoryTypesList.splice(0, 0, { EventCategoryTypeID: 0, EventCategoryTypeName: "All", IsActive: true });
        this.eventTypeList.splice(0, 0, { EventCategoryTypeID: 0, EventTypeID: 0, EventTypeName: "All", IsActive: true });
    }

    resetNotificationFilters() {
        this.NotificationDateRef.resetDateFilter();
        this.setDefaultValue();
        this.appPagination.resetPagination();
        this.getNotification();
        this.onSetEventTypes(this.staffNotificationSearch.eventCategoryTypeID);
    }

    //set Default dropdown and date value
    setDefaultValue() {
        this.staffNotificationSearchFilterParams = new StaffNotificationSearch();
        this.staffNotificationSearch.eventCategoryTypeID = 0;
        this.staffNotificationSearch.eventTypeID = 0;
        this.staffNotificationSearch.contactTypeID = null;
        this.staffNotificationSearch.Status = null;
        this.staffNotificationSearch.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.staffNotificationSearch.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
    }

    // changePageSize(e: any) {
    //     if (e.pageIndex >= this.pageNumber) { this.pageNumber = ++e.pageIndex; }

    //     else {
    //         if (e.pageIndex >= 1) {
    //             this.pageNumber = --this.pageNumber;
    //         }
    //         else { this.pageNumber = 1 }
    //     }
    //     this.pageSize = e.pageSize;
    //     this.isSearchByPageIndex = true;
    //     this.getNotification();
    // }

    onMarkASReadForEveryone() {
        let _strObj = "";
        this.staffNotificationIDsVM = {};
        this.isReadForMeList.forEach(element => {
            if (element.StaffNotificationIDs != "") {
                _strObj += element.StaffNotificationIDs + ",";
            }
        });
        this.staffNotificationIDsVM.IsMarkAsReadForMe = true;
        this.staffNotificationIDsVM.StaffNotificationIDs = _strObj.substring(0, _strObj.length - 1);
        this.markAsReadForMeoRForEveryOne();
    }

    onMarkASReadForMe() {
        let _strObj = "";
        this.staffNotificationIDsVM = {};
        this.isReadForMeList.forEach(element => {
            if (element.StaffNotificationIDs != "") {
                _strObj += element.StaffNotificationIDs + ",";
            }
        });
        this.staffNotificationIDsVM.IsMarkAsReadForMe = false;
        this.staffNotificationIDsVM.StaffNotificationIDs = _strObj.substring(0, _strObj.length - 1);
        this.markAsReadForMeoRForEveryOne();
    }

    reciviedDateTo($event) {
        this.staffNotificationSearch.DateFrom = $event.DateFrom;
        this.staffNotificationSearch.DateTo = $event.DateTo;
    }

    MarkAsRead(e: any, staffNotificationId: any, indx: number) {
        this.staffNotificationTempVM = {
            IsMarkAsReadForMe: false,
            StaffNotificationIDs: staffNotificationId,
            Index: indx
        };
        this.isReadForMeList.push(this.staffNotificationTempVM);
        // if (!e.target.checked) {
        //     this.isReadForMeList.splice(this.isReadForMeList.indexOf(x => x.index == indx), 1);
        // } else {
        // }
        let isSelected = this.viewNotificationList.filter(x => x.IsMarkAsReadForMe == false);
        if (isSelected.length > 0) {
            this.isSelectAll = false;
        }
        else {
            this.isSelectAll = true;
        }
    }

    selectAllList(event: any) {
        this.isReadForMeList = [];
        if (event.target.checked) {
            this.viewNotificationList.forEach(element => {
                !element.hasmarked ? element.IsMarkAsReadForMe = true : element.IsMarkAsReadForMe = false;
                if (!element.hasmarked) {
                    this.pushStaffNotificationIdToSelectAllNotification(element.StaffNotificationID, element.IsMarkAsReadForMe);
                }
            });
        }
        else {
            this.viewNotificationList.forEach(element => {
                element.IsMarkAsReadForMe = false;
            });
        }
    }

    pushStaffNotificationIdToSelectAllNotification(staffNotiId, isMarks) {
        this.staffNotificationTempVM = {
            IsMarkAsReadForMe: isMarks,
            StaffNotificationIDs: staffNotiId,
            Index: 0
        };
        this.isReadForMeList.push(this.staffNotificationTempVM);
    }

    searchNotification() {
        this.staffNotificationSearchFilterParams = new StaffNotificationSearch();
        this.staffNotificationSearchFilterParams.eventCategoryTypeID = this.staffNotificationSearch.eventCategoryTypeID > 0 ? this.staffNotificationSearch.eventCategoryTypeID : null;
        this.staffNotificationSearchFilterParams.eventTypeID = this.staffNotificationSearch.eventTypeID > 0 ? this.staffNotificationSearch.eventTypeID : null;
        this.staffNotificationSearchFilterParams.contactTypeID = this.staffNotificationSearch.contactTypeID != null ? this.staffNotificationSearch.contactTypeID : null;
        this.staffNotificationSearchFilterParams.Status = this.staffNotificationSearch.Status != null ? this.staffNotificationSearch.Status : null;
        // this.staffNotificationSearchFilterParams.DateFrom = this.staffNotificationSearch.DateFrom;
        // this.staffNotificationSearchFilterParams.DateTo = this.staffNotificationSearch.DateTo;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getNotification();
    }

    // Get Notifications
    getNotification() {
        this.staffNotificationSearchFilterParams.PageNumber = this.appPagination.pageNumber;
        this.staffNotificationSearchFilterParams.PageSize = this.appPagination.pageSize == undefined ? this.appPagination.pageSize : this.appPagination.pageSize,
            this.staffNotificationSearchFilterParams.DateFrom = this.staffNotificationSearch.DateFrom;
        this.staffNotificationSearchFilterParams.DateTo = this.staffNotificationSearch.DateTo;

        this._httpService.get(StaffNotificationApi.getStaffNotification, this.staffNotificationSearchFilterParams).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.isDataExists = res.Result != null ? true : false;
                if (res && res.Result) {
                    this.viewNotificationList = res.Result;
                    this.viewNotificationList.forEach(element => {
                        element.IsMarkAsReadForMe = false;
                        element.hasmarked = element.Status == 'Unread' ? false : true;
                    });

                } else {
                    this.viewNotificationList = [];
                }
                this.appPagination.totalRecords = res.TotalRecord;
                this.isSelectAll = false;
                this.isSearchByPageIndex = false;
                this.markAsReadHandling();
            }
            else {
                this._messagesService.showErrorMessage(res.MessageText);
            }
        });
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getNotification();
    }

    /*Generic method for mark As Read for me , for every one*/
    markAsReadForMeoRForEveryOne() {
        this._httpService.save(StaffNotificationApi.updateStaffNotification, this.staffNotificationIDsVM).subscribe((res: ApiResponse) => {
            this.getNotification();
            this.staffNotificationIDsVM.IsMarkAsReadForMe = false;
            this.staffNotificationIDsVM.StaffNotificationIDs = "";
            this.staffNotificationTempVM.IsMarkAsReadForMe = false;
            this.staffNotificationTempVM.StaffNotificationIDs = "";
        });
    }
}

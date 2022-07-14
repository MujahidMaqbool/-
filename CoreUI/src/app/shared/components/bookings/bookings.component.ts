import { MatDialogService } from './../generics/mat.dialog.service';
import { FillFormComponent } from '@app/shared/components/fill-form/fill.form.component';
/********************** Angular References *********************************/
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
/********************** Service & Models *********************/
/* Services */
import { DataSharingService } from '@services/data.sharing.service';
import { HttpService } from '@services/app.http.service';
import { CommonService } from '@app/services/common.service';
import { MessageService } from '@app/services/app.message.service';
import { DateTimeService } from '@app/services/date.time.service';

/* Models */
import { ClassBooking, SearchBooking } from '@models/bookings.model';
import { AllPerson } from '@app/models/common.model';

/********************** Component *********************************/
//import { InvoiceDetailComponent } from '../invoice.detail/invoice.detail.component';

/********************** Common *********************************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { BookingApi } from '@app/helper/config/app.webapi';
import { ENU_Package, ENU_DateFormatName } from '@app/helper/config/app.enums';
import { ActivatedRoute } from '@angular/router';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { ActivityPersonInfo } from '@app/models/activity.model';

@Component({
    selector: 'booked',
    templateUrl: './bookings.component.html',
})

export class BookingsComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('bookingRef') bookingRef: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    searchPerson: FormControl = new FormControl();

    /* Local */
    // dateFrom: Date;
    // dateTo: Date;
    isDataExists: boolean;
    showServiceCleaningTime: boolean = false;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string = this.sortOrder_DESC;

    currencyFormat: string;
    clearCustomerInput: string = "";
    searchByPageIndex: boolean = false;

    /* Messages */
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;

    hasServiceInPackage: boolean;
    hasClassesInPackage: boolean;
    hasClassesAndServices: boolean;

    isPOSBooking: boolean = false;
    isPOSBookingAction :boolean ;
    personName: string = "";
    person: string;
    customerID: string;

    /* Collection And Models */
    searchBooked: SearchBooking;
    searchBookedParams: SearchBooking = new SearchBooking();
    bookedClasses: ClassBooking[] = [];
    branchList: any[] = [];
    allPerson: AllPerson[];
    personInfos: ActivityPersonInfo;

    /* Dialog Reference */
    deleteDialogRef: any;
    viewDialogRef: any;
    memberIdSubscription: ISubscription;
    posSubscription: ISubscription;
    packageIdSubscription: ISubscription;
    activityPersonInfoSubscription: ISubscription;

    /* Configurations */
    timeFormat = Configurations.TimeFormat;
    dateFormat: string = "";//Configurations.DateFormat;
    itemType = Configurations.ItemType;
    package = ENU_Package;
    bookingStatusList = Configurations.BookingStatusList;

    dateToPlaceHolder: string = 'Booking Date';
    dateFromPlaceHolder: string = 'Booking Date';

    longDateFormat: string = "";
    // #endregion

    constructor(
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _route: ActivatedRoute,
        private _openDialogue: MatDialogService,
    ) {
        super();
        this.searchBooked = new SearchBooking();
    }

    ngOnInit() {
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchClient(searchText, 0)
                            .subscribe(
                                response => {
                                    if (response.Result != null && response.Result.length) {
                                        this.allPerson = response.Result;
                                        this.allPerson.forEach(person => {
                                            person.FullName = person.FirstName + " " + person.LastName;
                                        });
                                    }
                                    else {
                                        this.allPerson = [];
                                    }
                                });
                    }
                }
                else {
                    this.allPerson = [];
                }
            });
        this.activityPersonInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            this.personInfos = new ActivityPersonInfo();
            this.personInfos = personInfo;
        })

        
        this.checkPackagePermissions();
        this.removeItem();
    }

    ngAfterViewInit() {
        this.bookingRef.setEmptyDateFilter();
        this.getCurrentBranchDetail();
    }

    ngOnDestroy() {
        if (this.memberIdSubscription != undefined) {
            this.memberIdSubscription.unsubscribe();
        }
        if (this.posSubscription != undefined) {
            this.posSubscription.unsubscribe();
        }
        if (this.activityPersonInfoSubscription != undefined) {
            this.activityPersonInfoSubscription.unsubscribe();
        }
        if (this.packageIdSubscription != undefined) {
            this.packageIdSubscription.unsubscribe();
        }

    }
   
    // #region Events

    reciviedDateTo($event) {
        this.searchBooked.DateFrom = $event.DateFrom;
        this.searchBooked.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.searchBooked.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.searchBooked.DateTo = date;
    }

  

    onReset() {
        this.resetParameters();
        this.getBookedServices();

    }

    // #endregion Events

    // #region Methods

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getBookingInfo();
    }

    // getCustomerID() {
    //     this.memberIdSubscription = this._dataSharingService.customerID.subscribe(customerID => {
    //         if (customerID > 0) {
    //             this.searchBooked.CustomerID = customerID.toExponential();
    //             this.searchBooked.PersonTypeID = CustomerType.Client;
    //         }
    //     });
    // }

    getBookingInfo() {
        // this.posSubscription = this._dataSharingService.posBooking.subscribe(posBooking => {
        //     this.isPOSBooking = posBooking.POSBooking;
        //     this.searchBooked.CustomerID = posBooking.CustomerID;
        //     this.resetParameters();
        //     this.getBookedServices();
        // });

        this.customerID = this._route.parent.snapshot.paramMap.get('ClientID');
        if (this.customerID == null || this.customerID == undefined) {
            this.customerID = this._route.parent.snapshot.paramMap.get('LeadID');
        }
        if (this.customerID == null || this.customerID == undefined) {
            this.customerID = this._route.parent.snapshot.paramMap.get('MemberID');
        }

        if (this.customerID == null || this.customerID == undefined) {
            this.searchBooked.CustomerID = 0;
            this.isPOSBooking = true;
        }
        else {
            this.isPOSBooking = false;
            this.searchBooked.CustomerID = parseInt(this.customerID);
        }
        this.resetParameters();
        this.getBookedServices();

    }

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
    }

    setPackagePermissions(packageId: number) {
        this.hasClassesAndServices = false;
        this.hasClassesInPackage = false;
        this.hasServiceInPackage = false;

        switch (packageId) {
            case this.package.WellnessBasic:
                break;
            case this.package.WellnessMedium:
                break;
            case this.package.WellnessTop:
                this.hasClassesAndServices = false;
                this.hasClassesInPackage = false;
                this.hasServiceInPackage = true;
                this.isPOSBookingAction = true ;
                break;
            case this.package.FitnessBasic:
                this.isPOSBookingAction = true ;
                break;
            case this.package.FitnessMedium:
                this.hasClassesAndServices = false;
                this.hasClassesInPackage = true;
                this.hasServiceInPackage = false;
                this.isPOSBookingAction = true ;
                break;
            case this.package.Full:
                this.isPOSBookingAction = true ;
                this.hasClassesAndServices = true;
                this.hasClassesInPackage = true;
                this.hasServiceInPackage = true;
                break;
        }
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getBookedServices();
    }

    onSearchBooking() {
        this.searchBookedParams.CustomerID = this.searchBooked.CustomerID;
        this.searchBookedParams.DateFrom = this.searchBooked.DateFrom ? this.searchBooked.DateFrom : "";
        this.searchBookedParams.DateTo = this.searchBooked.DateTo ? this.searchBooked.DateTo : "";
        this.searchBookedParams.ItemTypeID = this.searchBooked.ItemTypeID;
        this.searchBookedParams.BookingStatusTypeID = this.searchBooked.BookingStatusTypeID;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getBookedServices();
    }

    getBookedServices() {
        // if (!this.searchByPageIndex) {
        //     this.pageNumber = 1;
        //     this.paginator.pageIndex = 0;
        // }

        // let params = {
            this.searchBookedParams.CustomerID = this.isPOSBooking ? this.searchBookedParams.CustomerID : this.searchBooked.CustomerID,
            this.searchBookedParams.DateFrom = this.searchBookedParams.DateFrom ? this.searchBookedParams.DateFrom : "",
            this.searchBookedParams.DateTo =  this.searchBookedParams.DateTo ? this.searchBookedParams.DateTo : "",
            this.searchBookedParams.ItemTypeID = this.isPOSBooking ? this.searchBooked.ItemTypeID : this.searchBookedParams.ItemTypeID,
            this.searchBookedParams.PageNumber = this.appPagination.pageNumber,
            this.searchBookedParams.PageSize = this.appPagination.pageSize,
        // }

        this._httpService.get(BookingApi.getBookedServices, this.searchBookedParams)
            .subscribe(data => {
                if(data && data.MessageCode > 0){
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.bookedClasses = data.Result;
                    this.setTimeFormat();
                    if (data.Result.length > 0) {
                        this.appPagination.totalRecords = data.TotalRecord;
                    }
                    this.searchByPageIndex = false;
                }
                else {
                    this.appPagination.totalRecords = 0;
                    this.bookedClasses = null;
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Bookings"));
                }
            );
    }

    setTimeFormat() {
        this.bookedClasses.forEach(element => {
            element.StartTime = this._dateTimeService.formatTimeString(element.StartTime, this.timeFormat);
            element.EndTime = this._dateTimeService.formatTimeString(element.EndTime, this.timeFormat);

        });
    }

    removeItem() {
        this.itemType.splice(3, 1)
    }

    getSelectedClient(person: AllPerson) {
        this.searchBooked.CustomerID = person.CustomerID;
    }

    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    resetParameters() {
        // this.dateFrom = null;
        // this.dateTo = null;
        // this.searchBooked.DateTo = "";
        // this.searchBooked.DateFrom = "";
        this.searchBookedParams = new SearchBooking();
        this.searchBooked.ItemTypeID = 0;
        this.searchBooked.BookingStatusTypeID = 0;
        this.clearCustomerInput = "";
        this.appPagination.resetPagination();
        this.bookingRef.setEmptyDateFilter();
        this.sortOrder = this.searchBookedParams.SortOrder;
        this.setItemTypeID();
    }

    setItemTypeID() {
        if (this.isPOSBooking) {
            // Search for only services
            this.searchBooked.ItemTypeID = this.itemType.find(i => i.ItemTypeName === "Service").ItemTypeID;
            this.searchBooked.CustomerID = 0;
        }
        else {
            if (!this.hasClassesAndServices) {
                if (this.hasClassesInPackage) {
                    this.searchBooked.ItemTypeID = this.itemType.find(i => i.ItemTypeName === "Class").ItemTypeID;
                }
                else if (this.hasServiceInPackage) {
                    this.searchBooked.ItemTypeID = this.itemType.find(i => i.ItemTypeName === "Service").ItemTypeID;
                }
            }
        }
    }

    openSubmitCustomerFormDialog(classBooking: ClassBooking) {
        const dialogRef = this._openDialogue.open(FillFormComponent, {
            disableClose: true,
            data: {
                saleDetailOrBookingID: classBooking.SaleDetailID > 0 ? classBooking.SaleDetailID : classBooking.CustomerBookingID,
                customerID: classBooking.CustomerID,
                isSale: classBooking.SaleDetailID > 0 ? true : false,
                dialogtype: 'SchedularService'
            }
        });

        dialogRef.componentInstance.onFormSubmittion.subscribe((isSubmitted: boolean) => {
            if (isSubmitted) {
               this.getBookedServices();
            }
        })

    }
    changeSorting(sortIndex: number) {
        this.searchBookedParams.SortIndex = sortIndex;
        if (sortIndex == 1) {
          if (this.sortOrder == this.sortOrder_ASC) {
            this.sortOrder = this.sortOrder_DESC;
            this.searchBookedParams.SortOrder = this.sortOrder;
            this.getBookedServices();
          } else {
            this.sortOrder = this.sortOrder_ASC;
            this.searchBookedParams.SortOrder = this.sortOrder;
            this.getBookedServices();
          }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            }
          }
          if (sortIndex == 3) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            }
          }
          if (sortIndex == 4) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.searchBookedParams.SortOrder = this.sortOrder;
              this.getBookedServices();
            }
          }
      }

    // #endregion
}

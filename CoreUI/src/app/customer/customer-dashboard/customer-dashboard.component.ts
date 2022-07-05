import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike } from "rxjs";
/************************* Services & Models ***********************************/
/* Services  */
import { DataSharingService } from "@app/services/data.sharing.service";
import { DateTimeService } from "@app/services/date.time.service";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
/* Models */
import { ApiResponse, DD_Branch } from "@app/models/common.model";
/************************* Common ***********************************/
import { ClientApi, HomeApi, MemberApi, RewardProgramApi } from "@app/helper/config/app.webapi";
import { Configurations } from "@app/helper/config/app.config";
import { Messages } from "@app/helper/config/app.messages";
import { EnumSaleSourceType, MembershipStatus_Enum, ENU_Package, CustomerType, ENU_DateFormatName, CustomerApplication_Enum, CustomerMobileApplication_Enum, ENU_MainDashboard_ClubVisitGraphType, EnumNetSaleSourceType } from "@app/helper/config/app.enums";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { MemberDashboardSearchParam, MemberSnapshot, MemberBooking, MemberServices, MemberProducts, MemberByStatus, MemberClubVisits, MemberPayment, MemberServiceAndAttendance, MemberTotalRevenue, customerBirthdaySummary, MembershipsExpiry, TotalSaleCount } from "../member/models/member.dashboard.model";
import { INewvsReturningClient, ISalesBreakDownServices, ISalesbyChannel, iTopEmployeeClasses, ITopEmployeeServices, ITopServices, TopClasses, TopMemberships, TopProducts } from "../client/models/client.dashboard.model";
import { environment } from "@env/environment";
import { AppUtilities } from "@app/helper/aap.utilities";
import { ImagesPlaceholder } from "@app/helper/config/app.placeholder";
import { CustomerApplication } from "../models/customers.models";
import { CurrencyPipe } from "@angular/common";
import { RewardProgramSummaryViewModel } from "@app/models/home.dashboard.model";

/*
    Component Variables are not accessible in Dashboard widget events
    Declared an Javascript variable to be used in events while changing label
*/
var currencyCode: any;

@Component({
    selector: 'customer-dashboard',
    templateUrl: './customer-dashboard.component.html'
})
export class CustomerDashboardComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;
    @ViewChild('vcfromToDateComoRef') vcfromToDateComoRef: DateToDateFromComponent;
    allowedPages = {
        ServiceDashboard: true,
        ProductDashboard: false,
        MembershipStatusDashboard: false,
        ServiceBookedAndAttendance: true,
        MemberSnapshot: false,
        clubVisits: false,
        MembershipPayments: false,
        MembershipDashboard: false,
        MembershipByExpiryDate: false,
        ClassesDashboard: false,
        RewardProgramSummary: false
    };

    DataChangeDashboard = {
        VisitInClub: 1,
        MembersActivities: 2,
        Attendance: 3,
        MembersbyStatus: 4,
        ServicesBookedandCompleted: 5,
        Payment: 6,
        SalesBreakdown: 7,
        TopServices: 8,
        NewvsReturningClient: 9,
        CustomerBirthday: 10
    };


    // ************* Local ****************
    ItemType = Configurations.ItemTypeOnReport;
    customerTypeBirthdayStatus = Configurations.DashboardCustomerBirthday;
    CustomerTypes = Configurations.CustomerTypeList;
    newVsReturningClientType = Configurations.NewVsReturningType;
    mainDashboard_ClubVisitGraphType = ENU_MainDashboard_ClubVisitGraphType;
    timeFormat = Configurations.TimeFormat;
    memberID: number = 0;
    customizeText: string = '';
    dateFormatForDP: string = 'yyyy-MM-dd';
    isMemberInfoExists: boolean = false;
    isMemberByStatusExists: boolean = false;
    isMemberSnapshotExists: boolean = false;
    ismemberBookingExists: boolean = false;
    ismemberShipBookingExists: boolean = false;
    isTotalRevenueExists: boolean = false;
    ismemberServicesExists: boolean = false;
    ismemberProductsExists: boolean = false;
    ismembersBookingeExists: boolean = false;
    ismembersClubVisitsExists: boolean = false;
    ismembersPaymentExists: boolean = false;
    isMemberServiceAndAttendanceExists: boolean = false;
    isSalesBreakDownDataExists: boolean = false;
    isTopServicesDataExists: boolean = false;
    isTopProductsDataExists: boolean = false;
    isTopEmployeeClassDataExists: boolean = false;
    isTopSalesDataExists: boolean = false;
    isTopClassDataExists: boolean = false;
    isTopRevenueExists: boolean = false;
    iTopMembershipPlansExists: boolean = false;
    isTopEmployeeServicesDataExists: boolean = false;
    isNewvsReturningExists: boolean = false;
    isMembershipExpiryExist: boolean = false;
    isCustomerBirthdaysExist: boolean = false;
    isCustomerApllicationsExist: boolean = false;
    showCustomerTypeStatus: boolean = false;

    maxDate: Date = new Date();
    currentDate: Date = new Date();
    selectedRewardProgramID: number = null;

    imagePath = ImagesPlaceholder.user;
    customerType = CustomerType;
    dateFormatForChart: string = "";//'MMM d, y';
    dateFormat: string = 'yyyy-MM-dd';
    dateFormatforReturingClient: string = ""; //'MMM d y';
    currencyFormat: string;
    packageIdSubscription: SubscriptionLike;
    // ************* Model and Collection ****************
    memberDashboardSearchParam: MemberDashboardSearchParam = new MemberDashboardSearchParam();
    memberSnapshot: MemberSnapshot;
    memberBooking: MemberBooking[] = [];
    memberMemberShipBooking: MemberBooking[] = [];
    MemberTotalRevenue: MemberTotalRevenue[] = []
    memberServices: MemberServices[] = [];
    memberProducts: MemberProducts[] = [];
    memberByStatus: MemberByStatus[] = [];
    customerApplication: CustomerApplication[] = [];
    customerBirthdays: customerBirthdaySummary[] = [];
    memberClubVisits: MemberClubVisits[] = [];
    memberPayment: MemberPayment[] = [];
    memberServiceAndAttendance: MemberServiceAndAttendance[] = [];
    iSalesBreakDownServices: ISalesBreakDownServices[] = [];
    iTopServices: ITopServices[] = [];
    iTopEmployeeServices: ITopEmployeeServices[] = [];
    iTopMembershipPlans: TopMemberships[] = [];
    iTopClasses: TopClasses[] = [];
    iTopProducts: TopProducts[] = [];
    iTopRevenueGeneration: ITopEmployeeServices[] = [];
    iTopEmployeeClasses: iTopEmployeeClasses[] = [];
    iSalesbyChannel: ISalesbyChannel[] = [];
    iNewvsReturningClient: INewvsReturningClient[] = [];
    membershipsExpiry: MembershipsExpiry[] = [];
    rewardProgramSummaryViewModel: RewardProgramSummaryViewModel = new RewardProgramSummaryViewModel();
    branchRewardProgramList: any[] = [];
    forAttendanceDate: any;
    types: string[] = ["area", "stackedarea", "fullstackedarea"];
    package = ENU_Package;
    PaymentStatusType: any = Configurations.PaymentStatusType;
    serverImageAddress = environment.imageUrl;
    currencySymbol: string;
    totalSaleCount: TotalSaleCount = new TotalSaleCount();
    /***********Messages*********/
    messages = Messages;

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        public _currencyFormatter: CurrencyPipe,
    ) {
        super();
    }

    ngOnInit() {
        this.memberDashboardSearchParam.paymentStatusTypeID = this.PaymentStatusType[0].value;
        this.getCurrentBranchDetail();

    }

    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }


    onMemberActivityDateChange() {
        this.getMemberSale();
    }

    onMemberStatusDateChange() {
        this.getmeberByStatus();
    }
    onMemberServiceandAttendanceDateChange() {
        this.getMemberServicesandAttendance();
    }

    onMemberClubVisitsDateChange() {
        this.getMemberClubVisits();
    }

    onMemberPaymentDateChange() {
        this.getAllMemberPayment();
    }

    onSalesBraekDownDateChange() {
        this.getSalesBreakDownByDate();
    }
    onTopServicesDateChange() {
        this.getTopServicesByDate();
    }

    onNewvsReturningDateChange() {
        this.getNewvsReturningClient();
    }
    onTopEmployessServicesDateChange() {
        this.getTopEmployeeServicesByDate();
    }

    onTopSalesByChanelDateChange() {
        this.getTopSalesChannelByDate();
    }
    
    reciviedDateToForVisitInClub($event) {
        let dateTo = new Date($event.DateTo);
        let dateFrom = new Date($event.DateFrom);
        var Time = dateTo.getTime() - dateFrom.getTime();
        var daysDifference = Time / (1000 * 3600 * 24); //Diference in Days

        if (daysDifference > 30) {
            this.vcfromToDateComoRef.onFromDateChangeForParent($event.DateFrom);
            $event.DateTo = dateFrom.setMonth(dateFrom.getMonth() + 1);
            $event.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormatForDP)
            this.vcfromToDateComoRef.onToDateChangeForParent($event.DateTo);

            this.memberDashboardSearchParam.DateFrom = $event.DateFrom;
            this.memberDashboardSearchParam.DateTo = $event.DateTo;
        } else {
            this.memberDashboardSearchParam.DateFrom = $event.DateFrom;
            this.memberDashboardSearchParam.DateTo = $event.DateTo;
        }
        if (new Date($event.DateFrom) < this.vcfromToDateComoRef.branchDate) {
            this.vcfromToDateComoRef.toMaxDate = new Date($event.DateFrom);
            this.vcfromToDateComoRef.toMaxDate.setMonth(this.vcfromToDateComoRef.toMaxDate.getMonth() + 1);
        }
        this.onMemberClubVisitsDateChange();
    }
    onDateChange($event, dashboardID: number) {
        if ($event != undefined) {
            this.memberDashboardSearchParam.DateFrom = $event.DateFrom;
            this.memberDashboardSearchParam.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.VisitInClub:
                this.onMemberClubVisitsDateChange();
                break;
            case this.DataChangeDashboard.MembersActivities:
                this.onMemberActivityDateChange();
                break;
            case this.DataChangeDashboard.CustomerBirthday:
                this.getCustomerBirthdays();
                break;
            case this.DataChangeDashboard.MembersbyStatus:
                this.onMemberStatusDateChange();
                break;
            case this.DataChangeDashboard.ServicesBookedandCompleted:
                this.onMemberServiceandAttendanceDateChange();
                break;
            case this.DataChangeDashboard.Payment:
                this.onMemberPaymentDateChange();
                break;
            case this.DataChangeDashboard.SalesBreakdown:
                this.onSalesBraekDownDateChange();
                break;

            case this.DataChangeDashboard.TopServices:
                this.getDashboardHighlights();
                break;
            case this.DataChangeDashboard.NewvsReturningClient:
                this.onNewvsReturningDateChange();
                break;

        }
    }

    async getCurrentBranchDetail() {
        this.dateFormatForChart = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforReturingClient);
        this.dateFormatforReturingClient = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforReturingClient);
        let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.memberDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.memberDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.memberDashboardSearchParam.itemTypeID = 0;


        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPermissions(packageId);
                this.getMemberSnapshot();
                this.onMemberActivityDateChange();
                this.onMemberStatusDateChange();
                this.getcustomerApplication();
                this.onMemberClubVisitsDateChange();
                this.onMemberServiceandAttendanceDateChange();
                this.onMemberPaymentDateChange();
                this.onSalesBraekDownDateChange();
                this.onTopEmployessServicesDateChange();
                this.onTopSalesByChanelDateChange();
                this.onNewvsReturningDateChange();
                this.getMembershipExpiry();
                this.getDashboardHighlights();
                this.getCustomerBirthdays();
            }

        });

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.Currency;
            currencyCode = branch.Currency;
            this.currencySymbol = branch.CurrencySymbol;
        }
    }

    getMemberSnapshot() {

        this._httpService.get(MemberApi.getMemberSnapshot)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.memberSnapshot = new MemberSnapshot();

                    this.isMemberSnapshotExists = res.Result != null ? true : false;
                    if (this.isMemberSnapshotExists) {
                        this.memberSnapshot = res.Result[0];
                    }

                    if (this.memberSnapshot.MoreThanFiftyTimes == null) {
                        this.memberSnapshot.MoreThanFiftyTimes = 0;
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }

    getMembershipExpiry() {
        this._httpService.get(ClientApi.getMembershipExpiry)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {

                    this.isMembershipExpiryExist = res.Result != null ? true : false;
                    if (this.isMembershipExpiryExist) {
                        this.membershipsExpiry = res.Result;
                        this.membershipsExpiry.reverse();
                    }
                    else {
                        this.membershipsExpiry = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Contract"));
                }
            );
    }
    getMemberSale() {
        let params = {
            memberId: this.memberID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            CustomerTypeID: this.memberDashboardSearchParam.saleRevenueCustomerTypeID == 0 ? null : this.memberDashboardSearchParam.saleRevenueCustomerTypeID
        }

        this._httpService.get(MemberApi.getMemberSale, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberInfoExists = res.Result != null ? true : false;
                    if (this.isMemberInfoExists) {
                        this.ismemberBookingExists = res.Result.ClassCountList != null && res.Result.ClassCountList.length > 0 ? true : false;
                        this.ismemberShipBookingExists = res.Result.MemberShipCountList != null && res.Result.MemberShipCountList.length > 0 ? true : false;
                        this.ismemberServicesExists = res.Result.ServiceCountList != null && res.Result.ServiceCountList.length > 0 ? true : false;
                        this.ismemberProductsExists = res.Result.ProductCountList != null && res.Result.ProductCountList.length > 0 ? true : false;
                        this.isTotalRevenueExists = res.Result.TotalRevenue != null && res.Result.TotalRevenue.length > 0 ? true : false;
                        if (this.ismemberBookingExists) {
                            this.memberBooking = res.Result.ClassCountList;
                            this.totalSaleCount.TotalClassSale = res.Result.TotalClassSale;
                        } else {
                            this.totalSaleCount.TotalClassSale = 0;
                        }
                        if (this.ismemberServicesExists) {
                            this.memberServices = res.Result.ServiceCountList;
                            this.totalSaleCount.TotalServiceSale = res.Result.TotalServiceSale;
                        } else {
                            this.totalSaleCount.TotalServiceSale = 0;
                        }

                        if (this.ismemberProductsExists) {
                            this.memberProducts = res.Result.ProductCountList;
                            this.totalSaleCount.TotalProductSale = res.Result.TotalProductSale;
                        } else {
                            this.totalSaleCount.TotalProductSale = 0;
                        }

                        if (this.ismemberShipBookingExists) {
                            this.memberMemberShipBooking = res.Result.MemberShipCountList;
                            this.totalSaleCount.TotalMembershipSale = res.Result.TotalMembershipSale;
                        } else {
                            this.totalSaleCount.TotalMembershipSale = 0;
                        }

                        if (this.isTotalRevenueExists) {
                            this.MemberTotalRevenue = res.Result.TotalRevenue;
                            this.totalSaleCount.TotalSale = res.Result.TotalSale;
                        } else {
                            this.totalSaleCount.TotalSale = 0;
                        }

                    }
                    else {
                        this.memberBooking = [];
                        this.memberServices = [];
                        this.memberProducts = [];
                        this.memberMemberShipBooking = [];
                        this.MemberTotalRevenue = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }

    getmeberByStatus() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo

        }

        this._httpService.get(MemberApi.getMemberByStaus, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberByStatusExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isMemberByStatusExists) {
                        this.memberByStatus = res.Result;
                    }
                    else {
                        this.memberByStatus = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }

    getcustomerApplication() {


        this._httpService.get(ClientApi.CustomerApplication)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isCustomerApllicationsExist = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isCustomerApllicationsExist) {
                        this.customerApplication = res.Result;
                    }
                    else {
                        this.customerApplication = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }

    getCustomerBirthdays() {
        let params = {
            isClient: this.memberDashboardSearchParam.isClient,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo

        }

        this._httpService.get(ClientApi.getCustomerBirthdays, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isCustomerBirthdaysExist = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isCustomerBirthdaysExist) {
                        this.customerBirthdays = res.Result;
                        this.setAttendanceSummaryDate();
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }

    getMemberClubVisits() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            customerTypeID: this.memberDashboardSearchParam.ClubVisitsCustomerTypeID
        }

        this._httpService.get(MemberApi.getMemberClubVisits, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.ismembersClubVisitsExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.ismembersClubVisitsExists) {
                        this.memberClubVisits = res.Result;
                        this.setClubVisitsDate();
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }


    getSalesBreakDownByDate() {
        let params = {
            itemTypeID: this.memberDashboardSearchParam.itemTypeID,
            customerTypeID: this.memberDashboardSearchParam.SaleBreakDownCustomerTypeID == 0 ? null : this.memberDashboardSearchParam.SaleBreakDownCustomerTypeID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getSalesBreakDownByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isSalesBreakDownDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isSalesBreakDownDataExists) {
                        this.iSalesBreakDownServices = response.Result;
                        this.iSalesBreakDownServices.forEach(element => {
                            if (element.Class) {
                                element.Class = Number(element.Class);
                            }
                            if (element.Product) {
                                element.Product = Number(element.Product);
                            }
                            if (element.Service) {
                                element.Service = Number(element.Service);
                            }
                            if (element.Membership) {
                                element.Membership = Number(element.Membership);
                            }
                        });

                        const sortable = Object.entries(this.iSalesBreakDownServices)
                            .sort(([, a], [, b]) => Number(a) - Number(b))
                            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

                    }
                    else {
                        this.iSalesBreakDownServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Employee Top Services"));
                });
    }

    getAllMemberPayment() {
        let params = {
            paymentStatusTypeID: this.memberDashboardSearchParam.paymentStatusTypeID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            AppSourceTypeID: this.memberDashboardSearchParam.AppSourceTypeID
        }

        this._httpService.get(MemberApi.getAllMemberPayment, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.ismembersPaymentExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.ismembersPaymentExists) {
                        this.memberPayment = res.Result;
                        this.setPaymenteDate();
                    }
                    else {
                        this.memberPayment = [];
                    }

                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );

    }
    getMemberServicesandAttendance() {
        let params = {

            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            CustomerTypeID: this.memberDashboardSearchParam.ServiceBookedCustomerTypeID
        }

        this._httpService.get(MemberApi.getMemberServicesandAttendance, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberServiceAndAttendanceExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isMemberServiceAndAttendanceExists) {
                        this.memberServiceAndAttendance = res.Result;
                        this.setServiceAndAttendanceDate();
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Customer Info"));
                }
            );
    }
    getDashboardHighlights() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getDashboardHighlights, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopServicesDataExists = response.Result != null && response.Result.TopServices.length > 0 ? true : false;
                    this.isTopClassDataExists = response.Result != null && response.Result.TopClasses.length > 0 ? true : false;
                    this.isTopEmployeeClassDataExists = response.Result != null && response.Result.TopEmployeeClasses.length > 0 ? true : false;
                    this.isTopEmployeeServicesDataExists = response.Result != null && response.Result.TopEmployeeSerices.length > 0 ? true : false;
                    this.isTopProductsDataExists = response.Result != null && response.Result.TopProducts.length > 0 ? true : false;
                    this.isTopRevenueExists = response.Result != null && response.Result.TotalRevenue.length > 0 ? true : false;
                    this.isTopSalesDataExists = response.Result != null && response.Result.PaymentMethods.length > 0 ? true : false;
                    this.iTopMembershipPlansExists = response.Result != null && response.Result.TopMemberships.length > 0 ? true : false;
                    if (this.isTopServicesDataExists) {
                        this.iTopServices = response.Result.TopServices;
                    }
                    else {
                        this.iTopServices = [];
                    }
                    if (this.isTopClassDataExists) {
                        this.iTopClasses = response.Result.TopClasses;
                    }
                    else {
                        this.iTopClasses = [];
                    }
                    if (this.isTopEmployeeClassDataExists) {
                        this.iTopEmployeeClasses = response.Result.TopEmployeeClasses;
                    }
                    else {
                        this.iTopEmployeeClasses = [];
                    }
                    if (this.isTopEmployeeServicesDataExists) {
                        this.iTopEmployeeServices = response.Result.TopEmployeeSerices;
                    }
                    else {
                        this.iTopEmployeeServices = [];
                    }
                    if (this.isTopProductsDataExists) {
                        this.iTopProducts = response.Result.TopProducts;
                    }
                    else {
                        this.iTopProducts = [];
                    }
                    if (this.isTopRevenueExists) {
                        this.iTopRevenueGeneration = response.Result.TotalRevenue;
                    }
                    else {
                        this.iTopRevenueGeneration = [];
                    }
                    if (this.isTopSalesDataExists) {
                        this.iSalesbyChannel = response.Result.PaymentMethods;
                    }
                    else {
                        this.iSalesbyChannel = [];
                    }
                    if (this.iTopMembershipPlansExists) {
                        this.iTopMembershipPlans = response.Result.TopMemberships;
                    }
                    else {
                        this.iTopMembershipPlans = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Top Services"));
                }
            );
    }
    getTopServicesByDate() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getTopServicesByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopServicesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopServicesDataExists) {
                        this.iTopServices = response.Result;
                    }
                    else {
                        this.iTopServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Top Services"));
                }
            );
    }

    getTopEmployeeServicesByDate() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getEmployeeTopServicesByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopEmployeeServicesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopEmployeeServicesDataExists) {
                        this.iTopEmployeeServices = response.Result;
                    }
                    else {
                        this.iTopEmployeeServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Employee Top Services"));
                });
    }

    getTopSalesChannelByDate() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getTopSalesByChannelByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopSalesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopSalesDataExists) {
                        this.iSalesbyChannel = response.Result;
                    }
                    else {
                        this.iSalesbyChannel = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale by Payment Method"));
                });
    }


    getNewvsReturningClient() {
        let params = {
            personTypeID: CustomerType.Customer,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            AppSourceTypeID: this.memberDashboardSearchParam.AppSourceTypeID
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.memberDashboardSearchParam.DateFrom), new Date(this.memberDashboardSearchParam.DateTo))) {
            this._httpService.get(ClientApi.getnewvsReturningClient, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isNewvsReturningExists = response.Result != null && response.Result.length ? true : false;
                        if (this.isNewvsReturningExists) {
                            this.iNewvsReturningClient = response.Result;
                            this.setReturningDate();
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "New vs Returning"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    setReturningDate() {
        this.iNewvsReturningClient.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatforReturingClient);
        });
    }


    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    setClubVisitsDate() {
        this.memberClubVisits.forEach(element => {

            if (element.GraphType === this.mainDashboard_ClubVisitGraphType.Hour) {
                element.Time = this._dateTimeService.formatTimeString(element.Time, this.timeFormat);
            } else {
                if (element.GraphType === this.mainDashboard_ClubVisitGraphType.Date) {
                    element.Time = this._dateTimeService.convertDateObjToString(new Date(element.Time), this.dateFormatForChart);
                }
            }
        });
    }

    setAttendanceSummaryDate() {
        this.customerBirthdays.forEach(element => {
            if (element.ImagePath != "" && element.ImagePath != null) {
                element.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + element.ImagePath;
                // element.AttendanceTime = this._dateTimeService.formatTimeString(element.AttendanceTime);
            }
            else {
                element.ImagePath = this.imagePath;
                //element.AttendanceTime = this._dateTimeService.formatTimeString(element.AttendanceTime);
            }
            element.BirthDate = this._dateTimeService.convertDateObjToString(new Date(element.BirthDate), this.dateFormatForChart);
            element.CreatedOn = this._dateTimeService.convertDateObjToString(new Date(element.CreatedOn), this.dateFormatForChart);
        });
    }

    setServiceAndAttendanceDate() {
        this.memberServiceAndAttendance.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatForChart);
            element.TotalAttendance = element.TotalAttendance + '<br/>' + ' ' + element.Time
        });
    }
    bookedVsCompletedTooltip(arg: any) {
        let text = "";
        if (arg.seriesName === 'Booked') {
            text = arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + 'Completed' + ' : ' + arg.point.data.TotalAttendance + '<br/>' + ' ' + arg.argument
        } else if (arg.seriesName === 'Completed') {
            text = arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + 'Booked' + ' : ' + arg.point.data.TotalSaleService + '<br/>' + ' ' + arg.argument
        }
        return {
            text: text
        };
    }
    setPaymenteDate() {
        this.memberPayment.forEach(element => {
            element.MonthNames = this._dateTimeService.convertDateObjToString(new Date(element.MonthNames), this.dateFormatForChart);
        });
    }

    customizeSeries(valueFromNameField: number) {
        return valueFromNameField === 2009 ?
            { type: "line", label: { visible: true }, color: "#ff3f7a" } : {};
    }

    clubVisits: ClubVisitsStatic[] = [
        { value: "Total", name: "Club Visits" }
    ];


    customizeProductLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }

    customizeServicesLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }
    customizeBookingLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }

    customizeProductTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    customizeServicesTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    customizeBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }


    memberBookingcustomizePoint(arg: any) {
    
        var enumSaleSourceType = EnumNetSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
          case enumSaleSourceType.Core:
            return { color: "#BFE1FF" };
          case enumSaleSourceType.Widget:
            return { color: "#BCD556" };
          case enumSaleSourceType.StaffApp:
            return { color: "#FEBF05" };
          case enumSaleSourceType.CustomerApp:
            return { color: "#F8CAA6" };
        }
      }

    // memberMemberShipBookingcustomizePoint(arg: any) {
    //     var enumSaleSourceType = EnumSaleSourceType;
    //     switch (arg.data.AppSourceTypeID) {
    //         case enumSaleSourceType.App:
    //             return { color: "#FEBF05" };
    //         case enumSaleSourceType.OnSite:
    //             return { color: "#BFE1FF" };
    //         case enumSaleSourceType.Shop:
    //             return { color: "#BCD556" };
    //         case enumSaleSourceType.WellyxShop:
    //             return { color: "#a37182" };
    //     }
    // }
    // memberServicecustomizePoint(arg: any) {
    //     var enumSaleSourceType = EnumSaleSourceType;
    //     switch (arg.data.AppSourceTypeID) {
    //         case enumSaleSourceType.App:
    //             return { color: "#FEBF05" };
    //         case enumSaleSourceType.OnSite:
    //             return { color: "#BFE1FF" };
    //         case enumSaleSourceType.Shop:
    //             return { color: "#BCD556" };
    //         case enumSaleSourceType.WellyxShop:
    //             return { color: "#a37182" };
    //     }
    // }

    // memberProductcustomizePoint(arg: any) {
    //     var enumSaleSourceType = EnumSaleSourceType;
    //     switch (arg.data.AppSourceTypeID) {
    //         case enumSaleSourceType.App:
    //             return { color: "#FEBF05" };
    //         case enumSaleSourceType.OnSite:
    //             return { color: "#BFE1FF" };
    //         case enumSaleSourceType.Shop:
    //             return { color: "#BCD556" };
    //         case enumSaleSourceType.WellyxShop:
    //             return { color: "#a37182" };
    //     }
    // }

    memberByStatuscustomizePoint(arg: any) {
        var enumMembershipStatus = MembershipStatus_Enum;
        switch (arg.data.MembershipStatusTypeID) {
            case enumMembershipStatus.Terminated:
                return { color: "#F8CAA6" };
            case enumMembershipStatus.Expired:
                return { color: "#E97C82" };
            case enumMembershipStatus.Frozen:
                return { color: "#BFE1FF" };
            case enumMembershipStatus.Active:
                return { color: "#BCD556" };
        }
    }
    customerApplicationcustomizePoint(arg: any) {
        var customerApllicationStatus = CustomerMobileApplication_Enum;
        switch (arg.argument) {
            case customerApllicationStatus.Android:
                return { color: "#BCD556" };
            case customerApllicationStatus.iOS:
                return { color: "#BFE1FF" };
        }
    }

    attendancecustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }
    membershipExpiryCustomizeTooltip(arg: any) {
        return {
            text: arg.argumentText + ' : ' + arg.value
        };
    }
    customizeMemberhipBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + ' : ' + this._currencyFormatter.transform(arg.value, this.currencyFormat, 'symbol')
        };
    }
    customizeClassesBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + ' : ' + this._currencyFormatter.transform(arg.value, this.currencyFormat, 'symbol')
        };
    }
    customizeServicesBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + ' : ' + this._currencyFormatter.transform(arg.value, this.currencyFormat, 'symbol')
        };
    }
    customizeProductBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + ' : ' + this._currencyFormatter.transform(arg.value, this.currencyFormat, 'symbol')
        };
    }
    VisitInClubcustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + arg.argumentText
        };
    }

    BreakDowncustomizeTooltip = (arg: any) => {
        return {
            text: arg.seriesName + ' : ' + this._currencyFormatter.transform(arg.value, this.currencyFormat, 'symbol') + '  <br/>  ' + arg.argument
        };
    }

    MembershipbyStatuscustomizeTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    CustomerMobileApplicationcustomizeTooltip = (arg: any) => {
        //console.log(arg)
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    memberPaymentcustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }


    setPermissions(packageId: number) {
        switch (packageId) {

            case this.package.WellnessMedium:
                this.allowedPages.ProductDashboard = true;
                this.allowedPages.clubVisits = true;
                this.memberDashboardSearchParam.isClient = true;
                this.memberDashboardSearchParam.CustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.saleRevenueCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.ClubVisitsCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.SaleBreakDownCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.ServiceBookedCustomerTypeID = CustomerType.Client;

                break;

            case this.package.WellnessTop:
                this.allowedPages.ProductDashboard = true;
                this.allowedPages.clubVisits = true;
                this.memberDashboardSearchParam.isClient = true;
                this.memberDashboardSearchParam.isClient = true;
                this.memberDashboardSearchParam.CustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.saleRevenueCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.ClubVisitsCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.SaleBreakDownCustomerTypeID = CustomerType.Client;
                this.memberDashboardSearchParam.ServiceBookedCustomerTypeID = CustomerType.Client;
                break;

            case this.package.FitnessMedium:
                this.allowedPages.ProductDashboard = true;
                this.allowedPages.MembershipStatusDashboard = true;
                this.allowedPages.MemberSnapshot = true;
                this.allowedPages.clubVisits = true;
                this.allowedPages.MembershipPayments = true;
                this.allowedPages.MembershipDashboard = true;
                this.allowedPages.MembershipByExpiryDate = true;
                this.memberDashboardSearchParam.isClient = false;
                this.allowedPages.ClassesDashboard = true;
                this.memberDashboardSearchParam.CustomerTypeID = CustomerType.Member;
                this.memberDashboardSearchParam.saleRevenueCustomerTypeID = CustomerType.Member;
                this.memberDashboardSearchParam.ClubVisitsCustomerTypeID = CustomerType.Member;
                this.memberDashboardSearchParam.SaleBreakDownCustomerTypeID = CustomerType.Member;
                this.memberDashboardSearchParam.ServiceBookedCustomerTypeID = CustomerType.Member;
                break;

            case this.package.Full:
                this.showCustomerTypeStatus = true;
                this.allowedPages.ProductDashboard = true;
                this.allowedPages.MembershipStatusDashboard = true;
                this.allowedPages.MemberSnapshot = true;
                this.allowedPages.clubVisits = true;
                this.allowedPages.MembershipPayments = true;
                this.allowedPages.MembershipDashboard = true;
                this.allowedPages.MembershipByExpiryDate = true;
                this.allowedPages.ClassesDashboard = true;
                this.allowedPages.RewardProgramSummary = true;
                this.getRewardProgramList();
                this.getRewardProgramSummary();
                break;

        }
    }

    getRewardProgramList() {

        this._httpService.get(HomeApi.getBranchActiveRewardProgramList).subscribe(
            data => {
                if (data.Result) {
                    this.branchRewardProgramList = data.Result;
                }
            });
    }

    getRewardProgramSummary() {
        let params = {
            RewardProgramID: this.selectedRewardProgramID,
            PageModuleID: 2,
        }

        this._httpService.get(RewardProgramApi.getRewardProgramSummary, params).subscribe(
            data => {
                if (data.Result) {
                    this.rewardProgramSummaryViewModel = data.Result;
                }
            });
    }

}


export class ClubVisitsStatic {
    value: string;
    name: string;
}

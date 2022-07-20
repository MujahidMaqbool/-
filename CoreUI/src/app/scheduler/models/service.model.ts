import { CustomFormView } from "src/app/models/customer.form.model";

export class Service {
    public ServiceID: number = 0;
    public ServiceCategoryID: number = 0;
    public BranchID: number = 0;
    public ServiceName: string = "";
    public BoltPoint: number = 0;
    public CleaningTimeInMinute: number = 0;
    public Description: string = "";
    public ImagePath: string = "";
    public ImageFile: string = "";
    public IsActive: boolean = true;
    public IsOnline: boolean = false;
    public CreatedOn: Date
    public CreatedBy: number = 0;
    public ModifiedOn: Date;
    public ModifiedBy: number = 0;
    public IsArchived: boolean = false;
    public IsFeatured: boolean = false;
    public ServicePackageList: ServicePackage[] = [];
}

export class ServicePackage {
    ServiceID: number;
    Price: number = 0;
    VATID: number;
    TotalPrice: any = 0.00;
    DurationValue: number = 0;
    DurationTypeID: number;
}

export class SearchParameter {
    public serviceName: string = "";
    public serviceCategoryID: number = 0;
    public IsActive: number = 1;
}

export class SchedulerServiceModel {
    CustomerID: number;
    CustomerTypeID: number;
    CustomerTypeName: string;
    CustomerName: string;
    IsWalkedInCustomer: boolean;
    Email: string;
    Mobile: string;
    AllowPartPaymentOnCore: boolean = false;
    ServiceBookingList: ServiceBookingList[] = new Array<ServiceBookingList>();
}

export class SaleServiceCalendarPOSList {
    id: number;
    text: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    recurrenceRule: string;
    description: string;
    SaleID: number;
    ServiceCategoryID: number;
    ServiceCategoryName: string;
    CleaningTimeInMinute: number;
    ServicePackageID: number;
    Duration: string;
    BookedOn: Date;
    StaffID: number;
    StaffFullName: string;
}

export class ServiceBookingList {
    ID: number;
    SaleID: number;
    SaleSourceTypeID: number;
    SaleStatusTypeID: number;
    SaleStatusTypeName: number;
    BookingStatusTypeID: number;
    BookingStatusTypeName: string;
    ServiceCategoryID: number;
    ServiceID: number;
    ServicePackageID: number;
    Price: any;
    CleaningTimeInMinute: number;
    StartDate: Date;
    StartTime: any;
    EndTime: any;
    AssignedToStaffID: number;
    AssignedToStaffName: string;
    FacilityID: number;
    Description: string;
    showErrorText: boolean;
    cleanupEndTimeError: boolean = false;
    TotalPrice: any;
    IsPartialPaid: boolean = false;
    TotalAmountPaid: number;
    SaleRefundAmount: number;
    IsMultiItem: boolean;

    SaleTotalPrice: number;
    /**for SALE DISCOUNT */
    SaleDiscountPerItemPercentage: number;
    ItemTaxPercentage: number;

    /* partail payment*/
    IsSale: boolean;



     /* Is Memberhsip Benefit*/
     public PricePerSession?: number;
     public DiscountPercentage?: number;
     public ItemDiscountAmount?: number;
     public CustomerMembershipID?: number = null;
     public TotalDiscount?: number;
     public IsFree?: boolean;
     public RemainingSession?: number;
     public IsBenefitsSuspended?: boolean;
     public IsMembershipBenefit?: boolean;
     public PriceBeforeBenefit?: number;
     public DiscountPrice?: number;
     public ItemTaxPrice?: number;
     public FormList : CustomFormView[] = [];

    /* custom form*/
    HasForm : boolean = false;
    HasAtleastOneMandatoryForm : boolean;
    HasUnSubmittedForm : boolean;
    isServiceChange : boolean;
    IsRepeat : boolean;
    ItemName: string;
    RestrictedCustomerTypeNames: string = "";

}

export class UpdateServiceBooking {
    ID: number;
    SaleSourceTypeID: number;
    SaleStatusTypeID: number;
    StartDate: Date;
    StartTime: string;
    EndTime: string;
    AssignedToStaffID: number;
    CustomerName: string;
    ServiceName: string;
    IsSale: boolean;
}

export class UpdateSaleServiceStatusModel {
    DetailId: number;
    SaleId: number;
    BookingStatusTypeID: number;
}

export class SchedulerServicesPackage {
    ServiceID: number;
    ServicePackageID: number;
    TotalPrice: number;
    Price: number;
    DurationTypeID: number;
    DurationValue: number;
    DurationTypeName: string;
    TotalTaxPercentage: number;
    DiscountPrice: number;
     /* Is Memberhsip Benefit*/
     public PricePerSession?: number;
     public DiscountPercentage?: number;
     public DiscountedPrice?: number;
     public ItemDiscountAmount?: number;
     public CustomerMembershipID?: number;
     public TotalDiscount?: number;
     public IsFree?: boolean;
     public RemainingSession?: number;
     public IsBenefitsSuspended?: boolean;
     public IsMembershipBenefit?: boolean;
     public RestrictedCustomerTypeNames? : string ="";
}

export class ServiceClient {
    public CustomerID: number;
    public CustomerTypeID: number;
    public CustomerTypeName: string;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public FullName: string;
    public Mobile: string;
    public Email: string;
    public ImagePath: string;
    public AllowPartPaymentOnCore: boolean;
    public IsWalkedIn : boolean;
    public HasMembership: boolean = false;
}

export class StaffBlockTimeModel {
    StaffBlockTimeID: number;
    StaffID: number;
    StaffName: string;
    AllDay: boolean;
    StartDate: any;
    StartTime: string;
    EndDate: any;
    EndTime: string;
    IsUpdate: boolean = false;
    RecurrenceRule: string;
    RecurrenceException: string;
    Description: string;
}

export class StaffBlockTimeUpdateModel {
    StaffBlockTimeID: number;
    StaffID: number;
    StartDate: Date;
    StartTime: string;
    EndDate: Date;
    EndTime: string;
    IsUpdate: boolean = false;
    RecurrenceRule: string;
    RecurrenceException: string;
}

export class DeleteServiceModel {
    delete_bookingId = 0;
    delete_saleDetailId = 0;
}
export class CustomerMembership {
    MembershipName: string
    CustomerMembershipID: number;
}

export class ServiceBenefitsPackage {
    IsFree: boolean = false;
    DiscountPercentage: number;
    CustomerMembershipID: number;
    IsBenefitsSuspended: boolean
    ItemID: number;
    ServiceID: number;
    ServicePackageID: number;
    RemainingSession: number;
    DiscountedPrice: number;
    GlobalRemainingSession?:number;
    MembershipEndDate: any;

    CopyRemainingSession: number; //for scheduler service handling
}

export class ClassServiceRescheduleModel {
    AppSourceTypeID: number;
    ActivityType:	string;     //(reschedule)
    ActionType: string;         //(Charge/refund)
    IsRefundNow	: boolean = false;
    IsChargeNow	: boolean = false;
    ChargesAmount:	any;
    PaymentGatewayID: number;
    SaleTypeID: number;
    CustomerPaymentGatewayID: number;
    CustomerID: number;
    SaleDetailID: number;
    SaleID: number;
    CustomerBookingID: number;
    Notes?:	string = null;
    ItemTypeID: number;        // 2 for service
    ItemID: number;            // this will be servicePackageId
    ReasonID: number;
    IsEarlyCancellationSelected: boolean;
    Token: any;
    IsBenefitConsumed: boolean;
    PaymentReferenceNo?: string = null;
    NewItemID: number;
    NewServiceStartDate: Date;
    NewServiceStartTime: any;
    NewServiceEndTime: any;
    CustomerMembershipID: number;
}

export interface ServiceCancelatinPolicyModel {
    IsServiceCancellation: boolean;
    IsServiceCancellationEarly: boolean;
    IsServiceCancellationEarlyBenefit: boolean;
    IsServiceCancellationLate: boolean;
    IsServiceCancellationLateBenefit: boolean;
    IsServiceCancellationLateFlatFee: boolean;
    IsServiceNoShow: boolean;
    IsServiceNoShowBenefit: boolean;
    IsServiceNoShowFee:  number;
    IsServiceNoShowFlatFee: boolean;

    ServiceCancellationLateFlatFeeMember:  number;
    ServiceCancellationLateFlatFeeClientLead: number;
    ServiceCancellationLatePercentageFeeClientLead: number;
    ServiceCancellationLatePercentageFeeMember: number;

    ServiceNoShowFlatFeeClientLead: number;
    ServiceNoShowFlatFeeMember: number;
    ServiceNoShowPercentageFeeClientLead: number;
    ServiceNoShowPercentageFeeMember: number;

}


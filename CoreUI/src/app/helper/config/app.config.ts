import { SEPACountryAccountDetail, SEPADashAfterDigit, SEPADashDigit } from "@app/models/cutomer.gateway.models";

class ActivityTypes {
    public All: string = "All";
    public Appointment: string = "Appointment";
    public FollowupAppointment: string = "Follow Up Appointment";
    public Call: string = "Call";
    public FollowupCall: string = "Follow Up Call";
    public Email: string = "Email";
    public Note: string = "Note";
    public Task: string = "Task";
    public SMS: string = "SMS";
    public MemberMessage: string = "Member Message";
    public Achievements: string = "Achievement";
    public AppNotification: string = "App Notification";
}

class ConfigurationsTypes {
    public Basic: string = "Basic";
    public Advanced: string = "Advanced";
    public CancellationPolicy: string = "Cancellation Policy";
    public WaitingList: string = "Waitlist";
    public Payments: string = "Payments";
    public POS: string = "POS";
    public Lead: string = "Lead";
    public Widget: string = "Widget";
    public ActivitiesColor = "Activities Color";
}

class ConfigurationsTypePath {
    public Basic: string = "basic";
    public Advanced: string = "advanced";
    public CancellationPolicy: string = "cancellation-policy";
    public WaitingList: string = "wait-list";
    public Payments: string = "payments";
    public POS: string = "pos";
    public Lead: string = "lead";
    public Widget: string = "widget";
    public ActivitiesColor = "actvities-color";
}

class TemplateTypes {
    public Email: string = "Email";
    public SMS: string = "SMS";
    public PushNotification: string = "Push Notification"
}

class PriorityTypes {
    public Low: string = "Low"
    public Medium: string = "Medium"
    public High: string = "High"
    public Critical: string = "Critical"
}

class ProductViewTabs {
    public ProductDetails: string = "Product Details";
    public PricingDetails: string = "Pricing Details";
    public InventoryDetails: string = "Inventory Details";
  
  }

export class Configurations {
    // #region Public Readonly Members

    public static readonly ProductViewTabs: ProductViewTabs = new ProductViewTabs();
    public static readonly SuccessMessageTimeout: number = 8000;
    public static readonly DefaultCountry: string = "gb";
    //public static readonly DateFormat: string = "d MMM, yyyy";
    public static readonly DateFormat: string = "yyyy-MM-dd";
    public static readonly SchedulerTooltipDateFormat: string = "dd/MM/yy";
    public static readonly ExceptionDateFormat: string = "dd-MM-y";
    public static readonly SchedulerDateFormatDayView: string = "EEEE, d MMMM y";
    public static readonly SchedulerDateFormatWeekViewTo: string = "EEEE d MMMM y";
    public static readonly SchedulerDateFormatWeekViewFrom: string = "EEEE d";
    public static readonly SchedulerDateFormatMonthView: string = "MMMM y";
    public static readonly SchedulerHeaderTimeFormat: string = "HH";
    public static readonly SchedulerHeaderTimeFormatWith12Hours: string = "hh a";
    public static readonly SchedulerRRuleUntilDateFormat: string = "dd/MM/yyyy";
    public static readonly DateFormatForSave: string = "MMMM d, y";
    public static readonly DateTimeFormat: string = "EEEE, MMMM d, y HH:mm";
    public static readonly NotficationDateTimeFormat: string = "dd/MM/yyyy  HH:mm";

    public static readonly ReceiptDateFormat: string = "dd/MM/yy";
    public static readonly RecurrenceExceptionDateFormat: string = "yyyyMMdd";
    public static readonly DashboardDateFormat: string = 'yyyy-MM-dd';
    public static readonly TimeFormat: string = "HH:mm";
    public static readonly TimeFormatWith12HoursFormat: string = "hh:mm a";
    public static readonly SchedulerTimeFormat: string = "HH:mm";
    public static readonly SchedulerTimeFormatWithFormat: string = "hh:mm a";
    public static readonly TimeFormatView: string = "HH:mm";
    public static readonly TimePlaceholder: string = "HH:mm";
    public static readonly TimePlaceholderWithFormat: string = "hh:mm a";
    public static readonly SortOrder_ASC = "ASC";
    public static readonly SortOrder_DESC = "DESC";
    public static readonly DefaultPageSize: number = 10;
    public static readonly PageSize1: number = 10;
    public static readonly PageSize2: number = 25;
    public static readonly PageSize3: number = 50;
    public static readonly PageSizeOptions: number[] = [5, 10, 15, 20, 50];
    public static readonly WaitlistPageSizeOptions: number[] = [5, 10];
    public static readonly Access_Token: string = "access_token";
    public static readonly EmailMaxLength: number = 2500;
    public static readonly SupplierEmailMaxLength: number = 1500;

    /* Keys Allowed in Discount filed */
    public static readonly AllowedNumberKeysForClassBooking: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ArrowRight", "ArrowLeft", "Backspace", "Delete"];
    public static readonly AllowedNumberKeys: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "ArrowRight", "ArrowLeft", "Backspace", "Delete"];
    public static readonly Months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    public static readonly ActivityTypes: ActivityTypes = new ActivityTypes();
    public static readonly ConfigurationsTypes: ConfigurationsTypes = new ConfigurationsTypes();
    public static readonly ConfigurationsTypePath: ConfigurationsTypePath = new ConfigurationsTypePath();
    public static readonly TemplateTypes: TemplateTypes = new TemplateTypes();
    public static readonly PriorityTypes: PriorityTypes = new PriorityTypes();
    public static readonly ProductStatusType: any[] = [{ ProductStatusID: 1, ProductStatusName: "Free" }, { ProductStatusID: 2, ProductStatusName: "Paid" }, { ProductStatusID: 3, ProductStatusName: "PartiallyPaid" }, { ProductStatusID: 4, ProductStatusName: "Unpaid" }]
    public static readonly CustomerList: any[] = [{ CustomerTypeID: 1, CustomerTypeName: "Clients" }, { CustomerTypeID: 2, CustomerTypeName: "Leads" }, { CustomerTypeID: 3, CustomerTypeName: "Members" }]
    public static readonly SaleType: any[] = [{ SaleTypeID: 1, SaleTypeName: "Membership Sale" }, { SaleTypeID: 2, SaleTypeName: "Product Sale" }, { SaleTypeID: 3, SaleTypeName: "Service Sale" }, { SaleTypeID: 4, SaleTypeName: "Class Sale" }]
    public static readonly CustomerTypeList: any[] = [{ CustomerTypeID: 0, CustomerTypeName: "All" }, { CustomerTypeID: 1, CustomerTypeName: "Client" }, { CustomerTypeID: 2, CustomerTypeName: "Lead" }, { CustomerTypeID: 3, CustomerTypeName: "Member" }]
    public static readonly ItemType: any[] = [{ ItemTypeID: 0, ItemTypeName: "All" }, { ItemTypeID: 1, ItemTypeName: "Class" }, { ItemTypeID: 2, ItemTypeName: "Service" }];
    public static readonly ItemTypeOnReport: any[] = [{ ItemTypeID: 0, ItemTypeName: "All" }, { ItemTypeID: 1, ItemTypeName: "Class" }, { ItemTypeID: 2, ItemTypeName: "Service" }, { ItemTypeID: 3, ItemTypeName: "Product" }]
    public static readonly Status: any[] = [{ StatusID: 1, StatusName: "Active" }, { StatusID: 0, StatusName: "Inactive" }];
    public static readonly PersonTypeList: any[] = [{ PersonID: 0, PersonName: "All" }, { PersonID: 2, PersonName: "Customer" }, { PersonID: 1, PersonName: "Staff" }];
    public static readonly TaskStatus: any[] = [{ TaskStatusID: 1, TaskStatusName: "Done" }, { TaskStatusID: 0, TaskStatusName: "Not Done" }];
    public static readonly DurationList: any[] = [{ value: 30, text: "30 Minutes" }, { value: 45, text: "45 Minutes" }, { value: 60, text: "60 Minutes" }];
    public static readonly TemplateVariableList: string[] = ["[Staff Name]", "[Lead Name]", "[Member Name]", "[Client Name]", "[Phone]", "[Address]"];
    public static readonly EnquirySourceTypeList: any[] = [{ value: 1, text: "Friend" }, { value: 2, text: "Newspaper" }, { value: 3, text: "Internet" }, { value: 4, text: "Billboard" }, { value: 5, text: "Walkin" }, { value: 6, text: "Online" }];

    public static readonly ActivityList: any[] = [{ value: 0, text: "All" }, { value: 3, text: "Call" }, { value: 4, text: "Appointment" }, { value: 5, text: "Email" }, { value: 6, text: "SMS" }];

    public static readonly LeadActivitiesForReports: any[] = [{ value: 0, text: "All" }, { value: 3, text: "Calls" }, { value: 4, text: "Appointments" }, { value: 5, text: "Emails" }, { value: 6, text: "SMS" }, { value: 1, text: "Notes" }, { value: 8, text: "Achievements" }, { value: 9, text: "App Notifications" }];

    public static readonly StaffActivityList: any[] = [{ value: 0, text: "All" }, { value: 2, text: "Tasks" }, { value: 5, text: "Emails" }, { value: 6, text: "SMS" }, { value: 1, text: "Notes" }];
    public static readonly SaleSourceType: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Core" }, { value: 2, text: "Widget" }];
    public static readonly AllSaleSourceType: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Core" }, { value: 2, text: "Widget" }, { value: 3, text: "Staff App" }, { value: 4, text: "Customer App" }];
    public static readonly PaymentType: any[] = [{ SaleTypeID: "", SaleTypeName: "All" }, { SaleTypeID: 1, SaleTypeName: "Cash" }, { SaleTypeID: 2, SaleTypeName: "Card" }, { SaleTypeID: 3, SaleTypeName: "Other" }];
    public static readonly PaymentSaleType: any[] = [{ SaleTypeID: 0, PaymentSaleTypeName: "All" }, { SaleTypeID: 1, PaymentSaleTypeName: "Cash" }, { SaleTypeID: 2, PaymentSaleTypeName: "Card" }, { SaleTypeID: 3, PaymentSaleTypeName: "Direct Debit" }, { SaleTypeID: 4, PaymentSaleTypeName: "3rd Party" }, { SaleTypeID: 9, PaymentSaleTypeName: "Reward Points" }];
    public static readonly PaymentSaleTypeForCashOther: any[] = [{ SaleTypeID: 0, PaymentSaleTypeName: "All" }, { SaleTypeID: 1, PaymentSaleTypeName: "Cash" }, { SaleTypeID: 4, PaymentSaleTypeName: "3rd Party" }];
    public static readonly EndRepeatOccurrence: any[] = [{ value: 1, text: "1" }, { value: 2, text: "2" }, { value: 3, text: "3" }];
    public static readonly BenefitsType: any[] = [{ value: 1, text: "All" }, { value: 2, text: "Free only" }, { value: 3, text: "Discounted only" }];
    public static readonly PaymentStatusType: any[] = [{ value: 0, text: "All" }, { value: 8, text: "Paid" }, { value: 4, text: "Failed" }, { value: 5, text: "Pending Bank Submission" }];
    public static readonly CustomerActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Notes" }, { value: 2, text: "Tasks" }, { value: 3, text: "Calls" }, { value: 4, text: "Appointments" }, { value: 5, text: "Emails" }, { value: 6, text: "SMS" }, { value: 7, text: "Member Messages" }, { value: 8, text: "Achievements" }, { value: 9, text: "App Notifications" }];
    public static readonly ClientActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Notes" }, { value: 3, text: "Calls" }, { value: 4, text: "Appointments" }, { value: 5, text: "Emails" }, { value: 6, text: "SMS" }, { value: 8, text: "Achievements" }, { value: 9, text: "App Notifications" }];
    public static readonly MemberActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Notes" }, { value: 3, text: "Calls" }, { value: 4, text: "Appointments" }, { value: 5, text: "Emails" }, { value: 6, text: "SMS" }, { value: 7, text: "Member Messages" }, { value: 8, text: "Achievements" }, { value: 9, text: "App Notifications" }];
    public static readonly customerEnrollmentList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Enrolled" }, { value: 2, text: "Terminated" }];

    public static readonly PaymentStatusTypesForReports: any[] = [{ PaymentStatusTypeID: 0, PaymentStatusTypeName: "All" }, { PaymentStatusTypeID: 2, PaymentStatusTypeName: "Paid" }, { PaymentStatusTypeID: 4, PaymentStatusTypeName: "Unpaid" }, { PaymentStatusTypeID: 7, PaymentStatusTypeName: "Partially Paid" }, { PaymentStatusTypeID: 3, PaymentStatusTypeName: "Refunded" }, { PaymentStatusTypeID: 6, PaymentStatusTypeName: "Written Off" }, { PaymentStatusTypeID: 5, PaymentStatusTypeName: "Voided" }, { PaymentStatusTypeID: 8, PaymentStatusTypeName: "Overpaid" }];

    public static readonly ClientBasicCheckInActivityList: any[] = [{ value: 0, text: "All" }, { value: 2, text: "Service" }];
    public static readonly MemberBasicCheckInActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Class" }, { value: 5, text: "Door Check-In" }];

    public static readonly ClientCheckInActivityList: any[] = [{ value: 0, text: "All" }, { value: 2, text: "Service" }, { value: 3, text: "Product" }];
    public static readonly MemberCheckInActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Class" }, { value: 3, text: "Product" }, { value: 5, text: "Door Check-In" }];

 
    public static readonly CustomerCheckInActivityList: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Class" }, { value: 2, text: "Service" }, { value: 3, text: "Product" }, { value: 5, text: "Door Check-In" }];


    public static readonly CustomerCheckInActivityListForCommon: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Class is Attended" }, { value: 2, text: "Service is Completed" }, { value: 3, text: "Product is Purchased" }, { value: 5, text: "Door Check-In" }];
    public static readonly CustomerWaitlistStatuses: any[] = [{ value: 1, text: "All" }, { value: 2, text: "Added to Waitlist" }, { value: 3, text: "Available to Book" }, { value: 4, text: "Timed out" },]

    public static readonly MembershipStatusList: any[] = [{ value: null, text: "All" }, { value: 1, text: "Active Memberships Only" }, { value: 2, text: "Active and Frozen Memberships" }];
    // Customer Form Status
    public static readonly CustomerFormStatus: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Submitted" }, { value: 2, text: "Not Submitted" }];

    // Custom Form Status
    public static readonly CustomFormStatus: any[] = [{ value: 2, text: "All" }, { value: 1, text: "Active" }, { value: 0, text: "Inactive" }];

    //Branch Time Format
    public static readonly BranchTimeFormats: any[] = [{ value: true, text: "12 Hours Clock" }, { value: false, text: "24 Hours Clock" }];

    // Customer Types
    public static readonly CustomerTypes: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Client" }, { value: 3, text: "Member" }];

    // Customer Status
    public static readonly CustomerStatus: any[] = [{ value: 0, text: "Active" }, { value: 1, text: "Archived" }];

    // Customer Dashboard Customer Birthday Type
    public static readonly DashboardCustomerBirthday: any[] = [{ value: null, text: "All" }, { value: true, text: "Client" }, { value: false, text: "Member" }];

    // Customer Reports Status
    public static readonly CustomerReportStatus: any[] = [{ value: null, text: "All" }, { value: 0, text: "Active" }, { value: 1, text: "Archived" }];

    //Expired & Terminated Memberships report
    public static readonly ExpiredAndTerminatedMembershipsStatus: any[] =  [{MembershipStatusTypeID: 0, MembershipStatusTypeName: "All"}, {MembershipStatusTypeID: 4, MembershipStatusTypeName: "Expired"}, {MembershipStatusTypeID: 3, MembershipStatusTypeName: "Terminated"}]

    // Customer New Vs Returning Clients
    public static readonly NewVsReturningType: any[] = [{ value: 0, text: "All" }, { value: 1, text: "Core" }, { value: 2, text: "Widget" }, { value: 4, text: "App" }];

    // Cancellation Policy Lists for dropdown
    public static readonly ClassCancellationRescheduleRule: any[] = [{ value: 1, text: "Any Class" }, { value: 2, text: "Class Of Same Or Greater Price " }];
    public static readonly ServiceCancellationRescheduleRule: any[] = [{ value: 1, text: "Any Service" }, { value: 2, text: "Service Of Same Or Greater Price " }];
    public static readonly CancellationPolicyRescheduleLimit: any[] = [{ value: 0, text: "No Limit" }, { value: 1, text: "1" }, { value: 2, text: "2" }, { value: 3, text: "3" }, { value: 4, text: "4" }, { value: 5, text: "5" }];
    public static readonly ServiceInterval: any[] = [{ value: 5, text: "5 minutes" }, { value: 10, text: "10 minutes" }, { value: 15, text: "15 minutes" }, { value: 20, text: "20 minutes" }, { value: 25, text: "25 minutes" }, { value: 30, text: "30 minutes" }, { value: 45, text: "45 minutes" }, { value: 60, text: "60 minutes" }];
    public static readonly AccessControlInterval: any[] = [{ value: 0, text: "0 minutes" }, { value: 15, text: "15 minutes" }, { value: 30, text: "30 minutes" }, { value: 45, text: "45 minutes" }, { value: 60, text: "60 minutes" }];
    public static readonly AccessControlOpeningTime: any[] = [{ value: 1, text: "Anytime Access" }, { value: 2, text: "Branch Opening Hours" }];

    // Date Filter For Classes Dropdown Values
    public static readonly DateIntervalForClasses: any[] = [{ value: 1, text: "1 Week" }, { value: 2, text: "2 Weeks" }, { value: 3, text: "3 Weeks" }, { value: 4, text: "4 Weeks" }]

    // Waitlist Item Type for only Class and Service
    public static readonly WaitListItemType: any[] = [{ ItemTypeID: 1, ItemTypeName: "Class" }, { ItemTypeID: 2, ItemTypeName: "Service" }];

    public static readonly CustomerServiceWaitlistStatuses: any[] = [{ value: 1, text: "All" }, { value: 2, text: "Added to Waitlist" }, { value: 4, text: "Timed out" }]

    public static readonly BookingStatusList: any[] = [{ value: 1, text: "Booked" }, { value: 5, text: "Not Confirmed" }, { value: 6, text: "Confirmed" }, { value: 7, text: "Checked-In By Staff" }, { value: 8, text: "Ready To Start" }, { value: 4, text: "No Show" }, { value: 9, text: "In Progress" }, { value: 3, text: "Completed" }, { value: 2, text: "Cancelled" }];

    // sale all item types
    public static readonly SaleItemTypeOnReport: any[] = [{ ItemTypeID: 0, ItemTypeName: "All" }, { ItemTypeID: 1, ItemTypeName: "Class" }, { ItemTypeID: 2, ItemTypeName: "Service" }, { ItemTypeID: 9, ItemTypeName: "Product" }, { ItemTypeID: 6, ItemTypeName: "Membership" }]

    public static readonly RewardProgramStatus: any[] = [{ RewardProgramStatusTypeID: null, RewardProgramStatusTypeName: "All" }, { RewardProgramStatusTypeID: 1, RewardProgramStatusTypeName: "Expired" }, { RewardProgramStatusTypeID: 2, RewardProgramStatusTypeName: "Redeemed" }, { RewardProgramStatusTypeID: 3, RewardProgramStatusTypeName: "Earned" }];

    public static readonly RestrictList: any[] = [{ value: 1, text: "Client" }, { value: 2, text: "Lead" }, { value: 3, text: "Member with Active Memberships" }, { value: 4, text: "Member with Inactive Memberships" }, { value: 5, text: "New Customer - From Widget & Customer App" }]
    
    public static readonly AllowedNumberKeysOnly: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ArrowRight", "ArrowLeft", "Backspace", "Delete"];
    
    public static readonly ClassificationList: any[] = [{ value: 1, text: "Standard Product" }, { value: 2, text: "Variant Product" }];
    // #endregion

    public static readonly LandingPageList: any[] = [{ value: 1, text: "Home" }, { value: 2, text: "Memberships" }, { value: 3, text: "Classes" }, { value: 4, text: "Services" }, { value: 5, text: "Products" },]

    public static readonly LeadStatusTypeID: any[] = [{ LeadStatusTypeID: 0, LeadStatusTypeName: "All" }, { LeadStatusTypeID: 1, LeadStatusTypeName: "Enquiry" }, { LeadStatusTypeID: 6, LeadStatusTypeName: "Lost" }, { LeadStatusTypeID: 10, LeadStatusTypeName: "Trial" }, { LeadStatusTypeID: 8, LeadStatusTypeName: "Tour" }, { LeadStatusTypeID: 7, LeadStatusTypeName: "Sale" }];


    public static readonly ProductFavouriteViewColumnNameList: Array<any> = [
        { FavouriteViewColumnIndex: 1, FavouriteViewColumnName: "Product", selected: true, isProductInfoColumn: true, isDefault: true ,ColumnName:"product"},
        { FavouriteViewColumnIndex: 2, FavouriteViewColumnName: "Classification", selected: true, isProductInfoColumn: true, isDefault: true ,ColumnName:"product"},
        { FavouriteViewColumnIndex: 3, FavouriteViewColumnName: "Type", selected: true, isProductInfoColumn: true, isDefault: true ,ColumnName:"product" },
        { FavouriteViewColumnIndex: 4, FavouriteViewColumnName: "Category", selected: true, isProductInfoColumn: true, isDefault: false,ColumnName:"product" },
        { FavouriteViewColumnIndex: 5, FavouriteViewColumnName: "Brand", selected: true, isProductInfoColumn: true, isDefault: false ,ColumnName:"product"},
        { FavouriteViewColumnIndex: 21, FavouriteViewColumnName: "Retail Price", selected: true, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 22, FavouriteViewColumnName: "Current Stock", selected: true, isProductInfoColumn: false, isDefault: false ,ColumnName:"inventory"},
  
        // Start Dynamic Loop Handling
        { FavouriteViewColumnIndex: 6, FavouriteViewColumnName: "Purchase Restriction", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"product"},
        { FavouriteViewColumnIndex: 8, FavouriteViewColumnName: "Show Online", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 9, FavouriteViewColumnName: "Hide Price Online", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 10, FavouriteViewColumnName: "Is Featured", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        // { FavouriteViewColumnIndex: 11, FavouriteViewColumnName: "Business Use Only", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 12, FavouriteViewColumnName: "Track Inventory", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 13, FavouriteViewColumnName: "Shipping", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 14, FavouriteViewColumnName: "Barcode", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 15, FavouriteViewColumnName: "SKU", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 16, FavouriteViewColumnName: "Supplier", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 17, FavouriteViewColumnName: "Supplier Code", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 18, FavouriteViewColumnName: "Supplier Price", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 19, FavouriteViewColumnName: "Price", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 20, FavouriteViewColumnName: "Tax", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"pricing"},
        { FavouriteViewColumnIndex: 23, FavouriteViewColumnName: "Reorder Quantity", selected: false, isProductInfoColumn: false, isDefault: false, ColumnName:"inventory"},
        { FavouriteViewColumnIndex: 24, FavouriteViewColumnName: "Threshold Point", selected: false, isProductInfoColumn: false, isDefault: false, ColumnName:"inventory"},
        { FavouriteViewColumnIndex: 25, FavouriteViewColumnName: "Stock Value", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"inventory"},
        { FavouriteViewColumnIndex: 26, FavouriteViewColumnName: "Retail", selected: false, isProductInfoColumn: false, isDefault: false ,ColumnName:"inventory"},
        // End Dynamic Loop Handling
  
        { FavouriteViewColumnIndex: 7, FavouriteViewColumnName: "Variant Status", selected: true, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
        { FavouriteViewColumnIndex: 28, FavouriteViewColumnName: "Product Status", selected: true, isProductInfoColumn: false, isDefault: false ,ColumnName:"branches"},
  
  
      ];

    public static readonly ProductDefaultViewColumnNameList: any[] = [
        { FavouriteViewColumnIndex: 1, FavouriteViewColumnName: "Product", selected: true, isDefault: true },
        { FavouriteViewColumnIndex: 2, FavouriteViewColumnName: "Classification", selected: true, isDefault: true },
        { FavouriteViewColumnIndex: 3, FavouriteViewColumnName: "Type", selected: true,isDefault: true },
        { FavouriteViewColumnIndex: 4, FavouriteViewColumnName: "Category", selected: true, isDefault: false },
        { FavouriteViewColumnIndex: 5, FavouriteViewColumnName: "Brand", selected: true, isDefault: false },
        { FavouriteViewColumnIndex: 21, FavouriteViewColumnName: "Retail Price", selected: true, isDefault: false },
        { FavouriteViewColumnIndex: 22, FavouriteViewColumnName: "Current Stock", selected: true, isDefault: false },
        { FavouriteViewColumnIndex: 7, FavouriteViewColumnName: "Variant Status", selected: true, isDefault: false },
        { FavouriteViewColumnIndex: 28, FavouriteViewColumnName: "Product Status", selected: true, isDefault: false },
    ];

    public static readonly StockAdjustment: any[] = [
        { value: 1, text: "Add" },
        { value: 2, text: "Decrease" }
    ];
}


export class SchedulerOptions {

    public static readonly SchedulerStartDayHour: string = "7";
    public static readonly strAll: string = "All";
    public static readonly strStaffID: string = "StaffID";
    public static readonly strFacilityID: string = "FacilityID";
    public static readonly strActivity: string = "ActivityType";
    public static readonly strStaffShift: string = "Staff Shift";
    public static readonly Scheduler: string = "Scheduler";
    public static readonly SchedulerActivityType = { Class: "Class", Service: "Service", BlockTime: "BlockTime", Appointment: "Appointment", Shifts: "Shifts", Call: "Call", Task: "Task", StaffShift: "StaffShift", ShiftInterval: "ShiftInterval", BranchOffTime: "OffTime" };
    public static readonly CalendarDefaultViewOptions: string[] = ["day", "week", "month"];
    public static readonly ServiceCleanupTimeText: string = "  (including cleanup time)";
    public static readonly ServiceEndTimeText: string = ", ends on "
    public static readonly BlockTimeBackgroundColor: string = "#D9D9D9";
    public static readonly BlockTimeTextColor = "#333";
    private SchedulerStaticStrings = {
        DateSerializationoFormat: "dateSerializationFormat", DataSource: "dataSource", Resources: "resources", CurrentDate: "currentDate", CurrentView: "currentView",
        Day: "day", TimeLineDay: "timelineDay", Week: "week", TimeLineWeek: "timelineWeek", Month: "month", TimeLineMonth: "timelineMonth", Views: "views", Height: "height", SelectedCellData: "selectedCellData", Editing: "editing",
        CapsDay: "Day", CapsWeek: "Week", CapsMonth: "Month",
        RecurrenceRule: "RecurrenceRule", AllDay: "AllDay", StaffBlockTimeID: "StaffBlockTimeID", ItemDurationNote: "itemDurationNote", DateTimeCompareError: "DateTimeCompareError",
        TotalPrice: "totalPrice", EditNotes: "editNotes", Block: "Block", ServiceStartTime: "ServiceStartTime", ServiceEndTime: "ServiceEndTime", Hours: "hours", Minutes: "minutes",
        IsPaidService: "IsPaidService", IsCompletedService: "IsCompletedService", SelectedForCheckout: "SelectedForCheckout", ShowDeleteButton: "ShowDeleteButton", OldServiceID: "OldServiceID"
    };
    public get GetSchedulerStaticString() {
        return this.SchedulerStaticStrings;
    }
}

export class MembershipBenefitTypeName {
    public static readonly Class: string = "Class";
    public static readonly Service: string = "Service";
    public static readonly Product: string = "Product";
}

export class MembershipBenefitTypesName {
    public static readonly Classes: string = "Classes";
    public static readonly Services: string = "Services";
    public static readonly Products: string = "Products";
}

export const SocialMediaLinks = {
    Facebook: "https://www.facebook.com/",
    Twitter: "https://twitter.com/",
    LinkedIn: "https://www.linkedin.com/",
    Youtube: "https://www.youtube.com/",
    Instagram: "https://www.instagram.com/",
}

export const SaleArea = {
    Class: "Class",
    Service: "Service",
    POS: "POS",
    Widget: "Widget",
    Waitlist: "WaitList"
}

export const ClassStatusName = {
    BuyNow: "Buy Now",
    Timeout: "Timeout",
    Full: "Full",
    Open: "Active",
    BookingNotStarted: "Booking not yet started"
}

export const MembershipTypeName = {
    TimeBased: "Time Based",
    TimeAndSessionBased: "Time And Session Based",
    ClassBased: "Class Based",
    ClassAndSessionBased: "Class And Session Based"
}


export const DiscountType = {
    MembershipBenefit: "Membership Benefit",
    POSDiscount: "Line Item Discount"
}



export const CustomerTypeName = {
    Client: "Client",
    Lead: "Lead",
    Member: "Member"
}

export class StaffNotificationsStatus {
    public static readonly StaffNotification: any[] = [{ value: null, text: "All" }, { value: 1, text: "Marked As Read For Me" }, { value: 2, text: "Marked As Read For EveryOne" }, { value: 3, text: "Unread" }];
}

export class SEPACountyAccountDetail {
    public static readonly SEPACountryAccountDetail: SEPACountryAccountDetail[] = [
        {
            CountryCode: "AUD",
            AccountCodeMax: 10,
            BankCodeMax: null,
            BranchCodeMax: 7,
            CheckMax: null
        },
        {
            CountryCode: "AT",
            AccountCodeMax: 11,
            BankCodeMax: 5,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "BE",
            AccountCodeMax: 14,
            BankCodeMax: null,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "CY",
            AccountCodeMax: 16,
            BankCodeMax: 3,
            BranchCodeMax: 5,
            CheckMax: null
        }, {
            CountryCode: "EE",
            AccountCodeMax: 14,
            BankCodeMax: null,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "FR",
            AccountCodeMax: 11,
            BankCodeMax: 5,
            BranchCodeMax: 5,
            CheckMax: 2
        }, {
            CountryCode: "DE",
            AccountCodeMax: 10,
            BankCodeMax: 8,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "IE",
            AccountCodeMax: 8,
            BankCodeMax: null,
            BranchCodeMax: 8,
            CheckMax: null
        }, {
            CountryCode: "IT",
            AccountCodeMax: 50,
            BankCodeMax: 5,
            BranchCodeMax: 5,
            CheckMax: null
        }, {
            CountryCode: "LV",
            AccountCodeMax: 13,
            BankCodeMax: 4,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "LU",
            AccountCodeMax: 13,
            BankCodeMax: 3,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "MT",
            AccountCodeMax: 50,
            BankCodeMax: null,
            BranchCodeMax: 5,
            CheckMax: null
        }, {
            CountryCode: "MC",
            AccountCodeMax: 11,
            BankCodeMax: 5,
            BranchCodeMax: 5,
            CheckMax: 2
        }, {
            CountryCode: "NL",
            AccountCodeMax: 10,
            BankCodeMax: 4,
            BranchCodeMax: null,
            CheckMax: null
        }, {
            CountryCode: "PT",
            AccountCodeMax: 11,
            BankCodeMax: 4,
            BranchCodeMax: 4,
            CheckMax: 2
        },
        {
            CountryCode: "SM",
            AccountCodeMax: 50,
            BankCodeMax: 5,
            BranchCodeMax: 5,
            CheckMax: null
        },

        {
            CountryCode: "SI",
            AccountCodeMax: 50,
            BankCodeMax: 5,
            BranchCodeMax: null,
            CheckMax: null
        },
        {
            CountryCode: "ES",
            AccountCodeMax: 10,
            BankCodeMax: 4,
            BranchCodeMax: 4,
            CheckMax: 2
        },
        {
            CountryCode: "FI",
            AccountCodeMax: 50,
            BankCodeMax: 6,
            BranchCodeMax: null,
            CheckMax: null
        },
        {
            CountryCode: "GR",
            AccountCodeMax: 16,
            BankCodeMax: 3,
            BranchCodeMax: 5,
            CheckMax: null
        },
        {
            CountryCode: "LT",
            AccountCodeMax: 11,
            BankCodeMax: 5,
            BranchCodeMax: null,
            CheckMax: null
        },
        {
            CountryCode: "SK",
            AccountCodeMax: 8,
            BankCodeMax: 4,
            BranchCodeMax: null,
            CheckMax: null
        },
        {
            CountryCode: "AS",
            AccountCodeMax: 9,
            BankCodeMax: null,
            BranchCodeMax: 7,
            CheckMax: null
        },
        {
            CountryCode: "USD",
            AccountCodeMax: 10,
            BankCodeMax: 9,
            BranchCodeMax: null,
            CheckMax: null
        },
        {
            CountryCode: "DE",
            AccountCodeMax: 10,
            BankCodeMax: 9,
            BranchCodeMax: null,
            CheckMax: null
        }
    ]
}


export class SEPACountyAccountDigitBeforeDash {
    public static readonly SEPACountryDigitAfterDashDetail: SEPADashDigit[] = [
        {
            CountryCode: "AUD",
            DashAfterDigit: [
                {
                    AccountCodeDigit: null,
                    BranchCodeDigit: 3,
                    AccountCheckDigit: null,
                    SpaceRequired: false
                }
            ]
        },
        {
            CountryCode: "BE",
            DashAfterDigit: [
                {
                    AccountCodeDigit: 3,
                    BranchCodeDigit: null,
                    AccountCheckDigit: null,
                    SpaceRequired: false
                },
                {
                    AccountCodeDigit: 11,
                    BranchCodeDigit: null,
                    AccountCheckDigit: null,
                    SpaceRequired: false
                }
            ]
        },

        {
            CountryCode: "FR",
            DashAfterDigit: [
                {
                    AccountCodeDigit: 11,
                    BranchCodeDigit: null,
                    AccountCheckDigit: null,
                    SpaceRequired: true
                }
            ]
        },
        {
            CountryCode: "IE",
            DashAfterDigit: [
                {
                    AccountCodeDigit: null,
                    BranchCodeDigit: 2,
                    AccountCheckDigit: null,
                    SpaceRequired: true
                },
                {
                    AccountCodeDigit: null,
                    BranchCodeDigit: 5,
                    AccountCheckDigit: null,
                    SpaceRequired: true
                }
            ]
        }

    ]
}

import { months } from "moment"

export enum ENU_LoginState {
    StaffLogin = 1,
    ChooseAccount = 2,
    WelcomeStaff = 3
}
export enum ENU_Reward_Action_Progress {
    Delete = 1,
    Revert = 2,
    Terminated = 3,
}

export enum ENU_ActivityType {
    All = null,
    Note = 1,
    Task = 2,
    Call = 3,
    Appointment = 4,
    Email = 5,
    SMS = 6,
    MemberMessage = 7,
    Achievement = 8,
    AppNotification = 9,
    GroupSMS = 100,
    GroupEmail = 101,
    GroupPushNotification = 102,
}

export enum ENU_ActivitySubType {
    Outgoing = 1,
    Incoming = 2,
    Now = 3,
    Scheduled = 4
}

export enum StatusType {
    Pending = 1,
    InProgress = 2,
    Completed = 3
}

export enum Module {
    Company = 101,
    Staff = 201,
    Member = 401
}

export enum ENU_ModuleList {
    Setup = 1,
    Staff = 2,
    Client = 3,
    Lead = 4,
    Member = 5,
    PointOfSale = 6,
    Scheduler = 7
}

export enum TemplateType {
    Email = 1,
    SMS = 2,
    Notification = 3,
}
export enum ENU_EnterPriseUrlType {
    Branch = 1,
    Setup = 2,
    Staff = 3,
    Customer = 4,
    Product = 5,
    Setup_Tax = 6
}
export enum LeadStatusType {
    Fresh = 1,
    PerposalMade = 2,
    MeetingArranged = 3,
    PerposalSend = 4,
    FinalMeeting = 5,
    Lost = 6,
    Sale = 7
}

export enum LeadStatusTypesNew {
    Enquiry = 1,
    NewLead = 2,
    MeetingArranged = 3,
    PerposalSend = 4,
    FinalMeeting = 5,
    Lost = 6,
    Won = 7
}
export enum LeadFlowStatusTypes {
    Enquiry = 1,
    NewLead = 2,
    Lost = 3,
    Won = 4,
    FinalMeeting = 5
}

export enum ActivityOutcomeType {
    Client_SpokeTo = 1,
    Client_LeftMessage = 2,
    Client_NoAnswer = 3,

    Lead_SpokeTo = 4,
    Lead_LeftMessage = 5,
    Lead_NoAnswer = 6,

    Lead_Apt_Tour = 7,
    Lead_Apt_Sale = 8,
    Lead_Apt_Lost = 9,
    Lead_Apt_Trial = 10,

    Member_SpokeTo = 11,
    Member_LeftMessage = 12,
    Member_NoAnswer = 13
}

export enum WhatNextType {
    Client_Call = 1,
    Client_Appointment = 2,
    Client_NoFurtherAction = 3,

    Client_Apt_Call = 4,
    Client_Apt_Appointment = 5,
    Client_Apt_NoFurtherAction = 6,

    Lead_Call = 7,
    Lead_Appointment = 8,
    Lead_Sale = 9,
    Lead_Lost = 10,
    Lead_NoFurtherAction = 11,

    Lead_Apt_Call = 12,
    Lead_Apt_Appointment = 13,
    Lead_Apt_NoFurtherAction = 14,

    Member_Call = 15,
    Member_Appointment = 16,
    Member_NoFurtherAction = 17,

    Member_Apt_Call = 18,
    Member_Apt_Appointment = 19,
    Member_Apt_NoFurtherAction = 20
}

export enum WeekDays {
    // Monday = 0,
    // Tuesday = 1,
    // Wednesday = 2,
    // Thursday = 3,
    // Friday = 4,
    // Saturday = 5,
    // Sunday = 6,
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export enum SchedulerWeekDays {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export enum MembershipPaymentType {
    Single = 1,
    Recurring = 2
}

export enum WizardStep {
    Details = 0,
    Membership = 1,
    Payments = 2,
    PaymentMethod = 3
}

export enum InvoiceStatusTypeName {
    Free = 1,
    Paid = 2,
    PartiallyPaid = 3,
    Unpaid = 4
}

export enum Gender {
    Male = 1,
    Female = 2
}

export enum POSItemType {
    Class = 1,
    Service = 2,
    //discussed with faisal (now we are using 9 instead of 3 in product case)
    Product = 9,
    Membership = 6
}

export enum POSProductEnum {
  ProductVariant = 9,
  Product = 3,
}
export enum PeriodIntervals {
    year, quarter, month, week, day, hour, minute, second
}

export enum enmSchedulerActvityType {
    class = 1,
    task = 2,
    call = 3,
    appointment = 4,
    service = 5,
    blockTime = 6
}

export enum ClassStatus {
    Cancelled = 2
}

export enum SchedulerType {

    ActivitiesScheduler = 1,
    ShiftAttendenceScheduler = 2

}

export enum ENU_MemberShipItemTypeName {
    Class = 7,
    Service = 2,
    Product = 3,
    ProductVariant = 9
}

export enum ENU_CustomFormItemType {
    Class = 7,
    Service = 8,
    Product = 3,
    MemberShip = 4
}

export enum ENU_FormType {
    Signup = 1,
    CustomerPurchase = 2,
    RequestForm = 3,
}

export enum ENU_BannerType {
    Home = 1,
    Membership = 2,
    Promotional = 3,
    Class = 4,
    Service = 5,
    Product = 6,
    Checkout = 7,
    Event = 8,
    Package =9
}

export enum ENU_LandingPage {
    Home = 1,
    Memberships = 2,
    Classes = 3,
    Services = 4,
    Products = 5,
    Events = 6,
    Packages = 7,
}

export enum FileType {
    PDF = 1,
    Excel = 2,
    CSV = 3,
    View = 4
}

export enum EnquirySourceType {
    OrganicSearch = 1,
    EmailMarketing = 2,
    DigitalAdvertising = 3,
    Website = 4,
    OtherSocialMediaPlatforms = 5,
    Referral = 6,
    Leaflets = 7,
    WalkIn = 8,
    Newspaper = 9,
    Magazine = 10,
    Signage = 11,
    Facebook = 12,
    Instagram = 13,
    Twitter = 14,
    WellyxCore = 15,
    WellyxWidget = 16,
    WellyxCustomerApp = 17,
    WellyxStaffApp = 18
}

export enum WizardforRewardProgram {
    RewardProgram = 0,
    RewardPurchases = 1,
    RewardActvities = 2,
}


export enum WizardforSetupMembership {
    Contract = 0,
    MembershipType = 1,
    Branches = 2,
    Classes = 3,
    Services = 4,
    Products = 5,
}

export enum EnumSaleType {
    Cash = 1,
    Card = 2,
    DirectDebit = 3,
    Other = 4,
    StripeDirectDebit = 5,
    Pending = 6,
    CardAndDirectDebit = 7,
    StripeTerminal = 8,
    RewardPoint = 9,
    CardPM = 11
}

export enum EnumSaleStatusType {
    WaitList = 0,
    Free = 1,
    Paid = 2,
    Refund = 3,
    Unpaid = 4,
    Cancelled = 5,
    WrittenOff = 6,
    PartialPaid = 7,
    OverPaid = 8
}

export enum EnumSalePaymentStatusType {
    PaidOut = 8,
    PMTRefund = 13,
}

export enum EnumSaleTermsType {
    SelectTerm = null,
    OverDue = 0,
    Next7Days = 7,
    Next14Days = 14,
    Next30Days = 30,
}

export enum EnumSchedulerFavouriteViewTypeID {
    Grouping = 1,
    Position = 2,
    Staff = 3,
    Activity = 4,
    Facility = 5,
}

export enum EnumSaleTermsOption {
    SelectTerm = " Select Term",
    OverDue = "Over Due",
    Next7Days = "Due in Next 7 Days",
    Next14Days = "Due in Next 14 Days",
    Next30Days = "Due in Next 30 Days",
}

export enum EnumSaleCurrentStatusType {
    AllExceptVoidedAndWrittenOff = 101,
    Closed = 100,
    PartiallyPaid = 99,
    WrittenOff = 6,
    Voided = 5,
    Unpaid = 4,
    Refund = 3
}

export enum EnumBookingStatusType {
    Booked = 1,
    Cancelled = 2,
    Attended = 3,
    NoShow = 4
}

export enum EnumServiceBookingStatusOptions {
    Booked = "Booked",
    Cancelled = "Cancelled",
    Completed = "Completed",
    NoShow = "No Show",
    NotConfirmed = "Not Confirmed",
    Confirmed = "Confirmed",
    CheckedInByStaff = "Checked-In by Staff",
    ReadyToStart = "Ready to Start",
    InProgress = "In Progress"
}

export enum EnumServiceBookingStatusType {
    Booked = 1,
    Cancelled = 2,
    Completed = 3,
    NoShow = 4,
    NotConfirmed = 5,
    Confirmed = 6,
    CheckedInByStaff = 7,
    ReadyToStart = 8,
    InProgress = 9
}

export enum EnumNetSaleSourceType {
    Core = 1,
    Widget = 2,
    StaffApp = 3,
    CustomerApp = 4
}

export enum EnumSaleSourceType {
    OnSite = 1, //core
    Shop = 2,
    App = 3,
    WellyxShop = 4,
    EnterPrise = 7
}


export enum EnumActivityLogType {
    Invoice = 1,
    MemberPayment = 2,
    Waitlist = 3,
    MemberShip = 4
}

export enum EnumSaleDetailType {
    InvoiceDetail = 1,
    RefundDetail = 2,
}

export enum CalculatorValue {
    Zero = 0,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9
}

export enum WizardforCompanySetup {
    CompanyInfo = 0,
    BranchInfo = 1,
    SoftwareAdminInfo = 2,
    ModuleSetup = 3,
    PaymentSetup = 4
}

export enum PersonType {
    Staff = 1,
    Customer = 2
}

export enum CustomerType {
    All = 0,
    Client = 1,
    Lead = 2,
    Member = 3,
    Customer = 4
}
export enum ReportCustomerType {
    ClientMember = 0,
    Client = 1,
    Lead = 2,
    Member = 3,
    Customer = 4
}

export enum AddressType {
    HomeAddress = 1,
    BillingAddress = 2,
    ShippingAddress = 3
}

export enum MembershipStatus_Enum {
    Active = 1,
    Frozen = 2,
    Terminated = 3,
    Expired = 4
}

export enum CustomerMobileApplication_Enum {
    Android = 'Android',
    iOS = 'iOS'
}

export enum CustomerApplication_Enum {
    Android = 1,
    iOS = 2,
}
export enum FileFormatType {
    Pdf = 1,
    Excel = 2
}

export enum EnumPriorityType {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

export enum ReportViewType {
    pdf = 1,
    view = 2,
}


export enum ReportTab {
    Sale = 0,
    Client = 1,
    Lead = 2,
    Member = 3,

}

export enum EnumMemberPayment {
    Scheduler = 0,
    Paid = 1,
    Overdue = 2

}

export enum EnumMemberDashboardSaleType {
    Membership = 1,
    Product = 2,
    Service = 3,
    Class = 4
}

export enum ReportName {
    AllInvoicesHistory = "All Invoices History",
    AllSale = "All Sales",
    AllCashSale = "All Cash Other Sales",
    AllClient = "All Client",
    AllStaff = "All Staff",
    SaleByCategory = "Sale By Category",
    AllSaleSummary = "All Sale Summary",
    SaleSummaryByCategory = "Sale Summary By Category",
    SaleByProduct = "Sales By Product",
    SaleByService = "Sales By Service",
    SaleByClass = "Sales By Class",
    SaleByStaff = "Sales By Staff",
    AllStaffTips = "Staff Tips",
    AllRedeem = "Membership Benefits Redemption",
    DailyRefunds = "Daily Refunds",
    SalesBreakDown = "Sales Breakdown",
    PaymentBreakDown = "Payment Breakdown",
    PaymentsSummary = "Payment Summary",
    ClientActivities = "Client Activities",
    StaffActivities = "Staff Activities",
    StaffClockTime = "Staff Shifts & Clock In / Out Time",
    ScheduleAtGlance = "Schedule At Glance",
    MailingList = "Mailing List",
    FirstVisit = "First Visit",
    TodayCustomerActivity = "Today Customer Activities",
    StaffTask = "Staff Task",
    AllLead = "All Leads",
    LeadActivties = "Lead Activties",
    AllLeadBySource = "Lead By Source",
    LeadLost = "Lead Lost",
    AllLeadSourceWithStatus = "All Lead Source With Status",
    ClientDetail = "Client Detail",
    AllMembers = "All Members",
    SaleInvoice = "Customer Sale Invoice",
    MemberActivties = "Member Activities",
    MemberMemberships = "Member Memberships",
    MembershipPayments = "Member Membership Payments",
    MemberBySourceType = "Member By Source Type",
    MembershipsStatus = "Memberships Status",
    RefferedByMember = "Customer Referrals",
    StaffWiseActivities = "Staff Activities",
    memberClassAttendance = "Class Attendance",
    StaffDetails = "Staff Details",
    AllCustomers = "All Customers",
    CustomerActivities = "Customer Activities",
    CustomerBySourceType = "Customer By Source Type",
    CustomerDetail = "Customer Detail",
    MembersMembershipContract = "Member's Membership Contract",
    CustomerClockInReport = 'Customer Check-In',
    ZeroVisitsReport = 'Zero Visits',
    ServiceBookings = 'Service Bookings',
    CurrentStock = 'Current Stock',
    InventoryChangeLog = 'Inventory Change Log',
    AllSalesDetailByLead = 'All Sales Detail By Lead',
    AllSalesDetailByCustomer = 'All Sales Detail By Customer',
    AllPaymentAndRefundHistory = 'All Payment & Refund History',
    RewardProgramSummary = 'Reward Program Summary',
    DailySalesSummaryBySource= 'Daily Sales Summary by Source',
    SalesSummaryByItemType = 'Sales Summary by Item Type',
    CashOtherSales = 'Cash/Other Sales',
    ExpiredAndTerminatedMemberships = 'Expired & Terminated Memberships'
}

export enum ENU_Package {

    WellnessBasic = 1,  // Engage
    WellnessMedium = 2, // Expand
    WellnessTop = 3,    // Excel

    FitnessBasic = 4,   // Engage
    FitnessMedium = 5,  // Excel

    Full = 6    // Wellness and Fitness Exceed
}

export enum ENU_DurationType {
    Days = 9,
    Hours = 10,
    Minutes = 11,
    Weeks = 12
}

export enum ClassStatus {
    BuyNow = 1,
    Timeout = 2,
    Full = 3,
    BookingNotStarted = 4
}

export enum MembershipType {
    TimeBased = 1,
    TimeAndSessionBased = 2,
    ClassBased = 3,
    ClassAndSessionBased = 4
}

export enum MembershipDurationType {
    Days = 1,
    Weeks = 2,
    FortnightBiweek = 17,
    Months = 3,
    Quarter = 4,
    SixMonth = 16,
}

export enum MembershipBenefitType {
    DoorCheckedInBenefits = 1,
    Classes = 2,
    Services = 3,
    Products = 4
}

export enum ENU_MembershipPaymetType {
    Single = 1,
    Recurring = 2
}

export enum ENU_MembershipAlertMessageRestrictionType {
    TimeValidation = 1,
    InactiveMembership = 2,
    PaymentFailed = 3,
    SessionCompleted = 4,
    MembershipTimeNotFoundForToday = 5,
    MembershipClassNotBookedForToday = 6,
    MembershipIsFrozeen = 7,
    MembershipPaymentMissing = 8,
    MembershipNotStartedYet = 9,
    NoDoorCheckInSessionsLeft = 10,
    NoClassCheckInSessionsLeft = 11
}

export enum ENU_PaymentGateway {
    Cash = 1,
    Stripe_Card = 2,
    GoCardless = 3,
    PaySafe = 4,
    Stripe_DD = 5,
    PayTabs = 6,
    Other = 7,
    RewardPoints = 8
    //Stripe_ACH = 6
}

// page ids
export enum ENU_Page {
    AddGateWay = 1,
    MemberMemberhipPayment = 2,
    TransactionPayment = 3,
    SaveMembership = 4,
    SavePartialPayment = 5,
    PosPayment = 6
}

export enum ENU_MemberShipBenefitDurations {
    Day = 1,
    Week = 2,
    FortnightBiweek = 17,
    Month = 3,
    Quarter = 4,
    FourWeek = 5,
    SixMonth = 16,
    Year = 18,
    Membership = 12 //Contract
}
export enum RewardProgramPurchasesType {
    Class = 7,
    Service = 8,
    Product = 3,
    Membership = 4,
    Forms = 9,
}
export enum EarnedRuleItemType {
    BenefittedEarnedPoints = 1,
    LeadEarnedPoints = 2,
    ClientEarnedPoints = 3,
    MemberEarnedPoints = 4,
    AmountSpent = 5,
}
export enum RewardProgramActivityType {
    CustomerBirthday = 1,
    RewardProgramOptIn = 2,
    WidgetAndAppBookings = 3,
    Referrals = 4,
    NewCustomer = 5,
    MemberCheckIn = 6,
    ClassPresent = 7,
    ServiceCompleted = 8,
    Forms = 9,
}
export enum ENU_PaymentStatus {
    Unpaid = 1,
    Freeze = 2,
    Cancelled = 3,
    Failed = 4,
    PendingBankSubmission = 5,
    Submitted = 6,
    Confirmed = 7,
    PaidOut = 8,
    PendingGatewaySubmission = 9,
    PendingAuthorization = 11,
    Refunded = 13
}

export enum ENU_SchedulerActivityType {
    Class = 1,
    Task = 2,
    Call = 3,
    Appointment = 4,
    Service = 5,
    BlockTime = 6,
    ShiftInterval = 7,
    OffTime = 8
}

export enum ENU_TaskMarkAsDone {
    Completed = 'Completed'
}

export enum ENU_ClockinRestrictionType {

    TimeValidation = 1,
    InactiveMembership = 2,
    PaymentFailed = 3,
    SessionCompleted = 4,
    MembershipTodayTime = 5,
    MembershipTodayClass = 6,
    MembershipFrozeen = 7,
    MembershipPaymentMissing = 8,
    MembershipNotStartedYet = 9
}

export enum ENU_BranchQuestionLength {

    BranchQuestionLength = 25
}

export enum ENU_MemberAttendanceRedirect {

    Dashboard = 1,
    AttendanceTerminal = 2
}

export enum ENU_WaitList {

    ManageManually = 1,
    TopPrice = 2,
    ManageSequentially = 3,
    AlertAll = 4,
    WaitListClass = 5,
    WaitListService = 6,
    Class = 7,
    Service = 8
}

export enum EnumDayType {
    Sunday = 1,
    Monday = 2,
    Tuesday = 3,
    Wednesday = 4,
    Thursday = 5,
    Friday = 6,
    Saturday = 7
}


export enum EnumDayOptions {
    Sunday = "Sunday",
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
}



export enum ENU_CancelMembershipReasons {

    ReasonNotGiven = 1,
    Relocation = 2,
    DissatisfiedFcilitiesServices = 3,
    RedundancyCantAfford = 4,
    MedicalPregnancy = 5,
    NotUsingEnough = 6,
    LackofTimeMotivation = 7,
    TransferredMembership = 8,
    DuplicateMembership = 9,
    CancelWithinCoolingPeriod = 10,
    BlacklistPreviousDebt = 11,
    Others = 12
}

export enum ENU_PartialPaymentName {
    Paid = "Paid",
    PartialPayment = "Partial Payment",
    OtherReason = "Other"
}

export enum ENU_HomeRedirect {
    Today = 1,
    Dashboard = 2,
    Notification = 3
}

export enum ENU_EventCategoryType {
    Class = 1,
    Service = 2,
    Lead = 3,
    Membership = 4,
    Shift = 5,
    CustomerActivities = 8,
    StaffActivities = 9,
    MembershipIsNearToExpiry = 17,
    MembershipIsSold = 20
}

export enum ENU_AudienceType {
    Customer = 1,
    RelatedStaff = 2,
    StaffPosition = 3
}

export enum ENU_CommunicationType {
    Email = 1,
    SMS = 2,
    Notification = 3
}
export enum ENU_AutomationDurationType {
    Minutes = 15,
    Hours = 14,
    Days = 13
}

export enum ENU_ReaderStatus {
    Connected = "connected",
    Not_connected = "not_connected",
    Connecting = "connecting"
}

export enum ENU_NotificationTriggerCategory {
    Class = 1,
    Service = 2,
    Lead = 3,
    Membership = 4,
    Shift = 5,
    CustomerActivity = 8,
    StaffActivity = 9,
}

export enum ENU_NotificationTrigger {
    PaymentFailed = 6,
    NewLead = 8,
    LeadAssigned = 9,
    CustomerIncomingEmail = 13,
    CustomerIncomingSMS = 14,
    StaffIncomingEmail = 15,
    StaffIncomingSMS = 16,
    MembershipExpiry = 17,
    MembershipIsSold = 20,

    BookedFromClassWaitlist = 29,
    BookedFromServiceWaitlist = 30,

    ServiceBookingIsCancelled = 33,
    ClassBookingIsCancelled = 34,

    ServiceCheckedInByCustomer = 35,
    ClassCheckedInByCustomer = 36
}

export enum ENU_CurrencyFormat {
    USA = "USD",
}

export enum ENU_CountryCodeStripeTerminal {
    USA = "US",
    UK = "GB",
    IRE = "IE",
    AE = "AE"
}

export enum ENU_CountryFormat {
    Default = 0,
    UK = 1,
    US = 2,
    CH = 3,
}

export enum ENU_DatePickerFormat {
    Default = "DD/MM/yyyy",
    UK = "DD/MM/yyyy",
    US = "MM/DD/yyyy",
    CH = "yyyy/MM/DD",
}

export enum ENU_PaymentAccount {
    Default = 8,
    AUD = 9
}

export enum ENU_SEPACountryCode {
    Default = 30,
    AUD = "AUD",
    AT = "AT",
    BE = "BE",
    CY = "CY",
    EE = "EE",
    FR = "FR",
    DE = "DE",
    IE = "IE",
    LV = "LV",
    LU = "LU",
    MC = "MC",
    PT = "PT",
    ES = "ES",
    GR = "GR",
    LT = "LT",
    SK = "SK",
    IT = "IT",
    MT = "MT",
    SM = "SM",
    SI = "SI",
    FI = "FI",
    NL = "NL",
    US = "USD",
    EUR = "EUR"

}

export enum ENU_SEPACountryScheme {
    bacs = "bacs",
    sepa_core = "sepa_core",
    ach = "ach",
    becs = "becs"
}
export enum ENU_PaymentSortCode {
    Default = 6,
    AUD = 7
}

export enum ENU_MemberhsipBenefit {
    Active = 1,
    Consumed = 2,
    Frozen = 3,
    Terminated = 4
}

export enum ENU_MemberhsipBenefitType {
    Active = "Active",
    Consumed = "Consumed",
    Frozen = "Frozen",
    Terminated = "Terminated"
}

export enum ENU_DateFormat {
    UKDateFormat = "d MMM, yyyy", // for day first
    USDateFormat = "MMM d, yyyy", // for month first
    CHDateFormat = "yyyy MMM d", // for year first
    UKLongDateFormat = "EEE, d MMM, yyyy",
    USLongDateFormat = "EEE, MMM d, yyyy",
    CHLongDateFormat = "EEE, yyyy MMM d",
    UKSchedulerTooltipDateFormat = "dd/MM/yy",
    USSchedulerTooltipDateFormat = "MM/dd/yy",
    CHSchedulerTooltipDateFormat = "yy/MM/dd",
    UKExceptionDateFormat = "dd-MM-y",
    USExceptionDateFormat = "MM-dd-y",
    CHExceptionDateFormat = "y-MM-dd",
    UKSchedulerDateFormatDayView = "EEEE, d MMMM y",
    USSchedulerDateFormatDayView = "EEEE, MMMM d y",
    CHSchedulerDateFormatDayView = "EEEE, y MMMM d",
    UKSchedulerDateFormatWeekViewTo = "EEEE d MMMM y",
    USSchedulerDateFormatWeekViewTo = "EEEE MMMM d y",
    CHSchedulerDateFormatWeekViewTo = "EEEE y MMMM d",
    UKSchedulerRRuleUntilDateFormat = "dd/MM/yyyy",
    USSchedulerRRuleUntilDateFormat = "MM/dd/yyyy",
    CHSchedulerRRuleUntilDateFormat = "yyyy/MM/dd",
    UKDateFormatForSave = "d MMMM, y",
    USDateFormatForSave = "MMMM d, y",
    CHDateFormatForSave = "y MMMM d",
    UKDateTimeFormat = "EEEE, d MMMM, y HH:mm",
    USDateTimeFormat = "EEEE, MMMM d, y HH:mm",
    CHDateTimeFormat = "EEEE, y MMMM d HH:mm",
    UKNotficationDateTimeFormat = "dd/MM/yyyy  HH:mm",
    USNotficationDateTimeFormat = "MM/dd/yyyy  HH:mm",
    CHNotficationDateTimeFormat = "yyyy/MM/dd  HH:mm",
    UKReceiptDateFormat = "dd/MM/yy",
    USReceiptDateFormat = "MM/dd/yy",
    CHReceiptDateFormat = "yy/MM/dd",
    UKRecurrenceExceptionDateFormat = "yyyyMMdd",
    USRecurrenceExceptionDateFormat = "yyyyMMdd",
    CHRecurrenceExceptionDateFormat = "yyyyMMdd",
    UKDashboardDateFormat = "yyyy-MM-dd",
    USDashboardDateFormat = "yyyy-dd-MM",
    CHDashboardDateFormat = "yyyy-dd-MM",
    UKSchedulerStaffShiftToolTipDateFormat = "d MMM",
    USSchedulerStaffShiftToolTipDateFormat = "MMM d",
    CHSchedulerStaffShiftToolTipDateFormat = "MMM d",
    UKDateFormatforBooked = 'EEE d MMM y',
    USDateFormatforBooked = 'EEE MMM d y',
    CHDateFormatforBooked = 'EEE y MMM d',
    UKAttendnaceformat = 'YYYY-MM-DD HH:mm',
    USAttendnaceformat = 'YYYY-DD-MM HH:mm',
    CHAttendnaceformat = 'YYYY-MM-DD HH:mm',
    UKDashBoardLastVisitDateFormat = 'dd/MM/yyyy HH:mm',
    USDashBoardLastVisitDateFormat = 'MM/dd/yyyy HH:mm',
    CHDashBoardLastVisitDateFormat = 'yyyy/MM/dd HH:mm',
    UKClockTimeDateFormat = 'EEEE dd MMMM',
    USClockTimeDateFormat = 'EEEE MMMM dd',
    CHClockTimeDateFormat = 'EEEE MMMM dd',
    UKShiftForeCastDateFormat = 'dd-MMMM',
    USShiftForeCastDateFormat = 'MMMM-dd',
    CHShiftForeCastDateFormat = 'MMMM-dd',
    UKDateFormatforReturingClient = 'd MMM y',
    USDateFormatforReturingClient = 'MMM d y',
    CHDateFormatforReturingClient = 'y MMM d',

}

export enum ENU_DateFormatName {
    DateFormat = "DateFormat",
    LongDateFormat = "LongDateFormat",
    SchedulerTooltipDateFormat = "SchedulerTooltipDateFormat",
    ExceptionDateFormat = "ExceptionDateFormat",
    SchedulerDateFormatDayView = "SchedulerDateFormatDayView",
    SchedulerDateFormatWeekViewTo = "SchedulerDateFormatWeekViewTo",
    SchedulerRRuleUntilDateFormat = "SchedulerRRuleUntilDateFormat",
    DateFormatForSave = "DateFormatForSave",
    DateTimeFormat = "DateTimeFormat",
    NotficationDateTimeFormat = "NotficationDateTimeFormat",
    ReceiptDateFormat = "ReceiptDateFormat",
    RecurrenceExceptionDateFormat = "RecurrenceExceptionDateFormat",
    DashboardDateFormat = "DashboardDateFormat",
    SchedulerStaffShiftToolTipDateFormat = "SchedulerStaffShiftToolTipDateFormat",
    DateFormatforBooked = 'DateFormatforBooked',
    Attendnaceformat = 'Attendnaceformat',
    DashBoardLastVisitDateFormat = 'DashBoardLastVisitDateFormat',
    ClockTimeDateFormat = 'ClockTimeDateFormat',
    ShiftForeCastDateFormat = 'ShiftForeCastDateFormat',
    DateFormatforReturingClient = 'DateFormatforReturingClient',
}

export enum ENU_RefundType {
    FlatAmountRefund = 1,
    LineItemRefund = 2,
}

export enum ENU_CountryBaseDateFormatName {
    //format for day, month and year
    UKDateFormat = "UKDateFormat",
    UKSchedulerTooltipDateFormat = "UKSchedulerTooltipDateFormat",
    UKExceptionDateFormat = "UKExceptionDateFormat",
    UKSchedulerDateFormatDayView = "UKSchedulerDateFormatDayView",
    UKSchedulerDateFormatWeekViewTo = "UKSchedulerDateFormatWeekViewTo",
    UKSchedulerRRuleUntilDateFormat = "UKSchedulerRRuleUntilDateFormat",
    UKDateFormatForSave = "UKDateFormatForSave",
    UKDateTimeFormat = "UKDateTimeFormat",
    UKNotficationDateTimeFormat = "UKNotficationDateTimeFormat",
    UKReceiptDateFormat = "UKReceiptDateFormat",
    UKRecurrenceExceptionDateFormat = "UKRecurrenceExceptionDateFormat",
    UKDashboardDateFormat = "UKDashboardDateFormat",
    UKSchedulerStaffShiftToolTipDateFormat = "UKSchedulerStaffShiftToolTipDateFormat",
    UKDateFormatforBooked = 'UKDateFormatforBooked',
    UKAttendnaceformat = 'UKAttendnaceformat',
    UKDashBoardLastVisitDateFormat = 'UKDashBoardLastVisitDateFormat',
    UKClockTimeDateFormat = 'UKClockTimeDateFormat',
    UKShiftForeCastDateFormat = 'UKShiftForeCastDateFormat',
    UKDateFormatforReturingClient = 'UKDateFormatforReturingClient',

    //format for month, day and year
    USDateFormat = "USDateFormat",
    USSchedulerTooltipDateFormat = "USSchedulerTooltipDateFormat",
    USExceptionDateFormat = "USExceptionDateFormat",
    USSchedulerDateFormatDayView = "USSchedulerDateFormatDayView",
    USSchedulerDateFormatWeekViewTo = "USSchedulerDateFormatWeekViewTo",
    USSchedulerRRuleUntilDateFormat = "USSchedulerRRuleUntilDateFormat",
    USDateFormatForSave = "USDateFormatForSave",
    USDateTimeFormat = "USDateTimeFormat",
    USNotficationDateTimeFormat = "USNotficationDateTimeFormat",
    USReceiptDateFormat = "USReceiptDateFormat",
    USRecurrenceExceptionDateFormat = "USRecurrenceExceptionDateFormat",
    USDashboardDateFormat = "USDashboardDateFormat",
    USSchedulerStaffShiftToolTipDateFormat = "USSchedulerStaffShiftToolTipDateFormat",
    USDateFormatforBooked = 'USDateFormatforBooked',
    USAttendnaceformat = 'USAttendnaceformat',
    USDashBoardLastVisitDateFormat = 'USDashBoardLastVisitDateFormat',
    USClockTimeDateFormat = 'USClockTimeDateFormat',
    USShiftForeCastDateFormat = 'USShiftForeCastDateFormat',
    USDateFormatforReturingClient = 'USDateFormatforReturingClient',

    //format for year, day and month
    CHDateFormat = "CHDateFormat",
    CHSchedulerTooltipDateFormat = "CHSchedulerTooltipDateFormat",
    CHExceptionDateFormat = "CHExceptionDateFormat",
    CHSchedulerDateFormatDayView = "CHSchedulerDateFormatDayView",
    CHSchedulerDateFormatWeekViewTo = "CHSchedulerDateFormatWeekViewTo",
    CHSchedulerRRuleUntilDateFormat = "CHSchedulerRRuleUntilDateFormat",
    CHDateFormatForSave = "CHDateFormatForSave",
    CHDateTimeFormat = "CHDateTimeFormat",
    CHNotficationDateTimeFormat = "CHNotficationDateTimeFormat",
    CHReceiptDateFormat = "CHReceiptDateFormat",
    CHRecurrenceExceptionDateFormat = "CHRecurrenceExceptionDateFormat",
    CHDashboardDateFormat = "CHDashboardDateFormat",
    CHSchedulerStaffShiftToolTipDateFormat = "CHSchedulerStaffShiftToolTipDateFormat",
    CHDateFormatforBooked = 'CHDateFormatforBooked',
    CHAttendnaceformat = 'CHAttendnaceformat',
    CHDashBoardLastVisitDateFormat = 'CHDashBoardLastVisitDateFormat',
    CHClockTimeDateFormat = 'CHClockTimeDateFormat',
    CHShiftForeCastDateFormat = 'CHShiftForeCastDateFormat',
    CHDateFormatforReturingClient = 'CHDateFormatforReturingClient',

    //format for long date
    UKLongDateFormat = "UKLongDateFormat",
    USLongDateFormat = "USLongDateFormat",
    CHLongDateFormat = "CHLongDateFormat",
}

export enum ENU_BenefitsType {
    All = 1,
    IsFree = 2,
    IsDiscount = 3
}

export enum ENU_MemberShipBenefitsName {
    DoorCheckIns = 1,
    Classes = 2,
    Services = 3,
    Products = 4,
}

export enum ENU_MemberShipBenefitsStatus {
    Suspended = "Suspended",
    Consumed = "Consumed",
}

export enum ENU_MobileOperatingSystem {
    WindowsPhone = 1,
    Android = 2,
    iOS = 3,
    unknown = 4,
    DesktopSafari = 5
}
export enum CustomFormStatus {
    Submitted = 1,
    NotSubmitted = 2
}

export enum ENU_FromTypeName {
    ESignature = "eSignature",
    Checkbox = "checkbox",
}
export enum ENU_pdfFor {
    Client = 1,
    Lead = 2,
    Member = 3,
    Staff = 4,
    POS = 5,
    Setup = 6,
}
export enum FormQueryType {
    QueryID = 1,
    CustomerID = 2,
    FormID = 3
}
export enum ENU_EmailSmsFor {
    Client = 1,
    Lead = 2,
    Member = 3,
    Staff = 4,
}
export enum ENU_CancelItemType {
    Class = 1,
    Service = 2,
}
export enum ENU_CancellationDurationType {
    Days = 9,
    Hours = 10,
    Minutes = 11,
    Weeks = 12

}
export enum ENU_CheckIn_Out_Type {
    Terminal = 1,
    Computer = 2
}
export enum ENU_Action_ActivityType {
    Cancellation = 'Cancellation',
    NoShow = 'NoShow',
    Reschedule = 'Reschedule',
}

export enum ENU_cancellationTypeValue {
    EarlyCancellation = 1,
    LateCancellation = 2
}

export enum ENU_cancellationTypeOption {
    EarlyCancellation = "Early Cancellation",
    LateCancellation = "Late Cancellation"
}
export enum ENU_BookingStatusValue {
    Booked = 1,
    Cancelled = 2,
    Present = 3,
    NoShow = 4,
    Reschedule = 5,// will change this later if required
    WaitList = 0 // wait list enum set zero for booking status ask by izhar bhai dated on 06/09/2021
}

export enum ENU_BookingStatusOption {
    Booked = 'Booked',
    Present = 'Present',
    NoShow = 'No Show',
    Cancelled = 'Cancelled',
    Reschedule = 'Reschedule'
}

export enum ENU_SearchBookingStatusValue {
    All = 10,
    AllExceptCancelled = 1,
    Present = 3,
    NoShow = 4,
    Cancelled = 2,
    WaitList = 0
}
export enum ENU_SearchBookingStatusOption {
    All = 'All',
    AllExceptCancelled = 'All except Cancelled',
    Present = 'Present',
    NoShow = 'No Show',
    Cancelled = 'Cancelled',
    WaitList = 'Waitlist'
}
export enum ENU_CancellationReasonValue {
    Bookingtimenotsuitable = 15,
    Customerwantstochangebookingdetails = 16,
    Customernolongerrequiresthisbooking = 17,
    Customerwasunsatisfiedwiththeirlastbooking = 18,
    Customerneedstoreschedulethisbooking = 19,
    CancelledbyStaff = 20,
}

export enum ENU_CancellationReasonOption {
    Bookingtimenotsuitable = 'Booking time not suitable',
    Customerwantstochangebookingdetails = 'Customer wants to change booking details',
    Customernolongerrequiresthisbooking = 'Customer no longer requires this booking',
    Customerwasunsatisfiedwiththeirlastbooking = 'Customer was unsatisfied with their last booking',
    Customerneedstoreschedulethisbooking = 'Customer needs to reschedule this booking',
    CancelledbyStaff = 'Cancelled by Staff'
}
export enum ENU_RefundValue {
    RefundNow = 1,
    RefundLater = 2,
}
export enum ENU_RefundOption {
    RefundNow = 'Refund Now',
    RefundLater = 'Refund Later',
}
export enum ENU_ChargeValue {
    ChargeNow = 1,
    ChargeLater = 2,
}
export enum ENU_ChargeOption {
    ChargeNow = 'Charge Now',
    chargeLater = 'Charge Later',
}
export enum ENU_NoShowReasonValue {
    Conflictinschedule = 21,
    Familyemergency = 22,
    Transportationlogisticalissues = 23,
    CustomerisUnreachable = 24,
    CustomerdeniedBooking = 25,
}
export enum ENU_NoShowReasonOption {
    Conflictinschedule = 'Conflict in schedule',
    Familyemergency = 'Family emergency',
    Transportationlogisticalissues = 'Transportation/logistical issues',
    CustomerisUnreachable = 'Customer is Unreachable',
    CustomerdeniedBooking = 'Customer denied Booking',
}

export enum ENU_CancellationPolicy {
    ClassCancellationFlatFee = 'ClassCancellationFlatFee',
    ClassCancellationPercentageFee = 'ClassCancellationPercentageFee',
    ClassCancellationClassNoShowFlatFee = 'ClassCancellationClassNoShowFlatFee',
    ClassCancellationClassNoShowpercentageFee = 'ClassCancellationClassNoShowpercentageFee',
    ServiceCancellationLateFlatFee = 'ServiceCancellationLateFlatFee',
    ServiceCancellationLatePercentageFee = 'ServiceCancellationLatePercentageFee',
    ServiceNoShowLateFlatFee = 'ServiceNoShowLateFlatFee',
    ServiceNoShowPercentageFee = 'ServiceNoShowPercentageFee',
    ClassCancellationChargeInstantly = 'ClassCancellationChargeInstantly',
    ClassCancellationChargeLater = 'ClassCancellationChargeLater',
    ServiceCancellationLatePaymentChargeInstantly = 'ServiceCancellationLatePaymentChargeInstantly',
    ServiceCancellationLatePaymentChargeLater = 'ServiceCancellationLatePaymentChargeLater',
}

export enum ENU_PaymentActionType {
    Charge = 'Charge',
    Refund = 'Refund',
    NoChange = 'NoChange'
}

export enum ENU_ChargeFeeType {
    Cancellation = 1,
    Reschedule = 2,
    NoShow = 3
}


export enum ENU_ConfigurationTab {
    basic = 0,
    CancellationPolicy = 1,
    WaitList = 2,
    Payments = 3,
    Pos = 4,
    Lead = 5,

    Widget = 6,
    ActivitiesColor = 7,
    Advanced = 8,
}

export enum ENU_WaitListBookingType {
    AddedToWaitlist = 2,
    AddedToBook = 3,
    TimedOut = 4
}
export enum WaitlistStatusType {
    All = 1,
    AddedToWaitlist = 2,
    AvailableToBook = 3,
    TimedOut = 4
}
export enum ENU_RewardProgramStatusTypeName {
    Enrolled = 1,
    Terminated = 2
}
export enum ENU_IsTransferRewardProgram {
    Yes = 0,
    No = 1
}
export enum customerEnrollmentTypeID {
    Customer_Opt_In = 2,
    Automatic_Enrollment = 1,
    Manual_Enrollment = 3,
}
export enum customerEnrollmentTypeName {
    Customer_Opt_In = 'Customer Opt In',
    Automatic_Enrollment = 'Automatic Enrollment',
    Manual_Enrollment = 'Manual Enrollment',
}
export enum ENU_Reward_Program_validation {
    RedemptionValue = 1,
    RedemptionPoints = 2,
    AmountSpent = 3,
    MemberEarnedPoints = 4,
    ClientEarnedPoints = 5,
    LeadEarnedPoints = 6,
    BenefittedEarnedPoints = 7,
    classAmountSpent = 8,
    classMemberEarnedPoints = 9,
    classClientEarnedPoints = 10,
    classLeadEarnedPoints = 11,
    classBenefittedEarnedPoints = 12,
    serviceAmountSpent = 13,
    serviceMemberEarnedPoints = 14,
    serviceClientEarnedPoints = 15,
    serviceLeadEarnedPoints = 16,
    serviceBenefittedEarnedPoints = 17,
    productAmountSpent = 18,
    productMemberEarnedPoints = 19,
    productClientEarnedPoints = 20,
    productLeadEarnedPoints = 21,
    productBenefittedEarnedPoints = 22,
    membershipAmountSpent = 23,
    membershipMemberEarnedPoints = 24,

}
export enum ENU_MainDashboard_ClubVisitGraphType {
    Hour = 1,
    DayName = 2,
    Date = 3,
}

export enum SupplierValidation {
    SupplierName = 1,
    Email = 2,
    Mobile = 3,
    Phone = 4
}

export enum ProductModulePagesEnum {
    Supplier = 1,
    Attribute = 2,
    Brand = 3,
    Products = 4,
    Category = 5,
    PurchaseOrder = 6
}

export enum ProductClassification {
    Standard = 1,
    Variant = 2
}

export enum ProductFavouriteViewColumnNameString {
    Product = "Product",
    Classification = "Classification",
    Type = "Type",
    Category = "Category",
    Brand = "Brand",
    Branch = "Branch",

    PurchaseRestriction = "Purchase Restriction",
    VariantStatus = "Variant Status",
    ProductStatus = "Product Status",

    ShowOnline = "Show Online",
    HidePriceOnline = "Hide Price Online",
    Featured = "Is Featured",
    // BusinessUseOnly = "Business Use Only",
    TrackInventory = "Track Inventory",
    Shipping = "Shipping",
    BarCode = 'Barcode',
    SKU = "SKU",
    Supplier = "Supplier",
    SupplerCode = "Supplier Code",
    SupplierPrice = "Supplier Price",
    Price = "Price",
    Tax = "Tax",
    RetailPrice = "Retail Price",
    CurrentStock = "Current Stock",
    ReorderQuantity =  "Reorder Quantity",
    ThresholdPointColumn = "Threshold Point",
    StockValue = "Stock Value",
    RetailValue = "Retail"
}

export enum PricingCheckBoxValues {
    BarCode = 'Barcode',
    SKU = "SKU",
    Supplier = "Supplier",
    SupplerCode = "SupplierCode",
    SupplierPrice = "SupplierPrice",
    Price = "Price",
    Tax = "Tax",
    ReOrderThreshold = "ReorderThreshold",
    ReOrderQty = "ReorderQuantity",
}

export enum Product_SearchFundamental_DropDowns {
    ProductCategory = 1,
    ProductBrand = 2,
    ProductSupplier = 3,
    ProductBranches = 4,
}

export enum ProductAreaEnum{
    SaveProduct = 1,
    EditPricing = 2
}
export enum WizardforProduct {
    ProductInformation = 0,
    BranchesAndPermissions = 1,
    Pricing = 3
}
export enum ProductViewTabs {
    ProductInformation = 0,
    PricingDetails = 1,
    InventoryDetails = 2
}

export enum MeasurementUnitType{
    Weight = 1,
    Dimension = 2,
    SizeOrVolume = 3
}

export enum EnumPurchaseOrderStatus {
    Ordered = 1,
    Received= 2,
    PartiallyReceived= 3,
    Cancelled = 4
}

export enum EnumPurchaseOrderStatusName {
    Ordered = "Ordered",
    Received= "Received",
    PartiallyReceived = "Partially Received",
    Cancelled = "Cancelled"
}

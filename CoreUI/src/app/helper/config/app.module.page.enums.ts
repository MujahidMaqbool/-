export enum ENU_Permission_Module {
    Setup = 1,
    Staff = 2,
    // Client = 3,
    Lead = 4,
    Customer = 5,
    PointOfSale = 6,
    Scheduler = 7,
    Reports = 8,
    Individual = 9,
    Automation = 10,
    General = 11,
    Product = 17
}
export enum ENU_Permission_Product {
    Category_View = 1701,
    Category_Save = 1702,
    Category_Delete = 1703,

    Brand_View = 1704,
    Brand_Save = 1705,
    Brand_Delete = 1706,

    Product_View = 1707,
    Product_Save = 1708,
    Product_Delete = 1709,

    Product_Inventory_View = 1710,
    Product_Inventory_Save = 1711,
    Product_Pricing_View = 1712,
    Product_Pricing_Save = 1713,

    Supplier_View = 1714,
    Supplier_Save = 1715,
    Supplier_Delete = 1716,

    Carrier_View = 1717,
    Carrier_Save = 1718,
    Carrier_Delete = 1719,

    PO_View = 1720,
    PO_Save = 1721,
    PO_Delete = 1725,
    PO_EmailToSupplier = 1726,

    Attribute_View = 1722,
    Attribute_Save = 1723,
    Attribute_Delete = 1724,
  }

export enum ENU_Permission_Setup {
    Company = 101,

    Branch_View = 102,
    Branch_Save = 103,

    StaffPosition_View = 104,
    StaffPosition_Save = 105,

    ProductCategory_View = 106,
    ProductCategory_Save = 107,

    Product_View = 108,
    Product_Save = 109,

    ServiceCategory_View = 110,
    ServiceCategory_Save = 111,

    Service_View = 112,
    Service_Save = 113,

    Membership_View = 114,
    Membership_Save = 115,

    MembershipCategory_View = 150,
    MembershipCategory_Save = 149,

    Facility_View = 116,
    Facility_Save = 117,

    Template_View = 118,
    Template_Save = 119,

    Role_View = 120,
    Role_Save = 121,

    Widget = 122,
    LeadStatus = 123,
    ActivitiesColor = 124,
    GatewayIntegration = 125,
    PrinterConfig = 126,

    Tax_View = 127,
    Tax_Save = 128,
    Tax_Delete = 129,
    Partial_Payment = 130,

    Automation_Template_View = 131,
    Automation_Template_Save = 132,

    Class_Save = 133,
    Class_View = 134,

    ClassCategory_Save = 135,
    ClassCategory_View = 136,

    Form_View = 137,
    Form_Save = 138,

    WaitList_View = 141,
    WaitList_Save = 142,

    CancellationPolicy_View = 143,
    CancellationPolicy_Save = 144,


    Advanced_View = 151,
    Advanced_Save = 152,

    SplitPayment = 145,

    RewardProgram_View = 146,
    RewardProgram_Save = 147,


}

export enum ENU_Permission_Staff {
    Dashboard = 201,
    View = 202,
    Save = 203,
    Activity_View = 204,
    Activity_Save = 205,
    Document_View = 206,
    Document_Save = 207,
    NextOfKin = 208,
    ShiftTemplate_View = 209,
    ShiftTemplate_Save = 210,
    Shift_View = 211,
    Shift_Save = 212,
    Attendance_View = 213,
    Attendance_Save = 214,
    AttendanceTerminal = 215,
    Timesheet = 216,
    AllTask_View = 217,
    AllTask_Save = 218,
    MyTask = 219,
    MyAttendance = 220,
    AddOtherBranchStaff = 221,
    Forms = 222,
    SaveForms = 223
}

// export enum ENU_Permission_Client {
//     Dashboard = 301,
//     View = 302,
//     Save = 303,
//     Activities_View = 304,
//     Activities_Save = 305,
//     InvoiceHistory = 306,
//     BookingHistory = 307,
//     ProceedToLead = 308,
//     ProceedToMember = 309,
//     Forms = 310,
//     benefits_View = 311,
//     ViewForm = 312,
//     SaveForm = 313,
//     Documents_View = 512,
//     Documents_Save = 513,
// }

export enum ENU_Permission_Lead {
    Dashboard = 401,
    View = 402,
    Save = 403,
    Activities_View = 404,
    Activities_Save = 405,
    Memberships_View = 406,
    Memberships_Save = 407,
    InvoiceHistory = 408,
    BookingHistory = 409,
    BusinessFlow_View = 410,
    BusinessFlow_Save = 411,
    ProceedToMember = 412,
    Forms = 413,
    benefits_View = 414,
    Lead_DeleteEnquiry = 415,
    ViewForm = 416,
    SaveForm = 417,
    ReferredBy = 418,
    Documents_View = 419,
    Documents_Save = 420,
    NextOfKin = 421,
    Gateway = 422,
    Delete = 423,
    WaitList_View = 423,
    WaitList_Save = 424,
    Cancelation_Policy_View = 425,
    Cancelation_Policy__Save = 426,
    RewardProgram_View = 427,
    RewardProgram_Save = 428,
}

export enum ENU_Permission_ClientAndMember {
    ProceedToLead = 308,
    ProceedToMember = 309,
    Dashboard = 501,
    View = 502,
    // Save = 503,
    MemberIndividualDashboard = 504,
    Activities_View = 505,
    Activities_Save = 506,
    Memberships_View = 507,
    Memberships_Save = 508,
    Payments_View = 509,
    Payments_Save = 510,
    ReferredBy = 511,
    Documents_View = 512,
    Documents_Save = 513,
    NextOfKin = 514,
    InvoiceHistory = 515,
    BookingHistory = 516,
    GlobalPayments = 517,
    ClockInOut = 518,//
    Gateway = 519,
    All_Payments = 520,
    Payments_Freeze = 521,
    Forms = 522,//
    BenefitsView = 523,
    BenefitsSave = 524,
    BenefitsSuspend = 525,
    CancelMembership = 526,
    ViewForm = 527,
    SaveForm = 528,
    DeleteClient = 529,
    SaveClient = 530,
    SaveMember = 531,
    DeleteMember = 532,
    WaitList_View = 533,
    WaitList_Save = 534,
    Cancelation_Policy_View = 535,
    Cancelation_Policy__Save = 536,
    RewardProgram_View = 537,
    RewardProgram_Save = 538,
}


export enum ENU_Permission_PointOfSale {
    Class = 601,
    Product = 602,
    Service = 603,
    QueueInvoice = 604,
    BarCodeScanner = 605,
    Tips = 606,
    Discount = 607,
    InvoiceHistory = 608,
    BookingHistory = 609,
    Attendance = 610,
    ServiceCharges = 611,
    ViewForm = 612,
    saveForm = 613,
    ViewWaitList = 614,
    SaveWaitList = 615,
    // ViewCancelationPolicy = 616,
    // SaveCancelation_Policy = 617,
    SplitPayment = 616,
}

export enum ENU_Permission_Scheduler {
    Class = 701,
    Service = 702,
    BlockTime = 703,
    Call = 704,
    Appointment = 705,
    Task = 706,
    GroupByFacility = 707,
    ShowMyOwnScheduler = 708
}

export enum ENU_Permission_Individual {
    MainDashboard = 901,
    ClassAttendance = 902,
    StaffAttendance = 903,
    MemberAttendance = 904,
    AddAttendee = 905,
    Refund = 906,
    WrittenOff = 907,
    AllowStripeTerminal = 908,
    NotificationForEveryOne = 911
}


export enum ENU_Permission_Report {
    AllMemberReport = 801,
    MemberActivitiesReport = 802,
    MemberMembershipReport = 803,
    MemberMembershipPaymentReport = 804,
    MemberReferralReport = 805,
    MemberBySourceReport = 806,
    MemberAllBookedDetailReport = 807,
    MemberAllSaleDetailReport = 808,
    AllLeadReport = 816,
    LeadActivitiesReport = 817,
    LeadBySourceReport = 818,
    LeadLostReport = 819,
    LeadAllBookedDetailReport = 820,
    LeadAllSaleDetailReport = 821,
    AllClientReport = 831,
    CllientDetailReport = 832,
    ClientActivitiesReport = 833,
    ClientAllBookedDetailReport = 834,
    ClientAllSaleDetailReport = 835,
    AllStaffReport = 846,
    StaffDetailReport = 847,
    StaffActivitiesReport = 848,
    StaffClockTimeReport = 849,
    ScheduleGlanceReport = 850,
    StaffTaskReport = 851,
    StaffTips = 867,
    AllSaleReport = 861,
    SaleByProductReport = 862,
    SaleByServiceReport = 863,
    SaleByStaffReport = 864,
    SaleSummaryReport = 865,
    AllSaleSummaryByItemReport = 866,
    StaffTipReport = 867,
    MailingListReport = 876,
    FirstVisitReport = 877,
    StaffActivities = 878,
    ClassAttendees = 879,
    MembershipPaymentEmailTemplate = 880,
    AllCashOtherSale = 881,
    MembershipBenefitsRedemption = 882,
    AllCustomerReports = 883,
    CustomerDetailReport = 884,
    CustomerActivitiesReport = 885,
    MemberMembershipContract = 886,
    CustomerCheckInReport = 887,
    CustomerZeroVisits = 888,
    PaymentsSummary = 889,
    SalesBreakdown = 890,
    DailyRefunds = 891,
    RewardProgramSummary = 892,
    ServiceBookingReport = 893,
    SaleByClassReport = 894,
    PaymentBreakdown = 895,
    InventoryChangeLog = 896,
    CurrentStock = 897,
    ExpiredAndTerminatedMemberships = 898
}

export enum ENU_Permission_Automation {
    AutomationView = 1001,
    AutomationSave = 1002,
    AutomationViewLog = 1003
}

export enum ENU_Permission_Home {
    HomeDashboard  = 1101,
    TodayTask  = 1102,
    StaffNotification = 1103
}



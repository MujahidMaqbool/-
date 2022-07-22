export const LoginApi = {
    staffCompany: "StaffAuthentication/Company",
    staffLogin: "StaffAuthentication/Login",
    savePassword: "StaffAuthentication/SavePassword",
    validateToken: "StaffAuthentication/ValidateUrl",
    forgotPassword: "StaffAuthentication/Forgot",
    changePassword: "Staff/ChangePassword"
};

//#region = Common

export const FileUploadApi = {
    upload: "UploadFile/Component"
};

export const DeleteFile = {
    deleteImage: "Image/Delete"
};

export const SaleApi = {
    getSaleFundamentals: "Sale/Fundamental",
    getProductFundamental: "SaleReport/ViewAll/ProductFundamental",
    getClassFundamental: "SaleReport/ViewAll/ClassFundamental",
    getServiceFundamental: "SaleReport/ViewAll/ServiceFundamental",
    getInvoiceFundamental: "Sale/InvoiceFundamental",
    getSaleHistory: "Sale/Invoice",
    getInvoiceDetail: "Sale/InvoiceDetail/",
    getCreditInvoiceDetail: "Sale/CreditInvoiceDetail",
    getSaleRefund: "Sale/Refund/",
    saveSaleRefund: "Sale/SaveRefund",
    getSaleBookedDetailReport: "SaleReport/BookedDetail",
    getSaleHistoryDetail: "SaleReport/HistoryDetail",
    getAllSale: "SaleReport/ViewAll/History",
    getAllCashSale: "SaleReport/ViewAll/CashSale",
    getMemberMembership: "Sale/GetMemberBenefitsMembership/",
    saveSaleOverPaidRefund: "Sale/SaveOverPaidRefund",


    getAllSaleByCategory: "SaleReport/ViewAll/HistoryByCategory",
    getAllSaleBySource: "SaleReport/ViewAll/HistoryBySource",
    getAllSaleBySourceCategory: "SaleReport/ViewAll/HistoryBySourceCategory",
    getHistoryByProduct: "SaleReport/ViewAll/HistoryByProduct",
    getHistoryByService: "SaleReport/ViewAll/HistoryByService",
    getHistoryByClass: "SaleReport/ViewAll/ViewAllClassSale",
    getHistoryByStaff: "SaleReport/ViewAll/HistoryByStaff",
    getAllStaffTips: "SaleReport/ViewAll/StaffTips",
    getAllRedeem: "SaleReport/ViewAll/RedeemSale",
    getAllRedeemMemberships: "SaleReport/ViewAll/RedeemMemberships/",
    /* Bad Debt */
    getBadDebtFundamental: "Sale/BadDebtReasons",
    saveBadDebt: "Sale/SaveBadDebt",
    getStripeACHAccounts: "Sale/ViewAll/StripeACHAccount/",
    /* Customer Memberhsip on POS */
    getCustomerMemberhsips: "Sale/GetMemberMemberships/{customerID}",
    getAllMembershipItems: "Sale/AllMembershipItems",
    /*Voided Sale */
    getVoidedFundamental: "Sale/VoidedReasons",
    saveVoidedSale: "Sale/SaveVoidedSale",
    /*Sale detail download */
    viewSaleDetail: "Sale/ViewSaleDetail/",

    /*Sale logs */
    getSaleLogs: "Sale/logs/",

    /*Sale Customer Membership benefits by Item */
    getCustomerMembershipBenefits: 'Sale/GetCustomerMembershipBenefitsByItem',

    // sale breakdown report
    getSaleBreakdown: 'SaleReport/ViewAll/Breakdown',

     // payment breakdown report
     getPaymentBreakdown: 'SaleReport/ViewAll/PaymentBreakdown',

    // sale DailyRefund report
    getSaleDailyRefund: 'SaleReport/ViewAll/DailyRefund',

    // sale Payments Summary report
    getSalePaymentsSummary: 'SaleReport/ViewAll/PaymentsSummary'
};

export const StripeApi = {
    saveRegisterReader: 'Stripe/RegisterReader',
    getConnectionToken: 'Stripe/ConnectionToken',
    savePaymentIntent: 'Stripe/CreatePaymentIntent',
    saveCapturePaymentIntent: 'Stripe/CapturePayment'
}

export const BookingApi = {
    getBookedServices: "Sale/Booking",
    getBookedClasses: "SaleClass/Booking/ViewAll"
};

//#endregion

//#region = Setup

export const CompanyDetailsApi = {
    save: "Company/Save",
    get: "Company/Detail",
    getFundamentals: "Company/Detail/Fundamental"
};

export const BranchApi = {
    getAll: "Branch/ViewAll/{pageNumber}/{pageSize}",
    getByID: "Branch/Detail/",
    update: "Branch/Update",
    delete: "Branch/Delete/",
    getBranchFundamentals: "Branch/Detail/Fundamental"
};

export const ProductCategoryApi = {
    getAll: "ProductCategory/ViewAll/{pageNumber}/{pageSize}",
    getByID: "ProductCategory/Detail/",
    save: "ProductCategory/Save",
    delete: "ProductCategory/Delete/"
};

export const InventoryProductCategoryApi = {
    GetAll: "ProductCategory/ViewAll",
    getByID: "ProductCategory/Detail/",
    save: "ProductCategory/Save",
    delete: "ProductCategory/Delete/",
    getSearchFundamental : 'ProductCategory/SearchFundamentals',
    deleteImage:"Image/Delete"
};

export const ClassCategoryApi = {
    getAll: "ClassCategory/ViewAll/{pageNumber}/{pageSize}",
    getByID: "ClassCategory/Detail/",
    save: "ClassCategory/Save",
    delete: "ClassCategory/Delete/"
};

export const ClassApi = {
    getFundamental: "ParentClass/Fundamental",
    getParentClass: "ParentClass/ViewAll",
    saveParentClass: "ParentClass/Save",
    getParentClassById: "ParentClass/Detail/",
    getParentClassViewDetail: "ParentClass/ViewDetail/",
    deleteParentClass: "ParentClass/Delete/",
};

export const FacilityApi = {
    getAll: "Facility/ViewAll/{pageNumber}/{pageSize}",
    getByID: "Facility/Detail/",
    save: "Facility/Save",
    delete: "Facility/Delete/"
};

export const ServiceCategoryApi = {
    getAll: "ServiceCategory/ViewAll/{pageNumber}/{pageSize}",
    getByID: "ServiceCategory/Detail/",
    save: "ServiceCategory/Save",
    delete: "ServiceCategory/Delete/"
};

export const StaffPositionApi = {
    getAll: "StaffPosition/ViewAll/{pageNumber}/{pageSize}",
    getByID: "StaffPosition/Detail/",
    save: "StaffPosition/Save",
    delete: "StaffPosition/Delete/"
};

export const MembershipApi = {
    getAll: "Membership/ViewAll",
    getFundamentals: "Membership/Detail/Fundamental",
    getByID: "Membership/Detail/",
    getBranchWiseClasses: "Membership/BranchWiseClasses",
    save: "Membership/Save",
    viewMemberById: "Membership/View/",
    delete: "Membership/Delete/",
    getBranchWiseBenefitTypes: "Membership/ViewAllItems/",
    getBranchWiseServices: "Membership/ViewAllBranchWiseServices/",
    getMembershipProductVariant: "Membership/MembershipProductVariant"
};

export const MembershipCategoryApi = {
  getAll: "MembershipCategory/ViewAll/",
  getByID: "MembershipCategory/Detail/",
  save: "MembershipCategory/Save",
  delete: "MembershipCategory/Delete/"
};

export const ConfigurationWaitList = {
    getFundamentals: "WaitListSetting/Detail/Fundamental",
    save: "WaitListSetting/Save",
};

export const FormApi = {
    getFundamentals: "CustomForm/Fundamentals",
    save: "CustomForm/Save",
    getByID: "CustomForm/Detail/",
    getCustomForms: "CustomForm/ViewAll",
    deleteCustomForm: "CustomForm/Delete/",
    viewCustomForm: "CustomForm/View/",
};

export const ProductsApi = {
    getFundamentals: "Product/Detail/Fundamental",
    searchFundamentals: "Product/ViewAll/Fundamental",
    getAll: "Product/ViewAll/",
    getByID: "Product/Detail/",
    save: "Product/Save",
    delete: "Product/Delete/"
};

export const ServiceApi = {
    getFundamentals: "Service/Detail/Fundamental",
    searchFundamentals: "Service/ViewAll/Fundamental",
    getAll: "Service/ViewAll",
    getByID: "Service/Detail/",
    save: "Service/Save",
    deleteServicePackage: "Service/DeleteServicePackage/{serviceID}/{servicePackageID}",
    delete: "Service/Delete/"
};

export const RoleApi = {
    getFundamentals: "Role/Detail/Fundamental",
    getAll: "Role/ViewAll",
    getByID: "Role/Detail/{roleID}",
    add: "Role/Save",
    update: "Role/Save",
    delete: "Role/Delete",
    detail: "Role/View/{roleID}"
};

export const TemplateApi = {
    getFundamentals: "TemplateText/Detail/Fundamental",
    searchFundamentals: "TemplateText/ViewAll/Fundamental",
    getAll: "TemplateText/ViewAll",
    getTemplateById: "TemplateText/Detail/{templateTextID}/{moduleID}/{templateTypeID}",
    getVariableByModuleId: "TemplateText/ModuleVariable/{moduleID}",
    addTemplate: "TemplateText/Save",
    updateTemplate: "TemplateText/Save",
    saveEmail: "TemplateText/Save",
    saveSMS: "TemplateText/Save",
    saveNotification: "TemplateText/Save",
    deleteTemplate: "TemplateText/Delete/{templateTextID}/{moduleID}/{templateTypeID}"
}

export const AutomationTemplateApi = {
    getSearchFundamentals: "AutomationTemplate/SearchFundamental",
    getFundamentals: "AutomationTemplate/Fundamental",
    save: "AutomationTemplate/Save",
    getAutomationTemplates: "AutomationTemplate/ViewAll",
    getDetail: "AutomationTemplate/Detail/",
    delete: "AutomationTemplate/Delete/",
    viewTemplate: "AutomationTemplate/ViewTemplate/"
}

export const StaffNotificationApi = {
    getFundamentals: "StaffNotification/Fundamental",
    getLogFundamental: "StaffNotification/LogFundamental",
    viewLogList: "StaffNotification/ViewAllLog",
    getStaffNotificationFundamental: "StaffNotification/Fundamental",
    getStaffNotification: "StaffNotification/ViewAll",
    updateStaffNotification: "StaffNotification/UpdateStaffNotification",
    viewAllStaffNotification: "StaffNotification/ViewAllNotification/{staffID}",
    NotificationServiceDetail: "StaffNotification/NotificationServiceDetail/{StaffNotificationID}"
}


export const WidgetSettingApi = {
    getFundamentals: "WidgetSetting/Detail/Fundamental",
    widgetSettingsDetail: "WidgetSetting/Detail",
    savePermissions: "WidgetSetting/SavePermission",
    saveSocialMedia: "WidgetSetting/SaveSocialMedia",
    saveBanner: "WidgetSetting/SaveBanner",
    deleteBanner: "WidgetSetting/DeleteBanner"
}

export const TaxApi = {
    getAll: "Tax/ViewAll",
    getByID: "Tax/Detail/",
    getSearchFundamental:'Tax/SearchFundamentals',
    save: "Tax/Save",
    delete: "Tax/Delete/"
}



export const ShiftTemplateApi = {
    getFundamentals: "ShiftTemplate/Detail/Fundamental",
    getAll: "ShiftTemplate/ViewAll",
    getByID: "ShiftTemplate/Detail/",
    save: "ShiftTemplate/Save",
    delete: "ShiftTemplate/Delete/"
}

export const StaffAttendanceApi = {

    verifyStaff: "StaffAttendance/TimeClock",
    staffClockIn: "StaffAttendance/ClockIn",
    staffClockOut: "StaffAttendance/ClockOut",
    getAllStaffAttendance: "StaffAttendance/ViewAll?staffID={staffID}&startDate={startDate}&endDate={endDate}",
    getByID: "StaffAttendance/Detail/{staffShiftID}/{staffAttendanceID}",
    checkShift: "StaffShift/Check",
    saveStaffAttendance: "StaffAttendance/Save",
    deleteStaffAttendance: "StaffAttendance/Delete/{staffShiftID}/{staffAttendanceID}"
}

export const StaffTimeSheetApi = {
    getAll: "StaffTimeSheet/ViewAll",
    getMyAttendanceTimeSheetById: "StaffTimeSheet/View"
}

export const MemberAttendanceApi = {
    memberClockIn: "CustomerClockIn/CustomerDetail",
    getMemberMembershipDetails: 'CustomerClockIn/CustomerMembershipDetail',
    markMemberAttendance: 'CustomerClockIn/MarkAttendance'
}

export const LeadStatusApi = {
    getFundamentals: "LeadStatusTypeFriendly/Detail/Fundamental",
    save: "LeadStatusTypeFriendly/Save",
    saveLeadSetting: "LeadStatusTypeFriendly/saveLeadSetting",
    getLeadSetting: "LeadStatusTypeFriendly/GetLeadSetting",
    ResetLeadSetting: "LeadStatusTypeFriendly/ResetLeadSetting",

}

export const SchedulerActivityColorApi = {
    getFundamentals: "SchedulerActivityTypeColor/Detail/Fundamental",
    save: "SchedulerActivityTypeColor/Save"

}

export const PrinterSetupApi = {
    save: "Settings/PrinterConfiguration",
    getPrinterConfiguration: "Settings/PrinterConfiguration"
}

export const DiscountSetupApi = {
    setDiscountPin: "Settings/SetDiscountPassword",
    verifyDiscountPassword: "Settings/VerifyDiscountPassword"
}


export const ConfigurationsApi = {

    // Basic Branch
    basicBranchSetting: "Branch/Basic/Fundamental",
    saveBasicBranchSetting: "Branch/Basic/SaveBasicSetting",
    //Cancellation Policy
    saveCancellationPolicySetting: "CancellationPolicySetting/Save",
    getCancellationPolicySettingDetail: "CancellationPolicySetting/Detail/Fundamental",
    //Advance Setting
    saveAdvanceSetting:"Branch/Advanced/SaveAdvancedSetting",
    getFundamentalAdvanceSetting:"Branch/Advanced/Fundamental",

}
//#endregion

export const HomeApi = {
    getFundamentals: "MainDashboard/Fundamental",
    getBranchPermissions: "MainDashboard/Permission",
    switchBranch: "MainDashboard/SwitchBranch/",
    saveFCMToken: "MainDashboard/SaveNotificationToken",
    getNotificationList: "MainDashboard/Notification",
    getMemberAttendance: "MainDashboard/RecentMemberAttendance",
    getStaffAttendance: "MainDashboard/RecentStaffAttendance",
    getSaleTypeSummary: "MainDashboard/SaleTypeSummary",
    getMembersContract: "MainDashboard/MembersContract",
    getMembershipStatus: "MainDashboard/MembershipStatus",
    getCustomerViewAll: "MainDashboard/ViewAll/?customerTypeID={customerTypeID}",
    getStaffPendingTask: "MainDashboard/StaffPendingTask",
    getTotalSaleSummary: "MainDashboard/TotalSaleSummary",
    getMemberContract: "MainDashboard/MembersContract",

    getBranches: "StaffDashboard/Detail/Branches",
    getBranchActiveRewardProgramList:"MainDashboard/BranchActiveRewardProgramList"

};

//#region = Staff

export const StaffDashboardApi = {
    getFundamentals: "StaffDashboard/Detail/Fundamental",
    getBranches: "StaffDashboard/Detail/Branches",
    switchBranch: "StaffDashboard/SwitchBranch",
    getStaffPendingTask: "StaffDashboard/ViewAll/PendingTask",
    getStaffAttendance: "StaffDashboard/ViewAll/AttendanceGraph",
    getStaffScheduledHours: "StaffDashboard/ViewAll/ScheduledHours"
};

export const StaffApi = {
    getFundamentals: "Staff/Detail/Fundamental",
    getBasicInfo: "Staff/BasicInfo",
    searchFundamentals: "Staff/ViewAll/Fundamental",
    getAll: "Staff/ViewAll",
    viewStaffById: "Staff/View/",
    getByID: "Staff/Detail/",
    save: "Staff/Save",
    delete: "Staff/Delete/",
    getAllStaff: 'Person/ViewAll/Staff/',
    getAllStaffReport: 'StaffReport/ViewAll',
    getStaffDetailReport: 'StaffReport/View/',
    getAllStaffActivitiesReport: 'StaffReport/ViewAllStaffActivties',
    getScheduleGlanceReport: 'StaffReport/ViewAllScheduleGlance',
    getAllStaffClockTimeReport: 'StaffReport/ViewAllStaffClockTime',
    getViewAllStaffTaskReport: 'StaffReport/ViewAllStaffTask',
    getStaffBasicInfo: 'Staff/BasicInfo',
    verifyStaff: "Staff/Verify",
    viewStaffForOtherBranch: 'Staff/ViewOtherBranchStaff/',
    saveStaffForOtherBranch: 'Staff/SaveOtherBranchStaff',
    unArchiveStaff: 'Staff/SubscribeBranch',
    viewAllSerivces: 'Staff/ViewAllService/',
    saveSelectedServices: 'Staff/SaveService',
    searchStaff: 'Staff/ViewAllBasicInfo',
    getTodayStaffActivity: 'StaffActivity/Today',
    updateStaffEmail: 'Staff/UpdateStaffEmail',
    StaffLogout: 'Staff/Logout',
    getAllStaffForms: 'Staff/ReadAllForm',
    SaveStaffForms: 'Staff/SaveStaffForm',
    getStaffFormsByID: 'Staff/StaffFormByID',
    deleteStaffForms: 'Staff/DeleteForm',
    getStaffCustomForms: 'Staff/ReadCustomForms',
    saveEmail: 'Staff/SaveForm/Email',
    saveSMS: 'Staff/SaveForm/SMS',
    staffAuthenication:'Staff/Authenticate',
    verifyMultiBranchCompany: 'Staff/VerifyMultiBranchCompany'
};

export const StaffActivityApi = {
    /* Get APIs*/
    getAll: "StaffActivity/ViewAll",
    getAllStaffTask: "StaffActivity/ViewAllTask",
    getActivityCount: "StaffActivity/ViewAll/StaffActivityCount",
    getStaffInfo: "StaffActivity/ViewAll/StaffDetail/",

    getTaskFundamentals: "StaffActivity/Detail/TaskFundamental",
    getTemplateDescription: "StaffActivity/Detail/TemplateDescription/{templateTextID}/{templateTypeID}/{staffID}",
    getTemplateFundamentals: "StaffActivity/Detail/TemplateFundamental/",

    getTaskById: "StaffActivity/Detail/Task/{staffActivityId}/{staffID}",
    getNoteById: "StaffActivity/Detail/Note/{staffActivityId}/{assignedToStaffID}",
    getViewTaskById: "StaffActivity/View/Task/{staffActivityId}/{staffID}",
    getEmailById: "StaffActivity/Detail/Email/{staffActivityId}/{staffID}",
    getMyTasksById: "StaffActivity/ViewMyTask",


    /* Save APIs*/
    saveNote: "StaffActivity/Save/Note",
    saveTask: "StaffActivity/Save/Task",
    saveEmail: "StaffActivity/Save/Email",
    saveSMS: "StaffActivity/Save/SMS",

    updateTask: "StaffActivity/Update/Task",
    updateNotificationMarkAsRead: "StaffActivity/MarkAsRead",
    saveStaffTaskMarkAsDone: "StaffActivity/CompleteTask",
    delete: "StaffActivity/Delete/{staffActivityId}/{activityTypeID}/{staffID}"
};

export const StaffDocumentApi = {
    getAll: "StaffDocument/ViewAll/",
    add: "StaffDocument/Save",
    delete: "StaffDocument/Delete/"
};

export const NextOfKinApi = {

    save: "StaffKin/Save",
    get: "StaffKin/Detail/",
    getFundamentals: "StaffKin/Detail/Fundamental"
};

export const StaffProfileApi = {
    update: "Staff/UpdateProfile",
    profile: "Staff/ViewProfile"
};

//#endregion

//#region = Staff Shift

export const StaffShiftApi = {

    getCalendarFundamentals: "StaffShift/ViewAll/Fundamental",
    getFundamentals: "StaffShift/Detail/Fundamental",
    getTemplateFundamental: "StaffShift/Detail/",
    getAll: "StaffShift/ViewAll?staffID={staffID}&startDate={startDate}&endDate={endDate}",
    getByID: "StaffShift/Detail/",
    save: "StaffShift/Save",
    update: "StaffShift/Update",
    delete: "StaffShift/Delete/{shiftID}/{recurrenceException}"
};

//#endregion

//#region = Lead

export const LeadApi = {
    getFundamentals: "Lead/Detail/Fundamental",
    searchFundamentals: "LeadReport/ViewAll/Fundamental",
    getAll: "Lead/ViewAll",
    getByID: "Lead/Detail/",
    save: "Lead/Save",
    update: "Lead/Update",
    delete: "Lead/Delete?CustomerId=",
    getLeadBusinessFlow: "LeadBusinessFlow/ViewAll",
    changeLeadStatus: "Lead/LeadStatus",
    saveLeadStatus: "Lead/LeadAssignedTo/",
    leadLostReasonType: "Lead/Detail/ByModule/",
    getLeadDetail: "Lead/View/",
    getAllLead: 'Person/ViewAll/Lead/',

    getLeadDashBoardFundemental: 'LeadDashboard/Fundamental',
    getOwns: 'LeadDashboard/Owns',
    getSaleTourEnquiryStatus: 'LeadDashboard/Status',
    getSourceDayWise: 'LeadDashboard/SourceDayWise',
    getActivitiesSummary: 'LeadDashboard/Summary',
    getActivities: 'LeadDashboard/Activities',
    getLeadFlow: 'LeadDashboard/Flow',
    //=========== Lead Reports =============//
    getAllLeadActivitiesReport: 'LeadReport/ViewAllLeadActivties',
    getAllLeadreport: 'LeadReport/ViewAll',
    getAllLeadBySourceReport: 'LeadReport/ViewAllLeadBySource',
    getAllLeadLostReport: 'LeadReport/ViewAllLostLead',
    getAllLeadSourceWithStatus: 'LeadReport/ViewAllLeadSourceWithStatus'


};

export const LeadMembershipApi = {
    getLeadMembership: 'LeadMembership/ViewAll',
    getLeadDetailFundmental: 'LeadMembership/Detail/Fundamental',

    deleteMembership: 'Path not defined yet',
    getLeadMembershipStatus: 'LeadMembership/StatusByMembership',
    save: 'LeadMembership/Save',
    saveLeadStatus: 'LeadMembership/Status',
    saveAssignedToStatus: 'LeadMembership/AssignedTo',
    saveLeadLost: "LeadMembership/Lost",
    delete: 'LeadMembership/Delete',
    AssigntoEdit: 'LeadMembership/Detail',
    AssignToSave: 'LeadMembership/AssignedTo'
}

export const LeadActivityApi = {
    /* Get APIs*/
    getAll: "LeadActivity/ViewAll",
    getLeadDetail: "LeadActivity/ViewAll/LeadDetail/",
    getActivityCount: "LeadActivity/ViewAll/LeadActivityCount",
    getDetailsFundamental: "LeadActivity/Detail/Fundamental",

    getCallFundamentals: "LeadActivity/Detail/CallFundamental",
    getAppointmentFundamentals: "LeadActivity/Detail/AppointmentFundamental",
    getTaskFundamentals: "LeadActivity/Detail/TaskFundamental",
    getTemplateFundamentals: "LeadActivity/Detail/TemplateFundamental/",
    getTemplateDescription: "LeadActivity/Detail/TemplateDescription/{templateTextID}/{templateTypeID}/{cutomerID}",

    getAppointmentNowById: "LeadActivity/Detail/AppointmentNow/{customerActivityID}/{customerID}",
    getAppointmentLaterById: "LeadActivity/Detail/AppointmentLater/{activityID}/{ownerID}",
    getCallNowById: "LeadActivity/Detail/CallNow/{customerActivityID}/{customerID}",
    getCallLaterById: "LeadActivity/Detail/CallLater/{activityID}/{ownerID}",
    getEmailById: "LeadActivity/Detail/Email/{activityID}/{ownerID}",
    getNoteById: "LeadActivity/Detail/Note/{activityID}/{ownerID}",
    getNoteActivityById: "LeadActivity/Detail/Note/{customerActivityID}/{customerID}",
    getSMSById: "LeadActivity/Detail/SMS/{activityID}/{ownerID}",
    getTaskById: "LeadActivity/Detail/Task/{activityID}/{ownerID}",
    getAchievementById: "LeadActivity/Detail/Achievement/{customerActivityID}/{customerID}",
    getViewTaskById: "LeadActivity/View/Task/{activityID}/{ownerID}",
    getAppNotificationById: "LeadActivity/Detail/AppNotification/{activityID}/{ownerID}",

    /* Save APIs*/
    saveAppointmentNow: "LeadActivity/Save/AppointmentNow",
    saveAppointmentMarkAsDone: "LeadActivity/Appointment/MarkAsDone",
    saveAppointmentLater: "LeadActivity/Save/AppointmentLater",
    saveCallNow: "LeadActivity/Save/CallNow",
    saveCallMarkAsDone: "LeadActivity/Call/MarkAsDone",
    saveCallLater: "LeadActivity/Save/CallLater",
    saveEmail: "LeadActivity/Save/Email",
    saveNote: "LeadActivity/Save/Note",
    saveTask: "LeadActivity/Save/Task",
    saveSMS: "LeadActivity/Save/SMS",
    saveAppNotification: "LeadActivity/Save/AppNotification",
    saveAchievement: "LeadActivity/Save/Achievement",

    /* Update APIs */
    updateCallLater: "LeadActivity/Update/CallLater",
    udpateAppointmentLater: "LeadActivity/Update/AppointmentLater",

    saveStatus: "LeadActivity/CompleteTask/{activityID}/{ownerID}/{assignedToStaffID}",
    delete: "CustomerActivity/Delete/{customerActivityID}/{customerID}/{activityTypeID}"
};

//#endregion


//#region = Member

export const DoorAccessApi = {
    checkIfCardNumberExist: "DoorAccess/CheckIfCardNumberExist",
};
//#endregion

//#region = Member

export const MemberApi = {
    getFundamentals: "Member/Detail/Fundamental",
    searchFundamentals: "Member/SearchFundamental",
    getAll: "Member/ViewAll",
    getByID: "Member/Detail/",
    saveMember: "Member/Save",
    saveNewMember: "Member/Save",
    updateMember: "Member/Update",
    delete: "Customer/Delete?customerID={customerID}",
    getAllMember: 'Person/ViewAll/Member/',
    verifyCardNumber: 'Member/VerifyCardNumber',
    deleteGateway: "Member/DeleteStripeCustomer/",
    //Member Document Address
    getCustomerDocumentByID: "CustomerDocument/ViewAll/",
    getMemberDetail: "Member/View/",
    saveCustomerDocument: "CustomerDocument/Save",
    deleteCustomerDocument: "CustomerDocument/Delete/",
    //Member Report Address
    getMemberReportFundamental: "MemberReport/ViewAll/Fundamental",
    getAllMemberReport: "MemberReport/ViewAll",
    getMemberActivtiesReport: "MemberReport/ViewAllMembersActivties",
    getAllMembershipsReport: "MemberReport/ViewAllMembership/{customerID}/{fileFormatTypeID}",
    getAllPaymentsReport: "MemberReport/ViewAllPayments/{customerID}/{customerMembershipID}/{membershipID}/{fileFormatTypeID}",
    getAllMembershipPaymentsReport: "MemberReport/ViewMembershipPayments/",
    getRefferedByMemberReport: "MemberReport/ViewAllMemberRefferal",
    getViewAllMemberBySourceTypeReport: "MemberReport/ViewAllMemberBySourceType",
    getViewAllMembershipStatusReport: "MemberReport/ViewAllMembershipStatus",
    getViewMembershipFirstPaymentReport: "MemberReport/ViewMembershipFirstPayment",
    ViewMembershipContract: "MemberReport/ViewMembershipContract",
    getMemberPastAndFuturePaymentsReport:"MemberReport/ViewAllPayments",
    //--------------- Local API's ---------------//
    getAllMembersLocal: "AllMembersReport",

    //Member Dashboard Address
    getMemberInfo: "MemberDashboard/MemberInfo/",
    getMemberActiveMemberships: "MemberDashboard/ActiveMemberships/",
    getMemberActivitiesCount: "MemberDashboard/MemberActivityCount/",
    getMemberSnapshot: 'MemberDashboard/Snapshot',
    getMemberPaymentDetails: 'MemberMembershipPayment/ViewAll/',
    getMemberSale: 'MemberDashboard/SaleSummary',
    getMemberByStaus: 'MemberDashboard/MembershipStatus',
    getMemberAttendanceSummary: 'MemberDashboard/AttendanceSummary',
    getAllMemberAttendanceSummary: 'MemberDashboard/AttendanceSummary',
    getMemberClubVisits: 'MemberDashboard/ClubVisits',
    getMemberServicesandAttendance: 'MemberDashboard/BookedServices',
    getAllMemberPayment: 'MemberDashboard/Payment',
    //Member Membership Freeze
    getMembershipFreezeFundamental: "MemberMembershipFreeze/Fundamental",
    getMemberMembershipDetail: "MemberMembershipFreeze/Detail",
    saveFreezeMembership: "MemberMembershipFreeze/Save",

};

export const MemberMembershipApi = {

    Fundamental: "Member/SearchFundamental",
    getMemberMembershipByID: "Customer/ViewAllMembership",
    getMemberMembershipFundamentals: "MemberMembership/Detail/Fundamental",
    saveMembership: "MemberMembership/Save",
    getMembershipPaymentPlan: "MemberMembership/Detail/PaymentPlan",
    getMembershipPaymentPlanSummary: "MemberMembership/Detail/PaymentSummary",
    cancelMembership: "MemberMembership/Cancel",
    suspendMemberFreeClass: "MemberMembership/SuspendMembershipFreeClass",
    revertCancelMemebrship: "MemberMembership/Schedule/Revert",
    getMembershipCancellationReasons: "MemberMembership/ViewAll/CancellationReasons",
    getActiveMemberMembership: "MemberMembership/MemberActiveMembership",
    getMemberMembershipBenefits: "MemberMembership/MemberMembershipBenefitsDetail",
    updateMemberMembershipBenefitsSession: "MemberMembership/UpdateMemberMembershipSession",
    suspendMemberMembershipBenefits: "MemberMembership/SuspendMemberMembershipBenefits",
    BenefitBenefitsByCustomerMembershipID: "MemberMembership/BenefitDetail/",
    getMemberMembershipBenefitsLog: "MemberMembership/BenefitsLog",
    getMemberMembershipBenefitsLogFundamentals: "MemberMembership/BenefitsLog/SearchFundamental",
    getMemberMembershipEditCustomerMembership: "MemberMembership/EditCustomerMembership",
    readMemberMembershipActivityLog: "MemberMembership/ReadMembershipLog?customerMembershipID={customerMembershipID}",

};

export const MemberPaymentsApi = {
    getMembershipPaymentFundamentals: "MemberMembershipPayment/SearchFundamental",
    getMembershipPyments: "MemberMembershipPayment/ViewAll",
    getPaymentTrancationFundmentals: "MemberMembershipPayment/Fundamental",
    getMemberPaymentDetail: "MemberMembershipPayment/Detail/Transaction/",
    getTransactionDetailForPayment: "MemberMembershipPayment/Detail/",

    savePaymentTranscation: "MemberMembershipPayment/Save/Transaction",
    savePayment: "MemberMembershipPayment/Save",

    deleteTransaction: "MemberMembershipPayment/Delete/Transaction",
    authorizeTranscation: "MemberMembershipPayment/GetApprovePaymentDetail/customerMembershipPaymentID?customerMembershipPaymentID={customerMembershipPaymentID}",
    retryPayment: "MemberMembershipPayment/Retry",
    getPaymentLog: "MemberMembershipPayment/GetPaymentLog?customerMembershipPaymentID={customerMembershipPaymentID}"
};

export const MemberActivityApi = {
    /* Get URLs*/
    getMemberInfo: "MemberActivity/ViewAll/MemberDetail/",
    getAll: "MemberActivity/ViewAll",
    getActivityCount: "MemberActivity/ViewAll/MemberActivityCount/",
    getAppointmentFundamentals: "MemberActivity/Detail/AppointmentFundamental",
    getCallFundamentals: "MemberActivity/Detail/CallFundamental",
    getTaskFundamentals: "MemberActivity/Detail/TaskFundamental",
    getTemplateFundamentals: "MemberActivity/Detail/TemplateFundamental/",
    getTemplateDescription: "MemberActivity/Detail/TemplateDescription/{templateTextID}/{templateTypeID}/{cutomerID}",
    getTaskById: "MemberActivity/Detail/Task/{memberActivityID}/{memberID}",
    getTaskForView: "MemberActivity/View/Task/{memberActivityID}/{memberID}",
    getAppointmentLaterById: "MemberActivity/Detail/AppointmentLater/{memberActivityID}/{memberID}",
    getAppointmentNowById: "MemberActivity/Detail/AppointmentNow/{memberActivityID}/{memberID}",
    getCallLaterById: "MemberActivity/Detail/CallLater/{memberActivityID}/{memberID}",
    getCallNowById: "MemberActivity/Detail/CallNow/{memberActivityID}/{memberID}",
    getEmailById: "MemberActivity/Detail/Email/{activityID}/{ownerID}",
    getAppNotificationById: "MemberActivity/Detail/AppNotification/{memberActivityID}/{memberID}",
    getAchievementById: "MemberActivity/Detail/Achievement/{customerActivityID}/{customerID}",
    getNotetById: "MemberActivity/Detail/Note/{customerActivityID}/{customerID}",
    getMemberMessageById: "MemberActivity/Detail/MemberMessage/{customerActivityID}/{customerID}",

    /* Post URLs*/
    saveNote: "MemberActivity/Save/Note",
    saveTask: "MemberActivity/Save/Task",
    saveAchievement: "MemberActivity/Save/Achievement",
    saveMemberMessage: "MemberActivity/Save/MemberMessage",
    saveSMS: "MemberActivity/Save/SMS",
    saveEmail: "MemberActivity/Save/Email",
    saveAppointmentNow: "MemberActivity/Save/AppointmentNow",
    saveAppointmentLater: "MemberActivity/Save/AppointmentLater",
    saveAppointmentMarkAsDone: "MemberActivity/Appointment/MarkAsDone",
    saveCallNow: "MemberActivity/Save/CallNow",
    saveCallLater: "MemberActivity/Save/CallLater",
    saveCallMarkAsDone: "MemberActivity/Call/MarkAsDone",
    saveAppNotification: "MemberActivity/Save/AppNotification",
    completeTask: "MemberActivity/CompleteTask",

    /* Delete URLs*/
    delete: "CustomerActivity/Delete/{activityID}/{memberID}/{activityTypeID}",
};

export const GroupActivityApi = {
    /* Get URLs*/
    getTemplateFundamentals: "MemberActivity/Detail/TemplateFundamental/",
    getTemplateDescription: "MemberActivity/Detail/GroupTemplateDescription/{templateTextID}/{templateTypeID}/{cutomerID}",

    /* Post URLs*/
    saveGroupEmail: "Attendee/SaveGroupEmail",
    saveGroupSMS: "Attendee/SaveGroupSMS",
    saveGroupNotification: "Attendee/SaveGroupNotificatoin"
    /* Delete URLs*/

};

export const MemberNextOfKinApi = {
    get: "CustomerKin/Detail/",
    getFundamentals: "CustomerKin/Detail/Fundamental",
    save: "CustomerKin/Save"
};

export const MemberReferralDetailApi = {
    getCustomerReferralDetails: "CustomerReferral/ViewAll/"
};

//#endregion

//#region = Calender

export const SchedulerApi = {

    getAll: "Scheduler/ViewAll?StaffID={staffID}&isGroupByStaff={isGroupByStaff}&FacilityID={facilityID}&SchedulerActivityTypeID={schedulerActivityTypeID}&StartDate={startDate}&EndDate={endDate}",
    getDayView: "Scheduler/DayView?StaffID={staffID}&StartDate={startDate}",
    getCallAppoinmentFundamental: "Activity/SchedulerCallAppoinmentFundamental",
    getTaskFundamental: "Activity/SchedulerTaskFundamental",
    getAllFundamentals: "Scheduler/ViewAll/Fundamental",
    getClassSearchFundamentals: "Class/ViewAll/Fundamental",
    getAllClass: "Class/ViewAll?staffID={staffID}",
    getClassFundamentals: "Class/Fundamental",
    getClassByID: "Class/Detail/",
    saveClass: "Class/Save",
    updateClass: "Class/Update",
    deleteClass: "Class/Delete/{classID}/{recurrenceException}",
    getAllCustomer: "Customer/ViewAll?search={request}&customerTypeID={customerTypeID}&skipWalkedIn={skipWalkedIn}&isPOSSearch={isPOSSearch}",
    deleteSchedulerFavouriteView: "Scheduler/DeleteSchedulerFavouriteView?schedulerFavouriteViewID=",
    saveSchedulerFavouriteView: "Scheduler/SaveSchedulerFavouriteView",
    getFavouriteViewsList: "Scheduler/SchedulerFavouriteViewList"

};

export const SchedulerServicesApi = {

    getSchedulerServiceFundamentals: "ServiceBookingAndSale/SchedulerFundamental",
    getServiceStaff: "ServiceBookingAndSale/ViewAll/CalendarFundamental",
    getSaleServiceDetail: "ServiceBookingAndSale/Detail/",
    getSchedulerServices: "ServiceBookingAndSale/ViewAll",
    saveSchedulerService: "ServiceBookingAndSale/Save",
    updateSchedulerService: "ServiceBookingAndSale/Update",
    deleteBookedSaleService: "ServiceBookingAndSale/Delete/",
    noShowBooking: "ServiceBookingAndSale/NoShow/",
    completeSaleService: "ServiceBookingAndSale/Complete/",
    getServiceBenefitsDetail: "ServiceBookingAndSale/ServiceBenefitsDetail?customerID={customerID}&serviceDate={serviceDate}",
    getCustomerForms: 'ServiceBookingAndSale/CustomerFormByDetailID/',
    getServicesCustomerForms: 'ServiceBookingAndSale/GetServicesCustomerForm',
    getServicesCustomerForm: 'ServiceBookingAndSale/GetItemCustomForm',
    changeSaleServiceStatus: "ServiceBookingAndSale/UpdateStatus",
    cancelNoShowSaleServiceStatus: "ServiceBookingAndSale/SaveServiceNoShowCancellation",
    getServiceDetailByBookingID: "ServiceBookingAndSale/DetailByBookingID/",
};

export const SchedulerBlockTimeApi = {
    getFundamentals: "StaffBlockTime/SchedulerFundamental",
    getStaffBlockTimeDetail: "StaffBlockTime/Detail/",
    saveStaffBlockTime: "StaffBlockTime/Save",
    updateStaffBlockTime: "StaffBlockTime/Update",
    deleteBlockTime: "StaffBlockTime/Delete/{blockTimeID}/{recurrenceException}"
}
export const RewardProgramApi={
    getRewardProgramExceptions : "RewardProgram/GetAllItemTypeExceptions/",
    getRewardProgramExceptionForms: "RewardProgram/GetAllFormExceptions",
    saveRewardProgram:"RewardProgram/SaveRewardProgram",
    searchRewardProgram:"RewardProgram/ViewAll",
    getRewardProgramByID: "RewardProgram/GetRewardProgram/",
    deleteRewardProgram: "RewardProgram/Delete",
    viewRewardProgram:"RewardProgram/View/",
    revertRewardProgram:"RewardProgram/RevertTerminationRewardProgram",
    defaultRewardProgram:"RewardProgram/UpdateDefaultRewardProgram",
    getRewardProgramDescription:"RewardProgram/GetRewardProgramDefaultTemplateByBranchID/",
    getRewardProgramSummary:"MainDashboard/RewardProgramSummary"

}

export const AttendeeApi = {
    getClassesByDate: "SaleClass/ViewAll",
    getClassesAttendeeOnBaseOfBranch: "SaleClass/ViewAllClasses",
    getAllClassAttendees: "Attendee/ViewAll/{classID}/{classDate}/{attendeeID}",
    getDetail: "SaleClass/Detail/",
    saveAttendees: "Sale/Save",
    saveAttendeeAttendance: "Attendee/MarkAttendance",
    saveAttendeeFreeClass: "Attendee/BookFreeClass",
    deleteAttendee: "Attendee/CancelBooking/",
    getAllPersonForAttendee: 'Person/ViewAll/Scheduler/',
    getClassAttendanceDetail: 'Attendee/AttendanceDetail/{classID}/{classDate}',
    getMemberClassDetailWithOtherMemberships: 'Attendee/ClassBenefitsMembership',
    getCustomerForms: 'Attendee/CustomerFormByDetailID/',
    GetClassAttendeeReport: 'Attendee/ClassAttendeeReport/',
    saveClassNoShowCancelation: ' Attendee/SaveClassNoShowCancelation',
    updateAttendeeStatus: 'Attendee/UpdateStatus',
    getAllRescheduleClasses:'SaleClass/ViewAllRescheduleClasses/'
};

export const RescheduleBookingApi = {
   saveReschedule :'Attendee/SaveReschedule'
}

export const CustomerRewardProgramApi = {
  getFundamentals :'CustomerRewardProgram/Fundamentals/',
  viewAllCustomerRewardProgram :'CustomerRewardProgram/ViewAllCustomerRewardProgram',
  customerRewardPoints :'CustomerRewardProgram/CustomerRewardPoints/',
  addRewardProgram :'CustomerRewardProgram/AddRewardProgram',
  adjustProgram :'CustomerRewardProgram/AdjustProgram',
  terminateProgram :'CustomerRewardProgram/TerminateProgram/',
  fundamentalsForWidgetAndPOS:'CustomerRewardProgram/FundamentalsForWidgetAndPOS/',
  allRewardPrograms :'CustomerRewardProgram/AllRewardPrograms/',
  getItemRewardsPointscolumns: 'CustomerRewardProgram/GetItemRewardsPointscolumns',
  customerRewardProgramForReport :'CustomerReport/ViewAllCustomerRewardProgram?CustomerID='
}

//#endregion

//#region = Client

export const ClientApi = {
    getClients: "Client/ViewAll",
    getFundamentals: "Client/Detail/Fundamental",
    getClientByID: "Client/Detail/",
    getClientViewDetailByID: "Client/View/",
    saveClient: "Client/Save",
    deleteClient: "Client/Delete/",
    getAllClient: 'Person/ViewAll/Client/',
    getAllClientReport: 'ClientReport/ViewAll',
    getClientDetailReport: 'ClientReport/View/',
    getAllClientActivtiesReport: 'ClientReport/ViewAllClientActivties',
    //***************** Dashboard ******************/
    getTopServicesByDate: 'ClientDashboard/TopServices',
    getEmployeeTopServicesByDate: 'ClientDashboard/TopEmployeeServices',
    getSalesBreakDownByDate: 'ClientDashboard/MonthlySalesItemBreakDown',
    getTopSalesByChannelByDate: 'ClientDashboard/SaleByChannel',
    getMonthlySalesByDate: 'ClientDashboard/MonthlySale',
    getMonthlyVisitsByDate: 'ClientDashboard/Visits',
    getBookedServicesByDate: 'ClientDashboard/BookedServices',
    getnewvsReturningClient: 'ClientDashboard/Summary',
    getDashboardHighlights: 'ClientDashboard/DashboardHighlights',
    getCustomerBirthdays: 'ClientDashboard/CustomerBirthday',
    getMembershipExpiry: 'ClientDashboard/MembershipExpiry',
    CustomerApplication: 'ClientDashboard/CustomerApplication'


};

export const ClientActivityApi = {
    /* Get APIs*/
    getAll: "ClientActivity/ViewAll",
    getClientDetail: "ClientActivity/ViewAll/ClientDetail/",
    getActivityCount: "ClientActivity/ViewAll/ClientActivityCount",

    getCallFundamentals: "ClientActivity/Detail/CallFundamental",
    getAppointmentFundamentals: "ClientActivity/Detail/AppointmentFundamental",
    getTaskFundamentals: "ClientActivity/Detail/TaskFundamental",
    getTemplateFundamentals: "ClientActivity/Detail/TemplateFundamental/",
    getTemplateDescription: "ClientActivity/Detail/TemplateDescription/{templateTextID}/{templateTypeID}/{cutomerID}",

    getAppointmentNowById: "ClientActivity/Detail/AppointmentNow/{clientActivityID}/{clientID}",
    getAppointmentLaterById: "ClientActivity/Detail/AppointmentLater/{clientActivityID}/{clientID}",
    getCallNowById: "ClientActivity/Detail/Call/{clientActivityID}/{clientID}",
    getCallLaterById: "ClientActivity/Detail/CallLater/{clientActivityID}/{clientID}",
    getEmailById: "ClientActivity/Detail/Email/{clientActivityID}/{clientID}",
    getNoteById: "ClientActivity/Detail/Note/{clientActivityID}/{clientID}",
    getAchievementById: "ClientActivity/Detail/Achievement/{customerActivityID}/{customerID}",
    getSMSById: "ClientActivity/Detail/SMS/{clientActivityID}/{clientID}",
    getAppNotificationById: "ClientActivity/Detail/AppNotification/{clientActivityID}/{clientID}",

    /* Save APIs*/
    saveAppointmentNow: "ClientActivity/Save/AppointmentNow",
    saveAppointmentLater: "ClientActivity/Save/AppointmentLater",
    saveAppointmentMarkAsDone: "ClientActivity/Appointment/MarkAsDone",
    saveCallNow: "ClientActivity/Save/CallNow",
    saveCallMarkAsDone: "ClientActivity/Call/MarkAsDone",
    saveCallLater: "ClientActivity/Save/CallLater",
    saveEmail: "ClientActivity/Save/Email",
    saveNote: "ClientActivity/Save/Note",
    saveSMS: "ClientActivity/Save/SMS",
    saveAppNotification: "ClientActivity/Save/AppNotification",
    saveAchievement: "ClientActivity/Save/Achievement",

    /** Update APIs CustomerActivity */
    updateCallAppointmentLater: "CustomerActivity/Update",
    delete: "CustomerActivity/Delete/{activityID}/{clientID}/{activityTypeID}"
};

//#endregion

//#region = Person
export const PersonApi = {
    getAllPerson: 'Person/ViewAll/',
    getAllPersons: 'Person/ViewAll/""/',
    getModuleWisePerson: 'Person/ViewAll/',
}
//#endregion

//#region = Point of Sale

export const PointOfSaleApi = {
    /* Get */
    getPOSProducts: 'SaleProduct/ViewAll/Fundamental',
    getProductDetail:'SaleProduct/Detail/',
    checkAvailability:'SaleProduct/CheckAvailability',
    getPOSServices: 'SaleService/Fundamental',
    getPOSClasses: 'SaleClass/Fundamental',
    getAllCustomers: 'Customer/ViewAll',
    getServiceStaff: 'SaleService/StaffTimeSlot',
    getServiceWaitListStatus: 'SaleService/WaitListStatus',
    getFreeClassesForMember: 'SaleClass/ViewAll/Free',
    getClassInfo: 'SaleClass/ClassInfo/{classID}/{classDate}',
    getSavedCards: "Sale/ViewAll/Cards/",
    getStripeSettings: "Sale/StripeSetting",
    getStripeCardAuthentication: "Sale/AuthenticateCard",
    getInvoiceForPrint: "Sale/InvoiceReceipt/",
    getAllSaleQueue: "QueueSale/ViewAll",
    getSaleQueueById: "QueueSale/Detail/",
    getFormList: "Sale/GetFormList",
    /* Save */
    saveInvoice: "Sale/Save",
    saveSaleQueue: "QueueSale/Save",
    savePartialPaymentInvoice: "Sale/SaveSaleInvoice",
    /* save invoice call if SCA required payment confirmation */
    saveSaleCardInvoice: "Sale/SaveSaleCardInvoice",
    updateCardSaleStatus: "Sale/UpdateCardSaleStatus",
    /* Delete */
    deleteSaleQueue: "QueueSale/Delete/",
    GetAttributesValuesByProductBarcode: "SaleProduct/GetAttributesValuesByProductBarcode"
    
}
//#endregion

//#region = Person Info

export const PersonInfoApi = {

    getPersonInfo: "Customer/Detail/"
};

//#endregion

//#region = Customer Info

export const CustomerApi = {
    checkBillingAndGateway: "Customer/CheckBillingAndGateway/",
    getCustomerInfo: "Customer/ViewAll",
    getCustomerDetails: "Customer/Details/",
    getCustomerBasicInfo: "Customer/Detail?CustomerID=",
    getCustomerBillingDetails: "Customer/BillingDetail/",
    getMerchantAccountName: "Customer/Detail/MerchantAccount/",
    verifyCustomer: "Customer/Verify",
    subscribeBranch: "Customer/SubscribeBranch",
    deleteCustomer: "Customer/Delete",
    deleteLead: "Lead/Delete",
    updateCustomerEmail: "Customer/UpdateCustomerEmail",
    updateCustomerBillingAddress: "Customer/SaveCustomerBillingAddress",
    ViewAllCustomer: "Customer/ViewAllCustomer",
    ResetCancellationNoShowCount: 'Customer/ResetCancellationNoShowCount'
};

//#endregion`

//#region = Common Report

export const CommonReportApi = {
    getAllMailingList: "CustomerReport/ViewAllMailingList",
    getFirstVisitReport: 'CustomerReport/ViewAllFirstVisit',
    getStaffWiseActivityReport: 'CustomerReport/StaffWiseActivity',
    Fundamental: 'CustomerReport/Fundamental',
    getMemberClassAttendance: 'CustomerReport/MemberClassAttendance',
    viewAll: 'CustomerReport/ViewAll',
    viewAllCustomerActivities: 'CustomerReport/ViewAllCustomerActivities',
    viewAllCustomerBySourceType: 'CustomerReport/ViewAllCustomerBySourceType',
    viewAllCustomerReferral: 'CustomerReport/ViewAllCustomerReferral',
    viewCustomerDetail: 'CustomerReport/ViewCustomerDetail',
    viewCustomerClockInReport: 'CustomerReport/ViewAllCustomerCheckIn',
    viewZeroVisitsReport: 'CustomerReport/ViewAllCustomerZeroVists',
    viewAllRewardProgramSummaryReport: 'CustomerReport/ViewAllRewardProgramSummaryReport',
    getBranchActiveRewardProgramListForReport:"CustomerReport/BranchActiveRewardProgramListForReport",
    viewAllServiceBooking: 'CustomerReport/ViewAllServiceBooking',
    viewAllInventoryChangeLog:'InventoryReport/ViewAllInventoryChangeLog',
    inventoryChangeLogFundamental:'InventoryReport/ViewAll/InventoryChangeLogFundamental',
    viewAllCurrentStock:'InventoryReport/ViewAllCurrentStock',
    viewAllExpiredTerminatedMemberships:'CustomerReport/ViewAllExpiredTerminatedMemberships'

};

//#endregion

//#region = Payment Integration

export const GatewayIntegrationApi = {
    fundamentals: "GatewayIntegration/Fundamental",
    stripe: "GatewayIntegration/Stripe",
    SavePaymentSetting: "GatewayIntegration/SavePaymentSetting",
    goCardLess: "GatewayIntegration/GoCardless",
    Disconnect: "GatewayIntegration/Disconnect",
    BranchPaymentGateway: "GatewayIntegration/BranchConfigureGateways",
    SaveWidgetPaymentGateway: "GatewayIntegration/Save/{paymentGatewayID}",
    SaveWidgetCheckoutPaymentGateway: "GatewayIntegration/SaveCheckOutGateway",
    GetTerminalConfig: "GatewayIntegration/GetTerminalConfig",
    SaveTerminalConfig: "GatewayIntegration/SaveTerminalConfig?allowStripeTerminal={allowStripeTerminal}",
    SaveStripeReader: "Stripe/RegisterReader?registrationCode={registrationCode}&label={label}",
    StripeAccount:"GatewayIntegration/StripeAccount"

}

//#endregion

//#region = Customer Payment Gateway

export const CustomerPaymentGatewayApi = {
    getGatewayFundamentals: "CustomerPaymentGateway/Detail/Fundamental",
    getAllCustomerGateways: "CustomerPaymentGateway/ViewAll",
    getGoCardlessAccounts: "CustomerPaymentGateway/ViewAll/GoCardlessMandate",
    getSEPACoutries: "CustomerPaymentGateway/GetPaymentGatewaySchemeAndCountries",

    saveCustomerGateways: "CustomerPaymentGateway/Save",
    getStripeCardAuthentication: "Sale/AuthenticateCard",
    editGatewayCard: "CustomerPaymentGateway/Update",
    deleteGateway: "CustomerPaymentGateway/Delete",
    makeDefaultGateway: "CustomerPaymentGateway/MakeDefault",
    saveStripeDDAccount: "Plaid/ConnectToPlaid",
    AuthorizationPayTabs: "CustomerPaymentGateway/PayTabsAuthentication",
    GetPaymentAuthorizationForPayTabs: "CustomerPaymentGateway/GetPaymentAuthorizationForPayTabs",
    AuthorizePaymentBasedOnPaymentGateway: "CustomerPaymentGateway/AuthorizePaymentBasedOnPaymentGateway",
    ReleasePaymentBasedOnPaymentGateway: "CustomerPaymentGateway/ReleasePaymentBasedOnPaymentGateway"

};
//#endregion


//#region = Branch Question



//#endregion
//#region = Automation

export const AutomationRuleApi = {
    getFundamentals: "AutomationRule/Fundamental",
    getAllAutomationRule: "AutomationRule/ViewAll",
    saveAutomationRule: "AutomationRule/SaveRule",
    getAllFundamental: "AutomationRule/Fundamental",
    getRuleTemplate: "AutomationRule/RuleTemplate/{eventTypeID}",
    getAutomationRuleDetail: "AutomationRule/Detail/{ruleID}",
    deleteAutomationRule: "AutomationRule/Delete/{ruleID}",
    getAutomationList: "AutomationRule/ViewAll"
};
//#endregion

//#region = CustomerFormApi
export const CustomerFormApi = {
    getAllCustomerForm: "CustomerForm/ViewAll",
    getAllCustomerFormFundamental: "CustomerForm/Fundamental",
    saveSaveManualCustomerForm: "CustomerForm/SaveManualCustomerForm",
    UpdateCustomForm: "CustomerForm/UpdateCustomForm",
    getCustomerFormDetail: "CustomerForm/Detail/",
    deleteCustomerForm: "CustomerForm/Delete/",
    saveCustomerForm: "CustomerForm/UpdateCustomForm",
    saveCustomerForms: "CustomerForm/SaveCustomerForm",
    getCustomerTypeForm: "CustomerForm/GetCustomerTypeForms",
    getMembershipSpecificForms: "CustomerForm/GetMembershipSpecificForms",
    SaveCustomerFormEmail: "CustomerForm/Save/Email",
    SaveCustomerFormSMS: "CustomerForm/Save/SMS",
    getCustomerFormUrl: "CustomerForm/CustomerFormUrl/"
};
//#endregion

// region = Cancel booking API
export const CancelNoShowBookingApi = {
    saveClassNoShowCancelation: 'Attendee/SaveClassNoShowCancelation'
};
//#endregion


// region = WaitList API
export const WaitlistAPI = {
    customerWaitlist: 'WaitList/ViewAll',
    pOSWaitlist: 'WaitList/ViewAllWaitList',
    deleteWaitList: 'WaitList/Delete',
    getWaitListStatusByItemID: 'WaitList/GetWaitListStatusByItemID',
    getCustomerWaitListStatusByItemID: 'WaitList/GetWaitListStatusByWaitListID',
    save : 'WaitList/SaveWaitList'
};
//#endregion

// region = Attribute API
export const AttributeApi = {
    getFundamental: "Attribute/Fundamental",
    getAttributes: "Attribute/ViewAll",
    getAttributeByID: "Attribute/View/",
    saveAttribute: "Attribute/Save",
    deleteAttribute: "Attribute/Delete/",
    getAttributeDetailByID: "Attribute/Get/"
};
//#endregion

// region = Supplier API
export const SupplierApi = {
  getSupplierFundamentals: "Supplier/Fundamental",
  saveSupplier: "Supplier/Save",
  getfundamentals: "Supplier/SaveFundamental",
  getSuppliers: "Supplier/ViewAll",
  getSupplierByID: "Supplier/View/",
  deleteSupplier: "Supplier/Delete/",
}

// region = Brand API
export const BrandApi = {
  getBrandSearchFundamentals: "Brand/SearchFundamentals",
  saveBrand: "Brand/Save",
  getBrands: "Brand/ViewAll",
  viewBrandByID: "Brand/View/",
  getBrandByID: "Brand/Detail/",
  deleteBrand: "Brand/Delete/",
}

// region = Product API
export const ProductApi = {
    getFundamental: "ProductAttribute/Fundamental",
    getGeneratedFundamental: "ProductAttribute/Fundamental/",
    getAttributeValue: "ProductAttribute/GetAttributeValues/",
    generateVariant: "ProductAttribute/GenerateVariant",
    deleteProductVariant: "ProductAttribute/DeleteProductVariant/",
    productVariantBranchUpdate: "ProductAttribute/ProductVariantBranchUpdate",
    productVariantDetail: "ProductAttribute/ProductVariantDetail",
    getArchivedProductVariant:"ProductAttribute/GetArchivedProductVariant/",
    restoreArchivedProductVariant: "ProductAttribute/RestoreProductVariant/",
  
    //// inventory
  
    getInventoryDetail: "Product/GetCurrentStockForInventory/",
    //////////////////////////////////////

    //Core API Used
    getProductFundamentals: "Product/ViewAll/Fundamental",
    productSearch : "Product/ViewAll",
    getDetail : "Product/Detail/",
    getProductPricingDetails: "Product/Detail/Pricing",
    getProductInventoryDetails :"Product/Detail/Inventory",
    deleteProduct:"Product/Delete/",
    saveProduct: "Product/Save",
    getSaveFundamentals: "Product/SaveFundamentals",    
    bulkUpdate :"Product/SaveInventory",
    getProductInventoryDetail: "Product/GetInventoryDetail",
    GetByID: "Product/GetByID/",
    getProductPricingDetail: "Product/GetPricingDetail",
    updatePricingAndPackaging: "Product/UpdatePricingAndPackaging",
    getProductPackagingDetail: "Product/GetProductPackagingDetail/",
    validateBarcodeAndSKU:"Product/ValidateBarcodeAndSKU",

    ///////reports

    reportProductSearch: "InventoryReport/ViewAll/ProductSearch",
  }

  export const PurchaseOrderApi = {
    getFundamentals: "PurchaseOrder/Fundamental",
    getPurchaseOrdersList: "PurchaseOrder/GetPurchaseOrderList",
    getProductVariants:"PurchaseOrder/GetProductVariants",
    savePurchaseOrder:"PurchaseOrder/Save",
    getPurchaseOrderDetailByID:"PurchaseOrder/Detail?PurchaseOrderID=",
    getGRNDetailByID:"PurchaseOrder/DetailGRN?grnID=", 
    getPurchaseOrderByID:"PurchaseOrder/GetPurchaseOrderByID?PurchaseOrderID=",
    cancelPurchaseOrder:"PurchaseOrder/Cancel?PurchaseOrderID=",
    deletePurchaseOrder:"PurchaseOrder/Delete?PurchaseOrderID=",
    deletePurchaseOrderDetailID:"PurchaseOrder/Delete/PurchaseOrderDetailID?PurchaseOrderDetailID=",
    GetRecivePurchaseOrder:"PurchaseOrder/GetRecivePurchaseOrder?PurchaseOrderID=",
    MarkAsReceive:"PurchaseOrder/MarkAsReceive/",
    SaveRecivePurchaseOrder:"PurchaseOrder/SaveRecivePurchaseOrder",
    getPurchaseOrderReport: "EnterpriseInventoryReport/GetPurchaseOrder?purchaseOrderID={0}&branchID={1}&isGrn=",
    sendEmail:"PurchaseOrder/Email"
    
  }
//#endregion

export class CancellationPolicy {
    public classCancellationPolicy: ClassCancellationPolicy = new ClassCancellationPolicy();
    public serviceCancellationPolicy: ServiceCancellationPolicy = new ServiceCancellationPolicy();
    public DurationTypeList: DurationTypeList[];
    public membershipCancellationPolicy: MemberCancellationPolicy = new MemberCancellationPolicy(); 
    // public classServiceResetBy : ClassServiceResetBy = new ClassServiceResetBy();
}
export class MemberCancellationPolicy{
    public IsMembershipCancellationPolicyEnabled: boolean;
    public IsCancelAnyTimeEnabledForWidgetAndApp: boolean;
    public IsCancelOutsideTheContractEnabledWidgetAndApp: boolean = false;
}

export class ClassCancellationPolicy {

    // Cancellation classes 
    public IsClassCancellation: boolean;
    public IsClassCancellationEarly: boolean;
    public ClassCancellationEarlyDisplayText: string;
    public IsClassCancellationEarlyBenefit: boolean;
    public IsClassReschedule: boolean;
    public ClassRescheduleDisplayText: string;
    public ClassRescheduleEndsBefore: number = 0;
    public ClassRescheduleEndsBeforeDurationType: number;
    public ClassRescheduleRule: number;
    public ClassRescheduleLimit: number;
    public IsClassCancellationLate: boolean;
    public ClassCancellationLateDisplayText: string;
    public IsClassCancellationLateBenefit: boolean;
    public ClassCancellationLateFlatFeeMember: number = 0;
    public ClassCancellationLateFlatFeeClientLead: number = 0;
    public ClassCancellationLatePercentageFeeMember: number = 100;
    public ClassCancellationLatePercentageFeeClientLead: number = 100;
    public IsClassCancellationLatePaymentChargeInstantly: boolean;
    public IsClassCancellationLatePaymentChargeLater: boolean;
    public IsClassCancellationLateRefundColumn: boolean;
    public IsClassCancellationLateFlatFee: boolean;
    public IsClassCancellationLateFee: boolean;
    public IsClassRescheduleBenefit: boolean;

    // Now show classes
    public IsClassNoShow: boolean;
    public IsClassNoShowFee: boolean;
    public IsClassNoShowBenefit: boolean;
    public ClassNoShowFlatFeeMember: number = 0;
    public ClassNoShowFlatFeeClientLead: number = 0;
    public ClassNoShowPercentageFeeMember: number = 100;
    public ClassNoShowPercentageFeeClientLead: number = 100;
    public IsClassNoShowFlatFee: boolean;

    // block booking classes 
    public IsClassBlockBooking: boolean;
    public IsClassBlockBookingAlert: boolean;
    public ClassBlockBookingCancellationAfterClientLead: number = 1;
    public ClassBlockBookingCancellationAfterMember: number = 1;
    public ClassBlockBookingNoShowAfterClientLead: number = 1;
    public ClassBlockBookingNoShowAfterMember: number = 1;

    // Reset By
    public ClassCancellationLateAndNoShowCountResetBy: string;
    public ClassCancellationLateAndNoShowCountResetOn: string;
}

export class ServiceCancellationPolicy {

    // Cancellation services
    public IsServiceCancellation: boolean;
    public IsServiceCancellationEarly: boolean;
    public ServiceCancellationEarlyEndsBefore: number = 0;
    public ServiceCancellationEarlyDisplayText: string;
    public IsServiceCancellationEarlyBenefit: boolean;
    public IsServiceReschedule: boolean;
    public ServiceRescheduleDisplayText: string;
    public ServiceRescheduleEndsBefore: number = 0;
    public ServiceRescheduleEndsBeforeDurationType: number = 0;
    public ServiceCancellationEarlyEndsBeforeDurationType = 0;
    public ServiceRescheduleRule: number = 0;
    public ServiceRescheduleLimit: number = 0;
    public IsServiceCancellationLate: boolean;
    public ServiceCancellationLateDisplayText: string;
    public IsServiceCancellationLateBenefit: boolean;
    public ServiceCancellationLateFlatFeeMember: number = 0;
    public ServiceCancellationLateFlatFeeClientLead: number = 0;
    public ServiceCancellationLatePercentageFeeMember: number = 100;
    public ServiceCancellationLatePercentageFeeClientLead: number = 100;
    public IsServiceCancellationLatePaymentChargeInstantly: boolean;
    public IsServiceCancellationLatePaymentChargeLater: boolean;
    public IsServiceCancellationLateRefundColumn: boolean;
    public IsServiceCancellationLateFlatFee: boolean;
    public IsServiceCancellationLateFee: boolean;
    public IsServiceRescheduleBenefit: boolean;

    // Now show services
    public IsServiceNoShow: boolean;
    public IsServiceNoShowFee: boolean;
    public IsServiceNoShowBenefit: boolean;
    public ServiceNoShowFlatFeeMember: number = 0;
    public ServiceNoShowFlatFeeClientLead: number = 0;
    public ServiceNoShowPercentageFeeMember: number = 100;
    public ServiceNoShowPercentageFeeClientLead: number = 100;
    public IsServiceNoShowFlatFee: boolean;

    // Block booking services
    public IsServiceBlockBooking: boolean;
    public IsServiceBlockBookingAlert: boolean;
    public ServiceBlockBookingCancellationAfterClientLead: number = 1;
    public ServiceBlockBookingCancellationAfterMember: number = 1;
    public ServiceBlockBookingNoShowAfterClientLead: number = 1;
    public ServiceBlockBookingNoShowAfterMember: number = 1;

    //Reset By
    public ServiceCancellationLateAndNoShowCountResetBy: string;
    public ServiceCancellationLateAndNoShowCountResetOn: string;

}

export class DurationTypeList {
    public DurationTypeID: number;
    public DurationTypeName: number;
}

export class ClassServiceResetBy {
    public ClassResetBy: string = "";
    public ClassResetDate: string = "";
    public ServiceResetDate: string = "";
    public ServiceResetBy: string = "";

    public ClassResetCountDate : string;
    public ClassResetCountBy : string;
    public ServiceResetCountDate : string;
    public ServiceResetCountBy : string;

}
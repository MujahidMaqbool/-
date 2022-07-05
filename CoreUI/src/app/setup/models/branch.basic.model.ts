export class BrachBasic {

    public BranchEmailFromName: string;
    public BranchReplyToEmail: string;

    public SuspendCustomerEmail: boolean;
    public SuspendOutgoingSMS: boolean;
    public SuspendOutgoingNotification: boolean;
    public RestrictCustomerInvoiceEmail: boolean;
    public SuspendAllBenefits : boolean;
    public MembershipItemsShowPriceOnlineForWidgetAndApp: boolean = false;
    public SuspendDoorCheckInBenefits: boolean;
    public SuspendServiceBenefits: boolean;
    public SuspendClassBenefits: boolean;
    public SuspendProductBenefits: boolean;

    public ClassShowFreeSpacesOnWidgetAndApp: boolean;
    public ServiceCustomerCheckIn: boolean;
    public RewardProgramOnWidgetAndApp: boolean;
    public RewardProgramCancellationAndRefund: boolean;
    public RevokeRewardPointsonCacellationandRefund: boolean;

    public ServiceCustomerCheckInStartsBefore: number;
    public ServiceCustomerCheckInEndsAfter: number;
    public ServiceLeadTime: number;
    public ServiceTimeSlotsInterval: number;

    public CheckInStartBefore: string;
    public CheckInEndAfter: string;

    public ServiceCustomerCheckInStartsBeforeDurationTypeId : number;
    public ServiceCustomerCheckInEndsAfterDurationTypeId : number;


    public ClassCustomerCheckIn: boolean;
    public ClassCustomerCheckInStartsBefore: number;
    public ClassCustomerCheckInEndsAfter: number;
    public ClassCustomerCheckInStartsBeforeDurationTypeId : number;
    public ClassCustomerCheckInEndsAfterDurationTypeId : number;

    public IsClassBookingForFamilyAndFriends: boolean;
    public IsClassBookingDiscountBenefitsForFamilyAndFriends: boolean;
    public IsClassBookingFreeBenefitsForFamilyAndFirends: boolean;

    public DateFilterForClasses: number;
    public accessControl: any;
}

export class BasicAccessControl {
  public MemberBLEAccess: boolean;
  public MemberNFCAccess: boolean;
  public StaffBLEAccess: boolean;
  public StaffNFCAccess: boolean;
  public StaffDoorAccessTiming: number = 1;
  public StaffDoorAccessTimeGracePeriodInMinutes: number;
  public StaffDoorAccessTimeGracePeriodInMinutesText: string;
}

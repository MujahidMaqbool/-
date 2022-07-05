export class MemerClockInInfo {
    MemberID: number;
    Title: string;
    FirstName: string;
    LastName: string;
    Email: string;
    ImagePath: string;
    MemberMessage: string;
}

export class MemberMessage {
    Title: string;
    Description: string;
}

export class MemberAttendanceDetail {
    public CustomerID: number;
    public CustomerName: string;
    public BranchName: string;
    public MessageTitle: string;
    public Message: string;
    public ImagePath: string;
    public CustomerMembershipList: CustomerMembership[];
}

export class CustomerMembership {
    public MembershipID: number;
    public CustomerMembershipID: number;
    public MembershipName: string;
    public ExpirationDate: Date;
    // public MembershipTypeID: number;
    public MembershipStatusTypeID:number;
    public BranchID: number;
    public BranchName: string;
    public MemberhsipConcatName: string;
    
}

export class BranchTimingListForMemberShip {
    public Name: string;
    public StartTime?: any;
    public EndTime?: any;
    //public MembershipRestrictionTypeID?: any;
    public IsNoAccess:boolean;
    //public ClassCode:string;
    //public IsTodayAttendanceMarked:boolean;
    public IsBranchTime: boolean;
}

export class MembershipGlobalSessionDetail {
    public DurationTypeID: number;
    public DurationTypeName: string;
    public MembershipBenefitsTypeID: number;
    public MembershipBenefitsTypeName: string;
    public NoLimits: boolean;
    public SessionConsumed: number;
    public TotalSessions: number;
}

export class MembershipAlertMessages{
    public MembershipAlertMessage: string;
    public MessageCode: number;
    public RestrictionTypeId: number;
}

export class MemberClassDetail {
    // public ClassID: number;
    // public ClassCode: number;
    // public ClassName: string;
    // public StartTime: string;
    // public EndTime: string;
    // public BookingStatusTypeID: number;
    // public IsFree: boolean;
    // public ImagePath: string;
    // public IsAttended: boolean;
    // public SaleDetailID: number;
    // public ClassStatus: string;
    // public SaleStatusTypeName: string;


    public ClassID: number;
    public ClassName: string;
    public DiscountPercentage: number;
    public EndTime: string;
    public ImagePath: string;
    public IsAttended: boolean;
    public IsClassBooked: boolean;
    public IsFree: boolean;
    public IsMembershipBenefit: boolean;
    public SaleDetailID: number;
    public StartTime: string;
    public IsItemBenefitsSuspended: boolean;
    
}

export class MembershipMessage {
    public MembershipMessage: string;
    public MembershipMessageTitle: string;
    public MessageCode: string;
    public RestrictionTypeId?:number;
}

export class MembershipClockin {
    public CustomerID: number;
    public CustomerMembershipID: number;

}

export class CustomerMembershipPaymentInfoList {
    public CollectionDate: string;
    public PaymentStatusTypeName: string;
}

export class  MemberMembershipMessages{
    public Title: string;
    public MemberMessage: string;
}
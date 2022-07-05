export class MemberMembershipBenefitsSearch {
    public MemberMembershipID: number;
}

export class searchMembership {
    public BranchID : number;
    public CustomerMembershipID : number;
    public MembershipName : string;
    public MembershipStatusName : string;
    public MembershipStatusTypeID : number;

}

export class MemberBenefitsViewModel {
    public BenefitDurationTypeName: string;
    public BenefitName: string;
    public BenefitSessionConsumed: number;
    public BenefitSessionRemaining: number;
    public BranchID: number;
    public BenefitSessionStatus: string;
    public Notes: string;
    public NoLimits : boolean;
    public BenefitsTotalSessions: number;
    public MembershipBenefitsTypeID: number;
    public CustomerMembershipBenefitsID: number;
    public MemberBenefits: MemberBenefitsBranch[];
    
    public BranchName: string;
    public MembershipName: string;
    public MemberhsipConcatName: string;
    public BenefitResetDate: string;
}

export class MemberBenefitsBranch {
    public BracnchID: number;
    public BranchName: string;
    public MemberBenefitsItemDetail: MemberBenefitsItemDetails[]
    public BenefitResetDate: string;
}

export class MemberBenefitsItemDetails {
    public BranchID: number;
    public DurationTypeName: string;
    public ItemName: string;
    public ItemID: number;
    public ItemTypeID: number;
    public SessionConsumed: number;
    public SessionRemaining: number;
    public SessionStatus: string;
    public TotalSessions: number;
    public Notes: string;
    public NoLimits : boolean;
    public CustomerMembershipBenefitsDetailID: number;
}

/** update Member Membership benefits **/
export class UpdateMemberBenefits {
    public CustomerMembershipBenefitsID: number;
    public CustomerMembershipBenefitsDetailID: number;
    public BranchID: number;
    public ItemName: string;
    public ItemID: number;
    public ItemTypeID: number;
    public SessionAllowed: number;
    public SessionConsumed: number;
    public Notes: string;
    public MembershipBenefitTypeID: number;
    public CustomerMembershipID: number;
    public MembershipTotalSessions: number;
    public RollOverBenefitsOnEachInterval:boolean;
    
}

/** Benefits Models **/

export class MemberBenefitsVM {
    isSuspendAll: boolean;
    SuspendBenefitType: number = 0;
    memberBenefits: MemberBenefits[]
}

export class MemberBenefits {
    public CustomerMembershipBenefitsID: number;
    public MembershipBenefitsTypeName: string;
    public isChecked: boolean = false;
    public SuspendBenefitType: number = 0;
    public isFree: boolean;
    public IsBenefitsSuspended: boolean;
    public isDiscount: boolean;
    public MembershipBenefitsTypeID: number;
    public EnforceManualSetting : boolean;
}
import { DecimalPipe } from "@angular/common";

export class MemberDashboardSearchParam {
    public MemberId: number;
    public ServiceDate: string;
    public DateFrom: string;
    public DateTo: string;
    public paymentStatusTypeID: number;
    public itemTypeID: number = 0;
    public isClient: boolean = null;
    public saleRevenueCustomerTypeID?: number = 0;
    public ClubVisitsCustomerTypeID?: number = 0;
    public CustomerTypeID?: number = 0;
    public ServiceBookedCustomerTypeID?: number = 0;
    public SaleBreakDownCustomerTypeID?: number = 0;
    public AppSourceTypeID?: number = 0;
}

export class MemberInfo {

    public MemberTitle: string;
    public MemberFullName: string;
    public MemberEmail: string;
    public MemberMobile: string;
    public MemberAddress: string;
    public MemberPostCode: string;
    public MemberJoiningDate: Date; // Member joining  Date is joining date of Birth
    public CreatedOn: Date; // Created on Date is joining date
    public ImagePath: string;
    public KinFullName: string;
    public kinEmail: string;
    public KinMobile: string;
    public KinAddress: string;
    public KinPostCode: string;
    public ItemType: string;
    public ClockInDate: Date;
    public ItemName: string;
    public AssignedStaff: string;
    public TotalVisits: number;
    public Gender: string;
}


export class MemberActivities {

    public ActivityTypeID: number;
    public ActivityTypeCount: number;

}
export class MemberBooking {

    public ActivityTypeID: number;
    public AppSourceTypeID: number;
    public ActivityTypeCount: number;

}
export class TotalRevenue {

    public ActivityTypeID: number;
    public AppSourceTypeID: number;
    public ActivityTypeCount: number;

}
export class TotalSaleCount {
    public TotalClassSale: number;
    public TotalMembershipSale: number;
    public TotalProductSale: number;
    public TotalSale: number;
    public TotalServiceSale: number;
}
export class MemberServices {

    public ActivityTypeID: number;
    public AppSourceTypeID: number;
    public ActivityTypeCount: number;

}
export class MemberProducts {

    public ActivityTypeID: number;
    public AppSourceTypeID: number;
    public ActivityTypeCount: number;
  
}
export class LeadStatusTypeListMainDashBorad {
    LeadStatusTypeFriendlyName: string;
    LeadStatusTypeID: number;
    public TotalLead:number;
}
export class MemberAttendanceSummary {

    public TotalAttendance: number;
    public ClockInDate: string;
    public GraphType?:any;
}

export class customerBirthdaySummary {
    public ImagePath: string;
    public CustomerName: string;
    public CreatedOn: string;
    public BirthDate: string;
    public CustomerType: string;
    public Countdown: string;
    CountDown:number;
}
export class MemberClubVisits {
    public TotalClient: number;
    public Date: string;
    public Time?:any;
    public GraphType:any;
}

export class MembershipsExpiry {
    Duration: number;
    DurationDescription: string;
}

export class MemberPayment {

    public MonthNames: string;
    public Paid: DecimalPipe;
    public Overdue: DecimalPipe;
}

export class MemberActiveMemberships {

    public MembershipDuration: number;
    public MembershipName: string
    public TotalDays: number;
    public StartDate: string;
    public EndDate: string;
    public IsAutoRoll: boolean;
    public Paid: string;
    public MembershipPercentage: number;
    public BranchID: number;

}



export class MemberSnapshot {
    public IncreasingFrequency: number = 0;
    public MoreThanFiftyTimes: number = 0;
    public LastSevenDaysAttended: number = 0;
    public ExpiredContractPeriod: number = 0;
    public TotalMemberships: number = 0;
    public NotAttended: number = 0;
    public SleepingMembers: number = 0;
    public MembershipRetention: number = 0;
    public MissedPayment: number = 0;
    public PrePayMembers: number = 0;
    public TotalActiveMember:number = 0;
}

export class MemberByStatus {
    public Total: number;
    public MembershipStatusTypeID: number;
    public MembershipStatusTypeName: string;
}

export class MemberServiceAndAttendance {
    Date: any;
    TotalAttendance: any;
    TotalSaleService: any;
    Time:any;
}


export class MemberTotalRevenue {

    public ActivityTypeID: number;
    public AppSourceTypeID: number;
    public ActivityTypeCount: number;

}
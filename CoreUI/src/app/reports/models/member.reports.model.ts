export class MemberReportSearchParameter {
    public IsActive: number = 1;
    public CustomerID: number;
    public Name: string = "";
    public CustomerName: string = "";
    public Email: string = "";
    public MembershipID: number = 0;
    public MembershipStatusTypeID: number = 0;
    public EnquirySourceTypeID: number = 0;
    public DateFrom: string = "";
    public DateTo: string = "";
    public MembershipMemberID: number;
    public MemberMembershipID: number;
    public SingleMembershipMemberID: number;
    public SingleMemberID: number;
    public ActivityTypeID?: number = 0;
    public CustomerMemberMembership: any;
    public FileType: string = "";
}
export class CustomerReportSearchParameter {
    public IsActive: number = 1;
    public CustomerID: number;
    public CustomerTypeID: number = 0;
    public customerStatusID: number = 0;
    public Name: string = "";
    public CustomerName: string = "";
    public Email: string = "";
    public MembershipID: number = 0;
    public MembershipStatusTypeID: number = 0;
    public EnquirySourceTypeID: number = 0;
    public DateFrom: string = "";
    public DateTo: string = "";
    public MembershipMemberID: number;
    public MemberMembershipID: number;
    public SingleMembershipMemberID: number;
    public SingleMemberID: number;
    public ActivityTypeID?: number = 0;
    public CustomerMemberMembership: any;
    public FileType: string = "";
    public PaymentGatewayID: number;
    public MembershipCategoryID : number;
    public PaymentStatusTypeID: number;
    public MembershipStatusID: number;
    public CustomerMembershipID: number;
}


export class MemberMembership {
    /* Shared */
    public MembershipID: number;
    public MemberMembershipID: number;
    public MembershipName: string;
    public StartDate: Date;
    public EndDate: Date;
    public MembershipStatusTypeID: number;
    public MembershipStatusTypeName: string;
}


export class Membership {
    /* Shared */
    public MembershipID: number;
    public MembershipName: string;
}


export class MembershipStatus {
    /* Shared */
    public MembershipStatusTypeID: number;
    public MembershipStatusTypeName: string;
}

export class EnquirySourceType {
    /* Shared */
    public EnquirySourceTypeID: number;
    public EnquirySourceTypeName: string;
}

export class MembershipCategoryType {
    /* Shared */
    public MembershipCategoryID: number;
    public CategoryName: string;
}

export class PaymentGatewayList {
    PaymentGatewayID: number;
    PaymentGatewayName: string;
}

export class PaymentStatusTypeList {
    PaymentStatusTypeID: number;
    PaymentStatusTypeName: string;
}
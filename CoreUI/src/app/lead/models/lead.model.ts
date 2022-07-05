
export class LeadSearchParameter {
    public CustomerName: string = "";
    public MembershipID?: number = null;
    public LeadStatusTypeID?: number = null;
    public AssignedToStaffID?: number = null;
    public Email: string = "";
    public DateFrom: string = "";
    public DateTo: string = "";
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number = 2;
    public SortOrder: string = "DESC";
}

export class SaveLead {
    public CustomerID: number = 0;
    public MembershipID: number;
    public EnquirySourceTypeID: number = 15;
    public AssignedToStaffID: number;
    public Title: string;
    public FirstName: string = "";
    public LastName: string = "";
    public Email: string = "";
    public Gender: string;
    public Phone: string;
    public Mobile: string;
    public Description: string = "";
    public Address1: string = "";
    public Address2: string;
    public CountryID: number;
    public StateCountyName: string;
    public CityName: string;
    public PostCode: string;
    public ImageFile: string;
    public ImagePath: string;
    public FirstAidAllowed = false;
    public EmailAllowed = true;
    public SMSAllowed = true;
    public PhoneCallAllowed = true;
    public PostalMailAllowed = true;
    public BirthDate: Date;
    public AllowPartPaymentOnCore = true;
    public AllowPartPaymentOnWidget = true;
    public CustomerAddress: Array<any> = [];
    public PushNotificationAllowed = true;
    public RewardProgramAllowed: boolean = true;
    public Occupation: string = null;
    public CompanyName: string;
    public ReferenceCustomerID: number;
    public ReferenceCustomerName: string;
    public ClassResetBy: string;
    public ClassResetDate: string;
    public ClassLateCancellationCount: number;
    public ClassNoShowCount: number;
    public ServiceResetBy: string;
    public ServiceResetDate: string;
    public ServiceLateCancellationCount: number;
    public ServiceNoShowCount: number;
    public IsClassBookingBlocked: boolean;
    public IsServiceBookingBlocked: boolean;
    public IsCustomerEnrolledRewardProgram: boolean;
    public DoorAccessAllowed : boolean = false;
}

export class UpdateLead {
    public CustomerID: number;
    public EnquirySourceTypeID: number;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Gender: string;
    public Phone: string;
    public Mobile: string;
    public Address1: string;
    public Address2: string;
    public CountryID: number;
    public StateCountyID: number;
    public StateCountyName: string;
    public CityName: string;
    public PostCode: string;
    public Description: string;
    public ImageFile: string;
    public ImagePath: string;
    public FirstAidAllowed: boolean = true;
    public EmailAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public PhoneCallAllowed: boolean = true;
    public PostalMailAllowed: boolean = true;
    public RewardProgramAllowed: boolean;
    public BirthDate: Date;
    public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
    public PushNotificationAllowed = true;
    public CustomerAddress: Array<any> = [];
    public Occupation: string = null;
    public CompanyName: string;
    public ReferenceCustomerID: number;
    public ReferenceCustomerName: string;
}

export class LeadActivityInfo {
    public LeadName: string = "";
    public Email: string = "";
    public Mobile: number;
    public Phone: number;
    public StaffName: string = "";
    public MembershipName: string = "";
    public LeadStatusTypeID: number;
    public AssignedToStaffID: number;
    public Address1: string;
}

export class LeadOnBoard {
    public CustomerID: number;
    public CustomerName: string;
    public Email: string;
    public Mobile: string;
    public MembershipID: number;
    public MembershipName: string;
    public AssignToStaffName: string;
    public LeadStatusTypeID: number;
}

export class LeadStatus {
    public CustomerID: number;
    public MembershipID: number;
    public LeadStatusTypeID: number;
}


export class LeadAssignedTo {
    public CustomerID: number;
    public MembershipID: number;
    public AssignedToStaffID: number;
}

export class LeadLostReasonModel {
    CustomerID: number;
    MembershipID: number;
    LostReasonTypeID: number;
    Description: string;
}

export class LeadDetail {
    public MembershipName: string;
    public LeadStatusTypeName: string;
    public EnquirySourceTypeName: string;
    public AssignedToStaffName: string;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Gender: string;
    public CountryName: string;
    public StateCountyName: string;
    public CityName: string;
    public Phone: string;
    public Mobile: string;
    public Address1: string;
    public Address2: string;
    public PostCode: string;
    public Description: string;
    public ImagePath: string;
    public BirthDate: any;
    public FirstAidAllowed: boolean = true;
    public EmailAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public PhoneCallAllowed: boolean = true;
    public PostalMailAllowed: boolean = true;
    public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
    public CustomerMembershipList: CustomerMembershipList[] = [];
    public Occupation: string;
    public CompanyName: string;
    public ReferenceCustomerID: number;
    public ReferenceCustomerName: string;
    public PushNotificationAllowed: boolean = true;
    public CreatedOn:string;

}

export class CustomerMembershipList {
    AssignedToStaffID: number
    AssignedToStaffName: string;
    CustomerID: number;
    IsLead: boolean;
    LeadStatusTypeFriendlyName: string;
    LeadStatusTypeID: number;
    MembershipID: number;
    MembershipName: string;
    MembershipStatusTypeID: number;
}



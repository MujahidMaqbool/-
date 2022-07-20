import { SaveMemberMembership } from "./member.membership.model";
import { CustomerAddress } from "src/app/models/common.model";
import { CustomFormView } from "src/app/models/customer.form.model";

export class SaveMember {

    public CustomerID: number;
    public LeadID: number;
    public EnquirySourceTypeID: number;
    public MembershipID: number;
    public Title: string = "";
    public FirstName: string = "";
    public LastName: string = "";
    public CardNumber: string = "";
    public Email: string = "";
    public Gender: string;
    public BirthDate: Date;
    public Phone: number;
    public Mobile: number;
    public Address1: string = "";
    public Address2: string = "";
    public CountryID: number;
    public StateCountyID: number;
    public CityName: string;
    public PostCode: string = "";
    public ImageFile: string = "";
    public ImagePath: string = "";
    public Description: string = "";
    public FirstAidAllowed: boolean = true;
    // public IsActive: boolean = true;

}

export class MemberRedirectInfo {

    public LeadID: number;
    public IsRedirect: boolean = false;

}

export class SavePageMember {
    public CustomerID: number = 0;
    public PublicToken: string;
    public LeadID: number;
    public EnquirySourceTypeID: number = 15; //by default wellyx core
    public ReferenceCustomerID: number;
    public ReferenceCustomerName: string;
    public CardNumber: string;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Gender: string;
    public BirthDate: Date;
    public Phone: string;
    public Mobile: string;
    public Address1: string;
    public Address2: string;
    public CountryID: number;
    public StateCountyName : string;
    public CityName: string;
    public PostCode: string;
    public ImageFile: string;
    public ImagePath: string;
    public CompanyName: string;
    public Description: string;
    public FreeClassSuspended: boolean = false;
    public ContractSigned: boolean = false;
    public FirstAidAllowed: boolean = false;
    public OnlineAccessAllowed: boolean = false;
    public EmailAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public PhoneCallAllowed: boolean = true;
    public PostalMailAllowed: boolean = true;
    public MemberMessageAllowed: boolean = false;
    public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
    public RewardProgramAllowed: boolean = true;
    public isCutomerViewedRewardProgramSkipped:boolean;
    public cutomerViewedRewardProgramID:number;
    // public IsActive: boolean = true;
    public AccountDetail: AccountDetail = new AccountDetail();
    public MemberMembership?: SaveMemberMembership = new SaveMemberMembership();
   // public BillingAddress: CustomerBillingAddress = new CustomerBillingAddress();
    public MembershipForms: CustomFormView[] = new Array<CustomFormView>();
    public CustomerAddress: Array<CustomerAddress> = [];
    public StateList: Array<any> = [];
    public PushNotificationAllowed: boolean = true;
    public Occupation: string;
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
    public DoorAccessAllowed : boolean  = true;
    public CardAccessID  : number;




}

export class MemberInfo {
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Mobile: string;
    public Address: string;
    // public IsActive: boolean = true;
    public ImagePath: string;
}

export class MemberSearchParameter {
    public CustomerName: string;
    public CardNumber: string;
    public Email: string;
    public IsActive: any = 1;
    public JoiningDateFrom: string;
    public JoiningDateTo: string;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    public MembershipID: number = null;
    public MembershipStatusTypeID: number = null;
}


export class AllMembers {
    public CustomerID: number;
    public CardNumber: number;
    public CustomerName: string;
    // public IsActive: boolean = true;
    public Email: string = "";
    public Mobile: number = 1;
    public CreatedOn: string;
    public IsLead: false;
}

export class MemberDocument {
    public CustomerID: number = 0;
    public DocumentName: string = "";
    public Description: string = "";
    public DocumentPath: string = "";
    public CustomerDocumentID: string = "";
    public CreatedOn: string = "";
}
export class DocumentSearch {
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    public customerID: number = 0;
}
export class MemberDetail {
   public CustomerID: number;
   public EnquirySourceTypeName: string;
   public ReferenceCustomerName: string;
   public CardNumber: string;
   public Title: string;
   public FirstName: string;
   public LastName: string;
   public Email: string;
   public Gender: string;
   public BirthDate: string;
   public Phone: string;
   public Mobile: string;
   public Address1: string;
   public Address2: string;
   public CountryName: string;
   public StateCountyName: string;
   public CityName: string;
   public PostCode: string;
   public ImagePath: string;
   public CompanyName: string;
   public Description: string;
   public FreeClassSuspended: boolean;
   public ContractSigned: boolean;
   public FirstAidAllowed: boolean;
   public OnlineAccessAllowed: boolean;
   public EmailAllowed: boolean;
   public SMSAllowed: boolean;
   public PhoneCallAllowed: boolean;
   public PostalMailAllowed: boolean;
   public MemberMessageAllowed: boolean;
   public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
   public Occupation: string;
   // IsActive: boolean = true;
   public MemberMembershipList: MemberMembershipList[];
   public PushNotificationAllowed : boolean = true;
   public IsWalkedIn:boolean;
   public CreatedOn: string;
}

export class MemberMembershipList {
   public MembershipID: number;
   public MembershipName: string;
   public MembershipStartDate: string;
   public MembershipStatusTypeID: number;
   public MembershipStatusTypeName: string;
}

export class AccountDetail{
    public ID: string;
    public Name: string;
    public Mask: string;
    public SubType: string;
    public Type: string;
}

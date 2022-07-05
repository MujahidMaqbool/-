import { CustomerAddress } from "@app/models/common.model";

export class Client {
    public CustomerID: number;
    public FirstName: string = "";
    public LastName: string = "";
    public Email: string = "";
    public DateofBirth: Date;
    public IsBenefitView: boolean = false;
}

export class SearchClient {
    public Name: string = "";
    public Mobile: string = "";
    public Email: string = "";
    public SortIndex: number;
    public SortOrder: string = "";
}

export class SaveClient {
    public CustomerID: number = 0;
    public EnquirySourceTypeID: number = 15; //by default wellyx core
    public Title: string;
    public FirstName: string = "";
    public LastName: string = "";
    public Email: string = "";
    public Gender: string;
    public BirthDate: Date;
    public Phone: string;
    public Mobile: string;
    public Address1: string = "";
    public Address2: string = "";
    public CountryID: number;
    //public StateCountyID: number;
    public StateCountyName  : string;
    public PostCode: string = "";
    public CityName: string;
    public ImageFile: string = "";
    public ImagePath: string = "";
    public Description: string = "";
    public IsWalkedIn?: boolean;
    public IsActive: boolean = true;

    public FirstAidAllowed: boolean = false;
    public EmailAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public PhoneCallAllowed: boolean = true;
    public PostalMailAllowed: boolean = true;
    public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
    public PushNotificationAllowed: boolean = true;
    public RewardProgramAllowed: boolean = true;
   // public BillingAddress?: CustomerBillingAddress;
    public CustomerAddress: Array<CustomerAddress> = [];
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

export class ClientDetail {
    public ClientID: number;
    public EnquirySourceTypeName: string = "";
    public Title: string;
    public FirstName: string = "";
    public LastName: string = "";
    public FullName: string = "";
    public Email: string = "";
    public Gender: string;
    public BirthDate: Date;
    public Phone: number;
    public Mobile: number;
    public Address1: string = "";
    public Address2: string = "";
    public CountryName: string = "";
    public StateCountyName: string = "";
    public CityName: string;
    public PostCode: number;
    public ImagePath: string;
    public Description: string = "";
    public FirstAidAllowed: boolean = true;
    public EmailAllowed: boolean = true;
    public SMSAllowed: boolean = true;
    public PhoneCallAllowed: boolean = true;
    public PostalMailAllowed: boolean = true;
    public AllowPartPaymentOnCore: boolean = true;
    public AllowPartPaymentOnWidget: boolean = true;
    public PushNotificationAllowed: boolean = true;
}
export class CountryList {
    public CountryID: number;
    public CountryName: string = "";
}
export class EnquirySourceTypeList {
    public EnquirySourceTypeID: number;
    public EnquirySourceTypeName: string = "";
}

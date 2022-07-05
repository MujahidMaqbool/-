
export class Branch {

   constructor() { };
   public CountryID: number;
   public BranchID: number = 0;
   public BranchName: string;
   public CountryName: string;
   public Address1: string;
   public Address2: string;
   public CompanyID: number = 2;
   public StateCountyName: string;
   public City: string;
   public Email: string;
   public Phone1: string;
   public Mobile: string;
   public Fax: string;
   public PostalCode: string;
   public IsActive: boolean = true;
   public IsOnline: boolean = true;
   public SuspendCustomerEmail: boolean;
   public DontRequireClientPaymentMethodwhenTotalZero: boolean;
   public DontRequireMemberPaymentMethodwhenTotalZero: boolean;
   public SuspendFreeClassWhenPaymentFailed: boolean;
   public CityName: string;
   public PageNumber: number = 1;
   public PageSize: number = 10;
   public PrefixTypeNamePOS: string;
   public PrefixTypeNameMembership: string;
   public TimeZone: string;
   public Currency: string;
   public PrivacyPolicyURL: string;
   public TermsOfServiceURL: string;
   public BranchTimeFormat12Hours: boolean = false;
   public SundayStartTime: string;
   public SundayEndTime: string;
   public MondayStartTime: string;
   public MondayEndTime: string;
   public TuesdayStartTime: string;
   public TuesdayEndTime: string;
   public WednesdayStartTime: string;
   public WednesdayEndTime: string;
   public ThursdayStartTime: string;
   public ThursdayEndTime: string;
   public FridayStartTime: string;
   public FridayEndTime: string;
   public SaturdayStartTime: string;
   public SaturdayEndTime: string;
   public AllowPartPayment: boolean;
   public BranchEmailFromName: string;
   public BranchReplyToEmail: string;
   public WidgetPartPaymentFriendlyName: string;
   public PartialPaymentLable: string;

   public isSelectAllBenefits: boolean;
   public SuspendClassBenefits: boolean;
   public SuspendDoorCheckInBenefits: boolean;
   public SuspendProductBenefits: boolean;
   public SuspendServiceBenefits: boolean;
   public RestrictCustomerInvoiceEmail: boolean;
   //----Partial Payment default value 100% As per Discussion with Tahir sab in meeting on 28-Feb-2020---//
   public WidgetPartPaymentForMember: number ;
   public WidgetPartPaymentForNonMember: number;
}

export class BranchWorkTime {
   public DayID: number;
   public StartTime: string;
   public EndTime: string;
}

export class BranchForSave {
   public CountryID: number;
   public BranchID: number;
   public BranchName: string;
   public CompanyID: number;
   public StateCountyName: string;
   public CityName: string;
   public Address1: string;
   public Address2: string;
   public PostalCode: string;
   public Email: string;
   public Mobile: string;
   public Phone1: string;
   public Fax: string;
   public IsActive: boolean;
   public IsOnline: boolean;
   public SuspendCustomerEmail: boolean;
   public DontRequireClientPaymentMethodwhenTotalZero: boolean;
   public DontRequireMemberPaymentMethodwhenTotalZero: boolean;
   public SuspendFreeClassWhenPaymentFailed: boolean;
   public PrefixTypeNamePOS: string;
   public PrefixTypeNameMembership: string;
   public BranchWorkTimeList: BranchWorkTime[] = [];
   public TimeZone: string;
   public Currency: string;
   public PrivacyPolicyURL: string;
   public TermsOfServiceURL: string;
   public AllowPartPayment: boolean;
   public WidgetPartPaymentFriendlyName: string;
   public PartialPaymentLable: string;
   public isSelectAllBenefits: boolean;
   public SuspendClassBenefits: boolean;
   public SuspendDoorCheckInBenefits: boolean;
   public SuspendProductBenefits: boolean;
   public SuspendServiceBenefits: boolean;  
   public RestrictCustomerInvoiceEmail: boolean;
   public WidgetPartPaymentForMember: number ;
   public WidgetPartPaymentForNonMember: number;
   public BranchEmailFromName: string;
   public BranchReplyToEmail: string;
   public isViewMode?: boolean;
   public BranchTimeFormat12Hours: boolean;
}
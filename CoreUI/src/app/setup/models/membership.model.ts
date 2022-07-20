import { ENU_MemberShipBenefitDurations } from "@app/helper/config/app.enums";

export class Membership {
    public MembershipID: number;
    //public MembershipTypeID: number;
    public MembershipName: string;
    public MembershipCategoryID: number = 0;
    public ShowAsPackage: boolean = false;
    public Description: string;
    public MembershipDurationValue: number;
    public MembershipDurationTypeID: number;
    public IsOnline: boolean = false;
    public IsFeatured: boolean = false;
    public IsActive: boolean = false;
    public IsHidePriceOnline = false;

    //public IsSaleSuspended: boolean = true;
    public MemberLimit: number;
    //public SessionDurationValue: number;
    //public SessionDurationTypeID: number;
    public ImageFile: string;
    public ImagePath: string;
    public IsDoorCheckedInBenefitsAllowed: boolean = false;
    public IsClassBenefitsAllowed: boolean = false;
    public IsServiceBenefitsAllowed: boolean = false;
    public IsProductBenefitsAllowed: boolean = false;
    public AllowDuplicate: boolean = false;


    public MembershipPaymentList: MembershipPayment[];
    public MembershipClockInTimeList: MembershipClockInTime[];
    public MembershipBranchList: MembershipBranch[];
    //public MembershipClassList: MembershipClass[];
    public TaxList: ItemTax[];
    public MembershipBenefits: MembershipBenefits[];
    public MembershipItemsBenefits: MembershipItemsBenefits[];
    public IsEnquireMembership: boolean;
    public RestrictedCustomerTypeID: string = "";

}

export class MembershipItemsBenefits {
    public MembershipItemID: number = 0;
    public MembershipID: number;
    public ItemCategoryID: number;
    public ProductClassificationID: number;
    public ItemCategoryName: string;
    public ItemID: number;
    public ItemName: string;
    public ProductVariantName: string;
    public ItemTypeID: number;
    public BranchID: number = 0;
    public BranchName: string;
    public ServiceID: number = 0;
    public ProductID: number = 0;
    public NoLimits: boolean = true;
    public TotalSessions: number = null;
    public DurationTypeID: number = ENU_MemberShipBenefitDurations.Membership;
    public DurationValue: string;
    public DurationTypeName: string;
    public IsFree: boolean = true;
    public DiscountPercentage: number = null;
    public IsEdit: boolean = false;
    public IsSelected: boolean = false;
    public IsActive: boolean = true;
}

export class AddMembershipItemsBenefits {
    public MembershipItemsBenefit: MembershipItemsBenefits;
    public MembershipBranchList: MembershipBranch[];
    public SelectedMembershipItemsBenefits: MembershipItemsBenefits[];

}

export class MembershipBenefits {
    public MembershipBenefitID: number;
    public MembershipID: number;
    public MembershipBenefitsTypeID: number;
    public NoLimits: boolean = true;
    public RollOverBenefitsOnEachInterval: boolean = false;
    public TotalSessions: number;
    public DurationTypeID: number;
}

export class SearchMembership {
    //public membershipTypeID : number = 0;
    public membershipName: string = "";
    public membershipCategoryID: number = null;
    public isActive: number = 1;
    public pageNumber: number;
    public pageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
}

export class MembershipPayment {
    public MembershipPaymentID: number;
    public MembershipPaymentTypeID: number;
    public SinglePaymentCollectionTypeID: number;
    public MembershipPaymentName: string = "";
    public Price: number = 0;
    public RecurringInterval: number = 1;
    public DurationTypeID: number;
    public IsAutoRoll: boolean = false;
    public IsProRata: boolean = false;

    // Used on Front End
    public TaxPercentage: number = 0;
    public TotalPrice: number = 0;
    public IsDurationValid: boolean = true;
    public controlIndex: number;
}

export class MembershipClockInTime {
    public DayID: number;
    public StartTime: any;
    public EndTime: any;
    public IsBranchOperationTime: boolean;
    public IsDayRestricted: boolean;

    // Used on Front End
    public IsStartTimeRequired: boolean;
    public IsEndTimeRequired: boolean;
    public IsStartTimeInvalid: boolean;
    public IsEndTimeInvalid: boolean;
}

export class MembershipBranchWithClass {
    public BranchID: number;
    public MembershipClassList?: MembershipClass[];
}

export class ItemTax {
    public TaxID: number;
}

export class MembershipBranch {
    public BranchID: number;
    public BranchName: number;
}

export class MembershipClass {
    public BranchID: number;
    public ClassID: number;
}

export class MembershipList {
    constructor() { };
    public MembershipID: number;
    public MembershipName: string;
    public MembershipCategoryName: string;
    public Description: string;
    public TotalPrice: number;
    public IsOnline: boolean;
    public IsActive: boolean;
    public CreatedOn: Date;
    public ImagePath: string;
    public IsFeatured: boolean;
    public MembershipTypeID: number;
    public MembershipTypeName: string;
    public MemberLimit: number;
    public ActiveMemberCount: number;
    public IsSaleSuspended: boolean;
}

export class ViewMembership {

  public MembershipName: string = "";
  public MembershipCategoryName: string = "";
    public MembershipID: number = 0;
    public Description: string = "";
    public MembershipDurationTypeID: number;
    public MembershipDurationTypeName: string;
    public MembershipDurationValue: number;
    public IsFeatured: boolean;
    public IsClassOnlyMembership: boolean;
    public IsActive: boolean = true;
    public IsOnline: boolean = true;
    public AllowDuplicate: boolean = false;
    public MemberLimit: number = 0;
    public PaymentTotal: number = 0;
    public ImagePath?: any;
    public SessionDurationValue?: any;
    public SessionDurationTypeID: number;
    public MembershipTypeID: number;
    public MembershipTypeName: string;
    public IsHidePriceOnline: string;

    public CheckedInSession: string;
    public ClassesSession: string;
    public ServicesSession: string;
    public ProductsSession: string;
    public RestrictedCustomerTypeNames: string;
    public ShowAsPackage: boolean;

    public MembershipPaymentList: ViewMembershipPayment[];
    public MembershipBranchList: ViewMembershipBranchClass[];
    public MembershipClockInTimeList: MembershipClockInTime[] = [];
}

export class ViewMembershipPayment {
    public MembershipPaymentID: number;
    public MembershipPaymentTypeID: number;
    public MembershipPaymentTypeName: string;
    public SinglePaymentCollectionTypeID: number;
    public SinglePaymentCollectionTypeName: string;
    public RecurringPaymentIntervalTypeID: number;
    public RecurringPaymentIntervalTypeName: string;
    public MembershipPaymentName: string;
    public Price: number;
    public TotalTaxPercentage: number;
    public RecurringInterval: number;
    public DurationTypeID: number;
    public DurationTypeName: string;
    public IsAutoRoll: boolean;
    public IsProRata: boolean;

    // Used on Front End
    public TotalPrice: number;
}

export class BranchWiseService {
    public ServiceCategoryID: number;
    public ServiceCategoryName: string;
    public ServiceID: number;
    public ServiceName: string;
    public IsSelected?: boolean = false;
    public ServicePackageList: ServicePackageList[] = new Array<ServicePackageList>();
}

export class BranchWiseServiceCategory{
    public ServiceCategoryID: number;
    public ServiceCategoryName: string;
    public ServiceList: BranchWiseService[];
}

export class ServicePackageList {
    public DurationTypeName: string;
    public DurationValue: string;
    public ServiceID: number;
    public ServicePackageID: number;
    public IsSelected: boolean = false;

}

export class ViewMembershipBranchClass {
    public BranchName: string;
    public MembershipClassList?: any[];
    public Classes?: string;
}

export class BranchWiseClass {
    public BranchID: number;
    public BranchName: string;
    public ClassList: BranchClass[];

    // Used on Front End
    public IsSelected: boolean;
}

export class BranchClass {
    public ClassID: number;
    public ClassName: string;
    public ClassCode: string;
    public StartDate: any;
    public StartTime: string;
    public EndDate: any;
    public EndTime: string;
    public IsActive: boolean;

    // Used on Front End
    public IsSelected: boolean;
}
export class BranchSpecificItemType {
    public ItemCategoryID: number;
    public ItemCategoryName: string;
    public ItemID: number;
    public ItemName: string;
    public IsSelected?: boolean = false;
}

export class BranchSpecificItemCategoryTypeList {
    public ItemCategoryID: number;
    public ItemCategoryName: string;
    public ItemList: BranchSpecificItemTypeList[] = new Array<BranchSpecificItemTypeList>();
}

export class BranchSpecificItemTypeList{
    public ItemCategoryID: number;
    public ItemCategoryName: string;
    public ItemID: number;
    public ItemName: string;
    public IsSelected?: boolean = false;
}

export class SearchProductVariantModel{
    public ProductVariantIDs: string = "";
    public BranchID: number = 0;
    public ProductCategoryName: string = "";
    public BrandName: string = "";
    public PageNumber: number;
    public PageSize: number;
}

export class BranchWiseProductCategory{
    public BranchID: number;
    public ProductCategoryID: number;
    public ProductCategoryName: string;
    public VariantProductInfoList: BranchWiseProduct[];
}

export class BranchWiseProduct {
    public ProductCategoryID: number;
    public ProductCategoryName: string;
    public ProductClassificationID: number;
    public ProductID: number;
    public ProductName: string;
    public IsSelected?: boolean = false;
    public VariantInfoList: ProductVariantList[] = new Array<ProductVariantList>();
}

export class ProductVariantList {
    public ProductID: number;
    public ProductVariantID: number;
    public ProductVariantName: string;
    public IsSelected: boolean = false;

}

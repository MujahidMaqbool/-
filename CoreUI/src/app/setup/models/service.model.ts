export class Service {
    constructor() { };

    public ServiceID: number = 0;
    public ServiceCategoryID: number = null;
    ///public BranchID: number = 0;
    public ServiceName: string = "";
    public BoltPoint: number = 0;
    public CleaningTimeInMinute: number = 0;
    public Description: string = "";
    public ImagePath: string = "";
    public ImageFile: string = "";
    public IsActive: boolean = true;
    public IsOnline: boolean = false;
   // public CreatedOn: Date
   // public CreatedBy: number = 0;
   // public ModifiedOn: Date;
   // public ModifiedBy: number = 0;
   // public IsArchived: boolean = false;
    public IsFeatured: boolean = false;
    public IsSaleSuspended: boolean = false;
    public IsHidePriceOnline: boolean = false;
    public ServicePackageList: ServicePackage[] = [];
    public ServiceFacilityList: ServiceFacility[] = [];
    public ItemTax: SaveTax[] = [];
    public EnableWaitList: boolean;
    public RestrictedCustomerTypeID: string = "";
}

export class ServicePackage {
    constructor() { };
    public ServicePackageID:number = 0;
    public Price: number = 0;
    public Cost: number = 0;
    public TotalPrice?: any = 0.00;
    public DurationValue: number = 0;
    public DurationTypeID: number;
    public IsHidePriceOnline:boolean = false
}

export class ServiceFacility {
    FacilityID: number;
}

export class SearchParameter {
    public serviceName: string = "";
    public serviceCategoryID: number = 0;
    public IsActive: number = 1;
}

export class SchedulerServiceModel {
    SaleID: number;
    PersonTypeID: number
    PersonTypeName: string
    PersonID: number
    PersonName: string
    Email: string
    Mobile: string
    SaleServiceList: SaleServiceList[] = []
}

export class SaleServiceCalendarPOSList {
    id: number
    text: string
    startDate: Date
    endDate: Date
    allDay: boolean
    recurrenceRule: string
    description: string
    SaleID: number
    ServiceCategoryID: number
    ServiceCategoryName: string
    CleaningTimeInMinute: number
    ServicePackageID: number
    Duration: string
    BookedOn: Date
    StaffID: number
    StaffFullName: string
}

export class SaleServiceList {
    SaleServiceID: number;
    SaleID: number;
    ServiceCategoryID: number;
    ServiceCategoryName: string;
    ServiceID: number;
    ServiceName: string;
    ServicePackageID: number;
    FacilityID: number;
    StaffID: number;
    StaffName: string;
    ServiceDate: Date;
    ServiceStartTime: string;
    ServiceEndTime: string;
    CleaningTimeInMinute: number;
    Note: string;
    BookedOn: Date;
}

export class SchedulerServicesPackage {
    ServiceID: number;
    ServicePackageID: number;
    TotalPrice: number;
    DurationTypeID: number;
    DurationValue: number;
    DurationTypeName: string;
}

export class ServiceClient {
    public PersonID: number;
    public PersonName: string;
    public Mobile: string;
    public Email: string;
    public PersonTypeID: number;
    public PersonTypeName: string;
}

export class StaffBlockTimeModel {
    StaffBlockTimeID: number
    StaffID: number
    StaffName: string
    AllDay: boolean
    StartDate: Date
    StartTime: string
    EndDate: Date
    EndTime: string
    RecurrenceRule: string
    Description: string
}


export class DurationType {
    DurationTypeID: number = 0;
    DurationTypeName: string;
    IsActive: boolean;
}

export class ServiceCategory {
    Description: string;
    ImageFile: string;
    ImagePath: string;
    IsActive: boolean;
    ServiceCategoryID: number;
    ServiceCategoryName: string;
}

export class SaveTax
{
    public TaxID: number = 0;
}

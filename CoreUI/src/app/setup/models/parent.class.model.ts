export class ParentClass {
    public ParentClassID: number = 0;
    public ParentClassName: string = "";
    public ClassCategoryID: number = null;
    public ClassLevelID: number = 0;
    public Description: string = "";
    public HowToPrepare: string = "";
    public BookingStartsBefore: number = null;
    public BookingStartsBeforeDurationTypeID: number = 0;
    public BookingClosesBefore: number = null;
    public BookingClosesBeforeDurationTypeID: number = 0;
    public CancellationEndsBefore: number = null;
    public CancellationEndsBeforeDurationTypeID: number = 0;
    public ClassDurationInMinutes: number = null;
    public ImagePath : string = "";
    public ImageFile : string = "";
    public IsActive : boolean = true;
    public RestrictedCustomerTypeID : string = "";

}

export class ParentClassSearchParameter
{
    public parentClassName: string = "";
    public classCategoryID: number = 0;
    public isActive: number = 1;
    public pageNumber : number = 0;
    public pageSize : number = 0;
}

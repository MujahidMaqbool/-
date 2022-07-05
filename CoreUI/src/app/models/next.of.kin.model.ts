export class NextOfKin {
    public StaffKinID: number = 0;
    public AssignedToStaffID: number = 0;
    public RelationshipTypeID: number;
    public Title: string;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Phone: string;
    public Mobile: string;
    public Address1: string = "";
    public Address2: string = "";
    public CountryID: number= 0;
    public StateCountyName : string;
    public CityName: string;
    public PostCode: string = "";
    public ImageFile: string = "";
    public ImagePath: string = "";
    public IsActive: boolean = true;
}

export class MemberNextOfKin {

    public CustomerKinID: number = 0;
    public CustomerID: number = 0;
    public RelationshipTypeID: number;
    public Title: string = "";
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public Phone: string = "";
    public Mobile: string = "";
    public Address1: string;
    public Address2: string = "";
    public CountryID: number = 0;
    public StateCountyName : string;
    public CityName: string = "";
    public PostCode: string = "";
}

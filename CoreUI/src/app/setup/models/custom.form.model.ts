import { ENU_FormType } from "src/app/helper/config/app.enums";

export class SaveCustomFormModel {
    public FormID: number;
    public FormTypeID: number = ENU_FormType.Signup;
    public FormName: string;
    public Description: string;
    public IsActive: boolean = false;
    public IsMandatory: boolean = false;
    public JsonText: any;
    public IsClient: boolean = false;
    public IsLead: boolean = false;
    public IsMember: boolean = false;
    public IsAllMembership: boolean = false;
    public OnBookingMembership: boolean = false;
    public OnEveryMembership: boolean = false;
    public Memberships: string;
    public IsAllClasses: boolean = false;
    public Classes: string;
    public IsAllServices: boolean = false;
    public Services: string;
    public IsAllProducts: boolean = false;
    public Products: string;
    public OnBookingProducts: boolean = false;
    public OnEveryProduct: boolean = false;
    public OnBookingService: boolean = false;
    public OnEveryService: boolean = false;
    public OnBookingClass: boolean = false;
    public OnEveryClass: boolean = false;
    public IsExistingCustomer: boolean = false;
    public IsVisibleToCustomer: boolean = false;
}

export class Memberships {
    public MembershipID: number;
}

export class Items {
    public ItemID: number;
}

export class FundamentalsMemberships {
    public MembershipID: number;
    public MembershipName: string;
    public IsSelected: boolean;
}

export class FundamentalsItems {
    public CategoryID: number;
    public CategoryName: string;
    public ItemTypeID: number;
    public IsSelected: boolean;
    public ItemList: ItemList[];
}

export class ItemList {
    public ItemID: number;
    public ItemName: string;
    public IsSelected: boolean;
}

export class ViewForm {
    public IsMandatory: boolean;
    public JsonText: any;
    public FormName: string;
    public Description: string;
}

export class FormSearchParameters {
    formName: string = "";
    isActive: number = 1;
    pageNumber: number = 1;
    pageSize: number = 10;
}
import { MemberMembershipList } from "../member/models/members.model";


export class CustomerSearchParameter {
    public CustomerName: string;
    public CustomerTypeID: number = 0;
    public CardNumber: string;
    public Email: string;
    public JoiningDateFrom: string;
    public JoiningDateTo: string;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 0;
    public SortOrder: string = "DESC";
    public MembershipID: number = null;
    public MembershipStatusTypeID: number = null;
}


export class AllCustomers {
    public CustomerID: number;
    public CustomerTypeID: number;
    public CardNumber: number;
    public CustomerName: string;
    // public IsActive: boolean = true;
    public Email: string = "";
    public Mobile: number = 1;
    public CreatedOn: string;
    public IsLead: false;
    public MemberMembershipList: MemberMembershipList[];
    public IsBenefitView :boolean;
}

export class customerAllowedPages {
    Save: boolean = false;
    Activities: boolean = false;
    Memberships: boolean = false;
    Payments: boolean = false;
    Invoices: boolean = false;
    Bookings: boolean = false;
    saveClient: boolean = false;
    saveMember: boolean = false;
    DeleteClient: boolean = false;
    DeleteMember:boolean = false;

};



export class CustomerApplication {
    public Total: number;
    public AppTypeID: number;
    public AppTypeName: string;
}

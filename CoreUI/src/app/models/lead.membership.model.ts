export class LeadMembershipsView  {
    CustomerID: number;
    MembershipID: number;
    MembershipName: string;
    LeadStatusTypeID: number;
    LeadStatusTypeFriendlyName: string;
    MembershipStatusTypeID: number;
    AssignedToStaffID: number;
    AssignedToStaffName: string;
    IsLead: boolean;
}

export class LeadMembershipsList {
    public MembershipID: number;
    public MembershipName: string;
    public IsSaleSuspended: boolean;
    public RestrictedCustomerTypeNames: string = "";
}
export class AssignedToStaffList {
    public StaffID: number = null;
    public StaffFullName: string;
}

export class AddLeadMembership {
   public CustomerID :number;
   public MembershipID :number;
   public CustomerMembershipID:number;
   public AssignedToStaffID :number;
   public IsMemberToLead : boolean;
   public MemberToLead : boolean;
   public IsEnquiryEdit : boolean = false;
}

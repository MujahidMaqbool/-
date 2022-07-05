export class MemberMembershipBenefitsLog {
    public ItemTypeName: string;
    public MembershipBenefitActivityTypeName: string;
    public Balance: number;
    public Description: string;
    public CreatedOn: string;
    public MembershipName: string;

}
export class MembershipBenefitsLogSearch{
    public CustomerMembershipID: number;
    public MembershipBenefitActivityTypeID: number;
    public DateFrom: string;
    public DateTo: string; 
    public PageNumber: number;
    public PageSize: number;
}

export class  MembershipBenefitActivityType{
    public MembershipBenefitActivityTypeID: number;
    public MembershipBenefitActivityTypeName: string;
}

export class  MemberMembership{
    public CustomerMembershipID: number;
    public MembershipID: number;
    public MembershipName: string;
}
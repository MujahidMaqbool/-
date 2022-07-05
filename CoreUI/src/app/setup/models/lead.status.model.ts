
export class LeadStatusType {
  public LeadStatusTypeID: number;
  public LeadStatusTypeFriendlyName: string;
}

export class SaveLeadSetting {
  BranchDefaultEmail: string;
  MembershipId: number = 0;
  StaffId: number = null;
}
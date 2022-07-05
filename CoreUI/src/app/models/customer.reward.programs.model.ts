export class RewardPrograms{
  public RewardProgramID: number;
  public RewardProgramName: string;
  public RewardProgramStatusTypeID: number;
  public RewardProgramStatusTypeName: string;
  public CustomerRewardProgramID: number;
}
export class CustomerBranches{
  public BranchID: number;
  public BranchName: string;
}

export class CustomerRewardProgramSearchParams{
  public CustomerRewardProgramID: number;
  public StatusID: number = null;
  public DateFrom: string;
  public DateTo: string;
  public CustomerID: number;
  public PageNumber: number;
  public PageSize: number;
  public BranchID: number;
}

export class AllCustomersRewardProgram{
  public RewardDate: string;
  public RewardPointStatusTypeName: string;
  public ActivityType: string;
  public BranchName: string;
  public Points: number;
  public RedemptionValue: number;
  public LastUpdatedBy: string;
  public PointsBalance: number;
  public RewardProgramStatusTypeID: number;
}
export class CustomersRewardPoints {
  public Points: number = 0;
  public PointsBalance: number = 0;
  public PointsExpiringSevenDays: number = 0;
  public PointsRedeemedThirtyDays: number = 0;
  public RedemptionValue: number = 0;
}
export class AdjustRewardPointsBalance {
  public AdjustReason: string;
  public AdjustCurrentBalance: number;
  public AdjustNewBalance: number;
}
export class AddRewardPrograms{
  public RedemptionPoints: number;
  public RedemptionValue: number;
  public RewardProgramID: number;
  public RewardProgramName: string;
  public RewardProgramStatusTypeID: number;
  public RewradProgramStatusName: string;
}
export class RewardProgramDetailViewModel {
  public RewardProgramDetailID:number;
  public RewardProgramID:number;
  public RewardProgramName:string;
  public Description:any;
}
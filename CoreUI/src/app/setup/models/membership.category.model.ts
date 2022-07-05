
export class MembershipCategory {
  public MembershipCategoryID: number = 0;
  public CategoryName: string = "";
  public Description: string = "";
  public IsActive: boolean = true;
  public ImageFile: string = "";
  public ImagePath: string = "";
}

export class SearchMembershipCategory {
  constructor() { };
  public membershipCategoryName: string = "";
  public IsActive: boolean = null;
  public pageNumber: number;
  public pageSize: number;
  public SortIndex: number;
  public SortOrder: string;
}

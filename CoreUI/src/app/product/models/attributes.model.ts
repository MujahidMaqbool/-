export class AttributesSearchParams {
    public AttributeName: string = '';
    public TypeID: number = 0;
    public BranchID: number = 0;
    public StatusID: number = null;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 0;
    public SortOrder: string = "DESC";
}
export class BranchList {
    public BranchID: number;
    public BranchName: string;
    public BranchCode: number;
    public CompanyID: number;
}
export class AttributeViewModel {
    public ProductAttributeID: number = 0;
    public AttributeName?: string = "";
    public Type: string = "";
    public VariantValue: string = "";
    public HasBranchPermission: boolean;
    public AttributeBranchVM: AttributeBranch[] = [];

}

export class Attribute {
    AttributeID: number;
    AttributeName: string = "";
    HasBranchPermission: boolean = true;
//  IsActive: boolean = true;
    AttributeValueVM: AttributeValue[] = [new AttributeValue()];
    AttributeBranchVM: AttributeBranch[] = [];
}

export class AttributeValue {
    AttributeValue: string = '';
    AttributeID: number = 0;
    SortOrder?: string | number = 0;
    IsArchived: boolean = false;
    isAssociated: boolean = false;
}

export class AttributeBranch {
    AttributeID: number = 0;
    BranchID: number;
    BranchName?: string = '';
    IsActive: boolean = true;
    IsIncluded: boolean = true;
}
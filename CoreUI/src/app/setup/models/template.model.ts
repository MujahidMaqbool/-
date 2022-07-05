export class TemplateSearchParameter{
    public TemplateTextTitle: string = "";
    public ModuleID: number = 0;
    public TemplateTypeID: number = 0;
    public IsActive: number = 1;
    public PageNumber: number;
    public PageSize: number;
    public SortIndex: number = 1;
    public SortOrder: string = "ASC";
    
}

export class TemplateList {
    public TemplateTextID: number = 0;
    public TemplateTextTitle: string = "";
    public ModuleID: number = 0;
    public ModuleName: string = "";
    public TemplateTypeID: number = 0;
    public TemplateTypeName: string = "";
    public IsActive: boolean = true;
    public CreatedOn: Date;

}

export class TemplateView {
    public TemplateTextID: number = 0;
    public TemplateTypeID: number = 0;
    public ModuleID: number = 0;
    public TemplateTextTitle: string = "";
    public TemplateTextEmailSubject: string = "";
    public TemplateTextDescription: string = "";
    public IsActive: boolean = true;

}
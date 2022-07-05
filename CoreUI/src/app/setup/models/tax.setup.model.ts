export class TaxSetup {
    public IsActive: boolean = true;
    TaxID: number;
    TaxName: string;
    TaxPercentage: number;
}
export class SearchTaxParams {
    public TaxTypeID: number = null;
    public TaxName: string;
    public TaxStatusID: number = null;
    public appSourceTypeID: number;
    public PageNumber: number = 1;
    public PageSize: number = 10;
    public SortIndex: number;
    public SortOrder: string;
}
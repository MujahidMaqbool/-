import { Configurations } from 'app/helper/config/app.config';


export class CustomerFormSearchModel {
    public customerID: number;
    public customerTypeID:number;
    public formName: string;
    public isActive: string;
    public customerName: string;
    public formStatusID: number;
    public DateFrom: string;
    public DateTo: string;
    public pageNumber: number;
    public pageSize: number;
    public SortIndex: number = 3;
    public SortOrder: string = Configurations.SortOrder_DESC;
}

export class CustomerFormModel {
    public CustomerFormID: string;
    public StaffID: string;
    public FormName: string;
    public IsMandatory: boolean;
    public FormStatus: string;
    public CreatedOn: Date;
    public CreatedOnTime: string;
    public ModifiedOn: string;
    public ModifiedOnTime: string;
    public ConfigurationsName: string;
    public ItemPurchased: string;
    public CustomerName: string;
    public FormStatusID: string;
    public SMSAllowed: boolean;
    public EmailAllowed: boolean;
    public IsWalkedIn:boolean ;
}

export class SaveCustomerFormModel {
    public CustomerFormID: string;
    public customerID: number;
    public FormID: number;
    public JsonText: string;
    public FormStatusID: number;
    public IsSkipped: boolean;
    public SaleDetailID: number;
    public CustomerBookingID: number;
}

export class CustomFormView {
    public CustomerFormID: string;
    public CustomerID: number;
    public FormID: number;
    public IsMandatory: boolean;
    public JsonText: any;
    public FormName: string;
    public Description: string;
    public IsSkipped: boolean;
    public FormStatusID: number;
    public CustomerBookingID: number;
    public FormTypeID: number;
    public ItemID: number
}

export class CustomFormViewBrief {
    public CustomFormView: CustomFormView = new CustomFormView();
    public SkipSubmitIndicator: string;
}

export class CustomerFormsInfromation {
    public CustomFormView: CustomFormView[] = [];
    public isViewForm: boolean;
}

export class SaveCustomerForm {
    public FormID: number;
    public CustomerID: string;
}

export class ItemServicesFormViewModel {
    public CustomerID: any
    public FormItem: ItemsList = new ItemsList;
}

export class ItemsList {
    public ItemID: number
    public ItemTypeID: number
}
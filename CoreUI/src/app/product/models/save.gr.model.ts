export class SaveGRNViewModel {
    public purchaseOrderID: number;
    public notes: string;
    public deliveryDate:string;
    public receivePurchaseOrderViewModels: Array<ReceivePurchaseOrder> = [];
}
export class ReceivePurchaseOrder {
    public PurchaseOrderID: number;
    public ProductVariantID: number;
    public ProductVariantName: string;
    public Barcode: string;
    public SKU: string;
    public SupplierCode: string;
    public OrderedQuantity: number;
    public PreviouslyReceiveQuantity: number;
    public ReceivedToday: number;
    public SuplierPrice: number;
    public OrderedTotal: number;
    public TodayTotal: number;
}
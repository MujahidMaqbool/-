export class GatewayCard {
    public customerID: number;
    public customerPaymentGatewayID: number;
    public name: string;
    public expMonth: number;
    public expYear: number;
}
export class EditCard {
    Name: string;
    ExpMonth:number;
    ExpYear:number;
    Brand: string;
    CreatedOn: string;
    CustomerPaymentGatewayID: number;
    customerID: number;
    IsArchived: boolean;
    Last4: string;
    MandateStatusName: string;
    PaymentGatewayID: number;
    PaymentGatewayName: string;
    SaleTypeID: number;
    SaleTypeName: string;
    StatusCode: string;
    StatusMessage: string;

}
export class WaitListViewModel{
    public waitListID: number;
    public customerID: number;
    public itemTypeID: number;
    public itemID: number;
    public customerPaymentGatewayID: number;
    public customer: any;
    public paymentMode: any;
    public startDate: string;
    public waitListDetail: WaitListDetail[];
}

export class WaitListDetail{
    waitListDetailID: number;
    waitListID: number;
    customerMembershipID: number;
    itemID: number;
    itemTypeID: number;
    staffID: number;
    requestDate: string;
    startTime: string;
    endTime: string;
    notes: string;
    customerPaymentGatewayID: number;
    createdOn: string;
    createdBy: string;
    modifiedOn: string;
}
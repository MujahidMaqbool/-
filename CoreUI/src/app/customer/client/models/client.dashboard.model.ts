export class ClientDashboardSearchParam {
    public DateFrom: string = "";
    public DateTo: string = "";
    public itemTypeID : number = 0;
}

export interface IClientVisits {
    value: string;
    name: string;
    time?:string;
}

export interface INewvsReturningClient {
    Date:string;
    OnlineNew: number;
    OnlineReturning: number;
    InHouseNew: number;
    InHouseReturning: number;
}

export interface ITopEmployeeServices {
    PersonName:string;
    staffName: string;
    TotalCount: number;
    ItemType:any;
    TotalSale:number;

}

export interface ITopRevenueGeneration {
    ItemType: string;
    TotalSale: number;
}
export interface iTopEmployeeClasses {
    staffName: string;
    TotalCount: number;
    PersonName
}

export interface TopEmployeeSerices {
    staffName: string;
    TotalCount: number;
}


export interface TopMemberships {
    ItemName: string,
    TotalCount: number
}

export interface TopClasses {
    ItemName: string,
    TotalCount: number
}

export interface TopServices {
    ItemName: string,
    TotalCount: number
}

export interface TopProducts {
    ItemName: string,
    TotalCount: number
}

export interface ISalesBreakDownServices {
    Month: string;
    Class: number;
    Product: number;
    Service: number;
    Membership: number;
}

export interface ITopServices {
    serviceName: string;
    totalPrice: number;
    totalSerivces: number;
    ItemName:string;
    TotalCount:number;
}

export interface ISalesbyChannel {
    channelName: string;
    totalSale: number;
    SaleTypeName:string;
    NetSale:number;
}

export interface IMonthlySales {
    Month: string;
    OnSite: number;
    Shop: number;
    App: number;
    TotalSale?:number;
}

export interface IMonthlyVisits {
    Date: string;
    TotalClient: any;
    Time:any;
    GraphType:any;
}
export interface IServicesandAttendanceBooking {
    TotalSaleService: number;
    TotalAttendance: any;
    Date: any;
    Time:any;
}
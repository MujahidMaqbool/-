export class WaitListConfiguration {
classWaitList: ClassWaitList = new ClassWaitList();
   serviceWaitList: ServiceWaitList= new ServiceWaitList();
   branchWorkTimeBrackets: WaitListTimeBrackets[] = new Array<WaitListTimeBrackets>();
}

export class ClassWaitList{
 //Class wait list
IsClassWaitList: boolean = false;
IsClassWaitListManually: boolean= false;

IsClassWaitListTopPrice: boolean= false;
IsClassWaitListTopPriceBookAuto: boolean= false;
ClassWaitListTopPriceCloseBookBeforeMember: number;
ClassWaitListTopPriceCloseBookBeforeClientLead: number;
ClassWaitListTopPriceBookTimeInterval: number;
IsClassWaitListTopPriceAlertOnly: boolean= false;
ClassWaitListTopPriceAlertOnlyTimetoRespond: number;

IsClassWaitListSequentially: boolean= false;
IsClassWaitListSequentiallyBookAuto: boolean= false;
ClassWaitListSequentiallyBookAutoBeforeMember: number;
ClassWaitListSequentiallyBookAutoBeforeClientLead: number;
ClassWaitListSequentiallyBookTimeInterval: number;
IsClassWaitListSequentiallyAlertOnly: boolean= false;
ClassWaitListSequentiallyAlertOnlyTimetoRespond: number;
IsClassWaitListAlertAll: boolean= false;
IsClassWaitListOnline: boolean= false;
IsClassWaitListRequirePaymentMethodOnline: boolean= false;
ClassWaitListPaymentDisplayText: string = "";
ClassWaitListNotificationType: string = ""; // Comma seperated string e.g 1,2,3

ClassWaitListSequentiallyBookTimeIntervalDurationTypeId: number;
ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId: number;

ClassWaitListTopPriceBookTimeIntervalDurationTypeId: number;
ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId: number;




}


export class ServiceWaitList{
IsServiceWaitList : boolean;
IsServiceWaitListManually : boolean;
IsServiceWaitListTopPrice : boolean;
IsServiceWaitListTopPriceBookAuto : boolean;
IsServiceWaitListTopPriceAlertOnly : boolean;
IsServiceWaitListSequentially : boolean;
IsServiceWaitListSequentiallyBookAuto : boolean;
IsServiceWaitListSequentiallyAlertOnly : boolean;
IsServiceWaitListAlertAll : boolean;
IsServiceWaitListOnline : boolean;
IsServiceWaitListRequirePaymentMethodOnline : boolean;

ServiceWaitListTopPriceCloseBookBeforeMember : number;
ServiceWaitListTopPriceCloseBookBeforeClientLead : number;
ServiceWaitListTopPriceBookTimeInterval : number;
ServiceWaitListTopPriceAlertOnlyTimetoRespond : number;
ServiceWaitListSequentiallyBookAutoBeforeMember : number;
ServiceWaitListSequentiallyBookAutoBeforeClientLead : number;
ServiceWaitListSequentiallyBookingTimeInterval : number;
ServiceWaitListSequentiallyAlertOnlyTimetoRespond : number;
ServiceWaitListMaxCustomer : number = null;

ServiceWaitListPaymentDisplayText : string;
ServiceWaitListDaysList : string; // Comma Seperated string
ServiceWaitListNotificationType : string; // Comma Seperated string

ServiceWaitListTopPriceBookTimeIntervalDurationTypeId: number;
ServiceWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId: number;

ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId: number;
ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId: number;
}

export class TimeDurationType{
    DurationTypeID: number;
    DurationTypeName: string;
}

export class WaitListTimeBrackets{
    BranchWorkTimeBracketID: number;
    BracketName: string;
    StartTime: any;
    EndTime: any;
    IsEndTimeInvalid: boolean = false;

}
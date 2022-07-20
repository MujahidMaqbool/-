import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/services/app.http.service';
import { SaleApi, CustomerApi, StaffApi, DeleteFile, CustomerRewardProgramApi, ProductApi } from 'src/app/helper/config/app.webapi';
import { MessageService } from './app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { DataSharingService } from './data.sharing.service';
import { DD_Branch, ApiResponse, AllWaitlist, WaitlistItemList } from 'src/app/models/common.model';
import { ActivityPersonInfo } from 'src/app/models/activity.model';

/********************** Services ***********************/
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { AllAttendees, CancelationPolicyDetails, ClassAttendanceDetail, FreeClassesMemberships } from 'src/app/models/attendee.model';
import { CustomerType, ENU_BookingStatusOption, ENU_BookingStatusValue, ENU_DurationType, ENU_Package, POSItemType, AddressType, ENU_ChargeFeeType } from 'src/app/helper/config/app.enums';
import { DateTimeService } from './date.time.service';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { DiscountType, SaleArea } from 'src/app/helper/config/app.config';
import { POSCartItem, POSClient, SaleInvoice, POSSaleDetail } from 'src/app/point-of-sale/models/point.of.sale.model';
import { SubscriptionLike } from 'rxjs';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Injectable({ providedIn: 'root' })
export class CommonService extends AbstractGenericComponent {

    discountType = DiscountType;
    messages = Messages;
    _bookingCancelationDetail: CancelationPolicyDetails = new CancelationPolicyDetails();
    _durationType = ENU_DurationType
    packageIdSubscription: SubscriptionLike;
    classDate: any
    bookingStatusOptions = [
        // { BookingStatusTypeID:this.bookingStatusValue.Booked, BookingStatusTypeName: this.bookingStatusOption.Booked },
        { BookingStatusTypeID: ENU_BookingStatusValue.Present, BookingStatusTypeName: ENU_BookingStatusOption.Present },
        { BookingStatusTypeID: ENU_BookingStatusValue.NoShow, BookingStatusTypeName: ENU_BookingStatusOption.NoShow },
        { BookingStatusTypeID: ENU_BookingStatusValue.Cancelled, BookingStatusTypeName: ENU_BookingStatusOption.Cancelled },
    ];
    constructor(
        private _http: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _taxCalculationService: TaxCalculation,
        private _dateTimeService: DateTimeService,

    ) {
        super();
        this.getCurrentBranchDate();

    }

    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }
    async getCurrentBranchDate() {
        this.classDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    }
    getAllSaleBookedDetailReport(fileType: number, customerID: number, dateFrom: string = "", dateTo: string = "", customerTypeID = 0, reportID = 0) {
        let params = {
            FileFormatTypeID: fileType,
            CustomerID: customerID,
            DateFrom: dateFrom,
            DateTo: dateTo,
            CustomerTypeID: customerTypeID,
            ReportID: reportID //by syed asim bukhari
        }
        return this._http.get(SaleApi.getSaleBookedDetailReport, params);
    }

    getAllSaleHistoryReport(fileType: number, customerID: number, dateFrom: string = "", dateTo: string = "", customerTypeID = 0) {
        let params = {
            FileFormatTypeID: fileType,
            CustomerID: customerID,
            CustomerTypeID: customerTypeID,
            DateFrom: dateFrom,
            DateTo: dateTo
        }
        return this._http.get(SaleApi.getSaleHistoryDetail, params);
    }

    searchClient(searchText: string, customerType: number, skipWalkedIn?: boolean, isPOSSearch?: boolean, customerID?: number) {
        skipWalkedIn = skipWalkedIn ? skipWalkedIn : false;
        isPOSSearch = isPOSSearch ? isPOSSearch : false;
        let params = {
            search: searchText,
            customerTypeID: customerType,
            skipWalkedIn: skipWalkedIn,
            isPOSSearch: isPOSSearch,
            customerID: customerID ? customerID : 0
        }
        return this._http.get(CustomerApi.getCustomerInfo, params)
    }

    searchProduct(searchText: string) {
        let params = {
            productName: searchText,
        }
        return this._http.get(ProductApi.reportProductSearch, params)
    }

    searchStaff(searchText: string) {
        let params = {
            search: searchText
        }
        return this._http.get(StaffApi.searchStaff, params);
    }

    searchModuleWisePerson(searchText: string, personType: number, customerType: number, ) {

        let params = {
            search: searchText,
            personTypeID: personType,
            customerTypeID: customerType,
        }
        return this._http.get(CustomerApi.getCustomerInfo, params)
    }
    createPDF(reportData: any, reportName: any) {
        if (reportData.Result && reportData.Result != undefined) {
            var link = document.createElement("a");
            link.setAttribute("href", "data:application/pdf;base64," + reportData.Result);
            link.setAttribute("download", reportName + ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Record_Found);
        }
    }

    createExcel(reportData: any, reportName: any) {
        if (reportData.Result && reportData.Result != undefined) {
            var link = document.createElement("a");
            link.setAttribute("href", "data:application/xlsx;base64," + reportData.Result);
            link.setAttribute("download", reportName + ".xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Record_Found);
        }
    }

    viewPDFReport(reportData: any) {
        if (reportData.Result && reportData.Result != undefined) {
            var base64URL = "data:application/pdf;base64," + reportData.Result + '#toolbar=0'
            var win = window.open();
            win.document.write('<iframe src="' + base64URL + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
        }
        else {
            this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Record_Found);
        }
    }

    deleteFile(ModulePageID: number, EntityId: number, FileName: string) {
        let params = {
            ModulePageID: ModulePageID,
            EntityID: EntityId,
            FileName: FileName
        };
        return this._http.delete(DeleteFile.deleteImage, params);
    }

    async getCurrentBranch() {

        const branch = await super.getBranchDetail(this._dataSharingService);
        return new Promise<number>((resolve, reject) => {
            if (branch && branch.hasOwnProperty("Currency")) {
                if (branch.BranchID > 0) {
                    return resolve(branch.BranchID);
                }
                else {
                    return resolve(0);
                }
            }
            // this._dataSharingService.currentBranch.subscribe(
            //     async (branch: DD_Branch) => {
            //         if (branch.BranchID > 0) {
            //             return resolve(await branch.BranchID);
            //         }
            //         else {
            //             return resolve(0);
            //         }
            //     });
        });
    }

    getCustomerMemberhsips(customerId: number) {
        return new Promise<ApiResponse>((resolve, reject) => {
            let url = SaleApi.getCustomerMemberhsips.replace("{customerID}", customerId.toString())
            this._http.get(url)
                .subscribe(
                    (res: ApiResponse) => {
                        resolve(res);
                    },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Customer Memberhsips"))
                    });
        });
    }

    shareLeadInfo(shareCustomerInfo: any) {
        let personInfo = new ActivityPersonInfo();

        personInfo.Name = shareCustomerInfo.FirstName ? shareCustomerInfo.FirstName : '' + ' ' + shareCustomerInfo.LastName ? shareCustomerInfo.LastName : '';
        personInfo.Mobile = shareCustomerInfo.Mobile;
        personInfo.Email = shareCustomerInfo.Email;
        personInfo.EmailAllowed = shareCustomerInfo.EmailAllowed;
        personInfo.IsWalkedIn = shareCustomerInfo.IsWalkedIn;
        personInfo.PhoneCallAllowed = shareCustomerInfo.PhoneCallAllowed;
        personInfo.SMSAllowed = shareCustomerInfo.SMSAllowed;
        personInfo.Address = shareCustomerInfo.Address;
        personInfo.AppNotificationAllowed = shareCustomerInfo.AppNotificationAllowed
        this._dataSharingService.shareActivityPersonInfo(personInfo);
    }

    calculateRewardPointsPerItem(customerInfo, item) {

        let EarnedPoints: number = 0;
        if (customerInfo?.CustomerTypeID === CustomerType.Member) {
            if (item.IsMembershipBenefit && (item.IsFree) && !item.IsConsumed && !item.IsBenefitsSuspended) {
                if (item.ItemTypeID == POSItemType.Service) {
                    EarnedPoints = item.MemberBaseEarnPoints;
                } else {
                    EarnedPoints = item.CustomerEarnedPoints;
                }
            }
            else if (item.IsMembershipBenefit && (!item.IsFree && item.DiscountPercentage > 0) && !item.IsConsumed && !item.IsBenefitsSuspended) {
                if (item.ItemTypeID == POSItemType.Service) {
                    EarnedPoints = this.calculateRewardProgramPointsForItem(item.AmountSpent, item.MemberBaseEarnPoints, item.TotalAmountIncludeTax);
                } else {
                    EarnedPoints = this.calculateRewardProgramPointsForItem(item.AmountSpent, item.CustomerEarnedPoints, item.TotalAmountIncludeTax);
                }
            }
            else {
                EarnedPoints = this.calculateRewardProgramPointsForItem(item.AmountSpent, item.MemberBaseEarnPoints, item.TotalAmountIncludeTax);
            }
        }
        else {
            EarnedPoints = this.calculateRewardProgramPointsForItem(item.AmountSpent, item.CustomerEarnedPoints, item.TotalAmountIncludeTax);
        }

        return this._taxCalculationService.getRoundValue(EarnedPoints);

    }

    calculateRewardProgramPointsForItem(amountSpent: number, CustomerEarnedPoints: number, itemPrice: number) {
        let earnedRewardPointsOnPurchase: number = 0;

        if (amountSpent && amountSpent > 0) {
            const rewardPointValue = itemPrice / amountSpent;
            earnedRewardPointsOnPurchase = rewardPointValue * CustomerEarnedPoints;
        }

        return earnedRewardPointsOnPurchase;
    }

    validateTotalAmount(paymentTotal: any, totalAmountLimit: any) {

        if (paymentTotal > totalAmountLimit) {
            return true;
        } else {
            return false;
        }
    }
    //function to calculate the refund or charge
    calculateRefundorCharge(oldTotalDue: any, amountPaid: any, itemCharges: any, itemPrice: any, percentage: any, activityType?: any, totalAdjustment?: any) {

        let refund, charge, newTotalDue, refundOrchargeAmount, calculatePercentage;

        // if(itemPrice > 0){
        if (percentage) {
            calculatePercentage = (itemCharges / 100) * itemPrice;
            itemCharges = calculatePercentage
        }

        // in case of when service is unpaid and class is free for member so here we check the oldtotoaldue
        if (oldTotalDue == 0) {
            //then we check if the cancellation charges are 0 and amount paid is 0 then its equal case we cant charge and refund any thing (early case)
            if (itemCharges == 0) {
                return {
                    Amount: null,
                    IsRefund: null
                }
            }
            else {
                return {
                    Amount: this._taxCalculationService.getRoundValue(itemCharges),
                    IsRefund: false
                }
            }

        }
        else {
            //calculating the newtotaldue amount according to formula
            newTotalDue = oldTotalDue - itemPrice + itemCharges;

            //here we calculate the refund or charge amount
            // refundOrchargeAmount = newTotalDue - amountPaid;

            // only reschedule cases
            if (activityType == ENU_ChargeFeeType.Reschedule) {

                refundOrchargeAmount = (newTotalDue - (amountPaid + totalAdjustment));
            }
            // cancel and no show cases
            else {
                // commenting this condition
                // if (newTotalDue < oldTotalDue && itemCharges > amountPaid) {

                //     refundOrchargeAmount = itemCharges - amountPaid;

                // } else {

                refundOrchargeAmount = newTotalDue - amountPaid;
                // }
            }
            //this is the refund case
            if (newTotalDue < amountPaid) {
                // refund = parseFloat(Math.abs(refundOrRechargeAmount).toFixed(2));
                refund = this._taxCalculationService.getRoundValue(refundOrchargeAmount);
                //here we check the least amount to refund
                if (refund <= itemCharges) {
                    return {
                        Amount: this._taxCalculationService.getRoundValue(refundOrchargeAmount),
                        IsRefund: true
                    }
                }
                else {
                    return {
                        Amount: this._taxCalculationService.getRoundValue(itemCharges),
                        IsRefund: true
                    }
                }
            }
            //if there is nothing to do case (no charge and no refund) equal case
            else if (newTotalDue == amountPaid) {
                return {
                    Amount: null,
                    IsRefund: null,
                }
            }
            //charge case
            else {
                charge = this._taxCalculationService.getRoundValue(refundOrchargeAmount);
                //here we check the least amount to charge
                if (charge <= itemCharges) {
                    // if the charge amount is equal to 0 then we show the equal case not the 0 charge case
                    if (itemCharges == 0) {
                        return {
                            Amount: null,
                            IsRefund: null
                        }
                    } else {
                        return {
                            Amount: this._taxCalculationService.getRoundValue(refundOrchargeAmount),
                            IsRefund: false
                        }
                    }
                }
                else {
                    // if the charge amount is equal to 0 then we show the equal case not the 0 charge case
                    if (itemCharges == 0) {
                        return {
                            Amount: null,
                            IsRefund: null
                        }
                    } else {
                        return {
                            Amount: this._taxCalculationService.getRoundValue(itemCharges),
                            IsRefund: false
                        }
                    }
                }
            }
        }

    }

    isBookingCancelValid(cancelDetail: CancelationPolicyDetails): boolean {

        let isBookingValid = false;

        this._bookingCancelationDetail = cancelDetail;

        if (!this._bookingCancelationDetail.CancelBeforeDurationTypeID || this._bookingCancelationDetail.CancelBeforeDurationTypeID == 0) {
            this._bookingCancelationDetail.CancelBeforeDurationTypeID = this._durationType.Minutes;
            this._bookingCancelationDetail.CancelBefore = 1;
        }

        switch (this._bookingCancelationDetail.CancelBeforeDurationTypeID) {
            case this._durationType.Days: {
                isBookingValid = this.validateCancelBookBeforeDays();
                break;
            }
            case this._durationType.Hours: {
                isBookingValid = this.validateCancelBookBeforeHours();
                break;
            }
            case this._durationType.Minutes: {
                isBookingValid = this.validateCancelBookBeforeMinutes();
                break;
            }
            case this._durationType.Weeks: {
                isBookingValid = this.validateCancelBookBeforeWeeks();
                break;
            }
        }
        return isBookingValid;

    }



    validateCancelBookBeforeDays() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._bookingCancelationDetail?.StartTime);
        var startDate = this._dateTimeService.convertTimeStringToDateTime(classStartTime, new Date(this._bookingCancelationDetail?.StartDate));
        var maxBookingBeforeDate = new Date(JSON.parse(JSON.stringify(startDate)));
        maxBookingBeforeDate.setDate(startDate.getDate() - this._bookingCancelationDetail?.CancelBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeDate);
    }

    validateCancelBookBeforeHours() {
        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._bookingCancelationDetail?.StartTime);
        var startTime = this._dateTimeService.convertTimeStringToDateTime(classStartTime, this._bookingCancelationDetail?.StartDate);
        var maxBookingBeforeTime = new Date(JSON.parse(JSON.stringify(startTime)));
        maxBookingBeforeTime.setHours(startTime.getHours() - this._bookingCancelationDetail?.CancelBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeTime);
    }

    validateCancelBookBeforeMinutes() {

        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._bookingCancelationDetail?.StartTime);
        var startTime = this._dateTimeService.convertTimeStringToDateTime(classStartTime, this._bookingCancelationDetail?.StartDate);
        var maxBookingBeforeTime = new Date(JSON.parse(JSON.stringify(startTime)));
        maxBookingBeforeTime.setMinutes(startTime.getMinutes() - this._bookingCancelationDetail?.CancelBefore);

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeTime);
    }

    validateCancelBookBeforeWeeks() {

        let classStartTime = this._dateTimeService.convertToTwentyFourHours(this._bookingCancelationDetail?.StartTime);
        var startDate = this._dateTimeService.convertTimeStringToDateTime(classStartTime, new Date(this._bookingCancelationDetail?.StartDate));
        var maxBookingBeforeDate = new Date(JSON.parse(JSON.stringify(startDate)));
        maxBookingBeforeDate.setDate(startDate.getDate() - (this._bookingCancelationDetail?.CancelBefore * 7));

        return this._dateTimeService.isBookingTimeValid(maxBookingBeforeDate);
    }
    isClassStarted(attendess: AllAttendees) {
        let today = this._dateTimeService.getDateTimeWithoutZone(this._dateTimeService.getCurrentDate());
        let isClassStarted: boolean = false;
        let itemStartDate: any = new Date(attendess.StartDate);
        itemStartDate.setHours(parseInt(attendess.StartTime.split(":")[0]));
        itemStartDate.setMinutes(parseInt(attendess.StartTime.split(":")[1]));
        itemStartDate = this._dateTimeService.getDateTimeWithoutZone(itemStartDate);
        if ((itemStartDate < today)) {
            isClassStarted = true
        }
        return isClassStarted;
    }


    prepareDataForPayment(customerID: number, waitList: AllWaitlist, itemType: WaitlistItemList, userInfo: any, freeClassServiceMemberships?: FreeClassesMemberships, classDetailObj?: ClassAttendanceDetail) {
        let cartItem = new POSCartItem();
        let personInfo = new POSClient();
        let saleInvoice: SaleInvoice = new SaleInvoice();
        saleInvoice.SaleDetailList = [];
        var posCartItems = [];
        var result: any = {};
        if (userInfo && userInfo.Email != '' && userInfo.CustomerTypeName != '') {
            // personInfo.FullName = userInfo?.FirstName + userInfo?.LastName;
            // personInfo.Mobile = userInfo?.Mobile?.toString();
            // personInfo.Email = userInfo?.Email;
            // personInfo.CustomerID = itemType.CustomerID;
            // personInfo.CustomerTypeID = userInfo.CustomerTypeID
            // personInfo.CustomerTypeName = userInfo.CustomerTypeName;
            // personInfo.AllowPartPaymentOnCore = userInfo.AllowPartPaymentOnCore;

            personInfo.FullName = userInfo?.Name;
            personInfo.Mobile = userInfo?.Mobile;
            personInfo.Email = userInfo?.Email;
            personInfo.CustomerID = userInfo?.CustomerID;
            personInfo.CustomerTypeID = userInfo?.CustomerTypeID
            personInfo.CustomerTypeName = userInfo?.CustomerTypeName;
            personInfo.AllowPartPaymentOnCore = userInfo?.AllowPartPaymentOnCore;
            personInfo.IsBlocked = waitList?.IsBlocked;
        } else {
            personInfo.FullName = itemType.CustomerName;
            personInfo.Mobile = itemType.Mobile?.toString();
            personInfo.Email = itemType.Email;
            personInfo.CustomerID = itemType.CustomerID;
            personInfo.CustomerTypeID = itemType.CustomerTypeID
            personInfo.CustomerTypeName = CustomerType.Client == itemType.CustomerTypeID ? 'Client' : (CustomerType.Member == itemType.CustomerTypeID ? 'Member' : (CustomerType.Lead == itemType.CustomerTypeID ? 'Lead' : null))
            personInfo.AllowPartPaymentOnCore = itemType.AllowPartPaymentOnCore;
            personInfo.IsBlocked = waitList?.IsBlocked;

        }



        cartItem.ItemID = classDetailObj.ClassID;
        cartItem.ItemTypeID = POSItemType.Class;
        cartItem.ClassEndTime = classDetailObj.EndTime;
        cartItem.ClassStartDate = this._dateTimeService.convertDateObjToString(this.classDate, 'yyyy-MM-dd');
        cartItem.ClassStartTime = classDetailObj.StartTime;
        cartItem.IsFree = false;
        cartItem.Name = classDetailObj.ClassName;
        cartItem.Price = classDetailObj.PricePerSession;
        cartItem.PricePerSession = classDetailObj.PricePerSession;

        cartItem.SelectedForPay = true;


        cartItem.TotalTaxPercentage = classDetailObj.TotalTaxPercentage;
        cartItem.TotalDiscount = 0;
        cartItem.ItemDiscountAmount = 0;
        cartItem.Qty = 1;
        cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty);

        // check waitlist class membership benefit
        if (freeClassServiceMemberships != null && freeClassServiceMemberships.IsMembershipBenefit && !freeClassServiceMemberships.IsBenefitSuspended &&
            (freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits)) {
            cartItem.DiscountType = freeClassServiceMemberships.MembershipName;
            cartItem.IsMembershipBenefit = freeClassServiceMemberships.IsMembershipBenefit;
            cartItem.IsBenefitsSuspended = freeClassServiceMemberships.IsBenefitSuspended;
            cartItem.IsFree = freeClassServiceMemberships.IsFree;

            if (freeClassServiceMemberships.IsFree) {
                cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits ? 0 : cartItem.PricePerSession;
                cartItem.TotalDiscount = classDetailObj.PricePerSession;
                cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
                cartItem.Price = cartItem.TotalAmountExcludeTax;

            } else if (!freeClassServiceMemberships.IsFree && freeClassServiceMemberships.DiscountPerncentage) {

                cartItem.DiscountPercentage = freeClassServiceMemberships.DiscountPerncentage;
                cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassServiceMemberships.DiscountPerncentage) / 100))
                cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
                cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
                cartItem.Price = cartItem.TotalAmountExcludeTax;
            }
        } else
            //check simple booking benefit
            if (freeClassServiceMemberships != null && freeClassServiceMemberships.IsMembershipBenefit && !freeClassServiceMemberships.IsBenefitsSuspended &&
                (freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null)) {
                cartItem.DiscountType = freeClassServiceMemberships.MembershipName;
                cartItem.IsMembershipBenefit = freeClassServiceMemberships.IsMembershipBenefit;
                cartItem.IsBenefitsSuspended = freeClassServiceMemberships.IsBenefitsSuspended;
                cartItem.IsFree = freeClassServiceMemberships.IsFree;

                if (freeClassServiceMemberships.IsFree) {
                    cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null ? 0 : cartItem.PricePerSession;
                    cartItem.TotalDiscount = classDetailObj.PricePerSession;
                    cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                    cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
                    cartItem.Price = cartItem.TotalAmountExcludeTax;

                } else if (!freeClassServiceMemberships.IsFree && freeClassServiceMemberships.DiscountPerncentage) {
                    // let val = {
                    //     PricePerSession: cartItem.PricePerSession,
                    //     DiscountPercentage: freeClassMemberships.DiscountPerncentage
                    // }
                    cartItem.DiscountPercentage = freeClassServiceMemberships.DiscountPerncentage;
                    cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassServiceMemberships.DiscountPerncentage) / 100))
                    cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
                    cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
                    //Comment by fazeel ... 19/10/2020
                    // cartItem.TotalTaxPercentage = this.classDetailObj.TotalTaxPercentage; //this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, cartItem.TotalAmount)
                    cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
                    cartItem.Price = cartItem.TotalAmountExcludeTax;
                }

            }
            // here we handle the case of future membership and assiging the membership Id null
            else{
              freeClassServiceMemberships.CustomerMembershipID = null;
            }

        cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(classDetailObj.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
        cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);

        // this line added for membership benifit if benefit apply not change value "TotalAmountExcludeTax" for dicount other wise pos cart item and total due show wrong values added by Fahad dated on 13/09/2021
        cartItem.TotalAmountExcludeTax = cartItem.ItemDiscountAmount > 0 ? this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty) : cartItem.TotalAmountExcludeTax;

        posCartItems.push(cartItem);
        result.grossAmount = posCartItems[0].TotalAmountExcludeTax;
        result.vatTotal = this._taxCalculationService.getTaxAmount(classDetailObj.TotalTaxPercentage, posCartItems[0].TotalAmountExcludeTax);
        result.posCartItems = posCartItems;
        result.saleInvoice = this.setSaleClassFinalData(customerID, classDetailObj.ClassID, freeClassServiceMemberships, itemType.WaitListDetailID);
        result.personInfo = personInfo;
        return result;
        // this.setSaleClassFinalData(waitlistDetailId);

        // if (this.isRewardProgramInPackage) {
        //     this._commonService.getItemRewardPoints(POSItemType.Class, cartItem.ItemID, personInfo.CustomerID, freeClassMemberships ? freeClassMemberships?.IsFree : false, freeClassMemberships ? freeClassMemberships?.IsBenefitSuspended : false, this.posCartItems[0].CustomerMembershipID && this.posCartItems[0].CustomerMembershipID > 0 ? true : false).subscribe((response: any) => {
        //         cartItem.AmountSpent = response.Result.AmountSpent;
        //         cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ? response.Result.MemberBaseEarnPoints : 0;
        //         cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
        //         this.saleInvoice.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(personInfo, cartItem);
        //         this.openDialogForPayment(personInfo, freeClassMemberships, waitlistDetailId);
        //     })
        // } else {
        //     this.openDialogForPayment(personInfo, freeClassMemberships, waitlistDetailId);
        // }
    }

    setSaleClassFinalData(customerID?: number, classID?: number, freeClassMemberships?: FreeClassesMemberships, WaitListDetailID?: number) {
        var saleInvoice = new SaleInvoice();
        saleInvoice.ApplicationArea = SaleArea.Waitlist;
        saleInvoice.SaleDetailList = [];

        saleInvoice.CustomerID = customerID;

        let saleItem = new POSSaleDetail();
        saleItem.ItemID = classID;
        saleItem.ItemTypeID = POSItemType.Class;
        saleItem.Qty = 1;
        saleItem.WaitListDetailID = WaitListDetailID;



        saleItem.StartDate = this._dateTimeService.convertDateObjToString(this.classDate, 'yyyy-MM-dd');
        saleItem.CustomerMembershipID = freeClassMemberships?.CustomerMembershipID;
        saleItem.ItemDiscountAmount = freeClassMemberships?.DiscountPercentage;
        saleInvoice.SaleDetailList.push(saleItem);


        return saleInvoice;

    }


    /* Open Payment Dialog */
    // openDialogForPayment(customerID: number, waitList: AllWaitlist, itemType: WaitlistItemList, userInfo: any, freeClassServiceMemberships?: FreeClassesMemberships , classDetailObj? : ClassAttendanceDetail) {

    //     let cartItem = new POSCartItem();
    //     let personInfo = new POSClient();
    //     let posCartItems = [];
    //     let saleInvoice: SaleInvoice = new SaleInvoice();
    //     let saleService = new POSSaleDetail();
    //     saleInvoice.SaleDetailList = [];

    //     let result: any = {}

    //     if (userInfo && userInfo.Email != '' && userInfo.CustomerTypeName != '') {
    //         personInfo.FullName = userInfo?.FirstName + userInfo?.LastName;
    //         personInfo.Mobile = userInfo?.Mobile?.toString();
    //         personInfo.Email = userInfo?.Email;
    //         personInfo.CustomerID = itemType.CustomerID;
    //         personInfo.CustomerTypeID = userInfo.CustomerTypeID
    //         personInfo.CustomerTypeName = userInfo.CustomerTypeName;
    //         personInfo.AllowPartPaymentOnCore = userInfo.AllowPartPaymentOnCore;
    //     } else {
    //         personInfo.FullName = itemType.CustomerName;
    //         personInfo.Mobile = itemType.Mobile?.toString();
    //         personInfo.Email = itemType.Email;
    //         personInfo.CustomerID = itemType.CustomerID;
    //         personInfo.CustomerTypeID = itemType.CustomerTypeID
    //         personInfo.CustomerTypeName = CustomerType.Client == itemType.CustomerTypeID ? 'Client' : (CustomerType.Member == itemType.CustomerTypeID ? 'Member' : (CustomerType.Lead == itemType.CustomerTypeID ? 'Lead' : null))
    //         personInfo.AllowPartPaymentOnCore = itemType.AllowPartPaymentOnCore;
    //     }
    //     // cartItem.ItemID = waitList.ItemID;
    //     // cartItem.ItemTypeID = waitList.ItemTypeID;

    //     // cartItem.IsFree = freeClassServiceMemberships.IsFree;
    //     // cartItem.Name = waitList.ItemName;
    //     // cartItem.Price = itemType.ItemPrice;
    //     // cartItem.PricePerSession = itemType.ItemPrice;
    //     // cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(0, cartItem.Price) * 1);
    //     // cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);

    //     cartItem.ItemID = classDetailObj.ClassID;
    //     cartItem.ItemTypeID = POSItemType.Class;
    //     cartItem.ClassEndTime = classDetailObj.EndTime;
    //     cartItem.ClassStartDate = this._dateTimeService.convertDateObjToString(new Date(itemType.RequestDate), 'yyyy-MM-dd');
    //     cartItem.ClassStartTime = classDetailObj.StartTime;
    //     cartItem.IsFree = false;
    //     cartItem.Name = classDetailObj.ClassName;
    //     cartItem.Price = classDetailObj.PricePerSession;
    //     cartItem.PricePerSession = classDetailObj.PricePerSession;

    //     // cartItem.SelectedForPay = true;
    //     // cartItem.TotalTaxPercentage = 0;
    //     // cartItem.TotalDiscount = 0;
    //     // cartItem.ItemDiscountAmount = 0;
    //     // cartItem.Qty = 1;
    //     // cartItem.TotalAmountExcludeTax = cartItem.PricePerSession;

    //     cartItem.TotalTaxPercentage = classDetailObj.TotalTaxPercentage;
    //     cartItem.TotalDiscount = 0;
    //     cartItem.ItemDiscountAmount = 0;
    //     cartItem.Qty = 1;

    //     cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty);
    //     if (freeClassServiceMemberships != null && freeClassServiceMemberships.IsMembershipBenefit && !freeClassServiceMemberships.IsBenefitSuspended &&
    //         (freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits)) {
    //         cartItem.DiscountType = this.discountType.MembershipBenefit;
    //         cartItem.IsMembershipBenefit = freeClassServiceMemberships.IsMembershipBenefit;
    //         cartItem.IsBenefitsSuspended = freeClassServiceMemberships.IsBenefitSuspended;
    //         cartItem.IsFree = freeClassServiceMemberships.IsFree;

    //         if (freeClassServiceMemberships.IsFree) {
    //             cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits ? 0 : cartItem.PricePerSession;
    //             cartItem.TotalDiscount = classDetailObj.PricePerSession;
    //             cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
    //             cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
    //             cartItem.Price = cartItem.TotalAmountExcludeTax;

    //         } else if (!freeClassServiceMemberships.IsFree && freeClassServiceMemberships.DiscountPercentage) {
    //             // let val = {
    //             //     PricePerSession: cartItem.PricePerSession,
    //             //     DiscountPercentage: freeClassMemberships.DiscountPercentage
    //             // }
    //             cartItem.DiscountPercentage = freeClassServiceMemberships.DiscountPercentage;
    //             cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassServiceMemberships.DiscountPercentage) / 100))
    //             cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
    //             cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.NoLimits ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
    //             //Comment by fazeel ... 19/10/2020
    //             // cartItem.TotalTaxPercentage = this.classDetailObj.TotalTaxPercentage; //this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, cartItem.TotalAmount)
    //             cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
    //             cartItem.Price = cartItem.TotalAmountExcludeTax;
    //         }
    //     }

    //     cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(classDetailObj.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
    //     cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);

    //     // this line added for membership benifit if benefit apply not change value "TotalAmountExcludeTax" for dicount other wise pos cart item and total due show wrong values added by Fahad dated on 13/09/2021
    //     cartItem.TotalAmountExcludeTax = cartItem.ItemDiscountAmount > 0 ? this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty) : cartItem.TotalAmountExcludeTax;

    //     posCartItems.push(cartItem);

    //     // let saleItem = new POSSaleDetail();
    //     // saleItem.ItemID = itemType.ItemID;
    //     // saleItem.ItemTypeID = waitList.ItemTypeID;

    //     // if (waitList.ItemTypeID == POSItemType.Class) {
    //     //     cartItem.ClassEndTime = itemType.EndTime;
    //     //     cartItem.ClassStartDate = this._dateTimeService.convertDateObjToString(new Date(itemType.RequestDate), 'yyyy-MM-dd');
    //     //     cartItem.ClassStartTime = itemType.StartTime;
    //     //     saleInvoice.SaleDetailList = [];
    //     //     saleInvoice.CustomerID = customerID;
    //     //     saleItem.WaitListDetailID = itemType.WaitListDetailID;
    //     //     saleItem.Qty = 1;
    //     //     saleItem.StartDate = this._dateTimeService.convertDateObjToString(new Date(itemType.RequestDate), 'yyyy-MM-dd');
    //     //     posCartItems.push(cartItem);
    //     //     saleItem.CustomerMembershipID = posCartItems[0].CustomerMembershipID;
    //     //     saleItem.ItemDiscountAmount = posCartItems[0].ItemDiscountAmount;

    //         saleInvoice.ApplicationArea = SaleArea.Waitlist;
    //     //     saleInvoice.SaleDetailList.push(saleItem);
    //         // if (freeClassServiceMemberships != null && freeClassServiceMemberships.CustomerMembershipID > 0 && !freeClassServiceMemberships.IsBenefitSuspended &&
    //         //     (freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null)) {
    //         //     cartItem.DiscountType = this.discountType.MembershipBenefit;
    //         //     if (freeClassServiceMemberships.IsFree) {
    //         //         cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null ? 0 : cartItem.PricePerSession;
    //         //         cartItem.TotalDiscount = cartItem.PricePerSession;
    //         //         cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
    //         //         cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
    //         //         cartItem.Price = cartItem.TotalAmountExcludeTax;

    //         //     } else if (!freeClassServiceMemberships.IsFree && freeClassServiceMemberships.DiscountPercentage) {
    //         //         // let val = {
    //         //         //     PricePerSession: cartItem.PricePerSession,
    //         //         //     DiscountPercentage: freeClassServiceMemberships.DiscountPercentage
    //         //         // }

    //         //         cartItem.TotalDiscount = this._taxCalculationService.getTwoDecimalDigit(((cartItem.PricePerSession * freeClassServiceMemberships.DiscountPercentage) / 100))
    //         //         cartItem.ItemDiscountAmount = cartItem.TotalDiscount;
    //         //         cartItem.TotalAmountExcludeTax = freeClassServiceMemberships.RemainingSession > 0 || freeClassServiceMemberships.RemainingSession == null ? (cartItem.PricePerSession - cartItem.TotalDiscount) : cartItem.PricePerSession;
    //         //         cartItem.CustomerMembershipID = freeClassServiceMemberships.CustomerMembershipID;
    //         //         cartItem.Price = cartItem.TotalAmountExcludeTax;
    //         //     }
    //         // }
    //     // }
    //     //  else {
    //     //     saleInvoice.ApplicationArea = SaleArea.Service;
    //     //     saleService.StartDate = itemType.RequestDate;
    //     //     saleService.StartTime = itemType.StartTime;
    //     //     saleService.EndTime = itemType.EndTime;
    //     //     saleService.ItemID = waitList.ItemID;
    //     //     saleService.FacilityID = null;
    //     //     saleService.ItemTypeID = POSItemType.Service;
    //     //     saleService.Qty = 1;
    //     //     saleService.CustomerBookingID = itemType.ItemID;
    //     //     saleService.ItemDiscountAmount = 0;
    //     //     saleService.AssignedToStaffID = itemType.StaffID > 0 ? itemType.StaffID : null;
    //     //     cartItem.ServiceDate = itemType.RequestDate;
    //     //     cartItem.ServiceStartTime = itemType.StartTime;
    //     //     cartItem.ServiceEndTime = itemType.EndTime;
    //     //     cartItem.IsMembershipBenefit = freeClassServiceMemberships?.CustomerMembershipID > 0 ? true : false;
    //     //     cartItem.CustomerMembershipID = freeClassServiceMemberships?.CustomerMembershipID;
    //     //     cartItem.PricePerSession = itemType.ItemPrice;
    //     //     let val = {
    //     //         PricePerSession: cartItem.PricePerSession,
    //     //         DiscountPercentage: freeClassServiceMemberships != null ? freeClassServiceMemberships?.DiscountPercentage : 0
    //     //     }

    //     //     cartItem.TotalDiscount = AppUtilities.getPerItemDiscount(val);
    //     //     cartItem.TotalAmountExcludeTax = cartItem.Qty * (cartItem.PricePerSession - cartItem.TotalDiscount);

    //     //     cartItem.ItemDiscountAmount = this._taxCalculationService.getRoundValue(cartItem.TotalDiscount);

    //     //     cartItem.Price = freeClassServiceMemberships?.IsFree ? 0 : cartItem.ItemDiscountAmount;
    //     //     posCartItems.push(cartItem);
    //     //     saleInvoice.WaitListDetailID = itemType.WaitListDetailID;
    //     //     saleInvoice.SaleDetailList.push(saleService);
    //     // }
    //     result.grossAmount = posCartItems[0].TotalAmountExcludeTax;
    //     result.vatTotal = this._taxCalculationService.getTaxAmount(0, posCartItems[0].TotalAmountExcludeTax);
    //     result.posCartItems = posCartItems;
    //     result.saleInvoice = saleInvoice;
    //     result.personInfo = personInfo;
    //     return result;
    // }

    // Get Service or Class Benefits if the Customer Membership Id > 0
    getMemberShipBenefits(ItemTypeID: number, ItemID: number, CustomerMembershipID: number ,BookingDate?:string) {
        let customerMembershipModel: any = {};
        customerMembershipModel.CustomerMembershipID = CustomerMembershipID;
        customerMembershipModel.ItemID = ItemID;
        customerMembershipModel.BookingDate = BookingDate;

        customerMembershipModel.ItemTypeID = ItemTypeID == POSItemType.Class ? 7 : ItemTypeID;

        return this._http.get(SaleApi.getCustomerMembershipBenefits, customerMembershipModel)
    }

    // Get Service or Class Benefits if the Customer Membership Id > 0
    getItemRewardPoints(ItemTypeID: number, ItemID: number, CustomerID: number, IsFree: boolean, IsBenefitsSuspended: boolean, IsMembershipBenefit: boolean) {
        let customerRewardPointsModel: any = {};
        customerRewardPointsModel.CustomerID = CustomerID;
        customerRewardPointsModel.ItemID = ItemID;
        customerRewardPointsModel.IsFree = IsFree;
        customerRewardPointsModel.IsBenefitsSuspended = IsBenefitsSuspended;
        customerRewardPointsModel.ItemTypeID = ItemTypeID == POSItemType.Class ? 7 : ItemTypeID;
        customerRewardPointsModel.IsCustomerMembershipBenefited = IsMembershipBenefit

        return this._http.get(CustomerRewardProgramApi.getItemRewardsPointscolumns, customerRewardPointsModel)
    }

    setCancellationPackagePermission() {
        return new Promise<any>((resolve, reject) => {
            var filteredbookingStatusOptions = this.bookingStatusOptions
            this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
                (packageId: number) => {
                    if (packageId && packageId > 0) {
                        var packages = ENU_Package;

                        switch (packageId) {

                            case packages.FitnessBasic:
                                filteredbookingStatusOptions = this.bookingStatusOptions.filter(option => option.BookingStatusTypeID !== ENU_BookingStatusValue.NoShow);
                                break;

                            case packages.FitnessMedium:
                                filteredbookingStatusOptions = this.bookingStatusOptions.filter(option => option.BookingStatusTypeID !== ENU_BookingStatusValue.NoShow);
                                break;
                        }
                    }
                    return resolve(filteredbookingStatusOptions);
                }
            );
        });
    }

    setReschedulePackagePermission() {
        return new Promise<any>((resolve, reject) => {
            var isRescheduleAllow = false;
            this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
                (packageId: number) => {
                    if (packageId && packageId > 0) {
                        var packages = ENU_Package;

                        switch (packageId) {
                            case packages.FitnessMedium:
                                isRescheduleAllow = true
                                break;

                            case packages.Full:
                                isRescheduleAllow = true
                                break;
                        }
                    }
                    return resolve(isRescheduleAllow);
                }
            );
        });
    }

    // check state county code is neccessary for us
    isStatCountyCodeExist(memberDetails: any, statList: any, branchCountryID: number) {
        let isCodeExist = true;
        if (branchCountryID == 2) {
            memberDetails.CustomerAddress.forEach(homeAddress => {
                homeAddress.isRequiredCOuntyCode = true;
                if (homeAddress.CountryID == 2) {
                    if (homeAddress.StateCountyName) {
                        let isExist = statList ? statList.filter(stat => stat.StateCountyName == homeAddress.StateCountyName && stat.StateCountyCode == homeAddress.StateCountyCode) : 0;
                        if (isExist.length == 0) {
                            homeAddress.isRequiredCOuntyCode = false;
                        }
                    } else if ((homeAddress.StateCountyName == null || homeAddress.StateCountyName == "") && (homeAddress.Address1 || homeAddress.CityName || homeAddress.PostalCode)) {
                        homeAddress.isRequiredCOuntyCode = false;
                    } else {
                        homeAddress.isRequiredCOuntyCode = true;
                    }
                }
            });
            this._dataSharingService.shareIsExistCountyCode(memberDetails.CustomerAddress);
            return !memberDetails.CustomerAddress[0].isRequiredCOuntyCode || !memberDetails.CustomerAddress[1].isRequiredCOuntyCode || !memberDetails.CustomerAddress[2].isRequiredCOuntyCode ? false : true;
        }
        return isCodeExist;
    }

    customPaginationGenerator(totalItems: number, currentPage: number = 1, pageSize: number = 16) {
        let currentRecord, lastTotalRecord;
        let totalPages = Math.ceil(totalItems / pageSize);
        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= 16) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 16;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
        if (currentPage === 1) {
            currentRecord = currentPage;
        } else {
            currentRecord = ((pageSize * currentPage) + (1) - pageSize);
        }
        if (pages && pages.length > 1) {
            if (currentPage === totalPages) {
                lastTotalRecord = totalItems;
            } else {
                lastTotalRecord = (currentPage) * pageSize;
            }
        } else {
            lastTotalRecord = 1;
        }
        // return object with all pager properties required by the view
        return {
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages,
            currentRecord: currentRecord,
            lastTotalRecord: lastTotalRecord
        };
    }

    getDiscountInPercentage(itemDiscountAmount , pricePerSession){
      return (itemDiscountAmount / pricePerSession) * 100;
    }
}

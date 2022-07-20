import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { StaffInfo } from 'src/app/staff/models/staff.model';
import { CompanyDetails, CompanyInfo } from 'src/app/setup/models/company.details.model';
import { PersonInfo, InvoiceHistory, DD_Branch, POSBooking, CustomerBillingAddress } from 'src/app/models/common.model';
import { ActivityPersonInfo } from 'src/app/models/activity.model';
import { Client } from 'src/app/customer/client/models/client.model';
import { ClassAppointmentDetail } from 'src/app/scheduler/models/class.model';
import { MemberAttendanceDetail } from 'src/app/attendance/models/member.attendance.model';
import { SEPACountry } from 'src/app/models/cutomer.gateway.models';

@Injectable({ providedIn: 'root' })
export class DataSharingService {

    // #region Private Members
    private staffArray: any[] = [];
    private sepaCountry: SEPACountry[] = [];

    private _staffIDSource = new BehaviorSubject<number>(0);
    private _loggedInStaffIDSource = new BehaviorSubject<number>(null);
    private _attributeID = new BehaviorSubject<number>(0);
    private _isMultiBranchID = new BehaviorSubject<boolean>(true);

    private _CategoryID = new BehaviorSubject<number>(0);

    private _companyIDSource = new BehaviorSubject<number>(0);
    private _countryIDSource = new BehaviorSubject<number>(0);
    private _enterPriseURlSource = new BehaviorSubject<string>("");
    private _staffEmailSource = new BehaviorSubject<string>("");
    private _companyImageSource = new BehaviorSubject<string>("");
    private _companyImageUploadedSource = new BehaviorSubject<boolean>(false);
    private _staffImageSource = new BehaviorSubject<string>("");
    private _staffImageUploadedSource = new BehaviorSubject<boolean>(false);
    private _staffInfoSource = new BehaviorSubject<StaffInfo>(new StaffInfo());
    private _staffListSource = new BehaviorSubject<any[]>(this.staffArray);
    private _leadIDSource = new BehaviorSubject<number>(0);
    private _leadIDOnMemberSource = new BehaviorSubject<number>(0);
    private _updateBranchSource = new BehaviorSubject<DD_Branch>(new DD_Branch());
    private _currentBranchSource = new BehaviorSubject<DD_Branch>(new DD_Branch());
    private _companyInfoSource = new BehaviorSubject<CompanyDetails>(new CompanyDetails);
    private _updateActivityCountSource = new BehaviorSubject<boolean>(false);
    private _memberIDSource = new BehaviorSubject<number>(0);
    private _memberEmailSource = new BehaviorSubject<string>("");
    private _imageSource = new BehaviorSubject<string>("");
    private _membershipIDSource = new BehaviorSubject<number>(0);
    private _memberMembershipIDSource = new BehaviorSubject<number>(0);
    private _isAppointmentResizeSource = new BehaviorSubject<boolean>(false);
    private _personInfoSource = new BehaviorSubject<PersonInfo>(new PersonInfo());
    private _customerIdSource = new BehaviorSubject<number>(0);
    private _customerTypeIdSource = new BehaviorSubject<number>(0);
    private _clientIDSource = new BehaviorSubject<number>(0);
    private _clientEmailSource = new BehaviorSubject<string>("");
    private _clientInfoSource = new BehaviorSubject<Client>(new Client());
    private _activityPersonInfoSource = new BehaviorSubject<ActivityPersonInfo>(new ActivityPersonInfo());
    private _classDetailSource = new BehaviorSubject<ClassAppointmentDetail>(new ClassAppointmentDetail());

    private _invoiceHistory = new BehaviorSubject<InvoiceHistory>(new InvoiceHistory());
    private _posBooking = new BehaviorSubject<POSBooking>(new POSBooking());
    private _reportsTabChange = new BehaviorSubject<number>(0);
    private _packageId = new BehaviorSubject<number>(0);
    private _memberAttendanceSource = new BehaviorSubject<MemberAttendanceDetail>(new MemberAttendanceDetail);
    private _updateRolePermission = new BehaviorSubject<boolean>(false);
    private _isPartPaymentAllow = new BehaviorSubject<boolean>(false);
    private _updateCancelledStatus = new BehaviorSubject<boolean>(false);
    private _isStripeReaderSaved = new BehaviorSubject<boolean>(false);
    private _isBranchLoaded = new BehaviorSubject<boolean>(false);
    // private _isMultiBranchCompany = new BehaviorSubject<boolean>(false);

    private _isCompanyLoaded = new BehaviorSubject<boolean>(false);

    private _sepaCountry = new BehaviorSubject<SEPACountry[]>(this.sepaCountry);
    private _formsCountForCustomerNavigation = new BehaviorSubject<number>(0);
    private _submitPayTabs = new BehaviorSubject<boolean>(false);
    private _customerBillingAddress = new BehaviorSubject<CustomerBillingAddress>(new CustomerBillingAddress());
    private _isExistCountyCode = new BehaviorSubject<any>([]);
    private _stripeTerminalLoactionID = new BehaviorSubject<string>(null);
    private _stripeTerminalConnectedOrDisconnected = new BehaviorSubject<boolean>(false);
    private _isStripeTerminalAllowed = new BehaviorSubject<boolean>(false);
    private _branchDefaultRewardProgram = new BehaviorSubject(null);
    // #endregion Private Members

    // #region Public Members

    staffID = this._staffIDSource.asObservable();
    loggedInStaffID = this._loggedInStaffIDSource.asObservable();
    sharedAttributeID = this._attributeID.asObservable();
    sharedIsMultiBranchCompany = this._isMultiBranchID.asObservable();

    sharedCategoryID = this._CategoryID.asObservable();

    companyID = this._companyIDSource.asObservable();
    countryID = this._countryIDSource.asObservable();
    enterPriseUrl = this._enterPriseURlSource.asObservable();
    staffEmail = this._staffEmailSource.asObservable();
    staffInfo = this._staffInfoSource.asObservable();
    staffList = this._staffListSource.asObservable();
    companyImage = this._companyImageSource.asObservable();
    companyImageUploaded = this._companyImageUploadedSource.asObservable();
    staffImage = this._staffImageSource.asObservable();
    staffImageUploaded = this._staffImageUploadedSource.asObservable();
    leadID = this._leadIDSource.asObservable();
    leadIDOnMember = this._leadIDOnMemberSource.asObservable();
    updateBranch = this._updateBranchSource.asObservable();
    currentBranch = this._currentBranchSource.asObservable();
    companyInfo = this._companyInfoSource.asObservable();
    updateActivityCount = this._updateActivityCountSource.asObservable();
    memberID = this._memberIDSource.asObservable();
    memberEmail = this._memberEmailSource.asObservable();
    uploadedImage = this._imageSource.asObservable();
    isAppointmentResize = this._isAppointmentResizeSource.asObservable();

    membershipID = this._membershipIDSource.asObservable();
    memberMembershipID = this._memberMembershipIDSource.asObservable();
    personInfo = this._personInfoSource.asObservable();
    customerID = this._customerIdSource.asObservable();
    customerTypeID = this._customerTypeIdSource.asObservable();
    clientID = this._clientIDSource.asObservable();
    clientEmail = this._clientEmailSource.asObservable();
    clientInfo = this._clientInfoSource.asObservable();
    activityPersonInfo = this._activityPersonInfoSource.asObservable();
    classDetailSource = this._classDetailSource.asObservable();
    invoiceHistory = this._invoiceHistory.asObservable();
    posBooking = this._posBooking.asObservable();
    notifyReportTabChange = this._reportsTabChange.asObservable();
    packageId = this._packageId.asObservable();
    memberAttendanceInfo = this._memberAttendanceSource.asObservable();
    updateRolePermission = this._updateRolePermission.asObservable();
    updateCancelledStatus = this._updateCancelledStatus.asObservable();
    isPartPaymentAllow = this._isPartPaymentAllow.asObservable();
    isStripeReaderSaved = this._isStripeReaderSaved.asObservable();
    isBranchLoaded = this._isBranchLoaded.asObservable();
    // isMultiBranchCompany = this._isMultiBranchCompany.asObservable();

    isCompanyLoaded = this._isCompanyLoaded.asObservable();
    sepaCountryList = this._sepaCountry.asObservable();
    formsCountForCustomerNavigation = this._formsCountForCustomerNavigation.asObservable();
    payTabsButtonSubmission = this._submitPayTabs.asObservable();
    customerBillingAddress = this._customerBillingAddress.asObservable();
    isExistCountyCodeName = this._isExistCountyCode.asObservable();
    stripeTerminalLoactionID = this._stripeTerminalLoactionID.asObservable();
    stripeTerminalConnectedOrDisconnected = this._stripeTerminalConnectedOrDisconnected.asObservable();
    isStripeTerminalAllowed = this._isStripeTerminalAllowed.asObservable();
    branchDefaultRewardProgram = this._branchDefaultRewardProgram.asObservable();
    // #endregion Public Members

    constructor() { }

    // #region Methods

    shareFormsCountForCustomerNavigation(customerID: number) {
        this._formsCountForCustomerNavigation.next(customerID);
    }

    shareBranchLoaded(isLoaded: boolean) {
        this._isBranchLoaded.next(isLoaded);
    }

    shareCompanyLoaded(isLoaded: boolean) {
        this._isCompanyLoaded.next(isLoaded);
    }
    shareStaffID(staffID: number) {
        this._staffIDSource.next(staffID);
    }

    shareloggedInStaffID(staffID: number) {
        this._loggedInStaffIDSource.next(staffID);
    }

    shareCategoryID(categoryID: number) {
      this._CategoryID.next(categoryID);
    }

    shareAttributeID(attributeID: number) {
        this._attributeID.next(attributeID);
    }

    shareBrandID(brandID: number) {
      this._attributeID.next(brandID);
    }

    shareIsMultiBranch(isMultiBranch: boolean) {
      this._isMultiBranchID.next(isMultiBranch);
    }
    shareCompanyID(companyID: number) {
        this._companyIDSource.next(companyID);
    }

    shareCountryID(countryID: number) {
        this._countryIDSource.next(countryID);
    }
    shareEnterPriseUrl(enterPriseUrl: string) {
        this._enterPriseURlSource.next(enterPriseUrl);
    }

    shareStaffEmail(staffEmail: string) {
        this._staffEmailSource.next(staffEmail);
    }

    shareStaffInfo(staffInfo: StaffInfo) {
        this._staffInfoSource.next(staffInfo);
    }


    shareStaffList(staff: any[]) {
        this._staffListSource.next(staff);
    }

    shareCompanyImage(image: string) {
        this._companyImageSource.next(image);
    }

    shareStaffImage(image: string) {
        this._staffImageSource.next(image);
    }

    shareCompanyImageUploaded(isUploaded: boolean) {
        this._companyImageUploadedSource.next(isUploaded);
    }

    shareStaffImageUploaded(isUploaded: boolean) {
        this._staffImageUploadedSource.next(isUploaded);
    }

    shareLeadID(leadID: number) {
        this._leadIDSource.next(leadID);
    }

    shareLeadIDOnMember(leadIDOnMember: number) {
        this._leadIDOnMemberSource.next(leadIDOnMember);
    }

    shareUpdateBranch(branch: DD_Branch) {
        this._updateBranchSource.next(branch);
    }

    shareCurrentBranch(branch: DD_Branch) {
        this._currentBranchSource.next(branch);
    }

    shareCompanyInfo(companyInfo: CompanyDetails) {
        this._companyInfoSource.next(companyInfo);
    }

    shareUpdateActivityCount(isUpdateRequired: boolean) {
        this._updateActivityCountSource.next(isUpdateRequired);
    }

    shareMemberID(memberID: number) {
        this._memberIDSource.next(memberID);
    }

    shareMemberEmail(memberEmail: string) {
        this._memberEmailSource.next(memberEmail);
    }

    shareImage(image: string) {
        this._imageSource.next(image);
    }

    shareIsResizeAppointment(isResiz: boolean) {
        this._isAppointmentResizeSource.next(isResiz);
    }

    shareMembershipID(membershipID: number) {
        this._membershipIDSource.next(membershipID);
    }

    shareMemberMembershipID(membershipID: number) {
        this._memberMembershipIDSource.next(membershipID);
    }

    sharePersonInfo(personInfo: PersonInfo) {
        this._personInfoSource.next(personInfo);
    }

    shareCustomerID(customerId: number) {
        this._customerIdSource.next(customerId);
    }

    shareCustomerTypeID(customerTypeId: number) {
        this._customerTypeIdSource.next(customerTypeId);
    }

    shareClientID(clientID: number) {
        this._clientIDSource.next(clientID);
    }

    shareClientEmail(clientEmail: string) {
        this._clientEmailSource.next(clientEmail);
    }

    shareClientInfo(clientInfo: Client) {
        this._clientInfoSource.next(clientInfo);
    }

    shareActivityPersonInfo(activityPersonInfo: ActivityPersonInfo) {
        this._activityPersonInfoSource.next(activityPersonInfo);
    }

    shareClassDetailSource(classAppointmentDetail: ClassAppointmentDetail) {
        this._classDetailSource.next(classAppointmentDetail);
    }

    shareinvoiceHistoryInfo(invoiceHistory: InvoiceHistory) {
        this._invoiceHistory.next(invoiceHistory);
    }

    sharePOSBookingInfo(posBooking: POSBooking) {
        this._posBooking.next(posBooking);
    }

    shareNotifyReportTabChange(notifyReportTabChange: number) {
        this._reportsTabChange.next(notifyReportTabChange);
    }

    sharePackageId(packageId: number) {
        this._packageId.next(packageId);
    }

    shareMemberAttendanceInfo(memberAttendanceInfo: MemberAttendanceDetail) {
        this._memberAttendanceSource.next(memberAttendanceInfo)
    }

    shareUpdateRolePermission(updateRolePermission: boolean) {
        this._updateRolePermission.next(updateRolePermission)
    }

    shareCancelledMembershipStatus(updateCancelledStatus: boolean) {
        this._updateCancelledStatus.next(updateCancelledStatus);
    }

    sharePartPaymentAllowPermission(isPartPaymentAllow: boolean) {
        this._isPartPaymentAllow.next(isPartPaymentAllow)
    }
    shareStripeReaderSaveStatus(isStripeReaderSaved: boolean) {
        this._isStripeReaderSaved.next(isStripeReaderSaved)
    }

    shareSEPACountryList(sepaCountry: SEPACountry[]) {
        this._sepaCountry.next(sepaCountry);
    }
    onButtonSubmit(isSubmited: boolean) {
        this._submitPayTabs.next(isSubmited);
    }

    shareCustomerBillingAddress(address) {
        this._customerBillingAddress.next(address);
    }

    shareIsExistCountyCode(isExist) {
        this._isExistCountyCode.next(isExist);
    }
    shareStripeTerminalLoactionID(locationID) {
        this._stripeTerminalLoactionID.next(locationID);
    }

    shareStripeTerminalConnectedOrDisconnected(isConnected) {
        this._stripeTerminalConnectedOrDisconnected.next(isConnected);
    }
    shareisStripeTerminalAllowed(isStripeTerminalAllowed) {
        this._isStripeTerminalAllowed.next(isStripeTerminalAllowed);
    }
    shareBranchDefaultRewardProgram(branchDefaultRewardProgram) {
        this._branchDefaultRewardProgram.next(branchDefaultRewardProgram);
    }
    // #endregion
    // Helper Function
    // returnCurrentBrnachDefaultCountry() {
    //     let currencyFormat;
    //     this.currentBranch.subscribe(
    //         (branch: DD_Branch) => {
    //             if (branch && branch.hasOwnProperty("Currency")) {
    //                 currencyFormat = branch.Currency.toLowerCase().substring(0, branch.Currency.length - 1);
    //             }
    //         });
    //     return currencyFormat;
    // }
}

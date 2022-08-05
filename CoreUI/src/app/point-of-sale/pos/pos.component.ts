/********************** Angular References *********************/
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/internal/operators";
import { SubscriptionLike } from "rxjs";
import * as moment from "moment";

/****************** Angular Material References *****************/
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

/****************** Services & Models *****************/
/* Models */
import {
    InvoiceInQueue, POSCartItem, POSClass, POSClassInfo, POSClassModel, POSClient, POSItem, POSProduct, POSSaleDetail, POSServiceModel, QueuedInvoiceForGrid, SaleInvoice, SaleQueueDetail,
    SaleService, SaveQueue, FreeClassBooking, MemberhsipBenefits, RemainingSessionDetail, ProductCategory, ClassCategory, ServiceCategory, SavePOSForAddMoreItems, SalePaymentMode, SaleQueuePaymentGateway, ItemList, MembershipBaseProductGlobalRemainingSession
} from "src/app/point-of-sale/models/point.of.sale.model";
import { ClassAttendanceDetail } from "src/app/models/attendee.model";
import { ApiResponse, CustomerMemberhsip } from "src/app/models/common.model";
import { Client } from "src/app/customer/client/models/client.model";
/* Services */
import { AuthService } from "src/app/helper/app.auth.service";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { ClassValidations } from "src/app/services/class.validations.service";
import { CommonService } from "src/app/services/common.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
/****************** Configurations *****************/
import { ENU_Permission_Module, ENU_Permission_ClientAndMember, ENU_Permission_PointOfSale } from "src/app/helper/config/app.module.page.enums";
import { CustomerType, POSItemType, ClassStatus, ENU_DateFormatName, CalculatorValue, EnumSaleType, ENU_Package, ProductClassification } from "src/app/helper/config/app.enums";
import { PointOfSaleApi, SaleApi, AttendeeApi, DiscountSetupApi, CustomerPaymentGatewayApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { environment } from "src/environments/environment";
import { Configurations, SaleArea, ClassStatusName, DiscountType } from "src/app/helper/config/app.config";
import { AppUtilities } from "src/app/helper/aap.utilities";



/****************** Components *****************/
import { POSServiceDetailComponent } from "../services/pos.service.detail.component";
import { AlertConfirmationComponent } from "src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component";
import { POSPaymentComponent } from "src/app/shared/components/sale/payment/pos.payment.component";
import { POSQueuedInvoicesComponent } from "../queued-invoices/pos.queued.invoices.component";
import { SaveClientPopupComponent } from 'src/app/customer/client/save/save.client.popup.component';
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { RedeemMembershipComponent } from "src/app/shared/components/redeem-membership/redeem.membership.component";
import { ClassBookingForFamilyAndFriendsComponent } from "../class-booking-for-family-and-friends/class.booking.for.family.and.friends.component";
import { PosProductDetailComponent } from "../pos-product-detail/pos-product-detail.component";
import { AppPaginationComponent } from "src/app/shared-pagination-module/app-pagination/app.pagination.component";

declare var $: any;


@Component({
    selector: 'point-of-sale',
    templateUrl: './pos.component.html',
    encapsulation: ViewEncapsulation.None
})

export class PointOfSaleComponent extends AbstractGenericComponent implements OnInit {
    // #region Local Members
    @ViewChild("SearchInput") inputEl: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    /* Local Members */
    currencyFormat: string;
    currencySymbol: string;
    activeTab: string;
    searchText: string = '';
    queuedInvoiceNumber: number = 0;
    personName: string;
    classStartDate: Date = new Date();
    minClassStartDate: Date = new Date();
    currentRecord: any;
    lastTotalRecord: any;
    isProductsAllowed: boolean = false;
    isServicesAllowed: boolean = false;
    isClassesAllowed: boolean = false;
    isQueueInvoiceAllowed: boolean = false;
    isBarCodeScannerAllowed: boolean = false;
    isTipsAllowed: boolean = false;
    isDiscountAllowed: boolean = false;
    isSaveClientAllowed: boolean;
    hasProducts: boolean;
    hasServices: boolean;
    hasClasses: boolean;
    isBarCodeSearch: boolean;
    hasMemberhsip: boolean;
    hasMemberhsipBenefits: boolean;
    noOfItems: number = 0;
    grossAmount: number = 0;
    taxAmount: number = 0;
    amountPaid: number = 0;
    productCustomPager: any = {};
    disableClassBookingButton: boolean = false;
    customerMembershipId: number = 0;
    hasDiscountInPackage: boolean = false;
    classGlobalRemainingSession?: number;
    productGlobalRemainingSession?: number;
    membershipBaseProductGlobalRemainingSession?: MembershipBaseProductGlobalRemainingSession[] = new Array<MembershipBaseProductGlobalRemainingSession>();
    productGlobalRemainingSessionCopy: number = null;
    classGlobalRemainingSessionCopy: number = null;
    serviceGlobalRemainingSessionCopy: number = null;
    serviceGlobalRemainingSession?: number;
    totalProductItemLevelQty: number = 0;
    totalClassItemLevelQty: number = 0;
    totalServiceItemLevelQty: number = 0;
    //---- Discount Calculator -----//
    showDiscountCalc: boolean;
    showDiscountPin: boolean;
    isDiscountCalculator: boolean;
    calculatorResult: string = "0";
    discountPinResult: string = "";
    discountPin: string = "";
    discountAmount: number = 0;
    customerName: string = "";
    totalRecord: number = 0;
    longDateFormat: string = "";//Configurations.DateFormat;
    dateFormat: string = "";//Configurations.DateFormat;
    receiptDateFormat: string = "";//Configurations.ReceiptDateFormat;

    /* Private Members */
    private readonly DATE_FORMAT = "yyyy-MM-dd";

    /* Model/Component References */
    searchPerson: FormControl = new FormControl();
    //posCartSingleItem: POSCartItem;
    posCartDiscountItemIndex: number;
    selectedClient: POSClient;
    walkedInClient: POSClient;
    saleInvoice: SaleInvoice;
    saveQueue: SaveQueue;
    calculatorValue = CalculatorValue;
    packageIdSubscription: SubscriptionLike;
    posDataSubscription: SubscriptionLike;
    customerMemberhsipSubscription: SubscriptionLike;
    customerMemberhsip: CustomerMemberhsip[];
    posProducts: POSProduct[];
    posServices: POSServiceModel[];
    posClasses: POSClassModel[];
    memberhsipBenefits: MemberhsipBenefits[];
    posItems: POSItem[];
    brandList: any[] = [];
    posCartItems: POSCartItem[] = [];
    queuedInvoices: InvoiceInQueue[] = [];
    clientList: POSClient[];
    remainingSessionDetail: RemainingSessionDetail[] = [];
    customerMembershipList: any = [];
    selectedMembershipName: string;

    POS_ITEM_TYPE = {
        Class: 'Classes',
        Product: 'Products',
        Service: 'Services'
    }

    POS_ITEM_SESSION = {
        isProductSessionExceed: false,
        totalItemLevelQty: 0
    }


    /* Configurations */
    timeFormat = Configurations.TimeFormat;
    posItemType = POSItemType;
    serverImageAddress = environment.imageUrl;
    messages = Messages;
    classStatus = ClassStatus;
    classStatusName = ClassStatusName;
    discountType = DiscountType;
    paymentType = EnumSaleType;

    //new search filter variables
    isShowSearchText: boolean = true;
    isShowSearchBYCategory: boolean = false;
    isShowSearchBYBrand: boolean = false;
    // isShowSearchClasses: boolean = true;
    // isShowSelectCategoryClasses: boolean = false;

    // isShowSearchServices: boolean = true;
    // isShowSelectCategoryServices: boolean = false;

    productsCategoryList: ProductCategory[] = [];

    classesCategoryList: ClassCategory[] = [];

    servicesCategoryList: ServiceCategory[] = [];

    selectedCategory: number = null;
    selectedBrand: number = null;
    copySelectedBrand: number = null;
    copySelectedCategory: number = null;
    isRewardProgramInPackage: boolean = false;
    isPurchaseRestrictionAllowed: boolean = false;

    package = ENU_Package;

    isShowDiscardInvoice: boolean = false;
    invoicePaymentModes: SalePaymentMode[] = new Array<SalePaymentMode>();
    paymentData: SavePOSForAddMoreItems = new SavePOSForAddMoreItems();
    dateFormatForSave = Configurations.DateFormatForSave;
    isCustomerMembership: boolean = false;
    productClassificationType = ProductClassification;

    productPlaceHolderImage = 'assets/images/pos_placeholder.jpg';


    // #endregion
    constructor(
        private _dialog: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _classValidationService: ClassValidations,
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _taxCalculationService: TaxCalculation,
        private _authService: AuthService) { super(); }


    ngOnInit() {

        this.checkPackagePermissions();
        this.activeTab = this.POS_ITEM_TYPE.Product;
        this.setPermissions();
        this.getCurrentBranchDetail();
        this.getSaleFundamentals();
        this.searchPerson.valueChanges
            .pipe(debounceTime(200))
            .subscribe(searchText => {
                if (searchText != null) {
                    if (searchText == "") {
                        this.clientList = [];
                        this.onClearSelectedClient();
                    }
                    else if (searchText.length > 2) {
                        if (typeof (searchText) === "string" && searchText.length > 2) {
                            let trimedValue = searchText.trim();
                            let isPOSSearch = true;
                            this._commonService.searchClient(trimedValue, 0, false, isPOSSearch)
                                .subscribe(response => {
                                    if (response.Result != null && response.Result.length) {
                                        this.clientList = response.Result;

                                        this.clientList.forEach(client => {
                                            client.FullName = client.FirstName + " " + client.LastName;
                                        });
                                    }
                                    else {
                                        this.clientList = [];
                                    }
                                });
                        }
                    }
                }
                else {
                    this.clientList = [];
                    this.selectedClient = null;
                }
            });



    }

    ngAfterViewInit() {
        if (this.isProductsAllowed) {
            this.activeTab = this.POS_ITEM_TYPE.Product;
            this.getPOSProducts();
        }
        else if (this.isClassesAllowed) {
            this.activeTab = this.POS_ITEM_TYPE.Class;
            this.getPOSClasses();
        }
        else if (this.isServicesAllowed) {
            this.activeTab = this.POS_ITEM_TYPE.Service;
            this.getPOSServices();
        }
    }

    // #region Events

    toggleTooltipTemplate(item) {

        $(".dx-popup-content").addClass('pr-overlay');
        item.WithTooltipVisible = !item.WithTooltipVisible;
    }

    //subscribe package and then call setPackagePermissions function to apply conditions according to package
    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
    }
    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getPOSProducts();
    }
    //here we apply conditions accroding to packages
    setPackagePermissions(packageId: number) {
        this.isRewardProgramInPackage = false;
        switch (packageId) {

            case this.package.Full:
                this.isRewardProgramInPackage = true;
                this.isPurchaseRestrictionAllowed = true;
                break;
        }
    }

    //on tap change (product class and service)
    onTabChange(event: any) {
        if (event.tab.textLabel) {
            this.activeTab = event.tab.textLabel;

            this.searchText = '';
            this.selectedCategory = null;
            this.isBarCodeSearch = false;

            this.isShowSearchText = true;
            this.isShowSearchBYCategory = false;
            this.isShowSearchBYBrand = false;
            this.selectedBrand = null;
            this.copySelectedBrand = null;
            this.copySelectedCategory = null;
            this.getPOSItems();
        }
    }

    //on search type change (category and search by text )
    onSearchChange(value) {
        this.searchText = '';
        this.selectedCategory = null;
        this.selectedBrand = null;
        this.copySelectedBrand = null;
        this.copySelectedCategory = null;
        this.isBarCodeSearch = false;

        if (value == 'Category') {
            this.isShowSearchText = false;
            this.isShowSearchBYCategory = true;
        } else if (value == 'Brands') {
            this.isShowSearchText = false;
            this.isShowSearchBYBrand = true;
        } else {
            this.isShowSearchText = true;
            this.isShowSearchBYBrand = false;
            this.isShowSearchBYCategory = false;
        }
        if (this.activeTab === this.POS_ITEM_TYPE.Product) {
            this.getPOSProducts();
        }
    }

    //on click category (when search category is selected and you select category type)
    onSelectCategory(event) {
        if (event.tab.textLabel) {
            this.selectedCategory = Number(event.tab.textLabel);
        } else {
            this.selectedCategory = null;
        }
        if (this.activeTab === this.POS_ITEM_TYPE.Product && this.copySelectedCategory == null || (this.copySelectedCategory > 0 && this.copySelectedCategory != this.selectedCategory)) {
            this.getPOSProducts();
            this.copySelectedCategory = this.selectedCategory;
        }
    }
    //on click category (when search category is selected and you select category type)
    onSelectBrand(event) {
        if (event.tab.textLabel) {
            this.selectedBrand = Number(event.tab.textLabel);
        } else {
            this.selectedBrand = null;
        }
        if (this.activeTab === this.POS_ITEM_TYPE.Product && this.copySelectedBrand == null || (this.copySelectedBrand > 0 && this.copySelectedBrand != this.selectedBrand) ) {
            this.getPOSProducts();
            this.copySelectedBrand = this.selectedBrand;
        }
    }

    //on clear search text for (class services and product)
    onClearSearchText() {
        this.searchText = '';
        if (this.activeTab === this.POS_ITEM_TYPE.Product) {
            this.getPOSProducts();
        }
    }

    setPage(page: number) {

        this.productCustomPager = this._commonService.customPaginationGenerator(this.totalRecord, page);
        let params = {
            customerMembershipID: this.customerMembershipId,
            customerID: this.selectedClient ? this.selectedClient.CustomerID : null,
            ProductCategoryID: this.selectedCategory,
            ProductName: this.searchText,
            brandID: null,
            PageNumber: page,
            PageSize: this.productCustomPager.pageSize
        }

        this.posProducts = [];
        this._httpService.save(PointOfSaleApi.getPOSProducts, params)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.hasProducts = res.Result && res.Result.ProductList && res.Result.ProductList.length > 0 ? true : false;
                        if (this.hasProducts) {

                            this.posProducts = res.Result.ProductList;

                            this.onUpdateStockQuantityOnPaginationAndAfterQue(this.posProducts);
                            this.productsCategoryList = res.Result.ProductCategoryList;
                            let filterGlobalSession: POSProduct = this.posProducts.filter(c => c.IsMembershipBenefit && (c.GlobalRemainingSession > 0 || c.GlobalRemainingSession == null))[0];
                            if (filterGlobalSession != undefined) {
                                this.productGlobalRemainingSession = filterGlobalSession && filterGlobalSession.GlobalRemainingSession > 0 ? filterGlobalSession.GlobalRemainingSession : null;

                                //update global session
                                let customerMembershipId = Number(this.customerMembershipId);
                                this.productGlobalRemainingSessionCopy = this.productGlobalRemainingSession;

                                if (this.posCartItems && this.posCartItems.length > 0 && this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == customerMembershipId)) {
                                    this.posCartItems.forEach(cartItem => {


                                        //update global level session
                                        if (cartItem.ItemTypeID === POSItemType.Product && cartItem.CustomerMembershipID == customerMembershipId && this.productGlobalRemainingSession > 0) {
                                            this.productGlobalRemainingSession = this.productGlobalRemainingSession - cartItem.Qty;
                                        }
                                    });
                                }

                                if (this.selectedClient && this.selectedClient?.CustomerTypeID == CustomerType.Member) {
                                    this.setProductBenefitModel();
                                    var result = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == this.customerMembershipId);
                                    if (result) {
                                        result.productGlobalRemainingSessionCopy = this.productGlobalRemainingSessionCopy;
                                        result.productGlobalRemainingSession = this.productGlobalRemainingSession;
                                        result.remainingSessionDetail = [];
                                        this.memberhsipBenefits?.forEach(benefit => {

                                            var itemRemainingSession: number = 0;
                                            var addedProduct = this.posCartItems.find(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == this.customerMembershipId && i.ProductVariantID == benefit.ItemID);
                                            if (addedProduct) {
                                                itemRemainingSession = benefit.RemainingSession == null ? benefit.RemainingSession : benefit.RemainingSession - addedProduct.Qty;
                                                // addedProduct.RemainingSession = itemRemainingSession;
                                            } else {
                                                itemRemainingSession = benefit.RemainingSession
                                            }

                                            // var itemRemainingSession = this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession == null
                                            //                             || this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession >= 0
                                            //                             ? this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession
                                            //                             : benefit.RemainingSession;

                                            var productBenefit = {
                                                ItemTypeID: benefit.ItemTypeID,
                                                ItemID: benefit.ItemID,
                                                RemainingSession: itemRemainingSession,
                                                AllowedSession: itemRemainingSession,
                                                IsMembershipBenefit: benefit.IsMembershipBenefit,
                                                CustomerMembershipID: this.customerMembershipId
                                            }

                                            result.remainingSessionDetail.push(productBenefit);
                                        });

                                    } else {
                                        var mbpgrs = new MembershipBaseProductGlobalRemainingSession();
                                        mbpgrs.CustomerMembershipID = this.customerMembershipId;
                                        mbpgrs.productGlobalRemainingSession = this.productGlobalRemainingSession;
                                        mbpgrs.productGlobalRemainingSessionCopy = this.productGlobalRemainingSessionCopy;

                                        mbpgrs.remainingSessionDetail = [];
                                        this.memberhsipBenefits?.forEach(benefit => {

                                            var productBenefit = {
                                                ItemTypeID: benefit.ItemTypeID,
                                                ItemID: benefit.ItemID,
                                                RemainingSession: benefit.RemainingSession,
                                                AllowedSession: benefit.RemainingSession,
                                                IsMembershipBenefit: benefit.IsMembershipBenefit,
                                                CustomerMembershipID: this.customerMembershipId
                                            }

                                            mbpgrs.remainingSessionDetail.push(productBenefit);
                                        });

                                        this.membershipBaseProductGlobalRemainingSession.push(mbpgrs);
                                    }

                                }
                            }

                            this.posProducts.forEach(posProduct => {
                                posProduct.TotalDiscount = 0;
                                posProduct.ServerImageAddress = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePathForCompanyOnly());
                            });

                            this.updateCartItems();
                            this.totalRecord = res.TotalRecord;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Products"))
                }
            );

    }

    // onErrorImage(arrayIndex){
    //     this.posProducts[arrayIndex].ServerImageAddress = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath());
    // }

    onProductLoadREcalculateBenefits() {

    }

    setProductBenefitModel() {
        if (this.membershipBaseProductGlobalRemainingSession == null || this.membershipBaseProductGlobalRemainingSession.length == 0) {
            this.membershipBaseProductGlobalRemainingSession = [];
        }
    }

    // onSelectAllCategory(){
    //     this.selectedCategory = null;
    //     //this.onTabChnageResetCategoriesFilter(itemType)
    // }

    // onTabChnageResetCategoriesFilter(itemType){
    //     if(this.posItemType.Product == itemType){
    //         this.isSelectAllProductsCategory = true;
    //         this.productsCategoryList.forEach(category => {
    //             category.IsSelected = false;
    //         });

    //         this.selectedCategory = null;
    //         this.isSelectAllProductsCategory = true;
    //     }
    // }

    //when click on any service and then it will call service details pop up
    onViewServiceDetail(service: POSServiceModel) {
        this.openViewServiceDialog(service);
    }

    //on selection of class date for search classes according to date
    onClassStartDate(date: any) {
        setTimeout(() => {
            this.classStartDate = date;
            this.getPOSClasses();
        });
    }

    // close autocomplete panel
    onFocusedOut() {
        this.autocomplete.closePanel();
        this.clientList = [];
    }
    // added product in the cart  => check benefits and calculate global remaining sessions
    // added product in the cart  => check benefits and calculate global remaining sessions
    onProductAddToCart(product: POSProduct, isBarCodeSearch: boolean = false) {
        if (product.ProductClassificationID === ProductClassification.Standard) {

            // if (product.IsStockBelowThreshold && !product.InventoryOverselling) {
            //     this._messageService.showErrorMessage(this.messages.Error.Item_Out_Of_Stock);
            //     return;
            // }
            if (this.checkProductQuantityandShowValidation(product as any, 'add', 'posProduct')) {
                this.addProductToCart(product);
            }
        } else {
            this._httpService.get(PointOfSaleApi.getProductDetail + product.ProductID)
                .subscribe(
                    (res: ApiResponse) => {
                        if (res && res.MessageCode > 0) {
                            var productCartList = this.posCartItems.filter(i => i.ItemTypeID == this.posItemType.Product);
                            const dialog = this._dialog.open(PosProductDetailComponent,
                                {
                                    disableClose: true,
                                    data: {
                                        productCartList: productCartList,
                                        product: res.Result,
                                        customerMembershipID: this.customerMembershipId,
                                        customerID: this.selectedClient?.CustomerID,
                                        posProduct: product,
                                        isBarCodeSearch: isBarCodeSearch
                                    }
                                });
                            dialog.componentInstance.productVariantAvailable.subscribe(productVarient => {
                                if (productVarient) {
                                    if (this.checkProductQuantityandShowValidation(productVarient as any, 'add', 'posProduct', true)) {
                                        this.addProductToCart(productVarient);
                                    }
                                }
                            });
                        }
                        else {

                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Product'))
                    }
                )
        }
    }


    checkProductQuantityandShowValidation(product: POSCartItem, event: string, area: string, isVarientProduct?: boolean) {

        var findSameProductQty = this.posCartItems.filter(i => i.ProductID == product.ProductID && i.ProductVariantID == product.ProductVariantID);
        if (findSameProductQty.length > 0) {
            product.ActualStock = findSameProductQty[0].ActualStock;
            var sumOfTotalQuantity = 0;
            findSameProductQty.forEach((element, i) => {
                sumOfTotalQuantity = sumOfTotalQuantity + element.Qty;
            });
            product.CurrentStock = product.ActualStock - sumOfTotalQuantity;
        }
        if (!product.InventoryOverselling && product.HasTrackInventory && (product.CurrentStock == 0 || product.CurrentStock! < 0)) {
            this._messageService.showErrorMessage(this.messages.Error.Item_Out_Of_Stock);
            return false;
        }


        else {
            if (area == 'posProduct') {

                if (product.IsMembershipBenefit && !product.IsBenefitsSuspended && !product.IsConsumed) {
                    let customerMembershipId = Number(this.customerMembershipId);
                    let cartItem = this.posCartItems.filter(c => c.ItemID == product.ProductVariantID && c.CustomerMembershipID == customerMembershipId);
                    if (cartItem.length > 0 && cartItem != undefined) {
                        this.updateRemainingSessions(cartItem[0], true);
                    }

                    if (this.oncheckProductItemAndGlobalLevelRemaingSession(product)) {
                        if (product.HasTrackInventory) {
                            var productQty = 0;
                            var productCartList = this.posCartItems.filter(i => i.ProductID == product.ProductID && i.ProductVariantID == product.ProductVariantID);

                            if (productCartList.length > 0) {
                                productCartList.forEach(i => {
                                    if (i.ProductID == product.ProductID)
                                        productQty = + 1;
                                    i.CurrentStock = (i.CurrentStock - 1);
                                });
                                product.CurrentStock = product.CurrentStock - productQty;
                                if (isVarientProduct) {
                                    this.onUpdateProductStockFromCart(product, 'add');
                                }
                                return true;
                            }
                            else {
                                product.CurrentStock = (product.CurrentStock - 1);
                                if (isVarientProduct) {
                                    this.onUpdateProductStockFromCart(product, 'add');
                                }
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Global_Remaining_Session.replace("{0}", "products"));
                    }
                }
                else {
                    if (product.HasTrackInventory) {
                        var productQty = 0;
                        var productCartList = this.posCartItems.filter(i => i.ProductID == product.ProductID && i.ProductVariantID == product.ProductVariantID);

                        if (productCartList.length > 0) {
                            productCartList.forEach(i => {
                                if (i.ProductID == product.ProductID)
                                    productQty = + 1;
                                i.CurrentStock = (i.CurrentStock - 1);
                            });
                            product.CurrentStock = product.CurrentStock - productQty;
                            if (isVarientProduct) {
                                this.onUpdateProductStockFromCart(product, 'add');
                            }
                            return true;
                        }
                        else {
                            product.CurrentStock = (product.CurrentStock - 1);
                            if (isVarientProduct) {
                                this.onUpdateProductStockFromCart(product, 'add');
                            }
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
            }
            else {
                if (product.HasTrackInventory) {
                    this.onUpdateProductStockFromCart(product, event);
                    return true;
                } else {
                    return true;
                }
            }
        }

    }

    // added services in the cart  => check benefits and calculate global remaining sessions
    onServiceAddToCart(serviceModel: POSServiceModel, saleService: SaleService) {
        let servicePackage = serviceModel.ServicePackageList.filter(sp => sp.ServicePackageID === saleService.ServicePackageID)[0];
        if (this.checkItemAssociationWithMemberhisp(serviceModel)) {
            switch (this.serviceGlobalRemainingSession == null || this.serviceGlobalRemainingSession != null) {
                case this.serviceGlobalRemainingSession == null:
                    if (this.oncheckItemLevelRemaingSession(serviceModel, this.posItemType.Service)) {
                        this.addServiceToCart(serviceModel, saleService);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Global_Remaining_Session.replace("{0}", "services"));
                    }
                    break;

                case this.serviceGlobalRemainingSession != null:
                    if (this.serviceGlobalRemainingSession != 0) {
                        this.addServiceToCart(serviceModel, saleService);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Global_Remaining_Session.replace("{0}", "services"));
                    }
                    break;
                default:
                    this.addServiceToCart(serviceModel, saleService);
                    break;
            }
        }
        else {
            this.addServiceToCart(serviceModel, saleService);
        }
    }

    // added classes in the cart  => check benefits and calculate global remaining sessions
    onClassAddToCart(classItem: POSClass, startDate: string) {
        this.disableClassBookingButton = true;
        //friend and family added to cart

        if (this.checkItemAssociationWithMemberhisp(classItem) && classItem.Status != this.classStatus.Full) {
            if (this.oncheckClassItemAndGlobalLevelRemaingSession(classItem)) {
                this.getClassInfo(classItem, startDate, false);
            }
            else if (classItem.IsClassBookingForFamilyAndFriends) {
                classItem.IsFamilyAndFriendItem = true;
                classItem.IsCartItemUseBenefit = false;
                this.getClassInfo(classItem, startDate, true);
            }
            else {
                this._messageService.showErrorMessage(this.messages.Error.Global_Remaining_Session.replace("{0}", "classes"));
                this.disableClassBookingButton = false;
            }
        }
        else if (classItem.IsFamilyAndFriendItem) {
            this.getClassInfo(classItem, startDate);
        } else
            //simple added to card
            if (this.checkItemAssociationWithMemberhisp(classItem) && classItem.Status != this.classStatus.Full) {
                if (this.oncheckClassItemAndGlobalLevelRemaingSession(classItem)) {
                    this.getClassInfo(classItem, startDate);
                } else if (classItem.IsClassBookingForFamilyAndFriends) {
                    classItem.IsFamilyAndFriendItem = true;
                    //classItem.IsFamilyAndFriendItemUseBenefit = false;
                    this.getClassInfo(classItem, startDate);
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Global_Remaining_Session.replace("{0}", "classes"));
                    this.disableClassBookingButton = false;
                }
            }
            else {
                this.getClassInfo(classItem, startDate);
            }
    }

    //friend and family booking
    onClassBookAgain(classItem: POSClass, startDate: string) {
        //check class free spaces left
        //as per Izhar if free spaces left are 0 and attendee max -99 its mean no limit in maximun attendee dated on 11/12/2021 added by fahad
        if (classItem.SpacesLeftFree > 1 || (classItem.IsBookedAgain && classItem.SpacesLeftFree > 0) || (classItem.AttendeeMax == 0)) {
            //check member benefits
            var isAllowedUseBenefit: boolean = false;
            classItem.IsCartItemUseBenefit = true;

            if (this.selectedClient && this.selectedClient.CustomerTypeID == CustomerType.Member) {
                var isAllowedUseBenefit = classItem.IsClassBookingForFamilyAndFriends && classItem.IsMembershipBenefit && classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 && classItem.IsClassBookingFreeBenefitsForFamilyAndFirends ? true :
                    classItem.IsClassBookingForFamilyAndFriends && classItem.IsMembershipBenefit && !classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 && classItem.DiscountPercentage > 0 && classItem.IsClassBookingDiscountBenefitsForFamilyAndFriends ? true :
                        classItem.ItemCurrentPrice == classItem.PricePerSession && classItem.IsClassBookingForFamilyAndFriends ? true : false;
            }

            var remainingclassBenefits = isAllowedUseBenefit ? this.getClassItemAndGlobalLevelRemaingSession(classItem) : 0;

            var freeSpacesLeft = classItem.AttendeeMax == 0 ? null : classItem.SpacesLeftFree;
            if (freeSpacesLeft != null && freeSpacesLeft != 0) {
                if (this.posCartItems.filter(i => i.ItemID == classItem.ClassID)) {
                    freeSpacesLeft = freeSpacesLeft - this.posCartItems.filter(i => i.ItemID == classItem.ClassID).length;
                    freeSpacesLeft = freeSpacesLeft > 0 ? freeSpacesLeft : 0;
                }
            }

            // if (remainingclassBenefits > 0) {
            //     let alreadyUseBenefit = this.posCartItems.filter(i => i.ItemID == classItem.ClassID && i.ItemTypeID == this.posItemType.Class && i.CustomerMembershipID == this.customerMembershipId && i.IsCartItemUseBenefit).length;
            //     remainingclassBenefits = remainingclassBenefits - (alreadyUseBenefit ? alreadyUseBenefit : 0);
            // }

            const dialog = this._dialog.open(ClassBookingForFamilyAndFriendsComponent,
                {
                    disableClose: true,
                    data: {
                        remaningMaxAttendee: freeSpacesLeft,
                        remainingclassBenefits: remainingclassBenefits
                    }
                });

            dialog.componentInstance.bookingForFamilyAndFriendsModel.subscribe((bookingForFamilyAndFriends: any) => {
                if (bookingForFamilyAndFriends) {
                    let url = PointOfSaleApi.getClassInfo.replace("{classID}", classItem.ClassID.toString())
                        .replace("{classDate}", this._dateTimeService.convertDateObjToString(new Date(startDate), this.DATE_FORMAT));
                    this._httpService.get(url).subscribe(
                        (response: ApiResponse) => {
                            if (response && response.MessageCode > 0) {
                                if (response.Result) {
                                    response.Result.TotalEnrolledAttendees = response.Result.TotalEnrolledAttendees + this.posCartItems.filter(i => i.ItemID == classItem.ClassID).length;
                                    for (let i = 0; i < bookingForFamilyAndFriends.TotalAttendeeAdded; i++) {
                                        classItem.IsFamilyAndFriendItem = true;
                                        var isFamilyAndFriendItemUseBenefit: boolean = bookingForFamilyAndFriends.TotalBenefitsUse && bookingForFamilyAndFriends.TotalBenefitsUse > 0 ? true : false;
                                        bookingForFamilyAndFriends.TotalBenefitsUse = bookingForFamilyAndFriends.TotalBenefitsUse ? bookingForFamilyAndFriends.TotalBenefitsUse - 1 : 0;
                                        if (isFamilyAndFriendItemUseBenefit) {
                                            classItem.IsCartItemUseBenefit = true;
                                            this.oncheckClassItemAndGlobalLevelRemaingSession(classItem);
                                            this.validateClassForBooking(response.Result, classItem, startDate, true);
                                        } else {
                                            classItem.IsCartItemUseBenefit = false;
                                            this.validateClassForBooking(response.Result, classItem, startDate, true);
                                        }

                                        response.Result.TotalEnrolledAttendees = response.Result.TotalEnrolledAttendees + 1;
                                    }
                                }
                            }
                            else {
                                this._messageService.showErrorMessage(response.MessageText);
                                this.disableClassBookingButton = false;
                            }
                        }
                    );
                }
            });
        }

    }

    //get class item level and global level session
    getClassItemAndGlobalLevelRemaingSession(selectedItem: any): number {
        if (selectedItem && this.checkItemAssociationWithMemberhisp(selectedItem)) {
            if (this.classGlobalRemainingSession == null && selectedItem.RemainingSession == null) {
                return null;
            }
            else if (this.classGlobalRemainingSession == null && selectedItem.RemainingSession != null) {
                return selectedItem.RemainingSession;
            }
            else if (this.classGlobalRemainingSession != null && selectedItem.RemainingSession == null) {
                return this.classGlobalRemainingSession;
            }
            else if (this.classGlobalRemainingSession != null && selectedItem.RemainingSession != null) {
                if (this.classGlobalRemainingSession > 0) {
                    return this.classGlobalRemainingSession > selectedItem.RemainingSession ? selectedItem.RemainingSession : this.classGlobalRemainingSession;
                }
                else {
                    return 0;
                }
            }
        } else {
            return 0;
        }
    }

    // item level session (in services we're calculating item level separetley because of package in product and class we're calculating item and global level in same function)
    // using for services (but can be use for product and services)
    oncheckItemLevelRemaingSession(cartItem: any, itemTypeId: number): boolean {
        if (this.remainingSessionDetail.length > 0) {
            let sessionDetail = new RemainingSessionDetail();

            switch (itemTypeId) {
                case this.posItemType.Class:
                    sessionDetail = this.remainingSessionDetail.filter(c => c.ItemTypeID === this.posItemType.Class && c.ItemID === cartItem.ClassID && c.CustomerMembershipID == cartItem.CustomerMembershipID)[0];
                    if ((sessionDetail == undefined) || (sessionDetail.IsMembershipBenefit && sessionDetail.RemainingSession && sessionDetail.RemainingSession > 0)) {
                        return true;
                    }
                    else {
                        return false;
                    }

                case this.posItemType.Product:
                    var benefit = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == cartItem.CustomerMembershipID);
                    sessionDetail = benefit.remainingSessionDetail.filter(c => c.ItemTypeID === this.posItemType.Product && c.ItemID === cartItem.ProductVariantID && c.CustomerMembershipID == cartItem.CustomerMembershipID)[0];
                    if ((sessionDetail == undefined) || (sessionDetail.IsMembershipBenefit && sessionDetail.RemainingSession && sessionDetail.RemainingSession > 0)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                case this.posItemType.Service:
                    sessionDetail = this.remainingSessionDetail.filter(c => c.ItemTypeID === this.posItemType.Service && c.ItemID === cartItem.ServicePackageID && c.CustomerMembershipID == cartItem.CustomerMembershipID)[0];
                    if ((sessionDetail == undefined) || (sessionDetail.IsMembershipBenefit && sessionDetail.RemainingSession && sessionDetail.RemainingSession > 0)) {
                        return true;
                    }
                    else {
                        return false;
                    }
            }
        }
        else {
            return true;
        }
    }

    getInventoryGlobalRemaningSession(customerMembershipID) {
        if (customerMembershipID > 0) {
            var products = this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == customerMembershipID);

            var totalQty: number = 0;

            products.forEach(cartItem => {
                totalQty = totalQty + cartItem.Qty;
            });

            var benefit = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == customerMembershipID);
            if (benefit) {
                if (benefit.productGlobalRemainingSessionCopy != null && benefit.productGlobalRemainingSessionCopy > 0) {
                    benefit.productGlobalRemainingSession = benefit.productGlobalRemainingSessionCopy - totalQty;
                }
            }
        }
    }

    //for product item level and global level session calucation
    oncheckProductItemAndGlobalLevelRemaingSession(selectedItem: any): boolean {
        if (selectedItem) {
            this.getInventoryGlobalRemaningSession(selectedItem.CustomerMembershipID);
            var productGlobalRemainingSession = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == selectedItem.CustomerMembershipID)?.productGlobalRemainingSession;
            if (productGlobalRemainingSession == null && selectedItem.RemainingSession == null) {
                return true;
            }
            else if (productGlobalRemainingSession == null && selectedItem.RemainingSession != null) {
                return this.checkItemLevelSession(selectedItem);
            }
            else if (productGlobalRemainingSession != null && selectedItem.RemainingSession == null) {
                ///////////////////////////////////////////////////////////////////
                // return this.productGlobalRemainingSession == 0 ? true : false;

                return productGlobalRemainingSession == 0 ? false : true;

            }
            else if (productGlobalRemainingSession != null && selectedItem.RemainingSession != null) {
                if (productGlobalRemainingSession > 0) {
                    var result = this.checkItemLevelSession(selectedItem);
                    if (result) { this.consumeProductGlobalSession(selectedItem.CustomerMembershipID); }
                    return result;
                }
                else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    //for class item level and global level session calucation
    oncheckClassItemAndGlobalLevelRemaingSession(selectedItem: any): boolean {
        if (selectedItem) {
            if (this.classGlobalRemainingSession == null && selectedItem.RemainingSession == null) {
                return true;
            }
            else if (this.classGlobalRemainingSession == null && selectedItem.RemainingSession != null) {
                return this.checkItemLevelSession(selectedItem);
            }
            else if (this.classGlobalRemainingSession != null && selectedItem.RemainingSession == null) {
                return this.classGlobalRemainingSession == 0 ? true : false;
            }
            else if (this.classGlobalRemainingSession != null && selectedItem.RemainingSession != null) {
                if (this.classGlobalRemainingSession > 0) {
                    var result = this.checkItemLevelSession(selectedItem);
                    if (result) { this.consumeClassGlobalSession(); }
                    return result;
                }
                else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    //remove item for cart and recalulate the sum
    onRemoveBenefitFromCartItem(cartItem: POSCartItem, isMemberShipBenefitRemove?: boolean) {

        switch (cartItem.ItemTypeID) {
            case this.posItemType.Class:
                if (this.posClasses) {
                    //check if class is waitlised
                    if (!cartItem.IsWaitlistItem) {
                        //check if remove benefit form selected membership then update sessions
                        if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                            this.updateClassSession(cartItem, false);
                        }
                        let classModel = this.posClasses.filter(c => cartItem.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(c.OccurrenceDate), this.DATE_FORMAT))[0];
                        if (classModel) {
                            if (this.posCartItems.filter(cItem => cItem.ItemID === cartItem.ItemID && cItem.ClassStartTime == cartItem.ClassStartTime && cItem.ClassEndTime == cartItem.ClassEndTime && cItem.ClassStartDate == cartItem.ClassStartDate)) {
                                cartItem.TotalTaxPercentage = classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0]?.TotalTaxPercentage ? classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0]?.TotalTaxPercentage : 0;
                            }
                        }
                    }
                }

                break;
            case this.posItemType.Service:
                if (!cartItem.IsWaitlistItem) {
                    if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                        this.updateServiceSession(cartItem, false);
                    }
                    if (this.posServices) {
                        let serviceModel = this.posServices.filter(s => s.ServiceID === cartItem.ServiceID)[0];
                        cartItem.TotalTaxPercentage = serviceModel.ServicePackageList.find(s => s.ServicePackageID == cartItem.ItemID)?.TotalTaxPercentage ? serviceModel.ServicePackageList.find(s => s.ServicePackageID == cartItem.ItemID)?.TotalTaxPercentage : 0;
                    }
                }

                break;

            case this.posItemType.Product:
                if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                    this.updateProductSession(cartItem, false, false, isMemberShipBenefitRemove);
                }
                // cartItem.TotalTaxPercentage = this.posProducts.find(p => p.ProductVariantID == cartItem.ItemID)?.TotalTaxPercentage ? this.posProducts.find(p => p.ProductVariantID == cartItem.ItemID).TotalTaxPercentage : 0;
                // cartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountForItem(cartItem);
                cartItem.TotalTaxPercentage = this.posCartItems.find(p => p.ProductVariantID == cartItem.ItemID)?.TotalTaxPercentage ? this.posCartItems.find(p => p.ProductVariantID == cartItem.ItemID).TotalTaxPercentage : 0;
                break;
        }

        if (cartItem.IsWaitlistItem == undefined || !cartItem.IsWaitlistItem) {
            cartItem.IsCartItemUseBenefit = false;
            cartItem.ItemDiscountAmount = 0;
            cartItem.TotalDiscount = 0;
            cartItem.TotalAmountExcludeTaxForPOS = (cartItem.Qty * cartItem.PricePerSession);
            cartItem.DiscountType = null;
            cartItem.CustomerMembershipID = null;
            cartItem.Price = cartItem.PricePerSession;
            cartItem.IsMembershipBenefit = false;
            cartItem.DiscountPercentage = 0;
            cartItem.PerLineItemDiscount = 0;
            cartItem.DiscountPrice = 0;
            cartItem.IsFree = false;

        } else {
            cartItem.TotalAmountExcludeTaxForPOS = 0;
            cartItem.Price = 0;
            cartItem.IsCartItemUseBenefit = false;
            cartItem.DiscountType = null;
            cartItem.CustomerMembershipID = null;
            cartItem.DiscountPercentage = 0;
            cartItem.PerLineItemDiscount = 0;
            cartItem.DiscountPrice = 0;
            cartItem.ItemDiscountAmount = 0;
            cartItem.TotalDiscount = 0;
            cartItem.IsMembershipBenefit = false;
            cartItem.IsFree = false;
        }

        this.getSubTotal();
    }


    //remove item for cart and recalulate the sum
    onRemoveItemFromCart(cartItem: POSCartItem) {
        var copyPosItems = JSON.parse(JSON.stringify(this.posCartItems));
        this.posCartItems = this.posCartItems.filter(item => item !== cartItem);

        switch (cartItem.ItemTypeID) {
            case this.posItemType.Class:
                if (this.posClasses) {
                    if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                        this.updateClassSession(cartItem, true);
                    }
                    let classModel = this.posClasses.filter(c => cartItem.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(c.OccurrenceDate), this.DATE_FORMAT))[0];
                    if (classModel) {
                        if (this.posCartItems.filter(cItem => cItem.ItemID === cartItem.ItemID && cItem.ClassStartTime == cartItem.ClassStartTime && cItem.ClassEndTime == cartItem.ClassEndTime && cItem.ClassStartDate == cartItem.ClassStartDate).length == 0) {
                            classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0].IsAddedToCart = false;
                            // classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0].IsFamilyAndFriendItem = false;
                            // classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0].IsFamilyAndFriendItemUseBenefit = false;
                        }
                    }
                }
                break;
            case this.posItemType.Service:
                if (!cartItem.IsWaitlistItem) {
                    if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                        this.updateServiceSession(cartItem, true);
                    }
                    if (this.posServices) {
                        this.posServices.filter(s => s.ServiceID === cartItem.ServiceID)[0].IsAddedToCart = false;
                    }
                } else {
                    if (this.posServices) {
                        var specificServiceWaitListItems = this.posCartItems.filter(pci => pci.ServiceID == cartItem.ServiceID);
                        if (specificServiceWaitListItems && !specificServiceWaitListItems.find(i => i.IsWaitlistItem)) {
                            this.posServices.filter(s => s.ServiceID === cartItem.ServiceID)[0].IsAddedToCart = false;
                            this.posServices.filter(s => s.ServiceID === cartItem.ServiceID)[0].IsAddedToWaitList = false;
                        }
                    }
                }

                break;

            case this.posItemType.Product:
                if (cartItem.CustomerMembershipID == this.customerMembershipId) {
                    cartItem.CurrentStock = cartItem.CurrentStock + cartItem.Qty;
                    this.onUpdateProductStockFromCart(cartItem, 'add', cartItem.Qty, copyPosItems);
                    this.updateProductSession(cartItem, false, true);
                } else {
                    cartItem.CurrentStock = cartItem.CurrentStock + cartItem.Qty;
                    this.onUpdateProductStockFromCart(cartItem, 'add', cartItem.Qty, copyPosItems);
                }
                break;
        }

        this.getSubTotal();
    }

    //not using this function
    // onRemoveItemFromCartAndUpdateSession(cartItem: POSCartItem) {
    //     switch (cartItem.ItemTypeID) {
    //         case this.posItemType.Class:
    //             if (this.posClasses) {
    //                 let classModel = this.posClasses.filter(c => cartItem.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(c.OccurrenceDate), this.DATE_FORMAT))[0];
    //                 if (classModel) {
    //                     classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0].IsAddedToCart = false;
    //                 }
    //             }
    //             break;
    //         case this.posItemType.Service:
    //             if (this.posServices) {
    //                 this.posServices.filter(s => s.ServiceID === cartItem.ServiceID)[0].IsAddedToCart = false;
    //             }
    //             break;
    //     }
    //     this.posCartItems = this.posCartItems.filter(item => item !== cartItem);
    //     this.getSubTotal();
    // }

    /////////////////////////////////////////////////
    onQuantityChange(item: POSCartItem) {
        // item.TotalAmount = this.getTotalAmountForItem(item);
        if (item.IsMembershipBenefit) {
            item.TotalDiscount = this.getTotalDiscount(item);
            item.TotalAmountExcludeTaxForPOS = this.getTotalAmountForItem(item);
        }
        else {
            item.TotalAmountExcludeTaxForPOS = this.getTotalAmountAfterDiscountForItem(item);
        }

        this.getSubTotal();
    }

    //on add and minus the quantity from cart item (plus minus button)
    onUpdateQuantity(item: POSCartItem, event: string) {
        if (event === 'add') {

            if (this.checkProductQuantityandShowValidation(item as any, 'add', 'posProduct')) {

                this.onUpdateProductsQuantity(item, event);
            }
        }
        else {
            this.onUpdateProductsQuantity(item, event);
        }
    }

    //update product stock quantity on change plus minus button from cart and also call this function on delete product and it will add the quantity in pos product list that matches
    onUpdateProductStockFromCart(item: POSCartItem, event: string, productQty?: number, posCopyItems?: POSCartItem[]) {
        // if(posCopyItems.length > 1){
        //   var findSameProductQty = posCopyItems.filter(i => i.ProductID == item.ProductID);
        //   if(findSameProductQty.length > 0){
        //     var sumOfTotalQuantity = findSameProductQty[0].ActualStock;


        //   }
        // }
        var updatedProduct = this.posProducts.find(i => i.ProductID == item.ProductID);

        if (updatedProduct) {
            if (event === 'add') {
                updatedProduct.CurrentStock = (productQty ? updatedProduct.CurrentStock + productQty : updatedProduct.CurrentStock - 1);
            }
            else {
                updatedProduct.CurrentStock = (updatedProduct.CurrentStock + 1);
            }
        }
    }

    //update product stock quantity on change pagination and after queue sale
    onUpdateStockQuantityOnPaginationAndAfterQue(productList: any) {
        this.posCartItems?.forEach((element) => {
            var productStock = productList?.find(i => i.ProductID == element.ProductID);
            if (productStock) {
                if (element.ProductID == productStock.ProductID) {
                    productStock.CurrentStock = productStock.CurrentStock - element.Qty;
                }
            }
        })
    }

    //update the product quantity
    onUpdateProductsQuantity(item: POSCartItem, event: string) {
        // let latestQty: number;
        // latestQty = item.Qty - 1;

        // here we check the product stock and overselling validation
        if (event === 'add') {

            if (this.checkProductQuantityandShowValidation(item, event, 'posCart')) {
                item.CurrentStock = (item.CurrentStock - 1);

                item.Qty = parseInt(item.Qty.toString()) + 1;
                item.TotalDiscount = this.getTotalDiscount(item);
                item.TotalAmountExcludeTaxForPOS = (item.Qty * item.PricePerSession) - item.TotalDiscount;
            }
        }
        if (event === 'minus' && item.Qty > 1) {
            item.Qty = parseInt(item.Qty.toString()) - 1;
            item.CurrentStock = (item.CurrentStock + 1);
            // this.discountAmount = this.getPercentage(item.PricePerSession, parseFloat(this.calculatorResult));
            this.discountAmount = this.getPercentage(item.PricePerSession, item?.DiscountPercentage);
            item.TotalDiscount = this.getTotalDiscount(item);
            item.TotalAmountExcludeTaxForPOS = this.getTotalAmountAfterDiscountForItem(item);
            this.checkProductQuantityandShowValidation(item, event, 'posCart');
        }
        //latestQty >= 1 &&
        if (event === 'minus' && item.IsMembershipBenefit) {
            var productGlobalRemainingSessionCopy = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == item.CustomerMembershipID)?.productGlobalRemainingSessionCopy
            if ((item.Qty >= item.RemainingSession || this.totalProductItemLevelQty > productGlobalRemainingSessionCopy)) {
                this.totalProductItemLevelQty = this.totalProductItemLevelQty > 0 ? this.totalProductItemLevelQty - 1 : 0;
                if (productGlobalRemainingSessionCopy != null) {
                    if (this.totalProductItemLevelQty == productGlobalRemainingSessionCopy) {
                        this.setCartValid();
                    }
                    else if (this.totalProductItemLevelQty < productGlobalRemainingSessionCopy) {
                        this.updateProductSession(item, false);
                    }

                }
                else if (item.Qty <= item.RemainingSession) {
                    if (item.Qty == item.RemainingSession) {
                        this.setCartValid();
                    }
                    else if (item.Qty < item.RemainingSession) {
                        this.updateProductSession(item, false);
                    }
                }
                // (this.totalProductItemLevelQty <= this.productGlobalRemainingSessionCopy) ? this.setCartValid() : '';
            }
            else {
                item.IsSessionConsumed = false;
                this.updateProductSession(item, false);
            }

        }

        this.getSubTotal();
    }


    onkeyPress(event: any) {
        const pattern = /[0-9]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    // clear all items from cart
    onCancelOrder() {
        if (this.posCartItems.length > 0) {
            this.clearCart();
        }
    }

    onFocusSearchInput() {
        if (!this.isBarCodeSearch) {
            this.inputEl.nativeElement.focus();
        }

        if (this.activeTab === this.POS_ITEM_TYPE.Product) {
            this.getPOSProducts();
        }
    }

    //for park sale
    onQueueInvoice() {

        if (this.posCartItems.length > 0) {
            var isWaitListedItemInCart = this.posCartItems.find(pc => pc.IsWaitlistItem) ? true : false;

            if (isWaitListedItemInCart && this.selectedClient?.CustomerID > 0 && !this.selectedClient?.IsWalkedIn) {
                this.addInvoiceToQueue();
            } else if (!isWaitListedItemInCart) {
                this.addInvoiceToQueue();
            } else {
                this._messageService.showErrorMessage(this.messages.Error.WaitlistMustBeAssociatedWithACustomer);
            }
        }

    }

    //to retrieve the parked sale
    onViewQueuedInvoices() {
        this.viewQueuedInvoices();
    }

    //open pos payment dialog
    onPayment() {
        let isCartInvalid = this.posCartItems.find(item => item.IsSessionConsumed == true);
        if (isCartInvalid) {
            this.openDialogForIvalidCart();
        }
        else {
            var isWaitListedItemInCart = this.posCartItems.find(pc => pc.IsWaitlistItem) ? true : false;

            var isFamilyAndFriendItemInCart = this.posCartItems.find(pc => pc.IsFamilyAndFriendItem) ? true : false;

            if ((isWaitListedItemInCart || isFamilyAndFriendItemInCart) && this.selectedClient?.CustomerID > 0 && !this.selectedClient?.IsWalkedIn) {
                this.openPOSPaymentDialog();
            } else if (!isWaitListedItemInCart && !isFamilyAndFriendItemInCart) {
                this.openPOSPaymentDialog();
            }
            else {
                if (isWaitListedItemInCart)
                    this._messageService.showErrorMessage(this.messages.Error.WaitlistMustBeAssociatedWithACustomer);
                else
                    this._messageService.showErrorMessage(this.messages.Error.BookingForFamilyAndFriendAssociatedWithACustomer);
            }

            // if(isWaitListedItemInCart && this.selectedClient?.CustomerID > 0 && !this.selectedClient?.IsWalkedIn){
            //     this.openPOSPaymentDialog();
            // } else if(!isWaitListedItemInCart){
            //     this.openPOSPaymentDialog();
            // }
            // else{
            //     this._messageService.showErrorMessage(this.messages.Error.WaitlistMustBeAssociatedWithACustomer);
            // }
        }
    }

    //on Add new client
    onAddClient() {
        this._dataSharingService.shareClientID(0);
        this._dialog.open(SaveClientPopupComponent, {
            disableClose: true
        });

        this._dataSharingService.clientInfo.subscribe((clientInfo: Client) => {
            if (clientInfo.Email && clientInfo.Email.length > 0) {
                this.setClientByEmail(clientInfo.Email);
            }
            else if (clientInfo && clientInfo.CustomerID > 0) {
                this.setClient(clientInfo.CustomerID, (clientInfo.FirstName + ' ' + clientInfo.LastName), true);
            }
        })
    }
    // onSearchTextChange keydown
    onSearchTextChange(searchText: any) {
        if (this.isBarCodeSearch) {
            let product = this.posProducts.filter(p => p.Code === searchText.target.value)[0];
            if (product) {
                this.onProductAddToCart(product, true);
            }
            setTimeout(() => {
                this.searchText = "";
            });
        }
    }
    onSearchProduct() {
        if (this.activeTab === this.POS_ITEM_TYPE.Product) {
            setTimeout(() => {
                this.getPOSProducts();
            }, 500);

        }
    }
    onDeletePaymentMode(paymentMode, arrayIndex) {

        if (paymentMode.PaymentTypeID != this.paymentType.Cash && paymentMode.PaymentTypeID != this.paymentType.Other && paymentMode.PaymentTypeID != this.paymentType.RewardPoint) {

            let params = {
                paymentGatewayID: paymentMode.PaymentGatewayID,
                paymentAuthorizationID: paymentMode.PaymentAuthorizationID
            }

            this._httpService.save(CustomerPaymentGatewayApi.ReleasePaymentBasedOnPaymentGateway, params).subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(res.Result.Message);
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Release_Payment_Error);
                }
            )
        }
    }

    // enum missing
    onCheckIsPaymentDataExist(type) {
        if (this.isShowDiscardInvoice) {
            const dialog = this._dialog.open(AlertConfirmationComponent);
            dialog.componentInstance.Title = this.messages.Dialog_Title.Discard_Invoice;
            dialog.componentInstance.Message = type == 3 ? this.messages.Confirmation.All_The_Items_And_Payments_Related_Data_Added_In_TheInvoice_Will_Be_Lost_This_Action_Cannot_Be_Undone
                : this.messages.Confirmation.All_The_Payments_Related_Data_Added_In_TheInvoice_Will_Be_Lost_This_Action_Cannot_Be_Undone;
            dialog.componentInstance.showConfirmCancelButton = true;
            dialog.componentInstance.isChangeIcon = true;
            dialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
                if (isConfirm) {
                    this.isShowDiscardInvoice = false;
                    this.invoicePaymentModes?.forEach((paymentMode, index) => {
                        this.onDeletePaymentMode(paymentMode, index);
                    });

                    this.paymentData = new SavePOSForAddMoreItems();

                    if (type == 1) {
                        this.onClearSelectedClient();
                    } else if (type == 2) {
                        this.onAddClient()
                    } else {
                        this.onCancelOrder()
                    }
                }
            })
        }
        else {
            if (type == 1) {
                this.onClearSelectedClient();
            } else if (type == 2) {
                this.onAddClient()
            } else {
                if (this.posCartItems.length > 0) {
                    const dialog = this._dialog.open(AlertConfirmationComponent);
                    dialog.componentInstance.Title = this.messages.Dialog_Title.Discard_Invoice;
                    dialog.componentInstance.Message = this.messages.Confirmation.All_The_Items_And_Payments_Related_Data_Added_In_TheInvoice_Will_Be_Lost_This_Action_Cannot_Be_Undone;
                    dialog.componentInstance.showConfirmCancelButton = true;
                    dialog.componentInstance.isChangeIcon = true;
                    dialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
                        if (isConfirm) {
                            this.onCancelOrder();
                        }
                    })
                }
            }
        }
    }

    onClearSelectedClient() {

        this.selectedClient = null;
        this.customerName = '';
        this.personName = undefined;
        this.isCustomerMembership = false;
        this.resetFreeClasses();
        this.resetCartItems();
        this.getSubTotal();

        if (this.customerMembershipId) {
            this.customerMemberhsip = [];
            this.customerMembershipId = null;
            this.memberhsipBenefits = [];
            this.remainingSessionDetail = [];
            this.membershipBaseProductGlobalRemainingSession = [];
            this.getPOSItems();
        }
        else {
            this.getPOSItems();
            // this.updateCartItems();
        }
        setTimeout(() => {
            this.searchPerson.reset();//.setValue(this.personName);
            this.searchPerson.updateValueAndValidity();
        })
    }

    onCheckItemIsFree(posCartItem: any): boolean {
        if (posCartItem.IsMembershipBenefit && posCartItem.IsFree && !posCartItem.IsBenefitsSuspended && posCartItem.RemainingSession != 0) {
            return true;
        }
        else if (posCartItem.IsMembershipBenefit && !posCartItem.IsConsumed && !posCartItem.IsBenefitsSuspended && !posCartItem.IsFree && posCartItem.RemainingSession != 0 && posCartItem.DiscountPercentage > 0) {
            return false;
        }

        else return null;

    }

    //-------------- Discount on POS --------------//

    onShowDiscountCalculator(cartItem: POSCartItem, arrayIndex) {

        // this.posCartSingleItem = new POSCartItem();
        // this.posCartSingleItem = cartItem;
        this.posCartDiscountItemIndex = arrayIndex;
        setTimeout(() => {
            this.calculatorResult = "0";
            this.showDiscountPin = true;
            this.showDiscountCalc = false;
            this.isDiscountCalculator = false;
        });
    }

    onCalculatorValueChange(value: any) {

        this.calculatorResult = this.calculatorResult.length >= 7 ? this.calculatorResult : this.calculatorResult + value.toString();
        // this.calculatorResult = this.calculatorResult + value.toString();
        this.calculatorResult = this.removeFirstCharacter(this.calculatorResult, "0");
    }

    onDiscountPinValueChange(value: any) {
        this.discountPinResult.length >= 10 ? '' : this.discountPinResult += "*";
        // this.discountPinResult += "*";
        if (!this.discountPin) {
            this.discountPin = value.toString();
        }
        else {
            this.discountPin = this.discountPin + value.toString();
        }
    }
    //discount pin reset function
    onDiscountPinReset() {
        this.resetDiscountPin();
    }
    //show the discount calculator
    showDiscountCalculator() {
        setTimeout(() => {
            this.resetDiscountPin();
            this.showDiscountCalc = true;
            this.showDiscountPin = false;

            this.isDiscountCalculator = true;
        });
    }
    onDiscountPinCancel() {
        this.resetDiscountPin();
        this.closeDiscountPin();
    }
    onDiscountPinVerify() {
        if (this.discountPin && this.discountPin.length > 3) {
            this.verifyDiscountPassword(parseInt(this.discountPin));
        }
    }

    onCalculate(isPercentage: boolean) {
        if (this.isDiscountCalculator) {
            this.getDiscount(isPercentage);
            this.showDiscountCalc = false;
        }
    }

    onCalulatorValueReset() {
        this.calculatorResult = "0";
    }

    onSelectCustomerMembership() {
        this.remainingSessionDetail = [];
        if (this.customerMembershipId && this.customerMembershipId > 0) {
            this.customerMembershipId = this.customerMembershipId;
            let selectedMemberShip = this.customerMemberhsip.find(i => i.CustomerMembershipID == this.customerMembershipId);
            this.selectedMembershipName = selectedMemberShip.MembershipName;
            this.getAllMemberhsipBenefitsItems().then(isResoved => {
                if (isResoved) {
                    this.getPOSItems();
                }
                else {
                    this.getPOSItems();
                }
            });
        }
        else {
            this.customerMembershipId = null;
            this.memberhsipBenefits = [];
            //this.remainingSessionDetail = [];
            this.getPOSItems();
        }
    }

    //redeem membership pop (if you member have multiple memberships then this pop up open for the selection of single one )
    onRedeemMembershipBenefits() {
        if (this.customerMemberhsipSubscription) {
            this.customerMemberhsipSubscription.unsubscribe();
        }
        const dialogRef = this._dialog.open(RedeemMembershipComponent, {
            disableClose: true,
            data: this.customerMemberhsip
        })

        this.customerMemberhsipSubscription = dialogRef.componentInstance.membershipSelected.subscribe((customerMembershipId: number) => {
            if (customerMembershipId && customerMembershipId > 0) {
                this.customerMembershipId = customerMembershipId;
                this.getAllMemberhsipBenefitsItems().then(isResoved => {
                    if (isResoved) {
                        this.getPOSItems();
                    }
                    else {
                        this.getPOSItems();
                    }
                });
            }
            else {
                this.customerMembershipId = null;
                this.memberhsipBenefits = [];
                this.getPOSItems();
            }
        });
    }

    //this functions calls when you apply the dicount and it re calculate the prices
    updateCartLineItemAfterDiscountApply(isPercentage: boolean) {
        let itemInCart = new POSCartItem();
        //let index: number = this.posCartItems.findIndex(fl => fl.ItemID === this.posCartSingleItem.ItemID);
        //itemInCart = this.posCartItems.filter(fl => fl.ItemID === this.posCartSingleItem.ItemID)[0];
        itemInCart = this.posCartItems[this.posCartDiscountItemIndex];
        let discountPerItem = isPercentage ? this.discountAmount : this.discountAmount / itemInCart.Qty;
        this.posCartItems[this.posCartDiscountItemIndex].PerLineItemDiscount = itemInCart.IsFree && itemInCart.CustomerMembershipID > 0 && !itemInCart.IsBenefitsSuspended ? itemInCart.Price : discountPerItem;
        this.posCartItems[this.posCartDiscountItemIndex].TotalDiscount = itemInCart.Qty * discountPerItem;
        this.posCartItems[this.posCartDiscountItemIndex].ItemDiscountAmount = discountPerItem;
        this.posCartItems[this.posCartDiscountItemIndex].DiscountType = (!itemInCart.IsBenefitsSuspended && itemInCart.IsMembershipBenefit && !itemInCart.IsBenefitsSuspended && itemInCart?.CustomerMembershipID > 0)
            || (!itemInCart.IsBenefitsSuspended && itemInCart.IsBenefitsSuspended && itemInCart.IsMembershipBenefit && itemInCart.IsCartItemUseBenefit) ? this.selectedMembershipName : this.discountType.POSDiscount;
        this.posCartItems[this.posCartDiscountItemIndex].Price = itemInCart.PricePerSession - discountPerItem;
        this.posCartItems[this.posCartDiscountItemIndex].TotalAmountExcludeTaxForPOS = itemInCart.PricePerSession * itemInCart.Qty - this.posCartItems[this.posCartDiscountItemIndex].TotalDiscount;
        this.getSubTotal();
    }

    updateRemainingSessions(posCartItem: POSCartItem, IsAddedToCart?: boolean) {
        switch (posCartItem.ItemTypeID) {
            case this.posItemType.Product:
                if (posCartItem.IsMembershipBenefit && !posCartItem.IsBenefitsSuspended)
                    if (!IsAddedToCart) {
                        this.updateProductSession(posCartItem, IsAddedToCart);
                    }
                break;

            case this.posItemType.Class:

                // if (posCartItem.IsMembershipBenefit && !posCartItem.IsBenefitsSuspended && this.classGlobalRemainingSession && !posCartItem.IsWaitlistItem)
                //     this.classGlobalRemainingSession = this.classGlobalRemainingSession - 1;
                // if (posCartItem.IsMembershipBenefit && !posCartItem.IsBenefitsSuspended && posCartItem.RemainingSession) {
                //     let sesstionDetail = new RemainingSessionDetail();
                //     sesstionDetail.ItemID = posCartItem.ItemID;
                //     sesstionDetail.ItemTypeID = posCartItem.ItemTypeID;
                //     sesstionDetail.IsMembershipBenefit = posCartItem.IsMembershipBenefit;
                //     sesstionDetail.RemainingSession = posCartItem.RemainingSession - 1;
                //     this.remainingSessionDetail.push(sesstionDetail);
                // }
                break;
            case this.posItemType.Service:
                if (posCartItem.IsMembershipBenefit && !posCartItem.IsWaitlistItem && !posCartItem.IsBenefitsSuspended && this.serviceGlobalRemainingSession)
                    this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession - 1;
                if (posCartItem.IsMembershipBenefit && !posCartItem.IsBenefitsSuspended && posCartItem.RemainingSession) {
                    let sesstionDetail = new RemainingSessionDetail();
                    sesstionDetail.ItemID = posCartItem.ItemID;
                    sesstionDetail.ItemTypeID = posCartItem.ItemTypeID;
                    sesstionDetail.IsMembershipBenefit = posCartItem.IsMembershipBenefit;
                    sesstionDetail.RemainingSession = posCartItem.RemainingSession - 1;
                    this.remainingSessionDetail.push(sesstionDetail);
                }

                break;
        }
    }
    //update product sessions (add or delete)
    updateProductSession(posCartItem: POSCartItem, IsAddedToCart?: boolean, isRemovedFromCart?: boolean, isMemberShipBenefitRemove?: boolean) {

        if (!IsAddedToCart) {

            var benefit = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == posCartItem.CustomerMembershipID);

            if (benefit?.productGlobalRemainingSession != null) {
                if (isRemovedFromCart) {
                    this.recountGobalSessionAfterRemoveItemFromCart(posCartItem.CustomerMembershipID);
                }
                else {
                    benefit.productGlobalRemainingSession = benefit.productGlobalRemainingSession + posCartItem.Qty;
                }
            }
            if (benefit.remainingSessionDetail.length > 0) {
                if (isRemovedFromCart) {
                    if (benefit.remainingSessionDetail.length > 0) {
                        let index = benefit.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.ItemID === posCartItem.ItemID);
                        if (index >= 0) {
                            benefit.remainingSessionDetail.splice(index, 1);
                            this.totalProductItemLevelQty = this.totalProductItemLevelQty - posCartItem.Qty;
                        }
                    }
                }
                else {
                    let index = benefit.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.ItemID === posCartItem.ItemID);
                    benefit.remainingSessionDetail[index].RemainingSession = benefit.remainingSessionDetail[index]?.RemainingSession + (isMemberShipBenefitRemove ? posCartItem.Qty : 1);
                }
            }
        }

    }

    //update class sessions (add or delete)
    updateClassSession(posCartItem: POSCartItem, isRemovedFromCart?: boolean) {
        if (this.classGlobalRemainingSession != null) {
            if (isRemovedFromCart) {
                this.recountGobalSessionAfterRemoveItemFromCart();
            }
            else {
                this.classGlobalRemainingSession = isRemovedFromCart ? this.classGlobalRemainingSession + posCartItem.Qty : this.classGlobalRemainingSession + 1;
            }
        }
        if (this.remainingSessionDetail.length > 0) {
            if (isRemovedFromCart) {
                if (this.remainingSessionDetail.length > 0) {
                    let index = this.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.ItemID === posCartItem.ItemID);
                    this.remainingSessionDetail.splice(index, 1);
                    this.totalProductItemLevelQty = this.totalProductItemLevelQty - posCartItem.Qty;
                }
            }
            else {
                let index = this.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.ItemID === posCartItem.ItemID);
                this.remainingSessionDetail[index].RemainingSession = isRemovedFromCart ? this.remainingSessionDetail[index].RemainingSession + posCartItem.Qty : this.remainingSessionDetail[index].RemainingSession + 1;
            }
        }
    }

    //update Service session (add or delete)
    updateServiceSession(posCartItem: POSCartItem, isRemovedFromCart?: boolean) {
        if (this.serviceGlobalRemainingSession != null) {
            if (isRemovedFromCart) {
                this.recountGobalSessionAfterRemoveItemFromCart();
            }
            else {
                this.serviceGlobalRemainingSession = isRemovedFromCart ? this.serviceGlobalRemainingSession + posCartItem.Qty : this.serviceGlobalRemainingSession + 1;
            }
        }
        if (this.remainingSessionDetail.length > 0) {
            if (isRemovedFromCart) {
                if (this.remainingSessionDetail.length > 0) {
                    let index = this.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Service && c.ItemID === posCartItem.ItemID);
                    this.remainingSessionDetail.splice(index, 1);
                    this.totalServiceItemLevelQty = this.totalServiceItemLevelQty - posCartItem.Qty;
                }
            }
            else {
                let index = this.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Service && c.ItemID === posCartItem.ItemID);
                this.remainingSessionDetail[index].RemainingSession = isRemovedFromCart ? this.remainingSessionDetail[index].RemainingSession + posCartItem.Qty : this.remainingSessionDetail[index].RemainingSession + 1;
            }
        }
    }

    // recount the global sessions for produt class and services
    recountGobalSessionAfterRemoveItemFromCart(customerMembershipID: number = null) {

        this.totalProductItemLevelQty = 0;
        this.totalClassItemLevelQty = 0;
        this.totalServiceItemLevelQty = 0;

        this.classGlobalRemainingSession = this.classGlobalRemainingSessionCopy;
        this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSessionCopy;


        var benefit = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == customerMembershipID);
        if (benefit) {
            benefit.productGlobalRemainingSession = benefit.productGlobalRemainingSessionCopy;
        }
        this.posCartItems.forEach(cartItem => {
            if (this.checkItemAssociationWithMemberhisp(cartItem)) {
                switch (cartItem.ItemTypeID) {
                    case this.posItemType.Product:
                        this.totalProductItemLevelQty = this.totalProductItemLevelQty + cartItem.Qty;
                        break;

                    case this.posItemType.Class:
                        this.totalClassItemLevelQty = this.totalClassItemLevelQty + cartItem.Qty;
                        break;

                    case this.posItemType.Service:
                        this.totalServiceItemLevelQty = this.totalServiceItemLevelQty + cartItem.Qty;
                        break;
                }
            }
        });


        this.setCartInvalid();
        if (benefit) {
            benefit.productGlobalRemainingSession = benefit.productGlobalRemainingSession != null ? benefit.productGlobalRemainingSession - this.totalProductItemLevelQty : benefit.productGlobalRemainingSession;
        }
        this.classGlobalRemainingSession = this.classGlobalRemainingSession != null ? this.classGlobalRemainingSession - this.totalClassItemLevelQty : this.classGlobalRemainingSession;
        this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession != null ? this.serviceGlobalRemainingSession - this.totalServiceItemLevelQty : this.serviceGlobalRemainingSession;
    }




    // get the round value according to standard formula (frontend and backend)
    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    //remove the last character from string
    removeLastCharacter(value, character) {
        return value.indexOf(character) === value.length ? value.substring(0, value - 1) : value;
    }

    //get percentage according to standard formula (frontend and backend)
    getPercentage(amount: number, percentage: number): number {
        // return this._taxCalculationService.getTaxAmount(percentage, amount);
        return this._taxCalculationService.getTwoDecimalDigit(((amount * percentage) / 100));
    }


    // close calculator
    closeCalculator() {
        this.showDiscountCalc = false;
        this.discountPinResult = "";
    }
    // remove the first character from string
    removeFirstCharacter(value, character) {
        return value.indexOf(character) === 0 ? value.substring(1) : value;
    }
    //closes the discount pin pop up
    closeDiscountPin() {
        this.showDiscountPin = false;
    }


    //-------------- Discount on POS --------------//



    changeStatusToAvailable(classItem: POSClass) {
        this.posClasses.forEach(classObj => {
            if(classObj.ClassPOSList.find(c => c === classItem)){
                classObj.ClassPOSList.find(c => c === classItem).Status = this.classStatus.BuyNow;
                classObj.ClassPOSList.find(c => c === classItem).IsAvailable = true;
            }
        })
    }

    // #endregion

    // #region Methods

    // verify the discount pin password
    verifyDiscountPassword(password: number) {
        this._httpService.save(DiscountSetupApi.verifyDiscountPassword, password).subscribe(
            response => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.showDiscountCalculator();
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Validation.Invalid_Discount_Password);
                    }
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Discount_Password_Verify_Error);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Discount_Password_Verify_Error);
            }
        )
    }

    // get the current branch details
    async getCurrentBranchDetail() {
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.receiptDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ReceiptDateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.Currency;
            this.currencySymbol = branch.CurrencySymbol;
        }
        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        this.minClassStartDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.classStartDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    }

    // set permissions according to packages
    setPermissions() {
        this.isClassesAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Class);
        this.isProductsAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Product);
        this.isServicesAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Service);
        this.isQueueInvoiceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.QueueInvoice);
        this.isBarCodeScannerAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.BarCodeScanner);
        this.isTipsAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Tips);
        this.isDiscountAllowed = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Discount);
        this.isSaveClientAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveClient);
        this.hasDiscountInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Discount);
    }

    markOutdatedItems() {
        let today = this._dateTimeService.getDateTimeWithoutZone(this._dateTimeService.getCurrentDate());
        this.posCartItems.forEach(item => {
            if (item.ItemTypeID === POSItemType.Service && !item.IsWaitlistItem) {
                let serviceDate = new Date(item.ServiceDate);
                serviceDate.setHours(parseInt(item.ServiceStartTime.split(":")[0]));
                serviceDate.setMinutes(parseInt(item.ServiceStartTime.split(":")[1]));
                let _serviceDate = this._dateTimeService.getDateTimeWithoutZone(serviceDate);
                item.IsOutdated = (_serviceDate < today);
            }
            else if (item.ItemTypeID === POSItemType.Class) {
                let classDate = new Date(item.ClassStartDate + ' ' + item.ClassStartTime.split(' ')[1]);
                let _classDate = this._dateTimeService.getDateTimeWithoutZone(classDate);
                item.IsOutdated = (_classDate < today);
            }
        });
    }

    getSaleFundamentals() {
        this._httpService.get(SaleApi.getSaleFundamentals).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.walkedInClient = response.Result.WalkedIn;
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            }
        )
    }

    // get discount items according to active tabs(class product and service)
    getPOSItems() {
        switch (this.activeTab) {
            case this.POS_ITEM_TYPE.Class:
                this.getPOSClasses();
                break;
            case this.POS_ITEM_TYPE.Product:
                this.getPOSProducts();
                break;
            case this.POS_ITEM_TYPE.Service:
                this.getPOSServices();
                break;
        }
    }



    // #region POS ITEMS GET Methods
    //---- Get POS ITEMS (CLASSES,SERVICES,PRODUCTS)
    // get the list of products
    getPOSProducts() {
        let params = {
            customerMembershipID: this.customerMembershipId,
            customerID: this.selectedClient ? this.selectedClient.CustomerID : null,
            ProductCategoryID: this.selectedCategory,
            ProductName: !this.isBarCodeSearch ? this.searchText : null ,
            barcode: this.isBarCodeSearch ? this.searchText : null ,
            brandID: this.selectedBrand,
            PageNumber: 1,
            PageSize: 16
        }
        this.posProducts = [];
        this._httpService.save(PointOfSaleApi.getPOSProducts, params)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.hasProducts = res.Result && res.Result.ProductList && res.Result.ProductList.length > 0 ? true : false;
                        if (this.hasProducts) {
                            this.posProducts = res.Result.ProductList;
                            this.productsCategoryList = res.Result.ProductCategoryList;
                            this.brandList = res.Result.BrandList;
                            this.onUpdateStockQuantityOnPaginationAndAfterQue(this.posProducts);
                            let filterGlobalSession: POSProduct = this.posProducts.filter(c => c.IsMembershipBenefit && (c.GlobalRemainingSession > 0 || c.GlobalRemainingSession == null))[0];
                            if (filterGlobalSession != undefined) {
                                this.productGlobalRemainingSession = filterGlobalSession && filterGlobalSession.GlobalRemainingSession > 0 ? filterGlobalSession.GlobalRemainingSession : null;

                                //update global session
                                let customerMembershipId = Number(this.customerMembershipId);
                                this.productGlobalRemainingSessionCopy = this.productGlobalRemainingSession;

                                if (this.posCartItems && this.posCartItems.length > 0 && this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == customerMembershipId)) {
                                    this.posCartItems.forEach(cartItem => {

                                        //update global level session
                                        if (cartItem.ItemTypeID === POSItemType.Product && cartItem.CustomerMembershipID == customerMembershipId && this.productGlobalRemainingSession > 0) {
                                            this.productGlobalRemainingSession = this.productGlobalRemainingSession - cartItem.Qty;

                                            //update item level session
                                            // if (cartItem.RemainingSession > 0) {
                                            //     cartItem.RemainingSession = cartItem.RemainingSession - cartItem.Qty;
                                            // }
                                            // }else if(cartItem.ItemTypeID === POSItemType.Product && cartItem.CustomerMembershipID == customerMembershipId && this.productGlobalRemainingSession == null && cartItem.RemainingSession != null){
                                            //   //update item level session
                                            //   if(cartItem.RemainingSession > 0){
                                            //     cartItem.RemainingSession = cartItem.RemainingSession - cartItem.Qty;
                                            //   }

                                        }
                                    });
                                }

                                this.setProductBenefitModel();
                                var result = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == this.customerMembershipId);

                                if (result) {
                                    result.productGlobalRemainingSessionCopy = this.productGlobalRemainingSessionCopy;
                                    result.productGlobalRemainingSession = this.productGlobalRemainingSession;
                                    result.remainingSessionDetail = [];
                                    this.memberhsipBenefits?.forEach(benefit => {


                                        var itemRemainingSession: number = 0;
                                        var addedProduct = this.posCartItems.find(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == this.customerMembershipId && i.ProductVariantID == benefit.ItemID);
                                        if (addedProduct) {
                                            itemRemainingSession = benefit.RemainingSession == null ? benefit.RemainingSession : benefit.RemainingSession - addedProduct.Qty;
                                            // addedProduct.RemainingSession = itemRemainingSession;

                                        } else {
                                            itemRemainingSession = benefit.RemainingSession
                                        }

                                        // var itemRemainingSession = this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession == null
                                        //                             || this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession >= 0
                                        //                             ? this.posCartItems.find(i => i.ItemID == benefit.ItemID && i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == result.CustomerMembershipID)?.RemainingSession
                                        //                             : benefit.RemainingSession;
                                        var productBenefit = {
                                            ItemTypeID: benefit.ItemTypeID,
                                            ItemID: benefit.ItemID,
                                            RemainingSession: itemRemainingSession,
                                            AllowedSession: itemRemainingSession,
                                            IsMembershipBenefit: benefit.IsMembershipBenefit,
                                            CustomerMembershipID: this.customerMembershipId
                                        }

                                        result.remainingSessionDetail.push(productBenefit);
                                    });
                                } else {
                                    var mbpgrs = new MembershipBaseProductGlobalRemainingSession();
                                    mbpgrs.CustomerMembershipID = this.customerMembershipId;
                                    mbpgrs.productGlobalRemainingSession = this.productGlobalRemainingSession;
                                    mbpgrs.productGlobalRemainingSessionCopy = this.productGlobalRemainingSessionCopy;

                                    mbpgrs.remainingSessionDetail = [];
                                    this.memberhsipBenefits?.forEach(benefit => {

                                        var productBenefit = {
                                            ItemTypeID: benefit.ItemTypeID,
                                            ItemID: benefit.ItemID,
                                            RemainingSession: benefit.RemainingSession,
                                            AllowedSession: benefit.RemainingSession,
                                            IsMembershipBenefit: benefit.IsMembershipBenefit,
                                            CustomerMembershipID: this.customerMembershipId
                                        }


                                        mbpgrs.remainingSessionDetail.push(productBenefit);
                                    });
                                    this.membershipBaseProductGlobalRemainingSession.push(mbpgrs);
                                }
                            }

                            this.posProducts.forEach(posProduct => {
                                posProduct.TotalDiscount = 0;
                                posProduct.ServerImageAddress = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePathForCompanyOnly());
                            });

                            this.updateCartItems();
                            this.totalRecord = res.TotalRecord;

                        } else {
                            this.totalRecord = 0
                        }
                        this.productCustomPager = this._commonService.customPaginationGenerator(this.totalRecord, 1);
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Products"))
                }
            );
    }

    //get the list of classes
    getPOSClasses() {
        let params = {
            startDate: this._dateTimeService.convertDateObjToString(this.classStartDate, this.DATE_FORMAT),
            customerMembershipID: this.customerMembershipId,
            customerID: this.selectedClient ? this.selectedClient.CustomerID : null
        }
        this.posClasses = [];

        this._httpService.get(PointOfSaleApi.getPOSClasses, params)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.hasClasses = res.Result && res.Result && res.Result.ClassList && res.Result.ClassList.length > 0 ? true : false;
                        if (this.hasClasses) {
                            this.posClasses = res.Result.ClassList;
                            this.classesCategoryList = res.Result.ClassCategoryList;
                            this.setPOSClassesDefaultSettings();

                            if (this.selectedClient) this.getFreeClassesForMember(this.selectedClient.CustomerID, this.customerMembershipId);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Classes"))
                }
            );
    }

    //get the list of services
    getPOSServices() {
        let params = {
            customerMembershipID: this.customerMembershipId,
            customerID: this.selectedClient ? this.selectedClient.CustomerID : null
        }

        this.posServices = [];
        this._httpService.get(PointOfSaleApi.getPOSServices, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.hasServices = res.Result && res.Result.ServiceList && res.Result.ServiceList.length > 0 ? true : false;
                    if (this.hasServices) {
                        let serviceCategories = res.Result.ServiceCategoryList;
                        this.servicesCategoryList = res.Result.ServiceCategoryList;
                        this.posServices = res.Result.ServiceList;

                        let serviceSessoin = this.posServices.filter(c => c.GlobalRemainingSession && c.GlobalRemainingSession > 0)[0];
                        if (serviceSessoin) {
                            this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession;
                            //update global session
                            let customerMembershipId = Number(this.customerMembershipId);
                            this.serviceGlobalRemainingSessionCopy = this.serviceGlobalRemainingSession;

                            if (this.posCartItems && this.posCartItems.length > 0 && this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Service && i.CustomerMembershipID == customerMembershipId)) {
                                this.posCartItems.forEach(cartItem => {

                                    if (cartItem.ItemTypeID === POSItemType.Service && cartItem.CustomerMembershipID == customerMembershipId && this.serviceGlobalRemainingSession > 0) {
                                        this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession - cartItem.Qty;
                                    }
                                });
                            }


                        }

                        this.posServices.forEach(service => {
                            let serviceInCart = this.posCartItems.filter(c => c.ServiceID === service.ServiceID)[0];
                            service.IsAddedToCart = serviceInCart ? true : false;

                            let serviceIsWaitList = this.posCartItems.filter(c => c.ServiceID === service.ServiceID && c.IsWaitlistItem)[0];
                            service.IsAddedToWaitList = serviceIsWaitList ? true : false;

                            service.ImagePath = service.ImagePath && service.ImagePath !== "" ?
                                this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + service.ImagePath : 'assets/images/pos_placeholder.jpg';
                            service.ServiceCategoryName = serviceCategories.filter(cat => cat.ServiceCategoryID === service.ServiceCategoryID)[0]?.ServiceCategoryName;
                        });
                        this.updateCartItems();
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Services"))
            }
        );
    }


    getDiscount(isPercentage: boolean) {
        /*
            Tax should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");
        this.calculatorResult = isNaN(parseFloat(this.calculatorResult)) ? "0" : this.calculatorResult;
        if (isPercentage) {
            if (parseFloat(this.calculatorResult) > 100) {
                // show message that Discount can not be greater than 100%
                this._messageService.showErrorMessage(this.messages.Validation.POS_Line_Item_Discount_Max);
            }
            else {
                this.discountAmount = this.getPercentage(this.posCartItems[this.posCartDiscountItemIndex].PricePerSession, parseFloat(this.calculatorResult));
                this.updateCartLineItemAfterDiscountApply(isPercentage);
            }
        }
        else {
            if (parseFloat(this.calculatorResult) > (this.posCartItems[this.posCartDiscountItemIndex].PricePerSession * this.posCartItems[this.posCartDiscountItemIndex].Qty)) {
                // show message that discount cannot be greater than line item total amount
                this._messageService.showErrorMessage(this.messages.Validation.POS_Line_Item_Discount_Max);
            }
            else {
                this.discountAmount = parseFloat(this.calculatorResult);
                this.updateCartLineItemAfterDiscountApply(isPercentage);
            }
        }
        this.discountAmount = this.roundValue(this.discountAmount);
    }


    getDiscountAmountPerClassAndServiceItem(item: any) {
        return ((item.Price * item.DiscountPercentage) / 100);
    }

    getItemPriceAfterDiscount(item: any) {
        switch (item.ItemTypeID) {
            case this.posItemType.Service:
            case this.posItemType.Class:
            case this.posItemType.Product:
                return (item.PricePerSession - (item.PricePerSession * item.DiscountPercentage) / 100);
        }


    }

    getTotalDiscount(item: POSCartItem) {

        // as per discussion with tahir sab on 04-March-2021 we will not round third digit in discount amount
        let discount: any;

        if (item.IsMembershipBenefit && item.IsFree && !item.IsBenefitsSuspended && item.RemainingSession != 0) {
            return (item.Qty * item.PricePerSession);
        }
        else if (item.IsMembershipBenefit && !item.IsFree && !item.IsBenefitsSuspended && item.RemainingSession != 0) {
            //using for product handling Discount Percentage for reterive park sale
            item.DiscountPercentage = item?.DiscountPercentage ? item.DiscountPercentage : (item.PerLineItemDiscount / item.PricePerSession) * 100;

            discount = this._taxCalculationService.getTwoDecimalDigit(((item.PricePerSession * item.DiscountPercentage) / 100)) * item.Qty;
        }

        else if (item.PerLineItemDiscount > 0) {
            discount = this._taxCalculationService.getTwoDecimalDigit((item.PerLineItemDiscount * item.Qty));
        }
        else {
            discount = 0;
        }
        return discount;
    }

    getPerItemDiscount(item: POSCartItem) {
        if (item.IsMembershipBenefit && item.IsFree && !item.IsBenefitsSuspended && item.RemainingSession != 0) {
            return this._taxCalculationService.getTwoDecimalDigit((1 * item.PricePerSession));
        }
        else if (item.IsMembershipBenefit && !item.IsFree && !item.IsBenefitsSuspended && item.RemainingSession != 0) {
            return this._taxCalculationService.getTwoDecimalDigit((((item.PricePerSession * item.DiscountPercentage) / 100) * 1));
        }
        else if (item.PerLineItemDiscount > 0) {
            return this._taxCalculationService.getTwoDecimalDigit((item.PerLineItemDiscount * 1));
        }
        else {
            return 0;
        }
    }


    // #endregion

    //open pop for search details
    openViewServiceDialog(serviceModel: POSServiceModel) {
        if (!serviceModel.IsAddedToCart) {
            let servicesInCart = this.posCartItems.filter(c => c.ItemTypeID === this.posItemType.Service);
            const dialog = this._dialog.open(POSServiceDetailComponent,
                {
                    disableClose: true,
                    data: {
                        serviceModel: serviceModel,
                        servicesInCart: servicesInCart
                    }
                });

            dialog.componentInstance.saleServiceModel.subscribe(saleService => {
                if (saleService) {
                    this.onServiceAddToCart(serviceModel, saleService);
                }
            });

            dialog.componentInstance.saleServiceWaitListModel.subscribe(saleServiceWaitList => {
                if (saleServiceWaitList) {
                    saleServiceWaitList.forEach(saleWaitListService => {
                        this.onServiceAddToCart(serviceModel, saleWaitListService);
                    });

                }
            });
        }
    }

    getClassInfo(classItem: POSClass, classDate: string, isCallFromBookAgain: boolean = false) {
        let url = PointOfSaleApi.getClassInfo.replace("{classID}", classItem.ClassID.toString())
            .replace("{classDate}", this._dateTimeService.convertDateObjToString(new Date(classDate), this.DATE_FORMAT));
        this._httpService.get(url).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.validateClassForBooking(response.Result, classItem, classDate, isCallFromBookAgain);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                    this.disableClassBookingButton = false;
                }
            }
        );
    }

    validateClassForBooking(classInfo: POSClassInfo, classItem: POSClass, classDate: string, isCallFromBookAgain: boolean) {
        if (!classInfo.EnableWaitList && classInfo.AttendeeMax > 0 && classInfo.TotalEnrolledAttendees >= classInfo.AttendeeMax) {
            this._messageService.showErrorMessage(this.messages.Error.Max_Attendee_Limit);
            this.disableClassBookingButton = false;
        } else if (classInfo.IsWaitListCapacityReached) {
            this._messageService.showWarningMessage("Waitlist class limit has been reached");
            this.disableClassBookingButton = false;
        }
        else {
            let classDetails = new ClassAttendanceDetail();
            classDetails.ClassID = classInfo.ClassID;
            classDetails.StartDate = new Date(classDate);
            classDetails.StartTime = classItem.StartTime;
            classDetails.EndTime = classItem.EndTime;
            classDetails.BookBefore = classInfo.BookBefore;
            classDetails.BookBeforeDurationTypeID = classInfo.BookBeforeDurationTypeID;
            classDetails.CancelBefore = classInfo.CancelBefore;
            classDetails.CancelBeforeDurationTypeID = classInfo.CancelBeforeDurationTypeID;
            classDetails.IsBookingClosesBeforeEndTime = classItem.IsBookingClosesBeforeEndTime;

            if (this._classValidationService.isClassBookingValid(classDetails)) {
                //--- Commecnted by fazeel on 24-08-2020--//

                // if (classItem.IsFree) {
                //     this.openDialogForIvalidCart(classItem);
                // }
                // else {
                //--- Commecnted by fazeel on 24-08-2020--//
                classItem.IsAddedToCart = true;

                if (!isCallFromBookAgain) {
                    classItem.IsCartItemUseBenefit = classItem.IsMembershipBenefit ? true : false;
                }

                this.addClassToCart(classItem, classDate);

                this.disableClassBookingButton = false;
                // }
            }
            // here we check if the class booking time is passed
            else{
              this.disableClassBookingButton = false;
              this._messageService.showErrorMessage(this.messages.Validation.Class_BookingTime_Expired);
            }

        }
    }

    openDialogForIvalidCart() {
        const dialog = this._dialog.open(AlertConfirmationComponent);
        dialog.componentInstance.Title = this.messages.Dialog_Title.Session_Limit_Exceed;
        dialog.componentInstance.Message = this.messages.Confirmation.Session_Limit_Exceed;
        dialog.componentInstance.showButton = true;
        dialog.componentInstance.isChangeIcon = true;
    }

    saveFreeClassBooking(classItem: POSClass) {
        let freeClassModel = new FreeClassBooking();
        freeClassModel.CustomerID = this.selectedClient.CustomerID;
        freeClassModel.CustomerTypeID = CustomerType.Member;
        freeClassModel.ItemID = classItem.ClassID;
        freeClassModel.StartDate = this._dateTimeService.convertDateObjToString(new Date(classItem.OccurrenceDate), this.DATE_FORMAT);

        this._httpService.save(AttendeeApi.saveAttendeeFreeClass, freeClassModel).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attendee"));
                    classItem.IsAlreadyBooked = true;
                    this.disableClassBookingButton = false;
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                    this.disableClassBookingButton = false;
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Free Class Booking"));
            }
        )
    }

    addServiceToCart(serviceModel: POSServiceModel, saleService: SaleService) {

        let servicePackage = serviceModel.ServicePackageList.filter(sp => sp.ServicePackageID === saleService.ServicePackageID)[0];
        let posCartItem = new POSCartItem();
        posCartItem.ItemID = servicePackage.ServicePackageID;
        posCartItem.Name = serviceModel.Name;
        posCartItem.PricePerSession = servicePackage.Price;
        posCartItem.TotalTaxPercentage = servicePackage.TotalTaxPercentage;
        posCartItem.ServiceID = servicePackage.ServiceID;
        posCartItem.StaffID = saleService.StaffID;
        posCartItem.ServiceDate = saleService.ServiceDate;
        posCartItem.ServiceStartTime = saleService.ServiceStartTime;
        posCartItem.ServiceEndTime = saleService.ServiceEndTime;
        posCartItem.ItemTypeID = POSItemType.Service;
        posCartItem.Qty = 1;
        posCartItem.IsQuantityDisabled = true;
        posCartItem.IsBenefitsSuspended = servicePackage.IsBenefitsSuspended;
        posCartItem.CustomerMembershipID = (servicePackage.IsFree || servicePackage.IsMembershipBenefit) && !serviceModel.IsConsumed && !servicePackage.IsBenefitsSuspended ? this.customerMembershipId : null;
        posCartItem.DiscountPercentage = servicePackage.DiscountPercentage ? servicePackage.DiscountPercentage : 0;
        posCartItem.TotalDiscount = servicePackage.TotalDiscount;
        posCartItem.ItemDiscountAmount = posCartItem.TotalDiscount;
        posCartItem.IsMembershipBenefit = !serviceModel.IsConsumed ? servicePackage.IsMembershipBenefit : false;
        posCartItem.IsFree = !serviceModel.IsConsumed ? servicePackage.IsFree : false;
        posCartItem.RemainingSession = servicePackage.RemainingSession;

        posCartItem.AmountSpent = serviceModel.AmountSpent;
        posCartItem.MemberBaseEarnPoints = serviceModel.MemberBaseEarnPoints;
        posCartItem.CustomerEarnedPoints = serviceModel.CustomerEarnedPoints;

        posCartItem.IsWaitlistItem = saleService.IsWaitlistItem
        if (saleService.IsWaitlistItem) {
            posCartItem.Price = 0;
            posCartItem.PricePerSession = 0;
            posCartItem.ItemDiscountAmount = 0;
            posCartItem.TotalDiscount = 0;
            posCartItem.DiscountPercentage = 0;
            posCartItem.IsWaitlistItem = true;
            posCartItem.DiscountType = "";
            posCartItem.Note = saleService.Note;
            posCartItem.DiscountType = posCartItem.CustomerMembershipID && posCartItem.CustomerMembershipID > 0 ? this.selectedMembershipName : "";
        } else if (servicePackage.IsMembershipBenefit && servicePackage.IsFree && !servicePackage.IsBenefitsSuspended) {
            posCartItem.Price = 0;
            // posCartItem.DiscountType = this.discountType.MembershipBenefit;
            posCartItem.DiscountType = this.selectedMembershipName;

        }
        else if (servicePackage.IsMembershipBenefit && !servicePackage.IsFree && !servicePackage.IsBenefitsSuspended) {
            posCartItem.Price = this.getItemPriceAfterDiscount(posCartItem);
            // posCartItem.DiscountType = this.discountType.MembershipBenefit;
            posCartItem.DiscountType = this.selectedMembershipName;

        }
        else {
            posCartItem.Price = servicePackage.Price;
            posCartItem.DiscountType = posCartItem.TotalDiscount > 0 ? this.discountType.POSDiscount : '';
        }

        posCartItem.TotalAmountExcludeTaxForPOS = this.roundValue(this.getTotalAmountAfterDiscountForItem(posCartItem));

        this.posCartItems.push(posCartItem);

        this.posServices.filter(s => s.ServiceID === serviceModel.ServiceID)[0].IsAddedToCart = true;

        if (saleService.IsWaitlistItem)
            this.posServices.filter(s => s.ServiceID === serviceModel.ServiceID && saleService.IsWaitlistItem)[0].IsAddedToWaitList = true;

        this.updateRemainingSessions(posCartItem);
        this.getSubTotal();
    }

    addProductToCart(product: any) {


        let posCartItem;//= this.posCartItems.filter(cartItem => cartItem.ItemTypeID === POSItemType.Product && cartItem.ItemID === product.ProductVariantID && cartItem.CustomerMembershipID == this.customerMembershipId)[0];

        for (let index = 0; index < this.posCartItems.length; index++) {

            if (this.posCartItems[index].ItemTypeID === POSItemType.Product && this.posCartItems[index].ItemID === product.ProductVariantID && product.IsMembershipBenefit && this.posCartItems[index].CustomerMembershipID == this.customerMembershipId) {
                posCartItem = this.posCartItems[index];
                break;
            } else if (this.posCartItems[index].ItemTypeID === POSItemType.Product && this.posCartItems[index].ItemID === product.ProductVariantID && !product.IsMembershipBenefit && this.posCartItems[index].CustomerMembershipID == null)  {
                posCartItem = this.posCartItems[index];
                break;
            }
            else if (this.posCartItems[index].ItemTypeID === POSItemType.Product && this.posCartItems[index].ItemID === product.ProductVariantID && product.IsMembershipBenefit && this.posCartItems[index].CustomerMembershipID == null && this.posCartItems[index].IsConsumed)  {
              posCartItem = this.posCartItems[index];
              break;
          }
        }
        if (posCartItem) {
            posCartItem.RemainingSession = product.RemainingSession;
            posCartItem.Qty = parseInt(posCartItem.Qty.toString()) + 1;

            posCartItem.IsBenefitsSuspended = posCartItem.IsBenefitsSuspended ? posCartItem.IsBenefitsSuspended : product.IsBenefitsSuspended;
            posCartItem.DiscountPercentage = posCartItem.DiscountPercentage ? posCartItem.DiscountPercentage : product.DiscountPercentage;
            posCartItem.PerLineItemDiscount = posCartItem.PerLineItemDiscount ? posCartItem.PerLineItemDiscount : product.PerLineItemDiscount;


            posCartItem.TotalDiscount = product.IsMembershipBenefit && !product.IsBenefitsSuspended && product.RemainingSession != 0 ? this.getTotalDiscount(posCartItem)
                : posCartItem.PerLineItemDiscount && posCartItem.PerLineItemDiscount > 0 ? this.getTotalDiscount(posCartItem) : 0;
            posCartItem.TotalAmountExcludeTaxForPOS = (posCartItem.Qty * posCartItem.PricePerSession) - posCartItem.TotalDiscount;

            posCartItem.AmountSpent = product.AmountSpent;
            posCartItem.MemberBaseEarnPoints = product.MemberBaseEarnPoints;
            posCartItem.CustomerEarnedPoints = product.CustomerEarnedPoints;

            posCartItem.CurrentStock = product.CurrentStock;
            posCartItem.ActualStock = product.ActualStock;

        }
        else {
            posCartItem = new POSCartItem();
            /////////////////////////////////////////////
            posCartItem.ProductID = product.ProductID;
            posCartItem.ItemID = product.ProductVariantID;
            posCartItem.ProductVariantID = product.ProductVariantID;
            posCartItem.InventoryOverselling = product.InventoryOverselling;
            posCartItem.CurrentStock = product.CurrentStock;
            posCartItem.HasTrackInventory = product.HasTrackInventory;
            posCartItem.ActualStock = product.CurrentStock + 1;
            posCartItem.Name = product.Name;
            posCartItem.ItemVariantName = product.ProductVariantName;
            posCartItem.InventoryDisplayStock = product.InventoryDisplayStock;
            posCartItem.Description = product.Description;
            posCartItem.PricePerSession = product.Price;
            posCartItem.TotalTaxPercentage = product.TotalTaxPercentage;
            posCartItem.ItemTypeID = POSItemType.Product;
            posCartItem.Qty = 1;
            posCartItem.IsConsumed = product.IsConsumed;
            posCartItem.CustomerMembershipID = product.IsMembershipBenefit && !product.IsConsumed && !product.IsBenefitsSuspended ? this.customerMembershipId : null;
            posCartItem.DiscountPercentage = product.DiscountPercentage;
            posCartItem.IsMembershipBenefit = !product.IsConsumed ? product.IsMembershipBenefit : false;
            posCartItem.IsFree = !product.IsConsumed ? product.IsFree : false;
            posCartItem.IsBenefitsSuspended = product.IsBenefitsSuspended;
            posCartItem.TotalDiscount = product.IsMembershipBenefit && !product.IsBenefitsSuspended && product.RemainingSession != 0 ? this.getTotalDiscount(posCartItem) : 0;//product.IsFree ? product.Price : product.DiscountPercentage ? this.getDiscountAmountPerItem(posCartItem) : 0;
            posCartItem.ItemDiscountAmount = this.getPerItemDiscount(posCartItem); // this.roundValue(posCartItem.TotalDiscount);
            posCartItem.RemainingSession = product.RemainingSession;
            posCartItem.PerLineItemDiscount = posCartItem.IsFree ? posCartItem.Price : posCartItem.TotalDiscount;

            posCartItem.AmountSpent = product.AmountSpent;
            posCartItem.MemberBaseEarnPoints = product.MemberBaseEarnPoints;
            posCartItem.CustomerEarnedPoints = product.CustomerEarnedPoints;

            if (this.onCheckItemIsFree(posCartItem)) {
                posCartItem.Price = 0;
                // posCartItem.DiscountType = this.discountType.MembershipBenefit;
                posCartItem.DiscountType = this.selectedMembershipName;

            }
            else if (this.onCheckItemIsFree(posCartItem) != null) {
                posCartItem.Price = this.roundValue(this.getItemPriceAfterDiscount(posCartItem));
                // posCartItem.DiscountType = this.discountType.MembershipBenefit;
                posCartItem.DiscountType = this.selectedMembershipName;
            }
            else {
                posCartItem.Price = product.Price;
                posCartItem.DiscountType = posCartItem.TotalDiscount > 0 ? this.discountType.POSDiscount : '';
            }

            posCartItem.TotalAmountExcludeTaxForPOS = this.roundValue(this.getTotalAmountAfterDiscountForItem(posCartItem));

            this.posCartItems.push(posCartItem);
        }
        this.updateRemainingSessions(posCartItem, true);
        this.getSubTotal();

    }
    addClassToCart(classItem: POSClass, classStartDate: string) {
        let posCartItem = new POSCartItem();
        posCartItem.ItemID = classItem.ClassID;
        posCartItem.Name = classItem.Name;
        posCartItem.PricePerSession = classItem.PricePerSession;
        posCartItem.TotalTaxPercentage = classItem.TotalTaxPercentage;
        posCartItem.ItemTypeID = POSItemType.Class;
        posCartItem.ClassStartDate = this._dateTimeService.convertDateObjToString(new Date(classStartDate), this.DATE_FORMAT);
        posCartItem.ClassStartTime = classItem.StartTime;
        posCartItem.ClassEndTime = classItem.EndTime;
        posCartItem.Qty = 1;
        posCartItem.IsQuantityDisabled = true;

        posCartItem.IsMembershipBenefit = !classItem.IsConsumed ? classItem.IsMembershipBenefit : false;
        posCartItem.IsFree = posCartItem.IsMembershipBenefit && !classItem.IsConsumed ? classItem.IsFree : false;
        posCartItem.CustomerMembershipID = posCartItem.IsMembershipBenefit && !classItem.IsBenefitsSuspended ? this.customerMembershipId : null;
        posCartItem.IsBenefitsSuspended = classItem.IsBenefitsSuspended;
        posCartItem.DiscountPercentage = posCartItem.IsMembershipBenefit ? classItem.DiscountPercentage : null;
        posCartItem.RemainingSession = classItem.RemainingSession;
        posCartItem.TotalDiscount = classItem.IsMembershipBenefit && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 ? this.getTotalDiscount(posCartItem) : 0; //classItem.IsFree && !classItem.IsBenefitsSuspended ? classItem.PricePerSession : classItem.DiscountPrice ? this.getItemPriceAfterDiscount(classItem) : 0;
        posCartItem.ItemDiscountAmount = this.roundValue(posCartItem.TotalDiscount);


        posCartItem.IsWaitlistItem = classItem.EnableWaitList;

        posCartItem.IsFamilyAndFriendItem = classItem.IsFamilyAndFriendItem;
        posCartItem.IsCartItemUseBenefit = classItem.IsCartItemUseBenefit;

        posCartItem.AmountSpent = classItem.AmountSpent;
        posCartItem.MemberBaseEarnPoints = classItem.MemberBaseEarnPoints;
        posCartItem.CustomerEarnedPoints = classItem.CustomerEarnedPoints;

        if (classItem.IsFamilyAndFriendItem && classItem.IsCartItemUseBenefit == false) {
            posCartItem.CustomerMembershipID = null;
            posCartItem.Price = classItem.PricePerSession;
            posCartItem.TotalDiscount = posCartItem.PerLineItemDiscount > 0 ? this._taxCalculationService.getTwoDecimalDigit(posCartItem.PerLineItemDiscount * posCartItem.Qty) : 0;
            posCartItem.ItemDiscountAmount = this.roundValue(posCartItem.TotalDiscount);
            posCartItem.DiscountType = posCartItem.PerLineItemDiscount > 0 ? this.discountType.POSDiscount : '';
            posCartItem.DiscountPercentage = null;
        } else
            if (classItem.Status == this.classStatus.Full && classItem.EnableWaitList) {
                posCartItem.Price = 0;
                posCartItem.PricePerSession = 0;
                posCartItem.ItemDiscountAmount = 0;
                posCartItem.TotalDiscount = 0;
                posCartItem.DiscountPercentage = 0;
                posCartItem.IsWaitlistItem = true;
                posCartItem.DiscountType = posCartItem.CustomerMembershipID && posCartItem.CustomerMembershipID > 0 ? this.selectedMembershipName : "";
                //posCartItem.IsWaitlistItem = true
            }
            else if (posCartItem.IsMembershipBenefit && classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0) {
                posCartItem.Price = 0;
                // posCartItem.DiscountType = this.discountType.MembershipBenefit;
                posCartItem.DiscountType = this.selectedMembershipName;
            }
            else if (classItem.IsMembershipBenefit && !classItem.IsConsumed && !classItem.IsBenefitsSuspended && !classItem.IsFree && classItem.RemainingSession != 0 && classItem.DiscountPercentage > 0) {
                posCartItem.Price = this.getItemPriceAfterDiscount(posCartItem);
                // posCartItem.DiscountType = this.discountType.MembershipBenefit;
                posCartItem.DiscountType = this.selectedMembershipName
            }
            else {
                posCartItem.Price = classItem.PricePerSession;
                posCartItem.DiscountType = posCartItem.TotalDiscount > 0 ? this.discountType.POSDiscount : '';
            }

        posCartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountAfterDiscountForItem(posCartItem);

        this.posCartItems.push(posCartItem);
        this.getSubTotal();
        this.updateRemainingSessions(posCartItem);
        this.disableClassBookingButton = false;
    }

    getSubTotal() {
        this.grossAmount = 0;
        this.noOfItems = 0;
        this.taxAmount = 0;
        this.posCartItems.forEach(item => {
            if (!item.IsFree || item.IsBenefitsSuspended || item.TotalAmountExcludeTaxForPOS == 0 || !item.IsConsumed) {
                this.grossAmount += item.TotalAmountExcludeTaxForPOS;
                this.getTaxAmount(item);
            }
            this.noOfItems += item.Qty && item.Qty.toString() !== '' ? parseInt(item.Qty.toString()) : 0;
        });
    }

    getTaxAmount(item: POSCartItem) {
        this.taxAmount += (this._taxCalculationService.getTaxAmount(item.TotalTaxPercentage, item.Price) * item.Qty);
    }

    getTotalAmountForItem(item: POSCartItem): number {
        return item.IsFree ? 0 : (item.Qty * item.Price);
    }

    getTotalAmountAfterDiscountForItem(item: POSCartItem): number {
        return (item.Qty * item.PricePerSession - item.TotalDiscount);
    }

    getTotalAmount(item: POSCartItem): number {
        return item.Qty * item.Price;
    }

    // call park sale api
    addInvoiceToQueue() {

        this.saveQueue = new SaveQueue();
        this.saveQueue.CustomerID = this.selectedClient ? this.selectedClient.CustomerID : this.walkedInClient.CustomerID;
        this.saveQueue.DiscountAmount = this.paymentData.saleDiscount;
        this.saveQueue.IsDiscountInPercentage = this.paymentData.isDiscountInPercentage;
        this.saveQueue.ServiceChargesAmount = this.paymentData.serviceCharges;
        this.saveQueue.IsServiceChargesInPercentage = this.paymentData.isServiceChargesInPercentage;
        this.saveQueue.TipAmount = this.paymentData.tipAmount;
        this.saveQueue.TipStaffID = this.paymentData.tipStaffID > 0 ? this.paymentData.tipStaffID : null;
        this.saveQueue.PaymentNote = this.paymentData.paymentNote;

        this.saveQueue.DueDate = this._dateTimeService.convertDateObjToString(this.paymentData.dueDate, this.dateFormatForSave);

        this.saveQueue.QueueSaleDetailList = [];
        this.saveQueue.QueueSalePaymentGatewayList = [];

        this.posCartItems.forEach((item) => {
            let saleQueueDetail = new SaleQueueDetail();

            saleQueueDetail.ItemTypeID = item.ItemTypeID;
            saleQueueDetail.ItemID = item.ItemID;
            saleQueueDetail.Qty = item.Qty;
            saleQueueDetail.Price = item.PricePerSession;
            saleQueueDetail.TotalTaxPercentage = item.TotalTaxPercentage;
            saleQueueDetail.CustomerMembershipID = item.CustomerMembershipID && item.CustomerMembershipID > 0 ? item.CustomerMembershipID : null;
            saleQueueDetail.ItemDiscountAmount = item.DiscountType && item.DiscountType == this.discountType.POSDiscount ? item.PerLineItemDiscount : item.ItemDiscountAmount;
            saleQueueDetail.IsFree = item.IsFree;
            saleQueueDetail.CustomerMembershipID = item.CustomerMembershipID;
            saleQueueDetail.MembershipName = item.DiscountType && item.DiscountType != this.discountType.POSDiscount ? item.DiscountType : null;
            saleQueueDetail.IsWaitlistItem = item.IsWaitlistItem;

            saleQueueDetail.IsFamilyAndFriendItem = item.IsFamilyAndFriendItem;
            saleQueueDetail.CustomerMembershipID = item.IsFamilyAndFriendItem && !item.IsCartItemUseBenefit ? null : saleQueueDetail.CustomerMembershipID;

            if (item.ItemTypeID === this.posItemType.Class) {
                saleQueueDetail.StartDate = item.ClassStartDate;
                saleQueueDetail.StartTime = item.ClassStartTime;
                saleQueueDetail.EndTime = item.ClassEndTime;
                //saleQueueDetail.ItemDiscountAmount = item.ItemDiscountAmount;
            }

            if (item.ItemTypeID === this.posItemType.Service) {
                saleQueueDetail.AssignedToStaffID = item.StaffID;
                saleQueueDetail.StartDate = item.ServiceDate;
                saleQueueDetail.StartTime = item.ServiceStartTime;
                saleQueueDetail.EndTime = item.ServiceEndTime;
                //saleQueueDetail.ItemDiscountAmount = item.ItemDiscountAmount;
                saleQueueDetail.Note = item.Note;
            }

            this.saveQueue.QueueSaleDetailList.push(saleQueueDetail);
        });

        this.paymentData.paymentModes.forEach((payment) => {
            let queueSalePaymentGateway = new SaleQueuePaymentGateway();

            queueSalePaymentGateway.PaymentGatewayID = payment.PaymentGatewayID;
            queueSalePaymentGateway.CustomerPaymentGatewayID = payment.CustomerPaymentGatewayID;
            queueSalePaymentGateway.Amount = payment.Amount;
            queueSalePaymentGateway.PaymentAuthorizationID = payment.PaymentAuthorizationID;
            queueSalePaymentGateway.IsStripeTerminal = payment.IsStripeTerminal;
            queueSalePaymentGateway.SaleTypeID = payment.SaleTypeID;
            queueSalePaymentGateway.LastDigit = payment.LastDigit;
            queueSalePaymentGateway.IsSaveInstrument = payment.IsSaveInstrument;
            queueSalePaymentGateway.IsSaveCard = payment.IsSaveCard;

            this.saveQueue.QueueSalePaymentGatewayList.push(queueSalePaymentGateway);
        });

        this._httpService.save(PointOfSaleApi.saveSaleQueue, this.saveQueue).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Park Sale"));
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Park Sale"));
            }
        )

        this.queuedInvoiceNumber += 1;
        let queueInvoice = new InvoiceInQueue();

        queueInvoice.CartItems = this.posCartItems;
        queueInvoice.InvoiceNumber = this.queuedInvoiceNumber;
        queueInvoice.GrossAmount = this.grossAmount;
        queueInvoice.Quantity = this.noOfItems;
        if (this.selectedClient) {
            queueInvoice.ClientID = this.selectedClient.CustomerID;
            queueInvoice.ClientName = this.selectedClient.FullName;
        }

        this.queuedInvoices.push(queueInvoice);
        this.isCustomerMembership = false;
        this.clearCart();
    }

    // clear the cart
    clearCart() {
        this.selectedClient = null;
        this.searchPerson.reset();
        this.posCartItems = [];
        this.amountPaid = 0;
        this.grossAmount = 0;
        this.taxAmount = 0;
        this.noOfItems = 0;
        this.customerMembershipId = null;
        this.remainingSessionDetail = [];
        this.productGlobalRemainingSession = null;
        this.serviceGlobalRemainingSession = null;
        this.classGlobalRemainingSession = null;
        this.classGlobalRemainingSessionCopy = null;
        this.productGlobalRemainingSessionCopy = null;
        this.membershipBaseProductGlobalRemainingSession = [];
        this.totalClassItemLevelQty = null;
        this.totalProductItemLevelQty = null;
        this.customerMembershipId = null;
        this.isCustomerMembership = false;
        this.paymentData = new SavePOSForAddMoreItems();
        this.customerMemberhsip = [];
        this.resetAddedToCart();
        this.getPOSItems();
    }

    setAddedToCart() {
        if (this.posServices && this.posServices.length > 0) {
            this.posServices.forEach(service => {
                let serviceInCart = this.posCartItems.filter(c => c.ServiceID === service.ServiceID)[0];
                service.IsAddedToCart = serviceInCart ? true : false;
                if (service.IsAddedToCart) {
                    this.checkItemAssociationWithRewardPoints(serviceInCart);
                }

            });
        }

        if (this.posClasses && this.posClasses.length > 0) {
            this.posClasses.forEach(classModel => {
                classModel.ClassPOSList.forEach(classItem => {
                    let classInCart = this.posCartItems.filter(c => c.ItemID === classItem.ClassID && c.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(classModel.OccurrenceDate), this.DATE_FORMAT))[0];
                    classItem.IsAddedToCart = classInCart ? true : false;
                    if (classItem.IsAddedToCart) {
                        this.checkItemAssociationWithRewardPoints(classInCart);
                    }
                })
            });
        }

        if (this.posProducts && this.posProducts.length > 0) {
            this.posProducts.forEach(productModel => {
                let productInCart = this.posCartItems.filter(c => c.ItemID === productModel.ProductVariantID)[0];
                if (productInCart) {
                    this.checkItemAssociationWithRewardPoints(productInCart);
                }
            });
        }
    }



    viewQueuedInvoices() {
        let queuedInvoicesForGrid = [];
        this.queuedInvoices.forEach((invoice) => {
            let queuedInvoice = new QueuedInvoiceForGrid();
            queuedInvoice.InvoiceNumber = invoice.InvoiceNumber;
            queuedInvoice.ClientName = invoice.ClientName;
            queuedInvoice.GrossAmount = invoice.GrossAmount;
            queuedInvoice.NoOfItems = invoice.CartItems.length;
            queuedInvoice.Quantity = invoice.Quantity;
            queuedInvoicesForGrid.push(queuedInvoice);
        });

        const dialogref = this._dialog.open(POSQueuedInvoicesComponent,
            {
                disableClose: true,
                //isShowRetrieveConfirmation: false,
                data: this.posCartItems && this.posCartItems.length > 0 ? true : false,
            });

        dialogref.componentInstance.removeInvoice.subscribe((invoiceNo: number) => {
            this.removeInvoiceFromQueue(invoiceNo);
        });

        dialogref.componentInstance.viewInvoice.subscribe((invoice: SaveQueue) => {
            this.setClient(invoice.CustomerID, invoice.CustomerName, true, true, invoice);
        });
    }

    removeInvoiceFromQueue(invoiceNo: number) {
        this.queuedInvoices = this.queuedInvoices.filter(inv => inv.InvoiceNumber !== invoiceNo);
    }

    viewInvoiceFromQueue(invoice: SaveQueue) {
        //this.setClient(invoice.CustomerID, invoice.CustomerName);
        this.saveQueue = invoice;
        this.customerMembershipId = invoice.CustomerMembershipID;
        if (this.customerMembershipId && this.customerMembershipId > 0) {
            this.getAllMemberhsipBenefitsItems().then((response) => {
                this.addItemsInCartFromQueue();
                this.addPosPaymentDataFromQueue();
                this.getPOSItems();
            });
        } else {
            this.addItemsInCartFromQueue();
            this.addPosPaymentDataFromQueue();
            this.getPOSItems();
        }


    }

    addItemsInCartFromQueue() {
        this.posCartItems = [];
        this.saveQueue.QueueSaleDetailList.forEach(item => {
            let cartItem = new POSCartItem();
            cartItem.DiscountPercentage = 0;
            cartItem.ItemTypeID = item.ItemTypeID;
            cartItem.ItemID = item.ItemID;
            cartItem.Name = item.ItemName;
            cartItem.ItemVariantName = item.ItemVariantName;
            cartItem.Description = item.ItemDescription;
            cartItem.Qty = item.Qty;
            // require product id only for product because when we retrive park sale we hava only product id not varient id and we have tp minus the quantity using filter
            cartItem.ProductID = item.ProductID;
            cartItem.ProductVariantID = item.ItemID;
            cartItem.PricePerSession = item.Price;
            cartItem.TotalTaxPercentage = item.TotalTaxPercentage;
            cartItem.HasTrackInventory = item.HasTrackInventory;
            cartItem.InventoryOverselling = item.InventoryOverselling;
            cartItem.CurrentStock = item.CurrentStock;
            cartItem.ActualStock = item.CurrentStock;

            //// check if membership cancel or freez not asinged membership benefits
            let membershipID = this.customerMemberhsip.find(x => x.CustomerMembershipID == item.CustomerMembershipID)?.CustomerMembershipID;

            //if benefit suspended then set null CustomerMembershipID
            if (item.CustomerMembershipID && item.CustomerMembershipID > 0 && (membershipID == null || membershipID == 0 || membershipID == undefined)) {
                item.CustomerMembershipID = null;
                cartItem.Price = item.Price;
                cartItem.CustomerMembershipID = null;
                cartItem.TotalDiscount = 0;
                item.ItemDiscountAmount = 0;
                item.IsFree = false;
                item.IsMembershipBenefit = false;
                this.customerMembershipId = this.customerMemberhsip[0].CustomerMembershipID;
            }

            if ((membershipID && membershipID > 0) || (item.ItemDiscountAmount && item.ItemDiscountAmount > 0)) {
                cartItem.Price = item.Price - item.ItemDiscountAmount;
                cartItem.TotalDiscount = item.ItemDiscountAmount * item.Qty;

                cartItem.PerLineItemDiscount = item.ItemDiscountAmount;
                cartItem.ItemDiscountAmount = item.ItemDiscountAmount;

                cartItem.DiscountPercentage = this._commonService.getDiscountInPercentage(cartItem.ItemDiscountAmount , cartItem.PricePerSession);

                // cartItem.DiscountPercentage = this.getPercentage(cartItem.PricePerSession, cartItem.ItemDiscountAmount);

                if (item.ItemDiscountAmount && item.ItemDiscountAmount > 0 && !item.IsWaitlistItem) {
                    // cartItem.DiscountType = item.IsMembershipBenefit ? this.discountType.MembershipBenefit : this.discountType.POSDiscount;
                    cartItem.DiscountType = item.IsMembershipBenefit ? item.MembershipName : this.discountType.POSDiscount;

                } else if (item.IsFree && membershipID > 0) {
                    // cartItem.DiscountType = item.CustomerMembershipID != null? this.discountType.MembershipBenefit : '';
                    cartItem.DiscountType = item.CustomerMembershipID != null ? item.MembershipName : '';

                    cartItem.TotalDiscount = cartItem.PricePerSession * item.Qty;
                    cartItem.PerLineItemDiscount = cartItem.PricePerSession;
                    cartItem.Price = 0;
                    cartItem.ItemDiscountAmount = cartItem.PricePerSession;
                    cartItem.TotalAmountExcludeTaxForPOS = 0;

                }

                cartItem.IsWaitlistItem = item.IsWaitlistItem;

                if(cartItem.IsWaitlistItem){
                  cartItem.CustomerMembershipID = item.CustomerMembershipID;
                  cartItem.DiscountType = item.MembershipName;
                }

                cartItem.IsFree = item.IsFree;
                cartItem.IsMembershipBenefit = item.IsMembershipBenefit;
                //cartItem.IsBenefitsSuspended = item.IsMembershipBenefit ? false : true;

                cartItem.IsFamilyAndFriendItem = item.IsFamilyAndFriendItem;
                cartItem.CustomerMembershipID = item.CustomerMembershipID;
                cartItem.IsCartItemUseBenefit = item.IsFamilyAndFriendItem && item.CustomerMembershipID > 0 ? true : false;

                cartItem.IsCartItemUseBenefit = item.ItemTypeID == this.posItemType.Class && item.CustomerMembershipID > 0 ? true : false;
            }
            else {
                cartItem.Price = item.Price;
                cartItem.CustomerMembershipID = null;
                cartItem.TotalDiscount = 0;
                cartItem.PerLineItemDiscount = 0;
                cartItem.ItemDiscountAmount = 0;
            }

            //for handling + and - functionalty product benefit section start
            if (item.CustomerMembershipID > 0 && item.ItemTypeID == this.posItemType.Product) {
                var result = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == item.CustomerMembershipID);
                if (!result) {
                    var mbpgrs = new MembershipBaseProductGlobalRemainingSession();
                    mbpgrs.CustomerMembershipID = item.CustomerMembershipID;
                    mbpgrs.productGlobalRemainingSessionCopy = item.GlobalSession;
                    // mbpgrs.productGlobalRemainingSession = item.GlobalSession - item.Qty;
                    mbpgrs.productGlobalRemainingSession = item.GlobalSession !== null ? item.GlobalSession - item.Qty : null;

                    mbpgrs.remainingSessionDetail = [];
                    var productBenefit = {
                        ItemTypeID: item.ItemTypeID,
                        ItemID: item.ItemID,
                        RemainingSession: item.RemainingSession - item.Qty,
                        AllowedSession: item.RemainingSession - item.Qty,
                        IsMembershipBenefit: item.IsMembershipBenefit,
                        CustomerMembershipID: item.CustomerMembershipID
                    }
                    // cartItem.RemainingSession = productBenefit.RemainingSession;
                    cartItem.RemainingSession = item.RemainingSession;

                    mbpgrs.remainingSessionDetail.push(productBenefit);

                    this.membershipBaseProductGlobalRemainingSession.push(mbpgrs);
                } else {
                    result.productGlobalRemainingSession = result.productGlobalRemainingSession !== null ? result.productGlobalRemainingSession - item.Qty : null;
                    ///////////////////
                    // result.productGlobalRemainingSession = result.productGlobalRemainingSession - item.Qty;

                    result.remainingSessionDetail = result.remainingSessionDetail && result.remainingSessionDetail.length > 0 ? result.remainingSessionDetail : [];
                    var productBenefit = {
                        ItemTypeID: item.ItemTypeID,
                        ItemID: item.ItemID,
                        RemainingSession: item.RemainingSession - item.Qty,
                        AllowedSession: item.RemainingSession - item.Qty,
                        IsMembershipBenefit: item.IsMembershipBenefit,
                        CustomerMembershipID: item.CustomerMembershipID
                    }
                    // cartItem.RemainingSession = productBenefit.RemainingSession;
                    cartItem.RemainingSession = item.RemainingSession;

                    result.remainingSessionDetail.push(productBenefit);
                }
            } else {
                cartItem.RemainingSession = item.RemainingSession;

            }
            cartItem.IsConsumed = false;
            cartItem.IsBenefitsSuspended = false;

            //end


            // cartItem.TotalDiscount = cartItem.PricePerSession * item.Qty;
            cartItem.TotalTaxPercentage = item.TotalTaxPercentage;

            cartItem.TotalAmountExcludeTaxForPOS = (item.Qty * cartItem.Price);

            if (item.ItemTypeID === this.posItemType.Class) {
                //// check if membership cancel or freez not asinged membership benefits
                if (membershipID && membershipID > 0) {
                    cartItem.IsFree = item.IsMembershipBasedClass == undefined ? cartItem.IsFree : item.IsMembershipBasedClass;
                }

                cartItem.ClassStartDate = this._dateTimeService.convertDateObjToString(this._dateTimeService.convertStringIntoDateForScheduler(item.StartDate), this.DATE_FORMAT);

                var formatter = 'YYYY-MM-DD';
                var date = new Date('July 17, 2018 03:24:00');
                var time = moment(item.StartDate).format(this.DATE_FORMAT);
                //console.log(time);

                cartItem.ClassStartTime = this._dateTimeService.formatTimeString(item.StartTime, Configurations.TimeFormat);
                cartItem.ClassEndTime = this._dateTimeService.formatTimeString(item.EndTime, Configurations.TimeFormat);
                cartItem.IsQuantityDisabled = true;
            }

            if (item.ItemTypeID === this.posItemType.Service) {
                cartItem.StaffID = item.AssignedToStaffID;
                cartItem.ServiceDate = this._dateTimeService.convertDateObjToString(this._dateTimeService.convertStringIntoDateForScheduler(item.StartDate), this.DATE_FORMAT);
                cartItem.ServiceStartTime = item.StartTime;
                cartItem.ServiceEndTime = item.EndTime;
                cartItem.ServiceID = item.ServiceID;
                cartItem.IsQuantityDisabled = true;
                cartItem.Note = item.Note;
            }

            this.posCartItems.push(cartItem);
        });

        this.markOutdatedItems();
        this.setAddedToCart();
        this.getSubTotal();

    }

    // returnCustomerMemberShipName(memberShipID){
    //     let memberShip = this.customerMemberhsip.find(i => i.CustomerMembershipID == memberShipID);
    //     return memberShip.MembershipName;
    // }

    addPosPaymentDataFromQueue() {
        this.paymentData = new SavePOSForAddMoreItems();
        this.paymentData.dueDate = new Date(this.saveQueue.DueDate);
        this.paymentData.saleDiscount = this.saveQueue.DiscountAmount;
        this.paymentData.isDiscountInPercentage = this.saveQueue.IsDiscountInPercentage;
        this.paymentData.serviceCharges = this.saveQueue.ServiceChargesAmount;
        this.paymentData.isServiceChargesInPercentage = this.saveQueue.IsServiceChargesInPercentage;
        this.paymentData.tipAmount = this.saveQueue.TipAmount;
        this.paymentData.tipStaffName = "";
        //data.paymentNote = this.saveQueue.Note;
        this.paymentData.paymentNote = this.saveQueue.PaymentNote;
        this.paymentData.tipStaffID = this.saveQueue.TipStaffID;
        this.paymentData.paymentModes = new Array<SalePaymentMode>();

        if (this.saveQueue.QueueSalePaymentGatewayList && this.saveQueue.QueueSalePaymentGatewayList.length > 0) {
            this.saveQueue.QueueSalePaymentGatewayList.forEach(paymentMode => {

                var salePaymentMode = new SalePaymentMode();
                salePaymentMode.PaymentGatewayID = paymentMode.PaymentGatewayID;
                salePaymentMode.CustomerPaymentGatewayID = paymentMode.CustomerPaymentGatewayID;
                salePaymentMode.Amount = paymentMode.Amount;
                salePaymentMode.PaymentAuthorizationID = paymentMode.PaymentAuthorizationID;
                salePaymentMode.IsStripeTerminal = paymentMode.IsStripeTerminal;
                salePaymentMode.SaleTypeID = paymentMode.SaleTypeID;
                salePaymentMode.LastDigit = paymentMode.LastDigit;
                salePaymentMode.IsSaveInstrument = paymentMode.IsSaveInstrument;
                salePaymentMode.IsSaveCard = paymentMode.IsSaveCard;

                this.paymentData.paymentModes.push(salePaymentMode);
            });
        }
    }

    finalizeSaleInvoice() {
        if (!this.hasOutdatedOrNotAvailableItems() && !this.hasOutOfStackItems()) {
            //if (this.selectedClient) {
            this.saleInvoice = new SaleInvoice();
            this.saleInvoice.ApplicationArea = SaleArea.POS;
            this.saleInvoice.SaleDetailList = [];
            if (this.saveQueue && this.saveQueue.QueueSaleID > 0) {
                this.saleInvoice.QueueSaleID = this.saveQueue.QueueSaleID;
            }

            this.posCartItems.forEach(item => {
                let saleItem = new POSSaleDetail();
                saleItem.ItemID = item.ItemID;
                saleItem.ItemTypeID = item.ItemTypeID;
                saleItem.Qty = item.Qty;

                saleItem.ItemDiscountAmount = item.ItemDiscountAmount;

                saleItem.CustomerMembershipID = item.CustomerMembershipID;
                saleItem.DiscountPrice = item.DiscountPrice;
                saleItem.TotalDiscount = item.DiscountPercentage;
                saleItem.DiscountType = item.DiscountType;
                saleItem.IsWaitlistItem = item.IsWaitlistItem;
                saleItem.IsFamilyAndFriendItem = item.IsFamilyAndFriendItem;

                //saleItem.CustomerMembershipID = item.IsFamilyAndFriendItem && !item.IsFamilyAndFriendItemUseBenefit ? null : saleItem.CustomerMembershipID

                switch (item.ItemTypeID) {
                    case this.posItemType.Service: {
                        saleItem.AssignedToStaffID = item.StaffID;
                        saleItem.StartDate = item.ServiceDate;
                        saleItem.StartTime = item.ServiceStartTime;
                        saleItem.EndTime = item.ServiceEndTime;
                        saleItem.Note = item.Note;
                        //saleItem.FacilityID = 0; //TODO: Fetch and set Facility ID
                        break;
                    }

                    case this.posItemType.Class: {
                        saleItem.StartDate = item.ClassStartDate;
                        break;
                    }
                }

                this.saleInvoice.SaleDetailList.push(saleItem);
            });
            return true;
        }
        else {
            if (this.hasOutdatedOrNotAvailableItems()) {
                this._messageService.showErrorMessage(this.messages.Validation.Outdated_Items);
                return false;
            } else {
                this._messageService.showErrorMessage(this.messages.Validation.Out_Of_Stock_Items);
                return false;
            }
        }
    }

    // open the pos payment component
    openPOSPaymentDialog() {
        if (this.posCartItems && this.posCartItems.length > 0 && this.finalizeSaleInvoice()) {
            //-- Free classes will always addd in cart. Meetting 13-08-2020--///
            // if (this.posCartItems.some(c => c.ItemTypeID === this.posItemType.Class && c.IsFree)) {
            //     this._messageService.showErrorMessage(this.messages.Validation.Free_Classes_In_Cart);
            // }
            // else {

            /// get peritem total tax and total tax inbcluded amount
            this.posCartItems.forEach(cartItem => {
                cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(cartItem.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
                cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.Price * cartItem.Qty);
                cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);
                cartItem.TotalAmountExcludeTax = cartItem.DiscountType ? cartItem.PricePerSession : cartItem.TotalAmountExcludeTax;
                //for product when apply discount
                if (cartItem.ItemTypeID == this.posItemType.Product && cartItem.Price != cartItem.PricePerSession) {
                    cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty);
                }
            });

            this.saleInvoice.TotalEarnedRewardPoints = 0;

            if (this.selectedClient && !this.selectedClient?.IsWalkedIn && this.isRewardProgramInPackage) {
                //calculate earned points
                this.posCartItems.forEach(cartItem => {
                    // if(cartItem?.IsFamilyAndFriendItem && !cartItem?.IsFamilyAndFriendItemUseBenefit){
                    //     cartItem.IsCustomerMembershipBenefit = false;
                    // }

                    this.saleInvoice.TotalEarnedRewardPoints += this._commonService.calculateRewardPointsPerItem(this.selectedClient, cartItem);
                });

                this.saleInvoice.TotalEarnedRewardPoints = this.roundValue(this.saleInvoice.TotalEarnedRewardPoints);
            }
            const dialogref = this._dialog.open(POSPaymentComponent,
                {
                    disableClose: true,
                    panelClass: 'pos-full-popup',
                    data: {
                        grossAmount: this.grossAmount,
                        cartItems: JSON.parse(JSON.stringify(this.posCartItems)),
                        saleInvoice: this.saleInvoice,
                        personInfo: this.selectedClient,
                        PaymentData: this.paymentData
                    }
                });

            dialogref.componentInstance.paymentStatus.subscribe((isPaid: boolean) => {
                if (isPaid) {
                    this.isCustomerMembership = false;
                    this.clearCart();
                }
            });

            dialogref.componentInstance.notAvailableServices.subscribe((serviceList) => {
                serviceList.forEach((service: any) => {
                    // this.posCartItems.find(c => c.ItemTypeID === this.posItemType.Service && c.ItemID === parseInt(service.ItemID))?.IsNotAvailable = true;
                    this.posCartItems.find(c => c.ItemID === parseInt(service.ItemID)).IsNotAvailable = true;
                });
            });

            dialogref.componentInstance.productOutOfStock.subscribe((productList) => {
                productList.forEach((product: any) => {
                    var _cartItems = this.posCartItems.filter(c => c.ItemID === parseInt(product.ItemID) && c.ItemTypeID == this.posItemType.Product);

                    _cartItems.forEach(product => {
                        product.IsItemOutOfStock = true;
                    });
                });
            });
            dialogref.componentInstance.onBack.subscribe((data) => {
                this.paymentData = data;
                if (this.paymentData.paymentModes?.length > 0 || this.paymentData.paymentNote || this.paymentData.dueDate || this.paymentData.saleDiscount > 0 || this.paymentData.serviceCharges > 0 || this.paymentData.tipAmount > 0 || this.paymentData.tipStaffName) {
                    this.isShowDiscardInvoice = true;
                    this.invoicePaymentModes = this.paymentData.paymentModes?.length > 0 ? this.paymentData.paymentModes : [];
                }
            });
        }
    }

    //display the customer search
    displayClientName(user?: POSClient): string | undefined {
        return user ? typeof (user) === "object" ? user.FullName : user : undefined;
    }

    //clicked on search client and recalculate all items (class product and service also that are added in cart)
    getSelectedClient(client: POSClient) {
        this.selectedClient = client;
        if (this.selectedClient && this.selectedClient.CustomerTypeID) {
            // if (this.selectedClient.IsWalkedIn) { as per discussion with fahad and tahir saab. now we are selecting the walkin client also
            //     this.onClearSelectedClient();
            // }
            if (this.selectedClient.HasMembership) {
                this.getCustomerMemberships();
                // this.getCustomerMemberhsips().then((response) => {
                //     if (response && this.customerMemberhsip.length > 0) {
                //         this.isCustomerMembership = true;
                //         this.customerMembershipId = this.customerMemberhsip[0].CustomerMembershipID;
                //         this.onSelectCustomerMembership();
                //         //this.customerMemberhsip = this.customerMemberhsip;
                //         //this.onRedeemMembershipBenefits();
                //         this.onFocusedOut();
                //     }
                //     else {
                //         this.isCustomerMembership = false;
                //         this.customerMembershipId = this.customerMemberhsip[0].CustomerMembershipID;
                //         this.getPOSItems();
                //         this.onFocusedOut();
                //         this.getAllMemberhsipBenefitsItems();
                //     }
                //     // this.getFreeClassesForMember(this.selectedClient.CustomerID, this.customerMembershipId);
                // });

            } else {
                this.isCustomerMembership = false;
                this.resetFreeClasses();
                this.resetCartItems();
                this.getSubTotal();

                if (this.customerMembershipId) {
                    this.customerMemberhsip = [];
                    this.customerMembershipId = null;
                    this.memberhsipBenefits = [];
                    this.remainingSessionDetail = [];
                    this.membershipBaseProductGlobalRemainingSession = [];
                    this.getPOSItems();
                }
                else {
                    this.getPOSItems();
                }
             }
        }
        else {
            this.memberhsipBenefits = []
            this.customerMembershipId = null;
            this.getPOSItems();
            this.resetFreeClasses();
            this.getSubTotal();
        }

    }

    getCustomerMemberships(isSetNullValue: boolean = false, invoice: SaveQueue = new SaveQueue()) {
        this.getCustomerMemberhsips().then((response) => {
            if (response && this.customerMemberhsip.length > 0) {
                this.isCustomerMembership = true;
                this.customerMembershipId = isSetNullValue ? null : this.customerMemberhsip[0].CustomerMembershipID;
                this.onSelectCustomerMembership();
                if (isSetNullValue) {
                    this.viewInvoiceFromQueue(invoice);
                }
                //this.customerMemberhsip = this.customerMemberhsip;
                //this.onRedeemMembershipBenefits();
                this.onFocusedOut();
            }
            else {
                this.isCustomerMembership = false;
                this.customerMembershipId = isSetNullValue ? null : this.customerMemberhsip[0].CustomerMembershipID;
                this.getPOSItems();
                this.onFocusedOut();
                this.getAllMemberhsipBenefitsItems();
                if (isSetNullValue) {
                    this.viewInvoiceFromQueue(invoice);
                }
            }
            // this.getFreeClassesForMember(this.selectedClient.CustomerID, this.customerMembershipId);
        });
    }


    isSessionExceeded(): boolean {
        if (this.checkGlobalSession()) {
            this.setCartInvalid();
            return true;
        }
        else {
            return false;
        }
    }

    checkGlobalSession(): boolean {

        let checkClassExists = this.posCartItems.find(item => item.ItemTypeID === this.posItemType.Class && item.CustomerMembershipID == this.customerMembershipId);
        let checkProductExists = this.posCartItems.find(item => item.ItemTypeID === this.posItemType.Product && item.CustomerMembershipID == this.customerMembershipId);
        let checkServiceExists = this.posCartItems.find(item => item.ItemTypeID === this.posItemType.Service && item.CustomerMembershipID == this.customerMembershipId);

        // implementation change after added select member ship dropdown it selected membership cart item not added then set zero item level qty
        if (checkClassExists) {
            this.countClassItemQty();
        }
        else {
            this.totalClassItemLevelQty = 0;
        }
        if (checkProductExists) {
            this.countProductItemQty();
        } else {
            this.totalProductItemLevelQty = 0;
        }

        if (checkServiceExists) {
            this.countServiceItemQty();
        } else {
            this.totalServiceItemLevelQty = 0;
        }


        if (checkClassExists && this.classGlobalRemainingSession != null && this.totalClassItemLevelQty > this.classGlobalRemainingSession) {
            this.classGlobalRemainingSession = 0;
            return true;
        }
        else {
            this.classGlobalRemainingSession = this.classGlobalRemainingSession == null ? this.classGlobalRemainingSession : this.classGlobalRemainingSession - this.totalClassItemLevelQty;
        }
        if (checkServiceExists && this.serviceGlobalRemainingSession != null && this.totalServiceItemLevelQty > this.serviceGlobalRemainingSession) {
            this.serviceGlobalRemainingSession = 0;
            return true;
        }
        else {
            this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession == null ? this.serviceGlobalRemainingSession : this.serviceGlobalRemainingSession - this.totalServiceItemLevelQty;
        }

        if (checkProductExists) {
            if (this.productGlobalRemainingSession != null && this.POS_ITEM_SESSION.totalItemLevelQty > this.productGlobalRemainingSession) {
                this.productGlobalRemainingSession = 0;
                return true;
            }
            else if (this.POS_ITEM_SESSION.isProductSessionExceed) {
                // this.productGlobalRemainingSession = this.productGlobalRemainingSession == null ? this.productGlobalRemainingSession = null : 0;
                return true;
            }
            else {
                this.productGlobalRemainingSession = this.productGlobalRemainingSession == null ? this.productGlobalRemainingSession : this.productGlobalRemainingSession - this.totalProductItemLevelQty;
                return false;
            }
        }
        else {
            this.productGlobalRemainingSession = this.productGlobalRemainingSession == null ? this.productGlobalRemainingSession : this.productGlobalRemainingSession - this.totalProductItemLevelQty;
            return false;
        }
    }

    countProductItemQty() {

        this.totalProductItemLevelQty = 0;
        var productItems = this.posCartItems.filter(item => item.ItemTypeID == this.posItemType.Product && item.CustomerMembershipID == this.customerMembershipId);
        if (productItems) {
            productItems.forEach(cartItem => {
                if (this.checkItemAssociationWithMemberhisp(cartItem)) {
                    this.totalProductItemLevelQty = this.totalProductItemLevelQty + cartItem.Qty;
                    this.pushIntoItemLevelSessionArray(cartItem, this.posItemType.Product);
                    if (!this.POS_ITEM_SESSION.isProductSessionExceed) {
                        if (cartItem.RemainingSession == null) {
                            this.POS_ITEM_SESSION.isProductSessionExceed = false;
                        }
                        else {
                            this.POS_ITEM_SESSION.isProductSessionExceed = cartItem.Qty > cartItem.RemainingSession ? true : false;
                        }

                    }
                }
            });
        }
        this.POS_ITEM_SESSION.totalItemLevelQty = this.totalProductItemLevelQty;
    }

    countServiceItemQty() {

        this.totalServiceItemLevelQty = 0;
        var serviceItems = this.posCartItems.filter(item => item.ItemTypeID == this.posItemType.Service && item.CustomerMembershipID == this.customerMembershipId);
        if (serviceItems) {
            serviceItems.forEach(cartItem => {
                if (this.checkItemAssociationWithMemberhisp(cartItem)) {
                    this.totalServiceItemLevelQty = this.totalServiceItemLevelQty + cartItem.Qty;
                    this.checkItemLevelSession(cartItem);
                }
            });
        }
        this.totalServiceItemLevelQty;
    }

    countClassItemQty() {
        this.totalClassItemLevelQty = 0;
        var classItems = this.posCartItems.filter(item => item.ItemTypeID == this.posItemType.Class);
        if (classItems) {
            classItems.forEach(cartItem => {
                if (this.checkItemAssociationWithMemberhisp(cartItem) && !cartItem.IsWaitlistItem) {
                    this.totalClassItemLevelQty = this.totalClassItemLevelQty + cartItem.Qty;
                    this.pushIntoItemLevelSessionArray(cartItem, this.posItemType.Product);
                }
            });
        }
        this.totalClassItemLevelQty;
    }

    getFreeClassesForMember(memberId: number, customerMembershipId?: number) {
        let url = PointOfSaleApi.getFreeClassesForMember + "?customerID=" + memberId.toString() +
            "&startDate=" + this._dateTimeService.convertDateObjToString(this.classStartDate, this.DATE_FORMAT) +
            "&customerMembershipID=" + (customerMembershipId ? customerMembershipId : null);

        this._httpService.get(url).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        let freeClasses = response.Result;
                        this.posCartItems.forEach(cartItem => {
                            // If Cart Item is Class
                            if (cartItem.ItemTypeID === this.posItemType.Class) {
                                // Check ItemID from Free Class List
                                let freeClass = freeClasses.filter(fc => fc.ClassID === cartItem.ItemID)[0];
                                // If found, then mark cartItem as Free
                                // cartItem.IsFree = freeClass ? true : false;
                                cartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountForItem(cartItem);
                            }
                        });
                        if (this.posClasses) {
                            this.posClasses.forEach(classModel => {
                                classModel.ClassPOSList.forEach(classItem => {
                                    // Check ItemID from Free Class List
                                    let freeClass = freeClasses.find(fc => fc.ClassID === classItem.ClassID && fc.OccurrenceDate === classItem.OccurrenceDate);
                                    // classItem.IsFree = freeClass ? true : false;

                                    classItem.IsAlreadyBooked = freeClass && freeClass.IsAlreadyBooked ? true : false;
                                    classItem.IsAddedToCart = classItem.IsAddedToCart && !classItem.IsAlreadyBooked;
                                })
                            });
                        }

                        this.getSubTotal();
                        // if (this.posCartItems.some(c => c.ItemTypeID === this.posItemType.Class && c.IsFree)) {
                        //     this._messageService.showErrorMessage(this.messages.Validation.Free_Classes_In_Cart);
                        // }
                    }
                    else {
                        this.resetFreeClasses();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Free Classes"));
            }
        );
    }

    getAllMemberhsipBenefitsItems() {
        if (this.customerMembershipId) {
            let params = {
                customerMembershipID: this.customerMembershipId,
                startDate: this._dateTimeService.convertDateObjToString(this.classStartDate, this.DATE_FORMAT)
            }

            return new Promise<boolean>((isPromiseResolved, reject) => {
                this._httpService.get(SaleApi.getAllMembershipItems, params)
                    .subscribe(
                        (res: ApiResponse) => {
                            if (res && res.MessageCode > 0) {
                                this.hasMemberhsipBenefits = res.Result && res.Result.length > 0 ? true : false;
                                if (this.hasMemberhsipBenefits) {
                                    this.memberhsipBenefits = res.Result;
                                    isPromiseResolved(true);
                                }
                                else {
                                    this.memberhsipBenefits = [];
                                    isPromiseResolved(false);
                                }
                            }
                            else {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                        },
                        error => {
                            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Memberhsip Benefits"))
                        }
                    );
            });
        } else {
            return new Promise<boolean>((isPromiseResolved, reject) => { isPromiseResolved(false); });
        }
    }

    getCustomerMemberhsips() {
        return new Promise<boolean>((resolve, reject) => {
            let url = SaleApi.getCustomerMemberhsips.replace("{customerID}", this.selectedClient.CustomerID.toString())
            this._httpService.get(url)
                .subscribe(
                    (res: ApiResponse) => {
                        if (res && res.MessageCode > 0) {
                            this.hasMemberhsip = res.Result && res.Result.length > 0 ? true : false;
                            if (this.hasMemberhsip) {
                                this.customerMemberhsip = res.Result;
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                            resolve(false);
                        }
                    },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Customer Memberhsips"))
                    });
        });
    }


    pushIntoItemLevelSessionArray(selectedItem, itemTypeId) {
        //if(this.membershipBaseProductGlobalRemainingSession.length > 0){
        var benefit = this.membershipBaseProductGlobalRemainingSession?.find(i => i.CustomerMembershipID == selectedItem.CustomerMembershipID)?.remainingSessionDetail;
        //}
        let index = this.remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.CustomerMembershipID === this.customerMembershipId && selectedItem.ItemID ? (c.ItemID === selectedItem.ItemID) : (c.ItemID === selectedItem.ProductVariantID) ? (c.ItemID === selectedItem.ProductVariantID) : (c.ItemID === selectedItem.ClassID));
        if (index < 0) {
            switch (itemTypeId) {
                case this.posItemType.Product:
                    let sesstionDetail = new RemainingSessionDetail();
                    sesstionDetail.ItemID = selectedItem.ProductVariantID ? selectedItem.ProductVariantID : selectedItem.ItemID ? selectedItem.ItemID : selectedItem.ClassID;
                    sesstionDetail.ItemTypeID = this.posItemType.Product;
                    sesstionDetail.IsMembershipBenefit = selectedItem.IsMembershipBenefit;
                    sesstionDetail.CustomerMembershipID = this.customerMembershipId;
                    if (selectedItem.Qty >= selectedItem.RemainingSession) {
                        sesstionDetail.RemainingSession = sesstionDetail.RemainingSession = 0;
                    } else if (selectedItem.Qty > 1) {
                        sesstionDetail.RemainingSession = selectedItem.RemainingSession - selectedItem.Qty;
                    }
                    else {
                        sesstionDetail.RemainingSession = selectedItem.RemainingSession - 1;
                    }

                    this.remainingSessionDetail.push(sesstionDetail);

                    if (this.membershipBaseProductGlobalRemainingSession.length > 0) {
                        benefit.push(sesstionDetail);
                    }

                    break;

            }
        }

    }

    checkItemLevelSession(selectedItem): boolean {
        var remainingSessionDetail = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == selectedItem.CustomerMembershipID)?.remainingSessionDetail;
        if (remainingSessionDetail?.length > 0) {
            let index = remainingSessionDetail.findIndex(c => c.ItemTypeID === this.posItemType.Product && c.CustomerMembershipID === this.customerMembershipId && selectedItem.ItemID ? (c.ItemID === selectedItem.ItemID) : (c.ItemID === selectedItem.ProductVariantID) ? (c.ItemID === selectedItem.ProductVariantID) : (c.ItemID === selectedItem.ClassID));
            if (index >= 0) {
                // this condition handle retrieve park sale handle benefit
                if (isNaN(remainingSessionDetail[index].RemainingSession)) {
                    let addedQty = this.posCartItems.find(c => c.ItemTypeID === this.posItemType.Product && c.CustomerMembershipID === Number(this.customerMembershipId) && c.ItemID === selectedItem.ProductVariantID)?.Qty;
                    remainingSessionDetail[index].RemainingSession = selectedItem.RemainingSession - (addedQty ? addedQty : 0);
                }

                if (remainingSessionDetail[index].RemainingSession > 0) {
                    remainingSessionDetail[index].RemainingSession = remainingSessionDetail[index].RemainingSession - 1;
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                this.pushIntoItemLevelSessionArray(selectedItem, this.posItemType.Product);
                return true;
            }
        }
        else {
            this.pushIntoItemLevelSessionArray(selectedItem, this.posItemType.Product);
            return true;
        }
    }

    consumeProductGlobalSession(customerMembershipID) {
        if (customerMembershipID > 0) {

            // var products = this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Product && i.CustomerMembershipID == customerMembershipID);

            // var totalQty: number = 0;

            // products.forEach(cartItem => {
            //   totalQty = totalQty + cartItem.Qty;
            // });

            // var benefit = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == customerMembershipID);
            // if(benefit.productGlobalRemainingSessionCopy != null && benefit.productGlobalRemainingSessionCopy > 0){
            //   benefit.productGlobalRemainingSession = benefit.productGlobalRemainingSessionCopy - totalQty;
            // }

            var productGlobalRemainingSession = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == customerMembershipID)?.productGlobalRemainingSession;
            if (productGlobalRemainingSession != null && productGlobalRemainingSession > 0) {
                productGlobalRemainingSession = productGlobalRemainingSession - 1;
            }

        }
    }

    consumeClassGlobalSession() {
        this.classGlobalRemainingSession = this.classGlobalRemainingSession - 1;
    }


    setClient(clientId: number, clientName: string, onAddClient: boolean = false, isRetriveParkSale: boolean = false, invoice: SaveQueue = new SaveQueue()) {
        this.personName = clientName;
        setTimeout(() => {
            this.searchPerson.setValue(this.personName.trim());
            this.searchPerson.updateValueAndValidity();

            setTimeout(() => {
                if (this.clientList && this.clientList.length > 0 && !onAddClient) {
                    this.selectedClient = this.clientList.filter(c => c.CustomerID === clientId)[0];
                    if (isRetriveParkSale) {
                        if (this.selectedClient.CustomerTypeID == CustomerType.Member) {
                            this.getCustomerMemberships(true, invoice);
                            //this.onSelectCustomerMembership();
                        } else {
                            this.viewInvoiceFromQueue(invoice);
                        }

                    }
                } else {
                    this._commonService.searchClient(onAddClient ? this.personName.trim() : '', 0, false, true, onAddClient ? clientId : 0)
                        .subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.clientList = response.Result;
                                this.selectedClient = this.clientList.filter(c => c.CustomerID === clientId)[0];
                                if (isRetriveParkSale) {
                                    if (this.selectedClient.CustomerTypeID == CustomerType.Member) {
                                        this.getCustomerMemberships(true, invoice);
                                        //this.onSelectCustomerMembership();
                                    } else {
                                        this.viewInvoiceFromQueue(invoice);
                                    }

                                }
                            }
                        }
                        );
                }

            }, 100);
        })
    }

    setClientByEmail(clientEmail: string) {
        setTimeout(() => {
            this.searchPerson.setValue(clientEmail);
            this.searchPerson.updateValueAndValidity();
        })

        setTimeout(() => {
            this.selectedClient = this.clientList.filter(c => c.Email === clientEmail)[0];
            this.personName = this.selectedClient.FirstName + ' ' + this.selectedClient.LastName;
        }, 1000);
    }

    setPOSClassesDefaultSettings() {
        this.classGlobalRemainingSession = this.posClasses[0].ClassPOSList[0].GlobalRemainingSession;

        //update global session
        let customerMembershipId = Number(this.customerMembershipId);
        this.classGlobalRemainingSessionCopy = this.classGlobalRemainingSession;
        if (this.posCartItems && this.posCartItems.length > 0 && this.posCartItems.filter(i => i.ItemTypeID === POSItemType.Class && i.CustomerMembershipID == customerMembershipId)) {
            this.posCartItems.forEach(cartItem => {

                if (cartItem.ItemTypeID === POSItemType.Class && cartItem.CustomerMembershipID == customerMembershipId && this.classGlobalRemainingSession > 0) {
                    this.classGlobalRemainingSession = this.classGlobalRemainingSession - cartItem.Qty;
                }
            });
        }


        this.posClasses.forEach(classModel => {
            classModel.ClassPOSList.forEach(classItem => {

                let classInCart = this.posCartItems.filter(c => c.ItemID === classItem.ClassID && c.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(classModel.OccurrenceDate), this.DATE_FORMAT))[0];
                classItem.IsAddedToCart = classInCart ? true : false;
                classItem.TotalDiscount = 0;
                classItem.StartTime = this._dateTimeService.formatTimeString(classItem.StartTime, Configurations.TimeFormat);
                classItem.EndTime = this._dateTimeService.formatTimeString(classItem.EndTime, Configurations.TimeFormat);
                classItem.ItemCurrentPrice = classItem.IsMembershipBenefit && classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 ? 0 : classItem.IsMembershipBenefit && !classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 && classItem.DiscountPercentage > 0 ? classItem.PricePerSession - this._taxCalculationService.getTwoDecimalDigit(((classItem.PricePerSession * classItem.DiscountPercentage) / 100)) : classItem.PricePerSession;
                // classItem.ItemPreviousPrice = getDiscountAmountPerItem
                classItem.ImagePath = classItem.ImagePath && classItem.ImagePath !== "" ?
                    this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + classItem.ImagePath : 'assets/images/pos_placeholder.jpg';

                switch (classItem.Status) {
                    case this.classStatus.BuyNow:
                        classItem.IsAvailable = true;
                        break;

                    case this.classStatus.Timeout:
                        classItem.IsAvailable = false;
                        classItem.StatusName = this.classStatusName.Timeout;
                        break;
                    case this.classStatus.Full:
                        classItem.IsAvailable = false;
                        classItem.StatusName = this.classStatusName.Full;
                        break;
                    case this.classStatus.BookingNotStarted:
                        classItem.IsAvailable = false;
                        classItem.StatusName = this.classStatusName.BookingNotStarted;
                        break;
                }

                classItem.IsShowWaitListButton = classItem.Status == this.classStatus.Full && classItem.EnableWaitList ? true : false;

                if (classItem.IsAlreadyBooked) {
                    // classItem.IsBookedAgain = classItem.IsFamilyAndFriendItem && classItem.IsMembershipBenefit && classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 && classItem.IsClassBookingFreeBenefitsForFamilyAndFirends ? true :
                    //                             classItem.IsFamilyAndFriendItem && classItem.IsMembershipBenefit && !classItem.IsFree && !classItem.IsBenefitsSuspended && classItem.RemainingSession != 0 && classItem.DiscountPercentage > 0 && classItem.IsClassBookingDiscountBenefitsForFamilyAndFriends ? true :
                    //                             classItem.ItemCurrentPrice == classItem.PricePerSession && classItem.IsFamilyAndFriendItem ? true : false;
                    classItem.IsBookedAgain = classItem.IsAvailable && this.selectedClient && !this.selectedClient.IsWalkedIn && classItem.IsClassBookingForFamilyAndFriends && (classItem.AttendeeMax == 0 || classItem.SpacesLeftFree > 0) ? true : false;
                }

                classItem.EnableWaitList = classItem.EnableWaitList;
            })
        });

        this.updateCartItems();
    }

    setCartValid() {
        this.posCartItems.forEach(cartItem => {
            if (this.checkItemAssociationWithMemberhisp(cartItem)) {
                if (cartItem.Qty > cartItem.RemainingSession && !cartItem.IsWaitlistItem) {
                    cartItem.IsSessionConsumed = true;
                }
                else {
                    cartItem.IsSessionConsumed = false;
                }
                this.checkItemLevelSession(cartItem);
            }
        });
        this.recountGobalSessionAfterRemoveItemFromCart();
    }

    setCartInvalid() {
        this.posCartItems.forEach(cartItem => {
            if (this.checkItemAssociationWithMemberhisp(cartItem)) {
                if (cartItem.ItemTypeID == this.posItemType.Product) {
                    var productGlobalRemainingSession = this.membershipBaseProductGlobalRemainingSession.find(i => i.CustomerMembershipID == cartItem.CustomerMembershipID).productGlobalRemainingSession;
                    if ((productGlobalRemainingSession != null && this.totalProductItemLevelQty > productGlobalRemainingSession)) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else if (cartItem.RemainingSession != null && (cartItem.Qty > cartItem.RemainingSession)) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else {
                        this.POS_ITEM_SESSION.isProductSessionExceed = false;
                        cartItem.IsSessionConsumed = false;
                    }
                }

                if (cartItem.ItemTypeID == this.posItemType.Class && !cartItem.IsWaitlistItem) {
                    if (this.classGlobalRemainingSession != null && this.totalClassItemLevelQty > this.classGlobalRemainingSession) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else if (cartItem.RemainingSession != null && cartItem.Qty > cartItem.RemainingSession) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else {
                        cartItem.IsSessionConsumed = false;
                    }
                }

                if (cartItem.ItemTypeID == this.posItemType.Service && !cartItem.IsWaitlistItem) {
                    if (this.serviceGlobalRemainingSession != null && this.totalServiceItemLevelQty > this.serviceGlobalRemainingSession) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else if (cartItem.RemainingSession != null && (cartItem.Qty > cartItem.RemainingSession)) {
                        cartItem.IsSessionConsumed = true;
                    }
                    else {
                        cartItem.IsSessionConsumed = false;
                    }
                }
            }

        });
    }




    hasOutdatedOrNotAvailableItems() {
        return this.posCartItems.find(item => item.IsOutdated || item.IsNotAvailable) != undefined ? true : false;
    }

    hasOutOfStackItems() {
        return this.posCartItems.find(item => item.IsItemOutOfStock) != undefined ? true : false;
    }

    // updateCartItemsForMemberMemberhsipBenefits() {
    //     this.updateCartItems();
    // }


    // reset free classes
    resetFreeClasses() {
        // Reset IsFree property
        this.posCartItems.forEach(cartItem => {
            cartItem.IsFree = false;
            cartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountForItem(cartItem);
        });
        if (this.posClasses) {
            this.posClasses.forEach(classModel => {
                classModel.ClassPOSList.forEach(classItem => {
                    if (classItem.IsFree) {
                        classItem.IsAlreadyBooked = classItem.IsAlreadyBooked ? false : classItem.IsAlreadyBooked;
                        classItem.IsAddedToCart = classItem.IsAddedToCart ? false : classItem.IsAddedToCart;
                    }

                    this.posCartItems.forEach(verifyCartItem => {
                        if ((verifyCartItem.ItemID == classItem.ClassID) && (this._dateTimeService.convertDateObjToString(new Date(verifyCartItem.ClassStartDate), this.DATE_FORMAT) == this._dateTimeService.convertDateObjToString(new Date(classItem.OccurrenceDate), this.DATE_FORMAT))) {
                            classItem.IsAddedToCart = true;
                        }
                    });
                });

            });
        }
    }

    //reset the cart items
    resetCartItems() {
        this.productGlobalRemainingSession = null;
        this.serviceGlobalRemainingSession = null;
        this.classGlobalRemainingSession = null;
        this.productGlobalRemainingSessionCopy = null;
        this.membershipBaseProductGlobalRemainingSession = [];
        this.serviceGlobalRemainingSessionCopy = null;
        this.totalProductItemLevelQty = 0;
        this.totalClassItemLevelQty = 0;
        this.totalServiceItemLevelQty = 0;

        this.posCartItems.forEach(cartItem => {
            cartItem.DiscountPercentage = null;
            cartItem.CustomerMembershipID = null;
            cartItem.IsFree = false;
            cartItem.IsMembershipBenefit = false;
            cartItem.IsCartItemUseBenefit = false;
            cartItem.IsConsumed = false;
            cartItem.RemainingSession = null;
            cartItem.TotalDiscount = 0;
            cartItem.Price = cartItem.PricePerSession;
            cartItem.DiscountType = '';
            cartItem.PerLineItemDiscount = 0;
            cartItem.ItemDiscountAmount = 0;
            cartItem.IsSessionConsumed = false;

            cartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountForItem(cartItem);
        });
        this.getSubTotal();
    }

    //reset the discount pin
    resetDiscountPin() {
        this.discountPinResult = "";
        this.discountPin = "";
    }

    resetAddedToCart() {
        if (this.posClasses && this.posClasses.length > 0) {
            this.posClasses.forEach(classModel => {
                classModel.ClassPOSList.forEach(classItem => {
                    classItem.IsAddedToCart = false;
                })
            });
        }

        if (this.posServices && this.posServices.length > 0) {
            this.posServices.forEach(service => {
                service.IsAddedToCart = false;
            });
        }
    }


    // #endregion


    // #region Memberhsip Benefits


    checkItemAssociationWithMemberhisp(cartItem: any): boolean {
        if (cartItem.IsMembershipBenefit && !cartItem.IsWaitlistItem && !cartItem.IsBenefitsSuspended && !cartItem.IsConsumed && cartItem.CustomerMembershipID == this.customerMembershipId) {
            return true;
        }
        else {
            return false;
        }
    }

    checkItemAssociationIsFreeWithMemberhisp(cartItem: POSCartItem): boolean {
        if (cartItem.IsMembershipBenefit && cartItem.IsFree && !cartItem.IsWaitlistItem && !cartItem.IsConsumed && !cartItem.IsBenefitsSuspended) {
            return true;
        }
        else {
            return false;
        }
    }
    checkItemAssociationIsDiscountedWithMembership(cartItem: POSCartItem): boolean {
        if (cartItem.IsMembershipBenefit && !cartItem.IsFree && !cartItem.IsWaitlistItem && !cartItem.IsConsumed && !cartItem.IsFree && !cartItem.IsBenefitsSuspended) {
            return true;
        }
        else {
            return false;
        }
    }

    updateCartItems() {
        // if (this.memberhsipBenefits) {


        //     let productSessoin = this.memberhsipBenefits.filter(c => c.ItemTypeID === this.posItemType.Product)[0];
        //     if (productSessoin) this.productGlobalRemainingSession = productSessoin.GlobalRemainingSession;
        //     let serviceSessoin = this.memberhsipBenefits.filter(c => c.ItemTypeID === this.posItemType.Service)[0];
        //     if (serviceSessoin) this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession;
        //     let classSessoin = this.memberhsipBenefits.filter(c => c.ItemTypeID === this.posItemType.Class)[0];
        //     if (classSessoin) this.classGlobalRemainingSession = classSessoin.GlobalRemainingSession;

        //     this.posCartItems.forEach(cartItem => {
        //         if(!cartItem.IsWaitlistItem){
        //             if(!cartItem.IsFamilyAndFriendItem || (cartItem.IsFamilyAndFriendItem && cartItem.IsCartItemUseBenefit)){
        //                 let benefitItemInCart;
        //                 benefitItemInCart = this.memberhsipBenefits.filter(c => c.ItemTypeID === cartItem.ItemTypeID && c.ItemID === cartItem.ItemID)[0];

        //                 if (cartItem.ItemTypeID == this.posItemType.Class) {
        //                     benefitItemInCart = null;
        //                     benefitItemInCart = this.memberhsipBenefits.filter(c => c.ItemTypeID === cartItem.ItemTypeID && c.ItemID === cartItem.ItemID && (cartItem.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(c.OccurrencesDate.toString()), this.DATE_FORMAT)))[0];
        //                 }

        //                 if (cartItem.ItemTypeID == this.posItemType.Service) {
        //                     benefitItemInCart = null;
        //                     let endDate = this.posServices.filter(item => item.ServiceID == cartItem.ServiceID)[0].MembershipEndDate;
        //                     benefitItemInCart = this.memberhsipBenefits.filter(c => c.ItemTypeID === cartItem.ItemTypeID && c.ItemID === cartItem.ItemID)[0];
        //                     if (!this._dateTimeService.compareTwoDates(new Date(cartItem.ServiceDate), new Date(endDate))) {
        //                         benefitItemInCart = null;
        //                     }
        //                 }


        //                 cartItem.IsMembershipBenefit = benefitItemInCart && this.checkItemAssociationWithMemberhisp(benefitItemInCart) ? benefitItemInCart.IsMembershipBenefit : false;
        //                 cartItem.DiscountPercentage = benefitItemInCart && this.checkItemAssociationWithMemberhisp(benefitItemInCart) ? benefitItemInCart.DiscountPercentage : null;
        //                 cartItem.IsFree = benefitItemInCart && this.checkItemAssociationWithMemberhisp(benefitItemInCart) ? benefitItemInCart.IsFree : false;
        //                 cartItem.RemainingSession = benefitItemInCart && this.checkItemAssociationWithMemberhisp(benefitItemInCart) ? benefitItemInCart.RemainingSession : null;
        //                 cartItem.CustomerMembershipID = benefitItemInCart && this.checkItemAssociationWithMemberhisp(benefitItemInCart) ? this.customerMembershipId : null;

        //                 // this condition added by fahad when cart item not benefited no need to total discount value round dated on 23/07/2021
        //                 if(cartItem.IsMembershipBenefit){
        //                     cartItem.TotalDiscount = this.getTotalDiscount(cartItem);
        //                 }

        //                 cartItem.ItemDiscountAmount = this.roundValue(this.getPerItemDiscount(cartItem));

        //                 if (benefitItemInCart && this.checkItemAssociationIsFreeWithMemberhisp(benefitItemInCart)) {
        //                     cartItem.Price = 0;
        //                     cartItem.DiscountType = this.discountType.MembershipBenefit;
        //                 }
        //                 else if (benefitItemInCart && this.checkItemAssociationIsDiscountedWithMembership(benefitItemInCart)) {
        //                     cartItem.Price = this.getItemPriceAfterDiscount(cartItem);
        //                     cartItem.DiscountType = this.discountType.MembershipBenefit;
        //                 }
        //                 else {
        //                     cartItem.Price = cartItem.Price;
        //                     cartItem.DiscountType = cartItem.PerLineItemDiscount > 0 ? this.discountType.POSDiscount : '';
        //                      //added by fahad when discount in line item no need to discount value round (this line of code added after discussion with Ali Raza dated on 22/07/2021)
        //                     cartItem.ItemDiscountAmount =  cartItem.PerLineItemDiscount > 0 ? cartItem.PerLineItemDiscount : 0;
        //                 }
        //                 cartItem.TotalAmountExcludeTaxForPOS = this.getTotalAmountAfterDiscountForItem(cartItem);
        //             }
        //         }

        //         if(this.isRewardProgramInPackage)
        //             this.checkItemAssociationWithRewardPoints(cartItem);
        //     });
        // }

        // this.isSessionExceeded();
        // this.getSubTotal();
        //this.isSessionExceeded();
        this.posCartItems.forEach(cartItem => {
            if (this.isRewardProgramInPackage)
                this.checkItemAssociationWithRewardPoints(cartItem);
        });
    }

    // checks if any item have association with reward program
    checkItemAssociationWithRewardPoints(cartItem: POSCartItem) {
        var result;
        if (cartItem.ItemTypeID == this.posItemType.Class) {
            if (this.posClasses && this.posClasses.length > 0) {
                let classModel = this.posClasses.filter(c => cartItem.ClassStartDate === this._dateTimeService.convertDateObjToString(new Date(c.OccurrenceDate), this.DATE_FORMAT))[0];
                if (classModel) {
                    result = classModel.ClassPOSList.filter(cItem => cItem.ClassID === cartItem.ItemID)[0];
                }
            }
        }

        if (cartItem.ItemTypeID == this.posItemType.Product) {
            if (this.posProducts && this.posProducts.length > 0) {
                result = this.posProducts.find(c => c.ProductVariantID === cartItem.ItemID);
            }
        }

        if (cartItem.ItemTypeID == this.posItemType.Service) {
            if (this.posServices && this.posServices.length > 0) {
                result = this.posServices.filter(item => item.ServiceID == cartItem.ServiceID)[0];
            }
        }

        if (result) {
            cartItem.AmountSpent = result.AmountSpent;
            cartItem.MemberBaseEarnPoints = result.MemberBaseEarnPoints;
            cartItem.CustomerEarnedPoints = result.CustomerEarnedPoints;
        }

    }
    // #endregion
}

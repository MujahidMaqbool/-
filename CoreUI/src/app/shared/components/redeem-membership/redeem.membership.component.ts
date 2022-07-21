/****************** Angular References **********/
import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { HttpService } from "src/app/services/app.http.service";
import { AttendeeApi, SaleApi } from "src/app/helper/config/app.webapi";
import { ApiResponse, CustomerMemberhsip } from "src/app/models/common.model";
import { MessageService } from "src/app/services/app.message.service";
import { Messages } from "src/app/helper/config/app.messages";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { FreeClassesMemberships } from "src/app/models/attendee.model";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { DateTimeService } from "src/app/services/date.time.service";

/**************** Services & Models ***************/


/************** Configurations **************/

@Component({
    selector: 'redeem-membership',
    templateUrl: './redeem.membership.component.html'
})

export class RedeemMembershipComponent extends AbstractGenericComponent implements OnInit {
    // #region Local Members
    @Output()
    membershipSelected = new EventEmitter<number>();
    /* Local Members */
    hasMemberhsip: boolean;
    membershipId: number = 0;
    branchID: number;
    itemTotalPrice:number ;
    currencyFormat: string;

    /* Model/Component References */
    selectedClassHasBenefits : boolean = true
    freeClassMemberships: FreeClassesMemberships;
    private readonly DATE_FORMAT = "yyyy-MM-dd";

    customerMemberhsip: CustomerMemberhsip[];
    freeClassMembershipsList: FreeClassesMemberships[];

    /* Configurations */
    messages = Messages;
    // #endregion

    // #endregion

    constructor(
        private _httpService: HttpService,
        public _dialog: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        public _dialogRef: MatDialogRef<RedeemMembershipComponent>,
        private _taxCalculationService: TaxCalculation,
        private _dateTimeService: DateTimeService,

        @Inject(MAT_DIALOG_DATA) public data: any ,
    ) {
        super();
    }

    ngOnInit() {
        this.getCustomerMemberhsips();
        this.getCurrentBranchDetail();
    }

    // #region Events

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
          this.branchID = branch.BranchID;
          this.currencyFormat = branch.CurrencySymbol;
        }
    }

    onClose(): void {
        this.membershipSelected.emit(-1);
        this._dialogRef.close();
    }

    onSave(): void {
        this.membershipSelected.emit(this.membershipId);
        this._dialogRef.close();
    }

    getCustomerMemberhsips() {
        let params = {
          parentClassId: this.data.parentClassId,
          customerId: this.data.customerId,
          classDate: this.data.classDate
        }
        let url = SaleApi.getCustomerMemberhsips.replace("{customerID}", this.data.customerId.toString());

        this._httpService.get(this.data?.itemTypeName == "Class" ? AttendeeApi.getMemberClassDetailWithOtherMemberships : url, this.data.itemTypeName == "Class"? params : '')
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.hasMemberhsip = res.Result && res.Result.length > 0 ? true : false;
                        if (this.hasMemberhsip) {
                            this.customerMemberhsip = res.Result;
                            this.membershipId =  this.data.customerMemberShipID == null || this.data.customerMemberShipID > 0 ? this.data.customerMemberShipID : this.customerMemberhsip[0].CustomerMembershipID;
                            this.isClassHasMembershipBenfits();

                        }
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Customer Memberhsips"))
                });
}


    isClassHasMembershipBenfits() {
        this.getMemberMembershipBenefitsDetail().then((isPromiseResolved: boolean) => {
          if (isPromiseResolved) {

            // var discountType = "";
            if (this.membershipId && this.membershipId > 0 && this.selectedClassHasBenefits) {
                var freeClassMemberships = this.freeClassMemberships;
                freeClassMemberships.IsBenefitSuspended = freeClassMemberships.IsBenefitSuspended;

                if (freeClassMemberships != null && freeClassMemberships.IsMembershipBenefit && !freeClassMemberships.IsBenefitSuspended &&
                  (freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null)) {

                    if (freeClassMemberships.IsFree) {
                        this.itemTotalPrice = 0;
                    } else if (!freeClassMemberships.IsFree && freeClassMemberships.DiscountPerncentage) {

                        var itemDiscountAmount = this._taxCalculationService.getTwoDecimalDigit(((this.data.classInfo.PricePerSession * freeClassMemberships.DiscountPerncentage) / 100));
                        var totalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession ==  null || freeClassMemberships.NoLimits ? (this.data.classInfo.PricePerSession - itemDiscountAmount) : this.data.classInfo.PricePerSession;

                        totalAmountExcludeTax = this.getItemTotalDiscountedPrice(totalAmountExcludeTax, this.data.classInfo.SaleDiscountPerItemPercentage);

                        var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.data.classInfo.TotalTaxPercentage, totalAmountExcludeTax) * 1);
                        this.itemTotalPrice = this._taxCalculationService.getRoundValue( Number(totalAmountExcludeTax) + itemTotalTaxAmount);

                    }
                } else {
                    //if the custmer have membership but remaining sessions are null
                    let itemDiscountAmount = 0; //Manage line item discount.
                    var totalAmountExcludeTax = this.getItemTotalDiscountedPrice((this.data.classInfo.PricePerSession - itemDiscountAmount), this.data.classInfo.SaleDiscountPerItemPercentage);
                    var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.data.classInfo.TotalTaxPercentage, totalAmountExcludeTax) * 1);
                    this.itemTotalPrice = this._taxCalculationService.getRoundValue( Number(totalAmountExcludeTax) + itemTotalTaxAmount);

                    this.data.classInfo.CustomerMembershipID = null;
                    this.selectedClassHasBenefits = false;
                }

            } else {
                let itemDiscountAmount = 0; //Manage line item discount.
                var totalAmountExcludeTax = this.getItemTotalDiscountedPrice((this.data.classInfo.PricePerSession - itemDiscountAmount), this.data.classInfo.SaleDiscountPerItemPercentage);
                var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.data.classInfo.TotalTaxPercentage, totalAmountExcludeTax) * 1);
                this.itemTotalPrice = this._taxCalculationService.getRoundValue( Number(totalAmountExcludeTax) + itemTotalTaxAmount);
            }
          }
        })
      }

    getMemberMembershipBenefitsDetail() {
        return new Promise<any>((isPromiseResolved, reject) => {
          try {
            let params = {
              parentClassId: this.data.classInfo.ParentClassID,
              customerId: this.data.customerId,
              classDate: this._dateTimeService.convertDateObjToString(this.data.classInfo.StartDate, this.DATE_FORMAT)
            }
            this._httpService.get(AttendeeApi.getMemberClassDetailWithOtherMemberships, params)
              .subscribe(async (response: ApiResponse) => {

                if (response && response.MessageCode > 0) {

                  if (await response.Result && response.Result.length > 0) {

                    this.freeClassMembershipsList = response.Result;
                    var findSelectedMembershipBenefit = this.freeClassMembershipsList.find(i => i.CustomerMembershipID == this.membershipId);
                    if (findSelectedMembershipBenefit) {

                      if (this.membershipId && this.membershipId > 0) {
                        if (this.freeClassMembershipsList.length >= 1) {
                          this.freeClassMembershipsList.forEach(element => {
                            if (element.CustomerMembershipID == this.membershipId) {
                              this.freeClassMemberships = element;
                              this.selectedClassHasBenefits = true;
                              isPromiseResolved(true);
                            }

                          });
                        }
                      }
                      else {
                        this.selectedClassHasBenefits = false;
                        isPromiseResolved(true);
                      }
                    }
                    else {
                      this.selectedClassHasBenefits = false;
                      isPromiseResolved(true);
                    }

                  }

                  else {
                    this.selectedClassHasBenefits = false;
                    isPromiseResolved(true);
                  }
                }
                else {
                  this._messageService.showErrorMessage(response.MessageText);
                }
              },
                error => {
                  this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reschedule Class"))
                }
              );
          }
          catch (err) {
            reject(this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")));
          }
        });
      }

      getItemTotalDiscountedPrice(discountedPricePerUnit, saleDiscountPerItemPercentage) {
        if (saleDiscountPerItemPercentage > 0) {
          discountedPricePerUnit -= ((discountedPricePerUnit / 100) * saleDiscountPerItemPercentage);//this._taxCalculationService.getTwoDecimalDigit((discountedPricePerUnit * ) / 100);
        }
        return this._taxCalculationService.getTwoDecimalDigit(discountedPricePerUnit);
      }

      onChangeMembership(){
          this.isClassHasMembershipBenfits();
      }
    // #endregion
}

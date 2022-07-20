/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs/internal/observable/forkJoin";
import { SubscriptionLike } from "rxjs";

/********************** START: Service & Models *********************/
/* Models */
import {
  Service,
  ServicePackage,
  DurationType,
} from "src/app/setup/models/service.model";
import { Tax, ApiResponse, DD_Branch } from "src/app/models/common.model";
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "../../../services/app.message.service";
import { CommonService } from "src/app/services/common.service";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
/********************** Common & Components *********************/
import { environment } from "src/environments/environment";
import { Messages } from "src/app/helper/config/app.messages";
import { ServiceApi } from "src/app/helper/config/app.webapi";
import { ImageEditorPopupComponent } from "src/app/application-dialog-module/image-editor/image.editor.popup.component";
import { DeleteConfirmationComponent } from "src/app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { ENU_Permission_Setup } from "src/app/helper/config/app.module.page.enums";
import { ENU_Package } from "src/app/helper/config/app.enums";
import { AppUtilities } from "src/app/helper/aap.utilities";
import { MatOption } from "@angular/material/core";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { Configurations } from "src/app/helper/config/app.config";

@Component({
  selector: "service-save",
  templateUrl: "./service.save.component.html",
})
export class ServiceSaveComponent extends AbstractGenericComponent implements OnInit {
  // #region Local Members

  @ViewChild("serviceFormData") serviceFormData: NgForm;
  @ViewChild('allSelectedTax') private allSelectedTax: MatOption;
  @ViewChild('allSelectedFacilities') private allSelectedFacilities: MatOption;
  @ViewChild('allRestrictionSelection') private allRestrictionSelection: MatOption;

  /* Messages */
  serverImageAddress = environment.imageUrl;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  showFacilities: boolean;
  showHidePriceLabel: boolean = false;

  /* Local Members */
  serviceID: number = 0;
  vatID: number;
  isImageExist: boolean = false;
  imagePath: string = "";
  servicePackageCount: number = 0;
  minDuration: number = 1;
  minPrice: number = 0;
  minCostPrice: number = 0;
  minTotalPrice: number = 0; // now total min value is zero
  totalPrice: any = 0;
  arePaymentPlansValid: boolean = true;
  showPaymentDeleteButton: boolean = false;
  paymentPlanID: number = 1;
  currencyFormat: string;
  currencySymbol: string;
  isDeleted: boolean = false;
  isPurchaseRestrictionAllowed: boolean = false;

  /* Collection Types */
  serviceCategoryList: any[];
  vatList: any[];
  facilityList: any[];
  durationTypeList: DurationType[] = [];
  taxList: Tax[] = [];
  selectedTaxList: any[] = [];
  selectedFacilityList: any[] = [];

  selectedRestrictedList: any[] = [];
  restrictedList = Configurations.RestrictList;

  objServicesData: Service;
  objServicePackageData: ServicePackage;
  serviceModelCopy: Service;

  packageIdSubscription: SubscriptionLike;

  package = ENU_Package;
  IsServiceWaitList: boolean;
  // #endregion

  constructor(
    private _httpService: HttpService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _dialog: MatDialogService,
    private _messageService: MessageService,
    private _taxCalculationService: TaxCalculation,
    private _commonService: CommonService,
    private _dataSharingService: DataSharingService
  ) {
    super();
    this.objServicesData = new Service();
    this.objServicePackageData = new ServicePackage();
    this.objServicesData.ServicePackageList.push(this.objServicePackageData);

  }

  ngOnInit() {
    this.getServiceIdFromRoute();

    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
        if (packageId && packageId > 0) {
          this.setPackagePermission(packageId);

          if (this.serviceID > 0) {
            this.getServiceByIdAndFundamentals();
          } else {
            this.getFundamentals();
          }
        }
      }
    );
    this.getCurrentBranchDetail()

  }

  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
  }
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
  }
  // #region Events

  toggleAllTaxSelection() {
    this.selectedTaxList = [];

    if (this.allSelectedTax.selected) {
      this.taxList.forEach(service => {
        this.selectedTaxList.push(service);
      });

      setTimeout(() => {
        this.allSelectedTax.select();
      }, 100);
    }
    this.onTaxSelectionChange();
  }

  tosslePerOneTax(all) {
    if (this.allSelectedTax && this.allSelectedTax.selected) {
      this.allSelectedTax.deselect();
    }
    if (this.taxList.length == this.selectedTaxList.length && this.taxList.length > 1) {
      this.allSelectedTax.select();
    }
    this.onTaxSelectionChange();
  }

  onTaxSelectionChange() {
    this.objServicesData.ItemTax = [];
    if (this.taxList && this.taxList.length > 0) {
      if (this.selectedTaxList && this.selectedTaxList.length > 0) {
        this.selectedTaxList.forEach(tax => {
          if (tax.TaxID && tax.TaxID > 0) {
            this.objServicesData.ItemTax.push({ TaxID: tax.TaxID });
          }
        });
      }
    }
    this.getTotalAmount();
  }

  getTotalAmount() {
    let taxPercentage = this.getTotalTaxPercentage();

    this.objServicesData.ServicePackageList.forEach((servicePakcage) => {
      servicePakcage.TotalPrice = servicePakcage.Price;
      if (servicePakcage.TotalPrice) {
        var taxValue = this._taxCalculationService.getTaxAmount(taxPercentage, servicePakcage.Price);
        servicePakcage.TotalPrice = this._taxCalculationService.getRoundValue(servicePakcage.TotalPrice + taxValue);
      }
    });

    // this.calculatePrice(taxPercentage);
  }

  getTotalTaxPercentage() {
    let taxTotal = 0;
    if (this.objServicesData.ItemTax) {
      this.objServicesData.ItemTax.forEach(tax => {
        taxTotal += this.taxList.find(t => t.TaxID === tax.TaxID).TaxPercentage;
      })
    }

    return taxTotal;
  }

  // facility
  toggleAllFacilitySelection() {
    this.selectedFacilityList = [];

    if (this.allSelectedFacilities.selected) {
      this.facilityList.forEach(service => {
        this.selectedFacilityList.push(service);
      });

      setTimeout(() => {
        this.allSelectedFacilities.select();
      }, 100);
    }

    this.onFacilitySelectionChange();
  }

  tosslePerOneFacility(all) {
    if (this.allSelectedFacilities && this.allSelectedFacilities.selected) {
      this.allSelectedFacilities.deselect();
      //  this.onTaxSelectionChange();
      //  return false;
    }
    if (this.facilityList.length == this.selectedFacilityList.length && this.facilityList.length > 1) {
      this.allSelectedFacilities.select();
    }
    this.onFacilitySelectionChange();
  }

  onFacilitySelectionChange() {
    this.objServicesData.ServiceFacilityList = [];
    if (this.facilityList && this.facilityList.length > 0) {
      if (this.selectedFacilityList && this.selectedFacilityList.length > 0) {
        this.selectedFacilityList.forEach(facility => {
          if (facility.FacilityID && facility.FacilityID > 0) {
            this.objServicesData.ServiceFacilityList.push({ FacilityID: facility.FacilityID });
          }
        });
      }
    }
  }

  // Purchase restriction
  togglePerOneRestriction(all) {
    if (this.allRestrictionSelection && this.allRestrictionSelection.selected) {
      this.allRestrictionSelection.deselect();
    }
    if (this.restrictedList.length == this.selectedRestrictedList.length && this.restrictedList.length > 1) {
      this.allRestrictionSelection.select();
    }
  }
  toggleAllRestrictionSelection() {
    this.selectedRestrictedList = [];

    if (this.allRestrictionSelection.selected) {
      this.restrictedList.forEach(service => {
        this.selectedRestrictedList.push(service);
      });
      setTimeout(() => {
        this.allRestrictionSelection.select();
      }, 100);
    }
  }

  // Array convert into String
  listToCommaSeparatedString(arr: any) {
    var i;
    var result: string = "";
    for (i = 0; i < arr.length; ++i) {
      if (arr[i].value !== undefined) {
        result = result + arr[i].value + ((arr.length - 1) == i ? "" : ",");
      }
    }
    return result;
  }

  setPurchaseRestriction() {
    var i;
    this.selectedRestrictedList = [];
    var array = this.objServicesData.RestrictedCustomerTypeID.split(',');
    for (i = 0; i < array.length; ++i) {
      var result = this.restrictedList.find(m => m.value == Number(array[i]));
      if (result) {
        this.selectedRestrictedList.push(result)
      }
    }
    // check if all selected set All true
    if (this.restrictedList && this.selectedRestrictedList && this.restrictedList.length == this.selectedRestrictedList.length) {
      setTimeout(() => {
        this.allRestrictionSelection.select();
      }, 100);
    }
  }


  onIsActiveChange() {
    if (!this.objServicesData.IsActive) {
      this.objServicesData.IsOnline = false;
      this.objServicesData.IsFeatured = false;
      this.objServicesData.EnableWaitList = false;
      this.objServicesData.ServicePackageList.forEach(i => i.IsHidePriceOnline = false);
    }
  }

  onIsOnlineChange() {
    if (!this.objServicesData.IsOnline) {
      this.objServicesData.IsFeatured = false;
      this.objServicesData.EnableWaitList = false;
      this.objServicesData.ServicePackageList.forEach(i => i.IsHidePriceOnline = false);
    }
  }

  onServiceNameUpdated() {
    this.objServicesData.ServiceName = this.objServicesData.ServiceName.trim();
  }

  onServiceDescriptionUpdated() {
    this.objServicesData.Description = this.objServicesData.Description.trim();
  }

  onRemoveServicePackage(
    serviceId: number,
    servicePackageID: number,
    index: number
  ) {
    if (servicePackageID && servicePackageID > 0) {
      this.deleteServicePackage(serviceId, servicePackageID, index);
    } else {
      this.removePaymentPlan(index);
    }
  }

  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this.discardImage();
        }
      }
    );
  }

  // #endregion

  // #region Methods

  getFundamentals() {
    this._httpService.get(ServiceApi.getFundamentals).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.setFundamentals(response);
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  getServiceByIdAndFundamentals() {
    let getFundamentals = this._httpService.get(ServiceApi.getFundamentals);
    let getServiceById = this._httpService.get(
      ServiceApi.getByID + this.serviceID
    );

    forkJoin([getFundamentals, getServiceById]).subscribe(
      (data) => {
        this.setResponseData(data);
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Service")
        );
      }
    );
  }

  setResponseData(data) {
    this.setFundamentals(data[0]);
    this.setServiceByIdData(data[1]);
  }

  setFundamentals(data) {
    this.serviceCategoryList = data.Result.ServiceCategoryList;
    this.facilityList = data.Result.FacilityList;
    this.durationTypeList = data.Result.DurationTypeList;
    this.taxList = data.Result.TaxList;
    this.IsServiceWaitList = data.Result.IsServiceWaitListOnline;
    this.setDefaultDropdownValues();
  }

  setServiceByIdData(data) {
    this.objServicesData = data.Result;
    this.serviceModelCopy = Object.assign({}, this.objServicesData);
    this.concatenateImagePath();
    //this.setVATList();
    this.setDefaultDropdownValues();
    // if (!this.objServicesData.ServicePackageList) {
    //   this.objServicesData.ServicePackageList = [];
    // }

    this.servicePackageCount = this.objServicesData.ServicePackageList.length;
    this.showPaymentDeleteButton =
      this.objServicesData.ServicePackageList.length > 1 ? true : false;

    this.setMultiSelectionDropdownValues();

    this.convertTwoNumbersDecimal();
    this.setPurchaseRestriction();
  }

  setMultiSelectionDropdownValues() {

    this.selectedTaxList = [];

    if (this.taxList) {
      this.taxList.forEach((tax) => {
        var result = this.objServicesData.ItemTax.find(it => it.TaxID == tax.TaxID);
        if (result)
          this.selectedTaxList.push(tax);
      });
    }

    if (this.taxList && this.selectedTaxList && this.selectedTaxList.length == this.taxList.length && this.taxList.length > 1) {
      setTimeout(() => {
        this.allSelectedTax.select();
      }, 100);
    }

    this.getTotalAmount();

    this.selectedFacilityList = [];
    if (this.facilityList) {
      this.facilityList.forEach((facility) => {
        if (this.objServicesData.ServiceFacilityList.find(it => it.FacilityID == facility.FacilityID))
          this.selectedFacilityList.push(facility);
      });
    }

    if (this.facilityList && this.selectedFacilityList && this.selectedFacilityList.length == this.facilityList.length && this.facilityList.length > 1) {
      setTimeout(() => {
        this.allSelectedFacilities.select();
      }, 100);
    }
  }

  setPackagePermission(packageId: number) {
    this.showFacilities = true;
    switch (packageId) {
      case this.package.WellnessBasic:
        break;
      case this.package.WellnessMedium:
        break;
      case this.package.FitnessBasic:
        break;
      case this.package.FitnessMedium:
        this.showFacilities = false;
        this.showHidePriceLabel = true;
        break;
      case this.package.WellnessTop:
        this.showHidePriceLabel = true;
        break;

      case this.package.Full:
        this.showFacilities = true;
        this.isPurchaseRestrictionAllowed = true;
        this.showHidePriceLabel = true;
        break;
    }


  }

  saveService(isvalid: boolean) {
    //console.log(this.selectedTaxList);
    if (
      this.validatePaymentPlans() &&
      isvalid &&
      (this.serviceFormData.dirty ||
        this.objServicesData.ImageFile != null ||
        this.objServicesData.ServicePackageList.length !=
        this.servicePackageCount || this.objServicesData.ServiceCategoryID > 0)
    ) {
      this.hasSuccess = false;
      this.hasError = false;
      //   this.addVATIDinServicePackage();
      //this.setFacilityList();
      //this.mapSeletedVATList();
      //  this.removeExtraPropertiesFromServicePackage();

      this.objServicesData.RestrictedCustomerTypeID = this.listToCommaSeparatedString(this.selectedRestrictedList);
      this._httpService.save(ServiceApi.save, this.objServicesData).subscribe(
        (res: any) => {
          if (res && res.MessageCode > 0) {
            // if (this.objServicesData.ServiceID > 0) {
            // Show Success Message and Redirect to Search
            this.serviceModelCopy = Object.assign({}, this.objServicesData);
            this._messageService.showSuccessMessage(
              this.messages.Success.Save_Success.replace("{0}", "Service")
            );
            this._router.navigate(["setup/service"]);
            //}
            // else {
            // Show Success Message
            // this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
            // Reset form for next Service
            // this.resetForm();
            // }
          } else if (res && res.MessageCode < 0) {
            this._messageService.showErrorMessage(res.MessageText);
          } else {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace("{0}", "Service")
            );
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Service")
          );
        }
      );
    }
  }

  // mapSeletedVATList() {
  //   this.objServicesData.ItemTax = [];
  //   if (this.taxList && this.taxList.length > 0) {
  //     let selectedTax = this.taxList.filter((m) => m.IsSelected);
  //     selectedTax.forEach((item) => {
  //       this.objServicesData.ItemTax.push({ TaxID: item.TaxID });
  //     });
  //   }
  // }

  removeExtraPropertiesFromServicePackage() {
    this.objServicesData.ServicePackageList.forEach((servicePakcage) => {
      delete servicePakcage.TotalPrice;
    });
  }

  // setFacilityList() {
  //   this.objServicesData.ServiceFacilityList = [];
  //   if (this.facilityList && this.facilityList.length > 0) {
  //     let selectedFacilities = this.facilityList.filter(
  //       (f) => f.IsSelected === true
  //     );
  //     if (selectedFacilities && selectedFacilities.length > 0) {
  //       selectedFacilities.forEach((sf) => {
  //         let newFacility = new ServiceFacility();
  //         newFacility.FacilityID = sf.FacilityID;
  //         this.objServicesData.ServiceFacilityList.push(newFacility);
  //       });
  //     }
  //   }
  // }

  setDefaultDropdownValues() {

    // if (this.serviceCategoryList) {
    //   this.objServicesData.ServiceCategoryID = !this.objServicesData
    //     .ServiceCategoryID
    //     ? this.serviceCategoryList[0].ServiceCategoryID
    //     : this.objServicesData.ServiceCategoryID;
    // }

    // if (this.facilityList && this.facilityList.length > 0) {
    //   this.facilityList.forEach((f) => (f.IsSelected = false));

    //   if (
    //     this.objServicesData.ServiceFacilityList &&
    //     this.objServicesData.ServiceFacilityList.length > 0
    //   ) {
    //     this.objServicesData.ServiceFacilityList.forEach((sf) => {
    //       this.facilityList.filter(
    //         (fl) => fl.FacilityID === sf.FacilityID
    //       )[0].IsSelected = true;
    //     });
    //   }
    // }

    this.setDefaultPaymentPlanValues();
  }

  setDefaultPaymentPlanValues() {
    this.objServicesData.ServicePackageList.forEach((servicePkg) => {
      servicePkg.DurationTypeID =
        !servicePkg.DurationTypeID || servicePkg.DurationTypeID <= 0
          ? this.durationTypeList[0].DurationTypeID
          : servicePkg.DurationTypeID;

      servicePkg.DurationValue =
        !servicePkg.DurationValue || servicePkg.DurationValue < this.minDuration
          ? this.minDuration
          : servicePkg.DurationValue;

      servicePkg.Price =
        !servicePkg.Price || servicePkg.Price < this.minPrice
          ? this.minPrice
          : servicePkg.Price;
      servicePkg.TotalPrice = this._taxCalculationService.getRoundValue(
        !servicePkg.TotalPrice || servicePkg.TotalPrice < this.minTotalPrice
          ? this.minTotalPrice
          : servicePkg.TotalPrice
      );
    });
  }

  showImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        height: 460,
        width: 720,
        aspectRatio: 36 / 23,
        showWebCam: true,
      },
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.objServicesData.ImageFile = img;
        this.concatenateImagePath();
        this.serviceFormData.form.markAsDirty();
      }
    });
  }

  // calculatePrice(taxPercentage: number) {
  //   let selectedVatValue: number;
  //   selectedVatValue = this._taxCalculationService.getTaxAmount(taxPercentage, this.productDataObj.Price);
  //   this.totalPrice = parseFloat(this.totalPrice) + selectedVatValue;
  //   this.totalPrice = this._taxCalculationService.getRoundValue(this.totalPrice);
  // }

  concatenateImagePath() {
    this.imagePath = "";
    if (
      this.objServicesData.ImageFile &&
      this.objServicesData.ImageFile != ""
    ) {
      this.imagePath =
        "data:image/jpeg;base64," + this.objServicesData.ImageFile;
      this.isImageExist = true;
    } else if (
      this.objServicesData.ImagePath != undefined &&
      this.objServicesData.ImagePath != ""
    ) {
      this.imagePath =
        this.serverImageAddress.replace(
          "{ImagePath}",
          AppUtilities.setOtherImagePath()
        ) + this.objServicesData.ImagePath;
      this.isImageExist = true;
    } else {
      this.isImageExist = false;
    }
  }

  setImageFilePath() {
    if (this.objServicesData.ImageFile == null) {
      this.objServicesData.ImageFile = this.objServicesData.ImagePath;
    }
  }

  getServiceIdFromRoute() {
    this._route.paramMap.subscribe((params) => {
      this.serviceID = +params.get("ServiceID");
    });
  }

  addPaymentPlan() {
    this.paymentPlanID++;
    this.objServicePackageData = new ServicePackage();
    this.objServicesData.ServicePackageList.push(this.objServicePackageData);
    this.setDefaultPaymentPlanValues();
    //this.calculateVATandTotalPrice();
    this.markFormAsDirty();
    this.showPaymentDeleteButton = true;
  }

  deleteServicePackage(
    serviceId: number,
    servicePackageId: number,
    index: number
  ) {
    let url = ServiceApi.deleteServicePackage
      .replace("{serviceID}", serviceId.toString())
      .replace("{servicePackageID}", servicePackageId.toString());
    this._httpService.delete(url).subscribe(
      (response) => {
        if (response && response.MessageCode > 0) {
          this.removePaymentPlan(index);
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Delete_Error.replace("{0}", "Service Package")
        );
      }
    );
  }

  removePaymentPlan(index: number) {
    if (this.objServicesData.ServicePackageList.length > 1) {
      this.objServicesData.ServicePackageList.splice(index, 1);
      this.markFormAsDirty();
      this.validatePaymentPlans();
      if (this.objServicesData.ServicePackageList.length == 1) {
        this.showPaymentDeleteButton = false;
      }
    }
  }

  removePaymentPlanAfterUpdate() {
    if (this.servicePackageCount > 1) {
      for (var i = this.servicePackageCount; i >= 1; i--) {
        this.objServicesData.ServicePackageList.splice(i, 1);
      }
    }
  }

  preventDecimalValue(e: any) {
    if (e.key === ".") e.preventDefault();
  }

  validatePaymentPlans() {
    this.arePaymentPlansValid = true;

    this.objServicesData.ServicePackageList.forEach(
      (servicePackage: ServicePackage) => {
        if (
          !servicePackage.DurationValue ||
          servicePackage.DurationValue < this.minDuration
        ) {
          return (this.arePaymentPlansValid = false);
        }

        if (servicePackage.Price < this.minPrice) {
          return (this.arePaymentPlansValid = false);
        }
      }
    );

    return this.arePaymentPlansValid;
  }

  convertTwoNumbersDecimal() {
    //this.calculateVATandTotalPrice();
    if (this.objServicesData.ServicePackageList) {
      this.objServicesData.ServicePackageList.forEach((servicePackage) => {
        servicePackage.TotalPrice = this._taxCalculationService.getRoundValue(
          servicePackage.TotalPrice
        );
      });
    }
  }

  // setVATList() {
  //   if (
  //     this.objServicesData.ItemTax &&
  //     this.objServicesData.ItemTax.length > 0
  //   ) {
  //     this.taxList.forEach((VAT) => {
  //       if (
  //         this.objServicesData.ItemTax.filter((m) => m.TaxID === VAT.TaxID)
  //           .length > 0
  //       ) {
  //         VAT.IsSelected = true;
  //         this.calculatePrice(VAT.TaxPercentage);
  //       }
  //     });
  //   } else {
  //     if (this.objServicesData.ServicePackageList) {
  //       this.objServicesData.ServicePackageList.forEach((servicePackage) => {
  //         servicePackage.TotalPrice = this._taxCalculationService.getRoundValue(
  //           servicePackage.TotalPrice
  //         );
  //       });
  //     }
  //   }
  // }

  // calculateVATandTotalPrice() {
  //   this.objServicesData.ServicePackageList.forEach((servicePakcage) => {
  //     servicePakcage.TotalPrice = servicePakcage.Price;
  //     let selectedVatValue: number;
  //     if (
  //       this.taxList &&
  //       this.taxList.length > 0 &&
  //       this.taxList.filter((m) => m.IsSelected).length > 0
  //     ) {
  //       let filteredSelectedTax = this.taxList.filter((m) => m.IsSelected);
  //       filteredSelectedTax.forEach((selectedVAT) => {
  //         selectedVatValue = this._taxCalculationService.getTaxAmount(
  //           selectedVAT.TaxPercentage,
  //           servicePakcage.Price,
  //           3
  //         );
  //         servicePakcage.TotalPrice =
  //           parseFloat(servicePakcage.TotalPrice) + selectedVatValue;
  //         servicePakcage.TotalPrice = this._taxCalculationService.getRoundValue(
  //           servicePakcage.TotalPrice
  //         );
  //       });
  //     } else {
  //       if (servicePakcage.TotalPrice) {
  //         servicePakcage.TotalPrice = this._taxCalculationService.getRoundValue(
  //           servicePakcage.TotalPrice
  //         );
  //       }
  //     }
  //   });
  // }

  markFormAsDirty() {
    setTimeout(() => {
      this.serviceFormData.form.markAsDirty();
    });
  }

  resetForm() {
    if (this.objServicesData.ServiceID > 0) {
      this.objServicesData = Object.assign({}, this.serviceModelCopy);
      if (this.isDeleted) {
        this.objServicesData.ImagePath = "";
      }

      this.setMultiSelectionDropdownValues();
      // this.objServicesData.ImagePath = "";
    } else {
      this.serviceFormData.resetForm();
      setTimeout(() => {
        this.objServicesData = new Service();
        this.objServicePackageData = new ServicePackage();
        this.objServicesData.ServicePackageList.push(
          this.objServicePackageData
        );
        this.selectedTaxList = [];
        this.selectedFacilityList = [];
        this.setDefaultDropdownValues();
      });
    }
    this.concatenateImagePath();
  }

  discardImage() {
    this._commonService
      .deleteFile(
        ENU_Permission_Setup.Service_Save,
        this.objServicesData.ServiceID,
        this.objServicesData.ImagePath
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Delete_Success.replace("{0}", "Image")
            );
            this.objServicesData.ImageFile = "";
            this.objServicesData.ImagePath = "";
            this.isDeleted = true;
            this.serviceFormData.form.markAsDirty();
            this.concatenateImagePath();
          } else {
            this._messageService.showErrorMessage(
              this.messages.Error.Delete_Error.replace("{0}", "Image")
            );
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Delete_Error.replace("{0}", "Image")
          );
        }
      );
  }

  // #endregion
}

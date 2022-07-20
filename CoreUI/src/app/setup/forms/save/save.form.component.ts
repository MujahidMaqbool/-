/********************* Angular References ********************/
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Messages } from 'src/app/helper/config/app.messages';
import { ElementRef } from '@angular/core';

/********************** Services & Model *********************/
import { ApiResponse } from 'src/app/models/common.model';
import { FundamentalsItems, FundamentalsMemberships, Items, Memberships, SaveCustomFormModel } from 'src/app/setup/models/custom.form.model';

import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { FormApi } from 'src/app/helper/config/app.webapi';
import { ENU_CustomFormItemType, ENU_FormType, ENU_MemberShipItemTypeName, ENU_MobileOperatingSystem, ENU_Package } from 'src/app/helper/config/app.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { FormItemsComponent } from './save-form-items-popup/save.form.items.popup.component';
import { field, value } from 'src/app/setup/models/form.model';
import { DropEffect } from 'ngx-drag-drop/dnd-types';
import { DndDropEvent } from 'ngx-drag-drop/dnd-dropzone.directive';
import { ViewFormComponent } from 'src/app/shared/components/forms/view/view.form.component';
import { CustomFormView, CustomerFormsInfromation } from 'src/app/models/customer.form.model';
import { SaveMembershipFormComponent } from './save-form-membership-popup/save.form.membership.popup.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Configurations } from 'src/app/helper/config/app.config';
import { SubscriptionLike } from 'rxjs';
import { DataSharingService } from 'src/app/services/data.sharing.service';

@Component({
  selector: 'form-save',
  templateUrl: './save.form.component.html'
})
export class FormSaveComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

  /* Model References */
  saveCustomForm = new SaveCustomFormModel();
  viewFormModel = new CustomFormView();
  selectedMembershipsList: Memberships[];
  selectedClassesList: Items[];
  selectedServicesList: Items[];
  selectedProductsList: Items[];
  itemList: FundamentalsItems[];
  memberShipList: FundamentalsMemberships[];

  /* Local Members */
  formID: number;
  showStepNum: number = 1;
  deviceID: number;

  isShowNext: boolean = false;
  isShowPreview: boolean = false;
  isShowPrevious: boolean = false;
  isShowSave: boolean = false;

  totalClassesCount: number = 0;
  totalServicesCount: number = 0;
  totalProductsCount: number = 0;
  totalMembershipsCount: number = 0;

  /* Messages */
  messages = Messages;
  addMembershipsError: boolean = false;
  customerSignupError: boolean = false;
  customerError: boolean = false;
  showFormDetailsValidation: boolean = false;
  addItemValidationMessage: string;
  addItemValidation: boolean = false;
  showFormError: boolean = false;
  showMandatoryFormError: boolean = false;
  success = false;
  isESignatureAdded: boolean = false;

  /* Configurations */
  enuItemType = ENU_CustomFormItemType;
  enuFormTypes = ENU_FormType;
  allowedNumberKeysForClassBooking = Configurations.AllowedNumberKeysForClassBooking;
  package = ENU_Package;

  packageIdSubscription: SubscriptionLike;

  /* Form model */
  value: value = {
    label: "",
    value: ""
  };

  fieldModels: Array<field> = [
    {
      "type": "text",
      "label": "Short Answer",
      "placeholder": "Enter your short answer",
      "error": false,
    },
    {
      "type": "textarea",
      "placeholder": "Enter your long answer",
      "label": "Long Answer",
      "error": false,
      "value": ""
    },
    {
      "type": "textarea-readonly",
      "label": "Display Text",
      "error": false,
      "value": ""
    },
    {
      "type": "email",
      "label": "Email",
      "placeholder": "Enter your email",
      "regex": "^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_.-]+)\.([a-zA-Z]{2,5})$",
      "errorText": "Please enter a valid email",
      "error": false,
    },
    {
      "type": "phone",
      "label": "Phone",
      "placeholder": "Enter your phone",
      "regex": "(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})",
      "errorText": "Please enter a valid phone number",
      "error": false,
    },
    {
      "type": "paragraph",
      "label": "Paragraph",
      "value": "Type your text to display here only",
      "error": false,
    },
    {
      "type": "number",
      "label": "Number",
      "description": "Age",
      "placeholder": "Enter your number",
      "min": 12,
      "max": 90,
      "error": false,
    },
    {
      "type": "date",
      "label": "Date",
      "placeholder": "Enter Date",
      "error": false,
    },
    {
      "type": "datetime-local",
      "label": "DateTime",
      "placeholder": "Enter Date Time",
      "error": false,
    },
    {
      "type": "checkbox",
      "label": "Checkbox",
      "error": false,
      "values": [
        {
          "label": "Option 1",
          "value": "option-1"
        },
        {
          "label": "Option 2",
          "value": "option-2"
        }
      ]
    },
    {
      "type": "radio",
      "label": "Radio",
      "description": "Radio boxes",
      "error": false,
      "values": [
        {
          "label": "Option 1",
          "value": "option-1"
        },
        {
          "label": "Option 2",
          "value": "option-2"
        }
      ]
    },
    {
      "type": "autocomplete",
      "label": "Dropdown",
      "placeholder": "Dropdown",
      "error": false,
      "values": [
        {
          "label": "Option 1",
          "value": "option-1"
        },
        {
          "label": "Option 2",
          "value": "option-2"
        },
        {
          "label": "Option 3",
          "value": "option-3"
        }
      ]
    },
    {
      "type": "eSignature",
      "label": "eSignature",
      "error": false,
    }
  ];

  modelFields: Array<field> = [];

  model: any = {
    theme: {
      bgColor: "#ffffff",
      textColor: "#000000"
    },
    attributes: this.modelFields
  };
  hasFacilityInPackage: boolean;

  constructor(
    private _router: Router,
    private _httpService: HttpService,
    private route: ActivatedRoute,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    private _dataSharingService: DataSharingService,
  ) {
    super();
  }

  ngOnInit() {
    this.getFormIdFromRoute();
    this.checkPackagePermissions();
    this.deviceID = super.getMobileOperatingSystem();

    if (this.formID > 0) {
      Promise.all([
        this.getFormConfigurationFundamentals(),
      ]).then(
        success => {
          this.getFormById(this.formID)
        });
    }
    else {
      this.selectedMembershipsList = new Array<Memberships>();
      this.selectedServicesList = new Array<Items>();
      this.selectedClassesList = new Array<Items>();
      this.selectedProductsList = new Array<Items>();

      this.getFormConfigurationFundamentals();
    }

    this.isShowNext = true;
    this.isShowPreview = false;
    this.isShowPrevious = false;
    this.isShowSave = false;
    this.showStepNum = 1;
  }

  ngOnDestroy() {
    document.body.style.overflow = "visible";
  }


  // #region Events

  onChangeIsActive() {
    if (!this.saveCustomForm.IsActive) {
      this.saveCustomForm.IsMandatory = false;
    }
  }

  onAddItemsPopup(itemTypeID: number) {

    var _itemList = this.itemList.filter(i => i.ItemTypeID == itemTypeID);
    if (_itemList && _itemList.length > 0) {
      const dialogRef = this._dialog.open(FormItemsComponent, {
        disableClose: true,
        data: _itemList
      });

      dialogRef.componentInstance.onItemsSelect.subscribe((selectedItems: FundamentalsItems[]) => {
        this.getSelectedItems(selectedItems, itemTypeID);
      })
    } else {
      if (this.enuItemType.Class == itemTypeID) {
        this._messageService.showErrorMessage(this.messages.Validation.NoExist.replace("{0}", "class"));
      } else if (this.enuItemType.Service == itemTypeID) {
        this._messageService.showErrorMessage(this.messages.Validation.NoExist.replace("{0}", "service"));
      } else {
        this._messageService.showErrorMessage(this.messages.Validation.NoExist.replace("{0}", "product"));
      }
    }

  }

  getSelectedItems(selectedItems: FundamentalsItems[], itemTypeID: number) {

    if (itemTypeID == this.enuItemType.Class) {
      this.selectedClassesList = new Array<Items>();
    } else if (itemTypeID == this.enuItemType.Service) {
      this.selectedServicesList = new Array<Items>();
    } else {
      this.selectedProductsList = new Array<Items>();
    }

    selectedItems.forEach(category => {
      category.ItemList.forEach(item => {
        if (item.IsSelected) {
          if (itemTypeID == this.enuItemType.Class) {
            this.selectedClassesList.push({ ItemID: item.ItemID });
          } else if (itemTypeID == this.enuItemType.Service) {
            this.selectedServicesList.push({ ItemID: item.ItemID });
          } else {
            this.selectedProductsList.push({ ItemID: item.ItemID });
          }
        }
      });
    });
  }

  onAddMembershipPopup() {
    if (this.memberShipList && this.memberShipList.length > 0) {
      const dialogRef = this._dialog.open(SaveMembershipFormComponent, {
        disableClose: true,
        data: this.memberShipList
      });

      dialogRef.componentInstance.onMembershipsSelect.subscribe((selectedMemberships: FundamentalsMemberships[]) => {
        this.getSelectedMemberships(selectedMemberships);
      })
    } else {
      this._messageService.showErrorMessage(this.messages.Validation.NoExist.replace("{0}", "membership"));
    }
  }

  getSelectedMemberships(selectedMemberships: FundamentalsMemberships[]) {
    this.selectedMembershipsList = new Array<FundamentalsMemberships>();

    if(selectedMemberships && selectedMemberships.find(m => m.IsSelected)){
      this.addMembershipsError = false;
    }

    selectedMemberships.forEach(membership => {
      if (membership.IsSelected) {
        this.selectedMembershipsList.push({ MembershipID: membership.MembershipID });
      }
    });
  }

  onFormTypeChange() {

    this.customerSignupError = false;
    this.customerError = false;
    this.addItemValidation = false;

    this.selectedMembershipsList = new Array<Memberships>();
    this.selectedServicesList = new Array<Items>();
    this.selectedClassesList = new Array<Items>();
    this.selectedProductsList = new Array<Items>();

    this.saveCustomForm.OnBookingClass = false;
    this.saveCustomForm.OnEveryClass = false;
    this.saveCustomForm.IsAllClasses = false;

    this.saveCustomForm.OnBookingService = false;
    this.saveCustomForm.OnEveryService = false;
    this.saveCustomForm.IsAllServices = false;

    this.saveCustomForm.OnBookingProducts = false;
    this.saveCustomForm.OnEveryProduct = false;
    this.saveCustomForm.IsAllProducts = false;

    this.saveCustomForm.IsClient = false;
    this.saveCustomForm.IsExistingCustomer = false;
    this.saveCustomForm.IsLead = false;
    this.saveCustomForm.IsMember = false;

    this.saveCustomForm.IsVisibleToCustomer = false;

  }

  onFormNameTrim() {
    this.showFormDetailsValidation = false;
    this.saveCustomForm.FormName = this.saveCustomForm.FormName ? this.saveCustomForm.FormName.trim() : this.saveCustomForm.FormName;
  }

  onDescriptionTrim() {
    this.showFormDetailsValidation = false;
    this.saveCustomForm.Description = this.saveCustomForm.Description ? this.saveCustomForm.Description.trim() : this.saveCustomForm.Description;
  }

  onCustomerSignUpSettingChange() {
    this.customerSignupError = false;
  }

  onIsMemberChange() {

    this.selectedMembershipsList = new Array<Memberships>();

    this.memberShipList.forEach(membership => {
      membership.IsSelected = this.saveCustomForm.IsMember;
      if (this.saveCustomForm.IsMember)
        this.selectedMembershipsList.push({ MembershipID: membership.MembershipID });
    });

    this.addMembershipsError = false;
    this.customerSignupError = false;
  }

  onBookingClassesChange() {

    this.selectedClassesList = new Array<Items>();

    this.saveCustomForm.IsAllClasses = this.saveCustomForm.OnBookingClass;
    this.itemList.forEach(category => {
      if (category.ItemTypeID == this.enuItemType.Class) {
        category.IsSelected = this.saveCustomForm.OnBookingClass;
        category.ItemList.forEach(item => {
          item.IsSelected = this.saveCustomForm.OnBookingClass;
          if (this.saveCustomForm.OnBookingClass)
            this.selectedClassesList.push({ ItemID: item.ItemID });
        });
      }
    });

    if (!this.saveCustomForm.OnBookingClass) {
      this.saveCustomForm.OnEveryClass = false;
      this.saveCustomForm.IsAllClasses = false;
    }

    this.customerError = false;
    this.addItemValidation = false;
  }

  onBookingServiceChange() {

    this.selectedServicesList = new Array<Items>();

    this.itemList.forEach(category => {
      if (category.ItemTypeID == this.enuItemType.Service) {
        category.IsSelected = this.saveCustomForm.OnBookingService;
        category.ItemList.forEach(item => {
          item.IsSelected = this.saveCustomForm.OnBookingService;
          if (this.saveCustomForm.OnBookingService)
            this.selectedServicesList.push({ ItemID: item.ItemID });
        });
      }
    });

    if (!this.saveCustomForm.OnBookingService) {
      this.saveCustomForm.OnEveryService = false;
      this.saveCustomForm.IsAllServices = false;
    }

    this.customerError = false;
    this.addItemValidation = false;
  }

  onBookingProductChange() {

    this.selectedProductsList = new Array<Items>();

    this.itemList.forEach(category => {
      if (category.ItemTypeID == this.enuItemType.Product) {
        category.IsSelected = this.saveCustomForm.OnBookingProducts;
        category.ItemList.forEach(item => {
          item.IsSelected = this.saveCustomForm.OnBookingProducts;
          if (this.saveCustomForm.OnBookingProducts)
            this.selectedProductsList.push({ ItemID: item.ItemID });
        });
      }
    });

    if (!this.saveCustomForm.OnBookingProducts) {
      this.saveCustomForm.OnEveryProduct = false;
      this.saveCustomForm.IsAllProducts = false;
    }

    this.customerError = false;
    this.addItemValidation = false;
  }

  onNext() {

    if (!this.saveCustomForm.FormName) {
      this.showFormDetailsValidation = true;
    } else if (this.saveCustomForm.FormTypeID == this.enuFormTypes.Signup) {
      if (!this.saveCustomForm.IsClient && !this.saveCustomForm.IsExistingCustomer && !this.saveCustomForm.IsLead && !this.saveCustomForm.IsMember) {
        this.customerSignupError = true;
      } else if (this.saveCustomForm.IsMember && this.selectedMembershipsList.length == 0) {
        this.addMembershipsError = true;
      } else {
        this.isShowNext = false;
        this.isShowPreview = true;
        this.isShowPrevious = true;
        this.isShowSave = true;
        this.showStepNum = 2;
        this.setWindowScrollOff();
      }
    } else if (this.saveCustomForm.FormTypeID == this.enuFormTypes.CustomerPurchase) {
      this.addItemValidation = false;
      if (!this.saveCustomForm.OnBookingClass && !this.saveCustomForm.OnBookingService && !this.saveCustomForm.OnBookingProducts) {
        this.customerError = true;
      } else if (this.saveCustomForm.OnBookingClass && this.selectedClassesList.length == 0 &&
        this.saveCustomForm.OnBookingService && this.selectedServicesList.length == 0 &&
        this.saveCustomForm.OnBookingProducts && this.selectedProductsList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_one_Class_And_Service_And_Product_To_Proceed;
      } else if (this.saveCustomForm.OnBookingClass && this.selectedClassesList.length == 0 &&
        this.saveCustomForm.OnBookingService && this.selectedServicesList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_one_Class_And_Service_To_Proceed;
      } else if (this.saveCustomForm.OnBookingClass && this.selectedClassesList.length == 0 &&
        this.saveCustomForm.OnBookingProducts && this.selectedProductsList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_one_Class_And_Product_To_Proceed;
      } else if (this.saveCustomForm.OnBookingService && this.selectedServicesList.length == 0 &&
        this.saveCustomForm.OnBookingProducts && this.selectedProductsList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_one_Service_And_Product_To_Proceed;
      } else if (this.saveCustomForm.OnBookingClass && this.selectedClassesList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_One_Class_To_Proceed;
      } else if (this.saveCustomForm.OnBookingService && this.selectedServicesList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_One_Service_To_Proceed;
      } else if (this.saveCustomForm.OnBookingProducts && this.selectedProductsList.length == 0) {
        this.addItemValidation = true;
        this.addItemValidationMessage = this.messages.Validation.Please_Add_At_Least_One_Product_To_Proceed;
      } else {
        this.isShowNext = false;
        this.isShowPreview = true;
        this.isShowPrevious = true;
        this.isShowSave = true;
        this.showStepNum = 2;
        this.setWindowScrollOff();
      }
    } else {
      this.isShowNext = false;
      this.isShowPreview = true;
      this.isShowPrevious = true;
      this.isShowSave = true;
      this.showStepNum = 2;
      this.setWindowScrollOff();

    }
  }

  onPrevious() {

    document.body.style.overflow = "visible";

    this.showMandatoryFormError = false;
    this.showFormError = false;

    this.isShowNext = true;
    this.isShowPreview = false;
    this.isShowPrevious = false;
    this.isShowSave = false;
    this.showStepNum = 1;
  }

  onPreview() {

    var savedCustomerForms = new CustomerFormsInfromation();
    savedCustomerForms.CustomFormView = new Array<CustomFormView>();
    this.viewFormModel.IsMandatory = this.saveCustomForm.IsMandatory;
    this.viewFormModel.FormName = this.saveCustomForm.FormName;
    this.viewFormModel.Description = this.saveCustomForm.Description;
    this.viewFormModel.JsonText = this.model;

    savedCustomerForms.CustomFormView.push(this.viewFormModel);
    savedCustomerForms.isViewForm = true;

    this._dialog.open(ViewFormComponent, {
      disableClose: true,
      data: savedCustomerForms
    });
  }

  setWindowScrollOff() {
    if (this.deviceID == ENU_MobileOperatingSystem.DesktopSafari || this.deviceID == ENU_MobileOperatingSystem.unknown) {
      document.body.style.overflow = "hidden";
    }
  }

  //form methods

  onDisplayTextChange(index: number, itemType: string) {
    //if(itemType == 'textarea-readonly'){
    this.model.attributes[index].rows = this.model.attributes[index].value && this.model.attributes[index].value.length > 120 ? this.model.attributes[index].value.length / 120 : this.model.attributes[index].value && this.model.attributes[index].value.length <= 120 ? 3 : 10;
    this.model.attributes[index].rows = this.model.attributes[index].rows < 2 ? 3 : this.model.attributes[index].rows;
    //}
  }

  onDragStart(event: DragEvent) {
    //console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent, item: any) {
    this.showFormError = false;

    if (item.type == 'eSignature') {
      this.isESignatureAdded = true;
    }

    //console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {
    //console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {
    //console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDragged(item: any, list: any[], effect: DropEffect) {
    if (effect === "move") {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  onDragCanceled(event: DragEvent) {
    //console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {
    //console.log("dragover", JSON.stringify(event, null, 2));
  }

  onChangeRequired() {
    this.showMandatoryFormError = false;
  }

  onDrop(event: DndDropEvent, list?: any[]) {
    if (list && (event.dropEffect === "copy" || event.dropEffect === "move")) {

      if (event.dropEffect === "copy")
        event.data.name = event.data.type + '-' + new Date().getTime();
      let index = event.index;
      if (typeof index === "undefined") {
        index = list.length;
      }
      list.splice(index, 0, event.data);
    }
  }

  addValue(values, newValue) {
    var value = {
      label: newValue,
      value: values.length + 1
    }
    values.push(value);
    newValue = "";
  }

  addFirstValue(values) {
    this.value.value = values.length + 1;
    values.push(this.value);
    this.value = { label: "", value: "" };
  }

  onDeleteSelectionBox(values){
    if(values){
      values.forEach(item => {
        item.newValue = '';
      });
    }
  }

  removeField(i) {

    const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
      disableClose: true
    });

    var _title = this.model.attributes[i].label && this.model.attributes[i].label.length > 50 ? this.model.attributes[i].label.substring(0, 50) + "..." : this.model.attributes[i].label ? this.model.attributes[i].label : this.messages.Confirmation.Delete_Field;
    confirmDialog.componentInstance.Title = _title;
    confirmDialog.componentInstance.Message = this.messages.Confirmation.Are_You_Sure_You_Want_To_Delete_This_Field;

    confirmDialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        if (this.model.attributes[i].type == 'eSignature') {
          this.isESignatureAdded = false;
        }

        this.model.attributes.splice(i, 1);
      }
    })

  }

  toggleValue(item) {
    item.selected = !item.selected;
  }

  // Prevent Charactors
  preventCharactersForClassBooking(event: any) {
    let index = this.allowedNumberKeysForClassBooking.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
  }

  onSave() {
    if (this.model.attributes && this.model.attributes.length > 0) {
      // if(this.saveCustomForm.IsMandatory){
      //   var result = this.model.attributes.find(i => i.required);
      //   if(result == null){
      //     this.showMandatoryFormError = true;
      //   } else{
      //     this.saveForm();
      //   }
      // } else{
      this.saveForm();
      // }
    } else {
      this.showFormError = true;
    }
  }

  // #endregion 

  // #region Methods

  getFormIdFromRoute() {
    this.route.paramMap.subscribe(params => {
      this.formID = +params.get('FormID');
    });
  }

  getFormConfigurationFundamentals() {
    return this._httpService.get(FormApi.getFundamentals)
      .toPromise()
      .then((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.memberShipList = response.Result.MembershipListViewModel;
          this.itemList = response.Result.ItemViewModel;
          this.totalClassesCount = response.Result.ClassCount;
          this.totalServicesCount = response.Result.ServiceCount;
          this.totalProductsCount = response.Result.ProductCount;
          this.totalMembershipsCount = this.memberShipList.length;
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Form Configuration Fundamentals")); }
      );
  }

  getFormById(formID: number) {
    return this._httpService.get(FormApi.getByID + formID)
      .toPromise()
      .then((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.saveCustomForm = response.Result;
          this.model = JSON.parse(this.saveCustomForm.JsonText);

          if (this.model.attributes.find(i => i.type == 'eSignature')) {
            this.isESignatureAdded = true;
          }

          if (this.model.theme.bgColor && !this.model.theme.bgColor.includes("#"))
            this.model.theme.bgColor = "#" + this.model.theme.bgColor;

          if (this.model.theme.textColor && !this.model.theme.textColor.includes("#"))
            this.model.theme.textColor = "#" + this.model.textColor;


          this.model.attributes.forEach(item => {
            if (item.type == 'textarea-readonly') {
              item.rows = item.value && item.value.length > 150 ? item.value.length / 150 : item.value && item.value.length <= 150 ? 4 : 10;
              item.rows = item.rows < 2 ? 3 : item.rows;
            }
          });

          this.model.attributes.forEach(item => {
            if (item.type == 'paragraph') {
              item.rows = item.value && item.value.length > 150 ? item.value.length / 150 : item.value && item.value.length <= 150 ? 4 : 10;
              item.rows = item.rows < 2 ? 3 : item.rows;
            }
          });

          if (this.saveCustomForm.IsMember) {
            if (this.saveCustomForm.IsAllMembership) {
              this.onIsMemberChange();
            } else {
              this.selectedMembershipsList = this.commaSeparatedStringToList(this.saveCustomForm.Memberships, this.enuItemType.MemberShip);
              this.setSelectedMemberships();
            }
          }

          if (this.saveCustomForm.OnBookingClass) {
            if (this.saveCustomForm.IsAllClasses) {
              this.onBookingClassesChange();
            } else {
              this.selectedClassesList = this.commaSeparatedStringToList(this.saveCustomForm.Classes, this.enuItemType.Class);
              this.setSelectedItems(this.enuItemType.Class);
            }
          }

          if (this.saveCustomForm.OnBookingService) {
            if (this.saveCustomForm.IsAllServices) {
              this.onBookingServiceChange();
            } else {
              this.selectedServicesList = this.commaSeparatedStringToList(this.saveCustomForm.Services, this.enuItemType.Service);
              this.setSelectedItems(this.enuItemType.Service);
            }
          }

          if (this.saveCustomForm.OnBookingProducts) {
            if (this.saveCustomForm.IsAllProducts) {
              this.onBookingProductChange();
            } else {
              this.selectedProductsList = this.commaSeparatedStringToList(this.saveCustomForm.Products, this.enuItemType.Product);
              this.setSelectedItems(this.enuItemType.Product);
            }
          }

        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Form"));
        }
      );
  }

  saveForm() {

    this.prepareFormModel();

    this._httpService.save(FormApi.save, this.saveCustomForm)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Form"));
          this._router.navigate(['/setup/form']);
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Form"));
        }
      );
  }

  prepareFormModel() {

    this.saveCustomForm.IsAllMembership = false;
    this.saveCustomForm.IsAllClasses = false;
    this.saveCustomForm.IsAllServices = false;
    this.saveCustomForm.IsAllProducts = false;

    if (this.saveCustomForm.IsMember) {
      if (this.totalMembershipsCount == this.selectedMembershipsList.length) {
        this.saveCustomForm.IsAllMembership = true;
      } else {
        this.saveCustomForm.Memberships = this.listToCommaSeparatedString(this.selectedMembershipsList, true);
      }
    }

    if (this.saveCustomForm.OnBookingClass) {
      if (this.totalClassesCount == this.selectedClassesList.length) {
        this.saveCustomForm.IsAllClasses = true;
      } else {
        this.saveCustomForm.Classes = this.listToCommaSeparatedString(this.selectedClassesList);
      }
    } else {
      this.saveCustomForm.Classes = '';
    }

    if (this.saveCustomForm.OnBookingService) {
      if (this.totalServicesCount == this.selectedServicesList.length) {
        this.saveCustomForm.IsAllServices = true;
      } else {
        this.saveCustomForm.Services = this.listToCommaSeparatedString(this.selectedServicesList);
      }
    } else {
      this.saveCustomForm.Services = '';
    }

    if (this.saveCustomForm.OnBookingProducts) {
      if (this.totalProductsCount == this.selectedProductsList.length) {
        this.saveCustomForm.IsAllProducts = true;
      } else {
        this.saveCustomForm.Products = this.listToCommaSeparatedString(this.selectedProductsList);
      }
    } else {
      this.saveCustomForm.Products = '';
    }

    this.model.attributes.forEach(item => {
      if (item.toggle)
        item.toggle = false;
    });

    if (this.model.theme.bgColor == "" || this.model.theme.bgColor == null || this.model.theme.bgColor == undefined) {
      this.model.theme.bgColor = "#ffffff";
    }

    if (this.model.theme.textColor == "" || this.model.theme.textColor == null || this.model.theme.textColor == undefined) {
      this.model.theme.textColor = "#000000";
    }

    this.saveCustomForm.JsonText = JSON.stringify(this.model);

    if (this.saveCustomForm.FormTypeID == this.enuFormTypes.RequestForm) {
      this.saveCustomForm.IsMandatory = false;
    }
    if (this.saveCustomForm.FormTypeID === ENU_FormType.Signup) {
      this.saveCustomForm.Classes = '';
      this.saveCustomForm.Services = '';
      this.saveCustomForm.Products = '';
    } else if (this.saveCustomForm.FormTypeID === ENU_FormType.CustomerPurchase) {
      this.saveCustomForm.Memberships = '';
    } else if (this.saveCustomForm.FormTypeID === ENU_FormType.RequestForm) {
      this.saveCustomForm.Memberships = '';
      this.saveCustomForm.Classes = '';
      this.saveCustomForm.Services = '';
      this.saveCustomForm.Products = '';
    }
  }

  setSelectedMemberships() {

    this.memberShipList.forEach(membership => {
      membership.IsSelected = this.selectedMembershipsList.find(m => m.MembershipID == membership.MembershipID) ? true : false;
    });
  }

  setSelectedItems(itemTypeID: number) {

    if (itemTypeID == this.enuItemType.Class) {
      this.itemList.forEach(category => {
        if (category.ItemTypeID == this.enuItemType.Class) {
          category.ItemList.forEach(item => {
            item.IsSelected = this.selectedClassesList.find(c => c.ItemID == item.ItemID) ? true : false;
          });
        }
      });
    } else if (itemTypeID == this.enuItemType.Service) {
      this.itemList.forEach(category => {
        if (category.ItemTypeID == this.enuItemType.Service) {
          category.ItemList.forEach(item => {
            item.IsSelected = this.selectedServicesList.find(c => c.ItemID == item.ItemID) ? true : false;
          });
        }
      });
    } else {
      this.itemList.forEach(category => {
        if (category.ItemTypeID == this.enuItemType.Product) {
          category.ItemList.forEach(item => {
            item.IsSelected = this.selectedProductsList.find(c => c.ItemID == item.ItemID) ? true : false;
          });
        }
      });
    }


  }

  listToCommaSeparatedString(arr: any, isMembership: boolean = false) {
    var i;
    var result: string = "";
    for (i = 0; i < arr.length; ++i) {
      if (isMembership) {
        result = result + arr[i].MembershipID + ((arr.length - 1) == i ? "" : ",");
      } else {
        result = result + arr[i].ItemID + ((arr.length - 1) == i ? "" : ",");
      }
    }
    return result;
  }

  commaSeparatedStringToList(val: string, itemTypeID: number) {
    var array = val.split(',');
    var i;
    var result: any = [];
    for (i = 0; i < array.length; ++i) {
      if (itemTypeID == this.enuItemType.MemberShip) {
        if (this.memberShipList.find(m => m.MembershipID == Number(array[i]))) {
          result.push({ MembershipID: array[i] });
        }
      } else {
        this.itemList.forEach(category => {
          if (category.ItemTypeID == itemTypeID && category.ItemList.find(j => j.ItemID == Number(array[i]))) {
            result.push({ ItemID: array[i] });
          }
        });
      }
    }
    return result;
  }

  gotoTop(i) {
    setTimeout(() => {
      // let el = document.getElementById(i);
      // el.scrollTop = el.scrollHeight;
      document.getElementById(i).scrollIntoView();
    }, 100);

  }

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
        if (packageId && packageId > 0) {
            this.setPackagePermissions(packageId);
        }
    })
  }

  setPackagePermissions(packageId: number) {
    this.hasFacilityInPackage = false;

    switch (packageId) {
        case this.package.FitnessBasic:
        case this.package.FitnessMedium:
        case this.package.Full:
            this.hasFacilityInPackage = true;
            break;
    }
  }

  // #endregion 

}
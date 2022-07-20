/********************** Angular References *********************************/
import { NgForm } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
/********************** Service & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/* Models */
import { ApiResponse } from 'src/app/models/common.model';
import { MembershipItemsBenefits, AddMembershipItemsBenefits, BranchWiseService, ServicePackageList, BranchSpecificItemType, BranchSpecificItemCategoryTypeList, BranchWiseServiceCategory } from 'src/app/setup/models/membership.model';

/********************** Common *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { MembershipApi } from 'src/app/helper/config/app.webapi';
import { NumberValidator } from 'src/app/shared/helper/number.validator';
import { ENU_MemberShipBenefitDurations, ENU_MemberShipItemTypeName } from 'src/app/helper/config/app.enums';

// import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'add-item-type',
  templateUrl: './add.item.type.component.html'
})
export class AddItemTypeComponent implements OnInit {

   // #region Definitions
   @ViewChild('membershipItemBenefitForm') membershipItemBenefitForm: NgForm;
   
   /* Messages */
   messages = Messages;
   showTotalSessionsValidation: boolean = false;
   showDiscountPercentageValidation: boolean = false;
 

  /* Configurations */
  enuMemberShipItemTypeName = ENU_MemberShipItemTypeName;
  enuMemberShipBenefitDurations = ENU_MemberShipBenefitDurations;
 
  /* Model References */

  selectedBranchList: any[] = [];
  branchSpecificItemTypeList: BranchSpecificItemType[];
  branchSpecificItemsList: BranchSpecificItemCategoryTypeList[] = new Array<BranchSpecificItemCategoryTypeList>();
  branchServiceList: BranchWiseService[];
  branchSpecificServiceList: BranchWiseServiceCategory[];
  showItemTypeValidation: boolean = false;
  selectedBranchSpecificItemTypeList: any[] = [];
  saveMembershipItemModel: MembershipItemsBenefits;
  showItemTypeValidationForNotExist: boolean = false;
  oldMembershipItemModelForEdit: MembershipItemsBenefits;
  numberValidator: NumberValidator = new NumberValidator();
  selectedMembershipItemsBenefits: MembershipItemsBenefits[]; 
  branchSpecificItemCategoryList: any[] = [];

  /* Local members*/
  itemTypeName: string = "";
  itemTypeHeading: string = "";
  isInvalidData: boolean = false;
  itemTypeValidationMessage: string = "";
  itemTypeValidationMessageForNotExist: string = "";
  itemsSelectionValidationMessage: string = "";
  isSelecteRequiredMsg: string = "";
  isAllClasses: boolean = false;

  isSelecteRequired: boolean = false;
  ////
  totalSessions: number;
  isFree: boolean = true;
  isNoLimit: boolean = true;
  discountPercentage: number;
  durationTypeID: number = this.enuMemberShipBenefitDurations.Membership;

  @Output() isClose = new EventEmitter<MembershipItemsBenefits>();
  @Output() savedItemType = new EventEmitter<MembershipItemsBenefits[]>();

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _dialogRef: MatDialogRef<AddItemTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMembershipItemsBenefits,

  ) { 
    this.saveMembershipItemModel = new MembershipItemsBenefits();
  }

  ngOnInit() {
    this.saveMembershipItemModel = this.data.MembershipItemsBenefit;

    switch(this.saveMembershipItemModel.ItemTypeID) {
      case this.enuMemberShipItemTypeName.Class:
        this.itemTypeName = "Class";
        this.itemTypeHeading = "Classes"
        break;
      case this.enuMemberShipItemTypeName.Service:
          this.itemTypeName = "Service";
          this.itemTypeHeading = "Services"
        break;
      default:
          this.itemTypeName = "Product";
          this.itemTypeHeading = "Products";
    }

    if(this.saveMembershipItemModel.IsEdit){
      this.setModelDataForEdit();
    }

    this.selectedBranchList = this.data.MembershipBranchList;
    this.selectedMembershipItemsBenefits = this.data.SelectedMembershipItemsBenefits;
    this.itemTypeValidationMessage = this.messages.Validation.Add_ItemType_In_Membership_For_Added.replace('{0}', this.itemTypeHeading.toLowerCase());
    this.itemTypeValidationMessageForNotExist = this.messages.Validation.Add_ItemType_In_Membership_For_Not_Created.replace('{0}', this.itemTypeHeading.toLowerCase());
    this.isSelecteRequiredMsg = this.messages.Validation.Add_ItemType_Required.replace('{0}', this.itemTypeName.toLowerCase());

  }

  // #region Events

  onBranchSelectionChange(branchID: number, isEdit: boolean = false){
    this.showItemTypeValidation = false
    this.showItemTypeValidationForNotExist = false;

    if(!isEdit){
      this.resetModelData();
    }

    if(branchID > 0){
      if(this.saveMembershipItemModel.ItemTypeID != this.enuMemberShipItemTypeName.Service){ //for add classes and products
        this.getBranchWiseBenefitTypes(branchID);
      } else { //for add services
        this.getBranchWiseServices(branchID);
      }
    } else {
      if(this.saveMembershipItemModel.ItemTypeID != this.enuMemberShipItemTypeName.Service){
        this.branchSpecificItemTypeList = [];
      }
      else{
        this.saveMembershipItemModel.ServiceID = 0
        this.branchSpecificServiceList = [];
        this.branchServiceList = [];      
      }
    }

  }

  onCloseDialog() {
    this._dialogRef.close();
  }

  onDiscountPercentageChangeOnlyNumbers(num: string){
    this.validateDiscountPercentage();
  }

  onBenefitSessionDurationChangeOnlyNumbers(num: string){
    this.validateTotalSessions();
    setTimeout(() => {
        this.totalSessions = this.numberValidator.NotAllowDecimalValue(num);
    }, 10);
  }

  noLimit_collapse_valueChanged(){
    setTimeout(() => { 
      this.isNoLimit = this.isNoLimit ? false : true;
      this.totalSessions = null;
      this.durationTypeID = this.enuMemberShipBenefitDurations.Membership
      //this.validateTotalSessions();
      this.showTotalSessionsValidation = false;
    }, 100);
  }

  free_collapse_valueChanged(){
    setTimeout(() => { 
     this.isFree = this.isFree ? false : true;
     this.discountPercentage = null;
    //this.validateDiscountPercentage();
    this.showDiscountPercentageValidation = false;
    }, 100);
  }

  // #endregion 

   // #region Methods

  setModelDataForEdit(){
    this.oldMembershipItemModelForEdit = this.data.MembershipItemsBenefit;
    this.isFree = this.saveMembershipItemModel.IsFree;
    this.durationTypeID = this.saveMembershipItemModel.DurationTypeID;
    this.discountPercentage = this.saveMembershipItemModel.DiscountPercentage;
    this.isNoLimit = this.saveMembershipItemModel.NoLimits;
    this.totalSessions = this.saveMembershipItemModel.TotalSessions;

    if(this.saveMembershipItemModel.ItemTypeID != this.enuMemberShipItemTypeName.Service){
      this.onBranchSelectionChange(this.saveMembershipItemModel.BranchID, true);
    } else {
      this.branchSpecificServiceList = [];
     
      let servicePackageList = new Array<ServicePackageList>();
      let servicePackage = new ServicePackageList();
      servicePackage.DurationTypeName = this.saveMembershipItemModel.DurationTypeName;
      servicePackage.DurationValue = this.saveMembershipItemModel.DurationValue;
      servicePackage.ServicePackageID = this.saveMembershipItemModel.ItemID;
      servicePackage.ServiceID = this.saveMembershipItemModel.ServiceID;
      servicePackage.IsSelected = true;
      servicePackageList.push(servicePackage);
 
      this.branchSpecificServiceList.push(
        {
          ServiceCategoryID: this.saveMembershipItemModel.ItemCategoryID,
          ServiceCategoryName: this.saveMembershipItemModel.ItemCategoryName,
          ServiceList: [
                    {
                      ServiceCategoryID: this.saveMembershipItemModel.ItemCategoryID,
                      ServiceCategoryName: this.saveMembershipItemModel.ItemCategoryName,
                      ServiceID: this.saveMembershipItemModel.ServiceID,
                      ServiceName: this.saveMembershipItemModel.ItemName,
                      IsSelected: true,
                      ServicePackageList: servicePackageList
                    }
                  ]
        }
      )
                     
    }
  }

  validateItemType(){
    var isValid: boolean = false;
    if(this.saveMembershipItemModel.ItemTypeID == this.enuMemberShipItemTypeName.Class){
      this.branchSpecificItemsList.forEach(itemType => {
        itemType.ItemList.forEach(item => {
          if(item.IsSelected){
            isValid = item.IsSelected
          }
        });  
      });  
    } else {
            this.branchSpecificServiceList.forEach(itemType => {
              itemType.ServiceList.forEach(service => {
                if(service.IsSelected){
                  isValid = service.IsSelected
                }
              });  
            });  
    }
    this.isSelecteRequired = isValid ? false : true;

    return isValid;

  }

  onSave(isValid: boolean){
      this.validateTotalSessions();
      this.validateDiscountPercentage();
      if(isValid && !this.showTotalSessionsValidation && !this.showDiscountPercentageValidation && this.validateItemType()){
        this.savedItemType.emit([]);

        let _membershipItemsBenefits = new Array<MembershipItemsBenefits>();

        if(this.saveMembershipItemModel.ItemTypeID == this.enuMemberShipItemTypeName.Service){
          this.branchSpecificServiceList.forEach(serviceCategory => {
            serviceCategory.ServiceList.forEach(service => {
              if(service.IsSelected){
                service.ServicePackageList.forEach(spackage => {
                  if (spackage.IsSelected) {
                    var mib = new MembershipItemsBenefits();
                    mib.BranchID = this.saveMembershipItemModel.BranchID;
                    mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == this.saveMembershipItemModel.BranchID).BranchName;
                    mib.DiscountPercentage = this.discountPercentage == 100 ? null : this.discountPercentage;
                    mib.DurationTypeID = this.durationTypeID;
                    mib.ItemCategoryID = serviceCategory.ServiceCategoryID;
                    mib.ItemCategoryName =  serviceCategory.ServiceCategoryName;
                    mib.IsFree = this.discountPercentage == 100 ? true : this.isFree;
                    mib.ItemID = spackage.ServicePackageID;
                    mib.DurationValue = spackage.DurationValue;
                    mib.DurationTypeName = spackage.DurationTypeName;
                    mib.ItemName = service.ServiceName;
                    mib.ServiceID = service.ServiceID;
                    mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
                    mib.MembershipID = this.saveMembershipItemModel.MembershipID;
                    mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
                    mib.NoLimits = this.isNoLimit;
                    mib.TotalSessions = this.totalSessions;
                    mib.IsEdit = this.saveMembershipItemModel.IsEdit;
                    _membershipItemsBenefits.push(mib);
                  }
                });
              }
            });  
        });  
        } else {
          this.branchSpecificItemsList.forEach(itemType => {
            itemType.ItemList.forEach(item => {

              if(item.IsSelected){
                var mib = new MembershipItemsBenefits();
                mib.BranchID = this.saveMembershipItemModel.BranchID;
                mib.ItemCategoryID = item.ItemCategoryID;
                mib.ItemCategoryName = item.ItemCategoryName;
                mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == this.saveMembershipItemModel.BranchID).BranchName;
                mib.DiscountPercentage = this.discountPercentage == 100 ? null : this.discountPercentage;
                mib.DurationTypeID = this.durationTypeID;
                mib.IsFree = this.discountPercentage == 100 ? true : this.isFree;
                mib.ItemID = item.ItemID;
                mib.ItemName = item.ItemName;
                mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
                mib.MembershipID = this.saveMembershipItemModel.MembershipID;
                mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
                mib.NoLimits = this.isNoLimit;
                mib.TotalSessions = this.totalSessions;
                mib.IsEdit = this.saveMembershipItemModel.IsEdit;
                _membershipItemsBenefits.push(mib);
              }

            });  
          });  
        }
       
        this.savedItemType.emit(_membershipItemsBenefits);
        
        this.onCloseDialog();
      } else {
        this.showValidationMessage(true);
      }
  }

  getBranchWiseBenefitTypes(branchID: number){
     this.branchSpecificItemsList = [];
    this.selectedBranchSpecificItemTypeList = [];
    this.branchSpecificItemCategoryList = [];
      this.branchSpecificItemTypeList = [];
      this._httpService.get(MembershipApi.getBranchWiseBenefitTypes + branchID + "/" + this.saveMembershipItemModel.ItemTypeID)
      .subscribe(
          (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                if(response.Result && response.Result.length > 0){
                  
                  //if item on edit mode push data for read only
                  if(this.saveMembershipItemModel.IsEdit){
                    response.Result.forEach(itemType => {
                      if(itemType.ItemID == this.saveMembershipItemModel.ItemID){
                        this.branchSpecificItemTypeList.push({ ItemID: itemType.ItemID, ItemName: itemType.ItemName, ItemCategoryID:itemType.ItemCategoryID, ItemCategoryName:itemType.ItemCategoryName, IsSelected:true });
                        this.selectedBranchSpecificItemTypeList.push(this.branchSpecificItemTypeList[0]);
                      }
                    })
                  }

                  // check already added item not add in list
                  if(this.selectedMembershipItemsBenefits && this.selectedMembershipItemsBenefits.length > 0){
                    response.Result.forEach(itemType => {
                      var result = this.selectedMembershipItemsBenefits.find(smib => smib.ItemID == itemType.ItemID);
                      if(!result){
                        this.branchSpecificItemTypeList.push({ ItemID: itemType.ItemID, ItemName: itemType.ItemName, ItemCategoryID:itemType.ItemCategoryID, ItemCategoryName:itemType.ItemCategoryName, IsSelected:false});                        
                      }
                    })
                  } else {
                    this.branchSpecificItemTypeList = response.Result;
                  }
                  /**group Items by category */
               
                ///////////////////////////////////////////////////
                this.branchSpecificItemsList = [];
                if(this.saveMembershipItemModel.IsEdit){
                        this.selectedBranchSpecificItemTypeList.forEach(item => {                                
                                this.branchSpecificItemsList.push(
                                  {
                                      ItemCategoryID: item.ItemCategoryID,
                                      ItemCategoryName: item.ItemCategoryName,
                                      ItemList: [
                                                  { ItemCategoryID: item.ItemCategoryID,
                                                    ItemCategoryName: item.ItemCategoryName,
                                                    ItemID: item.ItemID,
                                                    ItemName: item.ItemName,
                                                    IsSelected: true
                                                  }
                                                ]
                                    }
                                )                        
                         });
                } else {

                        this.branchSpecificItemTypeList.forEach(item => {
                          var result = this.branchSpecificItemsList.find(i => i.ItemCategoryID == item.ItemCategoryID);
                          if(result){
                              result.ItemList.push(item);
                              } else {
        
                                this.branchSpecificItemsList.push(
                                  {
                                      ItemCategoryID: item.ItemCategoryID,
                                      ItemCategoryName: item.ItemCategoryName,
                                      ItemList: [
                                                  { 
                                                    ItemCategoryID: item.ItemCategoryID,
                                                    ItemCategoryName: item.ItemCategoryName,
                                                    ItemID: item.ItemID,
                                                    ItemName: item.ItemName,
                                                    IsSelected: false
                                                  }
                                                ]
                                    }
                                )
                              }
                        });

                }               
                
                ////////////////////////////////////////////////// 
                
                  this.showItemTypeValidation = this.branchSpecificItemsList && this.branchSpecificItemsList.length > 0 ? false : true;
                } else{
                  this.showItemTypeValidationForNotExist = true;
                }
              }
              else {
                //this.showItemTypeValidation = true;
                this._messageService.showErrorMessage(response.MessageText);
              }
          },
          error => {
           
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Add " + this.itemTypeName));
          }
      );
  }

  /**@@@@@@@@@@@@@@@@@@ For Service Start  @@@@@@@@@@@@@@@@@@@  */
  selectOrDeselectAllServices(isCheck: boolean) {
    this.branchSpecificServiceList.forEach(serviceCategory => {
      serviceCategory.ServiceList.forEach(item => {
        item.IsSelected = isCheck;
        item.ServicePackageList.forEach(item => {
              item.IsSelected = isCheck;
        });
      });  
    });
  }

  onSelectOrDeselectServiceCategory(categoryID: number, isCheck: boolean) {
    var result = this.branchSpecificServiceList.find(i => i.ServiceCategoryID == categoryID)
    result.ServiceList.forEach(item => {
      item.IsSelected = isCheck;
        item.ServicePackageList.forEach(spackage => {
          spackage.IsSelected = isCheck;
        });
    });
  }

  onServiceChange(serviceID, IsCheck, catIndex, serviceIndex) {    
    this.branchSpecificServiceList[catIndex].ServiceList[serviceIndex].ServicePackageList.forEach(spackage => {       
      spackage.IsSelected = IsCheck;
    });
  }

  onServicePackageChange(packageID, IsCheck, catIndex, serviceIndex) {
   let result = this.branchSpecificServiceList[catIndex].ServiceList[serviceIndex].ServicePackageList.filter(spackage => spackage.IsSelected == true);
    if(!result || result.length < 1 || result == null) {
      this.branchSpecificServiceList[catIndex].ServiceList[serviceIndex].IsSelected = false;
    } else {
      this.branchSpecificServiceList[catIndex].ServiceList[serviceIndex].IsSelected = true;
    }
  }

 /**@@@@@@@@@@@@@@@@@@ For Service End  @@@@@@@@@@@@@@@@@@@  */

  /**@@@@@@@@@@@@@@@@@@ Start For Class and Products @@@@@@@@@@@@@@@@@@@  */
  selectOrDeselectAll(isCheck: boolean) {
    this.branchSpecificItemsList.forEach(itemCategory => {
      itemCategory.ItemList.forEach(item => {
        item.IsSelected = isCheck;
      });

      if(isCheck) {
        this.selectedBranchSpecificItemTypeList = [];
        this.branchSpecificItemsList.forEach(itemType => {
          this.selectedBranchSpecificItemTypeList.push(itemType);
        });  
      } else {
        this.selectedBranchSpecificItemTypeList = [];
      }

    });
   
  }

  selectOrDeselectItemCategory(categoryID: number, isCheck: boolean) {
    var result = this.branchSpecificItemsList.find(i => i.ItemCategoryID == categoryID)
    result.ItemList.forEach(item => {
      item.IsSelected = isCheck;
    });
    
  }
/**@@@@@@@@@@@@@@@@@@ End For Class and Products @@@@@@@@@@@@@@@@@@@  */

  getBranchWiseServices(branchID: number){
    
    this.branchServiceList = [];
    this._httpService.get(MembershipApi.getBranchWiseServices + branchID)
    .subscribe(
        (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if(response.Result && response.Result.ServiceList && response.Result.ServiceList.length > 0){
                // check already added services not add in list
                if(this.selectedMembershipItemsBenefits && this.selectedMembershipItemsBenefits.length > 0){
                  response.Result.ServiceList.forEach(service => {
                    var _servicePackageList = new Array<ServicePackageList>();
                    service.ServicePackageList.forEach(servicePackage => {
                      var result = this.selectedMembershipItemsBenefits.find(smib => smib.ItemID == servicePackage.ServicePackageID);
                      if(!result){
                        _servicePackageList.push(servicePackage);
                      }
                    })
                    service.ServicePackageList = _servicePackageList;
                    if(service.ServicePackageList && service.ServicePackageList.length > 0){
                      this.branchServiceList.push(service);
                    }
                  })
                } else{
                  this.branchServiceList = response.Result.ServiceList;
                }

                this.branchSpecificServiceList = [];

                this.branchServiceList.forEach(itemCategory => {
                  var result = this.branchSpecificServiceList.find(i => i.ServiceCategoryID == itemCategory.ServiceCategoryID);
                  if(result){
                      result.ServiceList.push(itemCategory);
                      } else {

                        this.branchSpecificServiceList.push(
                          {
                            ServiceCategoryID: itemCategory.ServiceCategoryID,
                            ServiceCategoryName: itemCategory.ServiceCategoryName,
                            ServiceList: [
                                      {
                                        ServiceCategoryID: itemCategory.ServiceCategoryID,
                                        ServiceCategoryName: itemCategory.ServiceCategoryName,
                                        ServiceID: itemCategory.ServiceID,
                                        ServiceName: itemCategory.ServiceName,
                                        IsSelected: false,
                                        ServicePackageList: itemCategory.ServicePackageList
                                      }
                                    ]
                          }
                        )
                      }
                });
                
                this.showItemTypeValidation = this.branchServiceList && this.branchServiceList.length > 0 ? false : true;
              } else{
                this.showItemTypeValidationForNotExist = true;
              }
            }
            else {
              //this.showItemTypeValidation = true;
              this._messageService.showErrorMessage(response.MessageText);
            }
        },
        error => {
          //this.showItemTypeValidation = true;
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Add " + this.itemTypeName));
        }
    );
  }

  showValidationMessage(isVisible: boolean) {
    this.isInvalidData = isVisible;
  }

  validateTotalSessions(){
    this.showTotalSessionsValidation = this.isNoLimit ? false : this.totalSessions > 0 && !this.isNoLimit ? false : true;
  }

  validateDiscountPercentage(){
    this.showDiscountPercentageValidation = this.isFree ? false : this.discountPercentage > 0 && this.discountPercentage <= 100 && !this.isFree ? false : true;
  }

  resetModelData(){
    this.isNoLimit = true;
    this.totalSessions = null;
    this.durationTypeID = this.enuMemberShipBenefitDurations.Membership
    this.isFree = true;
    this.discountPercentage = null;
    this.showTotalSessionsValidation = false;
    this.showDiscountPercentageValidation = false;
  }

  /******************************** New Tree*/

  // #endregion 
}

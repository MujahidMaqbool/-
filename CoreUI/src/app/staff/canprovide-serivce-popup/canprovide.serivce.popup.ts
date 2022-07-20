/* Angular References */
import { Component, Output, EventEmitter, Inject, ViewChild, } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

/* Models */
import { StaffService, ServiceCategoryWithServiceList } from 'src/app/staff/models/staff.model';

@Component({
    selector: 'provide-service',
    templateUrl: './canprovide.serivce.popup.html'
})

export class CanProvideServicePopup {

    @Output() onServicesSelect = new EventEmitter<ServiceCategoryWithServiceList[]>();    

    isAllServices: boolean = false;

    /* Model Reference */
    staffServiceModel: StaffService = new StaffService();

    constructor(
        private _dialogRef: MatDialogRef<CanProvideServicePopup>,
        @Inject(MAT_DIALOG_DATA) public serviceCategoryList: ServiceCategoryWithServiceList[]
    ) { }

    // #region Events

    onAllServicesChange(isAllServices: boolean) {
        this.setAllServices(isAllServices);
    }

    onSetAllServicesInCategory(isSelectAll: boolean, serviceCategoryId: number) {
        this.setAllServicesInCategory(isSelectAll, serviceCategoryId);
    }

    onSelect() {
        this.onServicesSelect.emit(this.serviceCategoryList);
        this.closePopup();
    }

    onClosePopup() {
        this.closePopup();
    }

    // #endregion    

    // #region Methods

    setAllServices(isAllServices: boolean) {
        this.isAllServices = !isAllServices;
        this.serviceCategoryList.forEach(serviceCategory => {            
            serviceCategory.ServiceList.forEach(service => { 
                service.IsSelected = isAllServices;
            });
        });
    }

    setAllServicesInCategory(isSelectAll: boolean, serviceCategoryId: number) {
        let selectedCategory = this.serviceCategoryList.find(sc => sc.ServiceCategoryID === serviceCategoryId);
        if (selectedCategory && selectedCategory.ServiceList && selectedCategory.ServiceList.length > 0) {
            selectedCategory.ServiceList.forEach(service => {
                service.IsSelected = isSelectAll;
            });
        }
    }

    closePopup() {
        this._dialogRef.close();
    }

    // #endregion
}
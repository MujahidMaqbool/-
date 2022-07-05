/*************************** Angular References *************************/
import { Component, Inject } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

//*********************** Material Reference *************************//
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/*************************** Services & Models *************************/
import { StaffView } from '@staff/models/staff.model';

import { DataSharingService } from '@app/services/data.sharing.service';
/*************************** Configurations *************************/
import { environment } from "@env/environment";
import { ENU_Package, ENU_DateFormatName } from '@app/helper/config/app.enums';
import { Configurations } from '@app/helper/config/app.config';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';


@Component({
    selector: 'view-staff-detail',
    templateUrl: './view.staff.detail.component.html'
})

export class ViewStaffDetail extends AbstractGenericComponent{
    imagePath: string = "./assets/images/user.jpg";

    staffId: number;
    showServicesCheck: boolean;

    packageIdSubscription: SubscriptionLike;

    package = ENU_Package;

    dateFormat = Configurations.DateFormat;
    serverImageAddress = environment.imageUrl;

    constructor(private _dataSharingService: DataSharingService,
        private dialogRef: MatDialogRef<ViewStaffDetail>,
        @Inject(MAT_DIALOG_DATA) public staffViewModel: StaffView) {
            super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }

    checkPackagePermissions(packageId: number) {
        //this.isRoleRequired = (packageId !== this.package.FitnessBasic && packageId !== this.package.WellnessBasic);
        switch (packageId) {
            case this.package.WellnessBasic:
            case this.package.WellnessMedium:
            case this.package.WellnessTop:
                this.showServicesCheck = true;
                break;
            case this.package.FitnessBasic:
            case this.package.FitnessMedium:
                this.showServicesCheck = false;
                break;
            case this.package.Full:
                this.showServicesCheck = true;
                break;
        }
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

        if (this.staffViewModel.ImagePath && this.staffViewModel.ImagePath.length > 0) {
            this.imagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + this.staffViewModel.ImagePath;
        }

        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.checkPackagePermissions(packageId);
            }
        })
    }
}
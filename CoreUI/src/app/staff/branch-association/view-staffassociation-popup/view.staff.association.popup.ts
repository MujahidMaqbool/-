/************************** Angular References *********************/
import { Component, Inject, ViewChild ,OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";

/*************************** Services & Models *************************/
/*Services*/
import { MessageService } from 'src/app/services/app.message.service';
import { HttpService } from 'src/app/services/app.http.service';
import { StaffApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';

/*Models*/
import { SaveStaffForOtherBranch } from 'src/app/staff/models/staff.model';
import { ModuleList } from 'src/app/setup/models/roles.model';
import { StaffView } from 'src/app/staff/models/staff.model';

/****************** Components ************/
import { RoleViewComponent } from 'src/app/setup/role/role-view/role-view.component';

/********************** Configurations ***********************/
import { environment } from "src/environments/environment";
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';


@Component({
    selector: 'view-staffassociation',
    templateUrl: './view.staff.association.popup.html'
})

export class ViewStaffAssociationComponent extends AbstractGenericComponent implements OnInit {

    /* Form Refrences*/
    @ViewChild('viewStaffForm') viewStaffForm: NgForm;

    /* Local Variables */
    imagePath: string = "./assets/images/user.jpg";

    /* Messages */
    messages = Messages;

    /* Model References */
    otherBranchStaffModel: SaveStaffForOtherBranch = new SaveStaffForOtherBranch();    
    staffViewModel: StaffView = new StaffView();
    roleList: ModuleList[] = [];
    dateFormat: string = ""; //Configurations.DateFormat;

    constructor(
        private dialogRef: MatDialogRef<ViewStaffAssociationComponent>,
        private _messageService: MessageService,
        private _staffService: HttpService,
        private _dialog: MatDialogService,
        private _router: Router,
        @Inject(MAT_DIALOG_DATA) public staffId: number,
        private _dataSharingService: DataSharingService

    ) {
       super();
     }

    ngOnInit() {
        if (this.staffViewModel.ImagePath && this.staffViewModel.ImagePath.length > 0) {
            this.imagePath = environment.imageUrl + this.staffViewModel.ImagePath;
        }
        
        this.otherBranchStaffModel.StaffID = this.staffId;
        this.viewStaffOfOtherBranch();
        this.getFundamentals();
        this.getBranchDatePattern();

    }

    // #region Events
    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }
    onSave(isValid: boolean) {
        this.saveStaffOfOtherBranch(isValid);
    }

    onViewRole(RoleId: number) {
        this.getRoleDetailById(RoleId);
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    // #endregion

    // #region Methods    

    viewStaffOfOtherBranch() {
        this._staffService.get(StaffApi.viewStaffForOtherBranch + this.otherBranchStaffModel.StaffID)
            .subscribe((data: any) => {
                this.staffViewModel = data.Result;
            })
    }

    getRoleDetailById(RoleId: number) {
        this._dialog.open(RoleViewComponent, {
            disableClose: true,
            data: RoleId,
        });
    }

    getFundamentals() {
        this._staffService.get(StaffApi.getFundamentals)
            .subscribe(
                data => {
                    this.roleList = data.Result.RoleList;
                },
                error => this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error));
    }

    saveStaffOfOtherBranch(isValid: boolean) {
        if (isValid && this.viewStaffForm.dirty)
            this._staffService.save(StaffApi.saveStaffForOtherBranch, this.otherBranchStaffModel)
                .subscribe((res: any) => {
                    if (res && (res.MessageCode != null || res.MessageCode != undefined)) {
                        if (res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff"));
                            this.closePopup();
                            this._router.navigate(['staff/search']);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff"));
                        }
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff")); }
                )
    }

    closePopup() {
        this._dialog.closeAll();
    }

    // #endregion
}
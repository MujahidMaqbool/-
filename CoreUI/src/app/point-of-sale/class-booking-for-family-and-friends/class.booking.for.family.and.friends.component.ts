/********************** Angular References *********************************/
import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Common *********************************/
import { Messages } from 'src/app/helper/config/app.messages';

import { NumberValidator } from 'src/app/shared/helper/number.validator';

/********************** Service & Models *********************/
/* Services */

/* Models */
import { BookingForFamilyAndFriends } from '../models/point.of.sale.model';

@Component({
    selector: 'app-class-booking-for-family-and-friends',
    templateUrl: './class.booking.for.family.and.friends.component.html',
})
export class ClassBookingForFamilyAndFriendsComponent implements OnInit {

    @Output() bookingForFamilyAndFriendsModel = new EventEmitter<BookingForFamilyAndFriends[]>();

    //local Variables

    isShowConsumeMembershipBenefit: boolean = false;
    errorMessage: string = "";
    maxAttendee: number = 0;
    maxBenefit: number = 0;

    bookingForFamilyAndFriends: any = {
        TotalAttendeeAdded: 0,
        TotalBenefitsUse: 0,
    };

    numberValidator: NumberValidator = new NumberValidator();

    /***********Messages*********/
    messages = Messages;
    
    // #endregion

    constructor(
        public dialogRef: MatDialogRef<ClassBookingForFamilyAndFriendsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isShowConsumeMembershipBenefit = this.data.remainingclassBenefits > 0 || this.data.remainingclassBenefits == null ? true : false;
        this.maxBenefit = this.data.remainingclassBenefits == null ? 999 : this.data.remainingclassBenefits;
        this.maxAttendee = this.data.remaningMaxAttendee == null ? 999 : this.data.remaningMaxAttendee;
    }

    ngOnInit(): void {
  
    }
   
    //#region Events

    // not allow dot in munber
    onTotalAttendeeAddedChangeOnlyNumbers(num) {
        this.errorMessage = null;
        setTimeout(() => {
            this.bookingForFamilyAndFriends.TotalAttendeeAdded = this.numberValidator.NotAllowDecimalValue(num);
        }, 10);
    }

    // not allow dot in munber
    onTotalBenefitsUseChangeOnlyNumbers(num) {
        this.errorMessage = null;
        setTimeout(() => {
            this.bookingForFamilyAndFriends.TotalBenefitsUse = this.numberValidator.NotAllowDecimalValue(num);
        }, 10);
    }
    
    //#endregion Events

    //#region Methods

    onClassAddToCart(){
        
        if(this.isValid()){
            this.bookingForFamilyAndFriendsModel.emit(this.bookingForFamilyAndFriends);
            this.dialogRef.close();
        }
    }

    isValid(){
        if(this.bookingForFamilyAndFriends.TotalAttendeeAdded > this.maxAttendee){

            this.errorMessage = this.messages.Error.Class_Attendee_Limit_Has_Reached_You_Can_Add_Maximum_Attendees_To_The_Class.replace('{0}', this.maxAttendee.toString());
            return false;
        }

        if(this.isShowConsumeMembershipBenefit && this.bookingForFamilyAndFriends.TotalBenefitsUse == null){
            this.errorMessage = this.messages.Error.Membership_Benefits_Field_Cannot_Be_Empty_Please_Enter_A_Value_Of_Zero_Or_Greater_Than_Zero;
            return false;
        }

        if(this.bookingForFamilyAndFriends.TotalBenefitsUse > this.maxBenefit){
            this.errorMessage = this.messages.Error.Benefit_Limit_Has_Reached_You_Can_Add_Maximum_Benift_To_The_Class.replace('{0}', this.maxBenefit.toString());
            return false;
        }

        if(this.isShowConsumeMembershipBenefit && this.bookingForFamilyAndFriends.TotalBenefitsUse > this.bookingForFamilyAndFriends.TotalAttendeeAdded){
            this.errorMessage = this.messages.Error.Membership_Benefits_Field_Cannot_Accept_Value_Greater_Than_The_Number_Of_People_Attending;
            return false;
        }

        return true;
    }

    onClosePopup() {
        this.dialogRef.close();
    }

    onUpdateQuantityPeopleAttending(event: string) {
        this.errorMessage = null;
        if(event == 'add'){
            this.bookingForFamilyAndFriends.TotalAttendeeAdded = this.bookingForFamilyAndFriends.TotalAttendeeAdded ? this.bookingForFamilyAndFriends.TotalAttendeeAdded + 1 : 1;
        } else{
            this.bookingForFamilyAndFriends.TotalAttendeeAdded = this.bookingForFamilyAndFriends.TotalAttendeeAdded == 0 ? 0 : this.bookingForFamilyAndFriends.TotalAttendeeAdded - 1;
        }
    }

    onUpdateQuantityConsumeMembershipBenefits(event: string){
        this.errorMessage = null;
        if(event == 'add'){
            this.bookingForFamilyAndFriends.TotalBenefitsUse = this.bookingForFamilyAndFriends.TotalBenefitsUse ? this.bookingForFamilyAndFriends.TotalBenefitsUse + 1 : 1;
        } else{
            this.bookingForFamilyAndFriends.TotalBenefitsUse = this.bookingForFamilyAndFriends.TotalBenefitsUse == 0 ? 0 : this.bookingForFamilyAndFriends.TotalBenefitsUse - 1;
        }
    }
    

}

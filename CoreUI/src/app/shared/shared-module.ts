import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DxDateBoxModule, DxSchedulerModule, DxValidatorModule, DxHtmlEditorModule, DxButtonGroupModule, DxDataGridModule, DxCheckBoxModule, DxTooltipModule, DxTemplateModule } from 'devextreme-angular';

import { SaveActivityComponent } from './components/activities/save/save.activity.component';
import { SearchActivityComponent } from './components/activities/search/search.activity.component';
import { CompleteTaskComponent } from './components/activities/edit/complete.task.component';
import { ViewEmailComponent } from './components/activities/view/view.email.component';
import { ViewActivityComponent } from './components/activities/view/view.activity.component';
import { TimeFormatterPipe } from './pipes/time.formatter';
import { TimeControlDirective } from './directives/time.control';
import { TrimValue } from './directives/trim.values.directive';
import { SearchProductByNameFilter, SearchProductByCodeFilter, ServicePackageDurationFilter, StaffListFilter, posAttendeeNameFilter, searchProductByCategoryFilter, searchServiceByCategoryFilter, searchClassByCategoryFilter } from './pipes/product.filters';
import { SaleHistoryComponent } from './components/sale/sale-history/sale.history.component';
import { SaleDetailComponent } from './components/sale/sale.detail/sale.detail.component';
import { BookingsComponent } from './components/bookings/bookings.component';
// import { PersonInfoComponent } from './components/person-info/person.info.component';
import { ClickOutsideDirective } from './directives/click.outside.directive';
import { SchedulerTooltipDirective } from './directives/scheduler.tooltip.directive';
import { PrintReceiptComponent } from './components/print-receipt/print.receipt.component';
import { POSPaymentComponent } from './components/sale/payment/pos.payment.component';
//import { SaveTaskComponent } from './components/activities/save/task/save.task.component';
import { MaxDirective, MinDirective } from './directives/min.max.validation.directive';
import {AutofocusDirective} from './directives/auto.focus.directive';

/* Staff Profile */
//import { StaffProfilePopupComponent } from '@shared/components/staff-profile/staff.profile.popup.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
//import { MyTasksComponent } from './components/my-tasks/my.tasks.component';
//import { MyAttendanceTimeSheetComponent } from './components/my-attendance-timesheet/my.attendance.timesheet.component';
import { CustomerSearchComponent } from './components/customer-search/customer.search.component';
//import { StaffSearchAutoCompleteComponent } from './components/staff-search/staff.search.component';
//import { EmailEditorComponent } from './components/email-editor/email.editor.component';
//import { AddGoCardlessCustomerComponent } from './components/add-gateways/gocardless/add.gocardless.customer.component';
//import { AddStripeCustomerComponent } from './components/add-gateways/stripe/add.stripe.customer.component';
import { StaffBasicInfoComponent } from './components/staff-basic-info/staff.basicinfo.component';
import { NumberControlDirective } from './directives/number.control.directive';
import { MatDialogService } from './components/generics/mat.dialog.service';
//import { MandateConfirmationDialog } from './components/add-member-membership/mandate-confirmation/mandate.confirmation.component';
import { POSClassAttendanceComponent } from '@app/point-of-sale/class-attendance/pos.class.attendance.component';
import { PartPaymentComponent } from './components/sale/part-payment-alert/part.payment.component'
import { TrimPipe } from './pipes/trim';
import { SavePartialPaymentComponent } from './components/sale/partial-payment/save.partial.payment.component'
import { RefundPaymentComponent } from './components/sale/refund-payment/refund.payment.component';
import { BadDebtComponent } from './components/sale/bad-debt/bad.debt.component';
import { TwoDigitDecimaNumberDirective } from './directives/two.digit.decima.number';
//import { StripeReaderComponent } from './components/add-gateways/stripe-terminal/stripe.reader.component';
//import { StripeACHComponent } from './components/add-gateways/stripe-ach/stripe.ach.component';
//import { BranchCodeDirective } from './directives/branch.code.directive';
import { EmailValidatePipe } from './pipes/email.validate';
import { SharedPaginationModule } from '@app/shared-pagination-module/shared-pagination-module';
import { MembershipViewComponent } from './components/membership-view/membership.view.component';
import { RedeemMembershipComponent } from './components/redeem-membership/redeem.membership.component';
//import { SearchFormsComponent } from './components/forms/search-forms/search.forms.component';
//import { SaveFormsComponent } from './components/forms/save-forms/save.forms.component';
import { ViewFormComponent } from './components/forms/view/view.form.component';
//import { EmailFormComponent } from './components/forms/email/email.form.component';
//import { SmsFormComponent } from './components/forms/sms/sms.form.component';
import { FillFormComponent } from './components/fill-form/fill.form.component';

import { SlickCarouselModule } from 'ngx-slick-carousel';
//import { AccountCodeDirective } from './directives/account.code.directive';
//import { MembershipFormComponent } from './components/forms/membership-form/membership.form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MandateConfirmationDialog } from '@app/customer-shared-module/add-member-membership/mandate-confirmation/mandate.confirmation.component';
import { OneDaySchedulerComponent } from './components/scheduler/one.day.scheduler.component';
import { MemberMemberhshipAttendance } from './components/member-memberhsip-attendance/member-membership-attendance';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { SaveFormsComponent } from './components/forms/save-forms/save.forms.component';
import { EditClassAttendeeComponent } from './components/scheduler/edit-class-attendee/edit-class-attendee.component';
import { EditSeriesComponent } from './components/scheduler/edit-series/edit.series.component';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
import { GatewayModule } from '@app/gateway/gateway-module';
import { AttendeeModule } from '@app/attendee/attendee-module';
import { AddressComponent } from './components/address/address.component';
import { SaleVoidComponent } from './components/sale/sale-void/sale-void.popup.component';
import { ActivityLogComponent } from './components/activity-log/activity.log.popup.component';
import { CancelBookingComponent } from './components/cancel-booking/cancel.booking.component';
import { NoShowBookingComponent } from './components/noshow-booking/noshow.booking.component';
import { RescheduleServiceComponent } from './components/reschedule-service/reschedule-service.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClassRescheduleComponent } from './components/class-reschedule/class.reschedule.component';
import { RescheduleBookingComponent } from './components/reschedule-booking/reschedule.booking.component';
import { UaeStripeConnectComponent } from './components/uae-stripe-connect/uae.stripe.connect.component';
import { FavouriteViewComponent } from './components/save-favourite-view/save.favourite.view.component';
import { PaymentFailedComponent } from './components/sale/payment-failed/payment.failed.component';
import { RewardPointTemplateComponent } from './components/reward-point-template/reward-point-template.component';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,

    DragDropModule,
    MatDialogModule,
    MatDatepickerModule,
    MatTabsModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatStepperModule,
    InternationalPhoneNumberModule,


    DxDateBoxModule,
    DxSchedulerModule,
    DxValidatorModule,
    DxHtmlEditorModule,
    DxButtonGroupModule, DxDataGridModule, DxCheckBoxModule,
    SharedPaginationModule,
    AttendeeModule,
    SlickCarouselModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GatewayModule,
    MatSlideToggleModule,
    MatInputModule,

    DxTooltipModule,
    DxTemplateModule,
  ],
  declarations: [
    posAttendeeNameFilter,
    ActivityLogComponent,

    SaveActivityComponent,
    SearchActivityComponent,
    CompleteTaskComponent,
    ViewEmailComponent,
    ViewActivityComponent,
    SaleHistoryComponent,
    SaleDetailComponent,
    BookingsComponent,
    AddressComponent,
    //PersonInfoComponent,
    //SaveTaskComponent,
    POSPaymentComponent,
    PrintReceiptComponent,
    //SaveMemberMembershipComponent,
    //SaveMemberMembershipPopup,
    //SaveMemberPaymentComponent,
    MandateConfirmationDialog,
    POSClassAttendanceComponent,
    TimeFormatterPipe,
    TrimPipe,
    EmailValidatePipe,
    TimeControlDirective,
    TrimValue,
    NumberControlDirective,
    ClickOutsideDirective,
    TwoDigitDecimaNumberDirective,
    SchedulerTooltipDirective,
    MinDirective,
    MaxDirective,
    AutofocusDirective,
    //BranchCodeDirective,
    //AccountCodeDirective,
    SearchProductByNameFilter,
    SearchProductByCodeFilter,
    searchProductByCategoryFilter,
    searchServiceByCategoryFilter,
    searchClassByCategoryFilter,
    ServicePackageDurationFilter,
    StaffListFilter,
    //MyTasksComponent,
    //MyAttendanceTimeSheetComponent,
    /* Staff Profile */
    //StaffProfilePopupComponent,
    StaffBasicInfoComponent,

    //EmailEditorComponent,

    CustomerSearchComponent,
    //StaffSearchAutoCompleteComponent,
    //SearchFormsComponent,
    MemberMemberhshipAttendance,

    //AddGoCardlessCustomerComponent,
    //AddStripeCustomerComponent,
    PartPaymentComponent,
    SavePartialPaymentComponent,
    RefundPaymentComponent,
    BadDebtComponent,
    SaleVoidComponent,
    PaymentFailedComponent,
    // StripeReaderComponent,
    // StripeACHComponent,
    MembershipViewComponent,
    RedeemMembershipComponent,
    EditClassAttendeeComponent,
    EditSeriesComponent,
    SaveFormsComponent,
    ViewFormComponent,
    //EmailFormComponent,
    // SmsFormComponent,
    FillFormComponent,
    OneDaySchedulerComponent,
    //MembershipFormComponent
    // AttendeeComponent,
    CancelBookingComponent,
    NoShowBookingComponent,
    RescheduleServiceComponent,
    ClassRescheduleComponent,
    RescheduleBookingComponent,
    UaeStripeConnectComponent,
    FavouriteViewComponent,
    RewardPointTemplateComponent
  ],
  exports: [
    ActivityLogComponent,
    SaveActivityComponent,
    SearchActivityComponent,
    SaleHistoryComponent,
    SaleDetailComponent,
    BookingsComponent,
    AddressComponent,
    //PersonInfoComponent,
    //SaveTaskComponent,
    POSPaymentComponent,
    PrintReceiptComponent,
    PaymentFailedComponent,
    //SaveMemberMembershipComponent,
    //SaveMemberMembershipPopup,
    //SaveMemberPaymentComponent,
    MandateConfirmationDialog,
    POSClassAttendanceComponent,

    TimeFormatterPipe,
    TrimPipe,
    EmailValidatePipe,
    TimeControlDirective,
    TrimValue,
    NumberControlDirective,
    ClickOutsideDirective,
    TwoDigitDecimaNumberDirective,
    SchedulerTooltipDirective,
    MinDirective,
    MaxDirective,
    AutofocusDirective,
    //BranchCodeDirective,
    //AccountCodeDirective,
    SearchProductByNameFilter,
    SearchProductByCodeFilter,
    searchProductByCategoryFilter,
    searchClassByCategoryFilter,
    searchServiceByCategoryFilter,
    ServicePackageDurationFilter,
    StaffListFilter,
    //MyTasksComponent,
    //MyAttendanceTimeSheetComponent,
    CustomerSearchComponent,
    //StaffSearchAutoCompleteComponent,

    /* Staff Profile */
    //StaffProfilePopupComponent,
    StaffBasicInfoComponent,

    //EmailEditorComponent,
    //SearchFormsComponent,
    //AddGoCardlessCustomerComponent,
    //AddStripeCustomerComponent,
    //StripeReaderComponent,
    //StripeACHComponent,
    //SaveFormsComponent,
    ViewFormComponent,
    //EmailFormComponent,
    //SmsFormComponent,
    FillFormComponent,
    OneDaySchedulerComponent,
    // MembershipFormComponent
    CancelBookingComponent,
    NoShowBookingComponent,
    RescheduleServiceComponent,
    ClassRescheduleComponent,
    RescheduleBookingComponent,
    UaeStripeConnectComponent,
    FavouriteViewComponent,
    RewardPointTemplateComponent,
    MatInputModule
  ],
  entryComponents: [
    SaveActivityComponent,
    ActivityLogComponent,
    //CompleteCallComponent, not using
    CompleteTaskComponent,
    ViewEmailComponent,
    ViewActivityComponent,
    SaleDetailComponent,
    //SaveTaskComponent,
    POSPaymentComponent,
    PrintReceiptComponent,
    //SaveMemberMembershipPopup,
    MandateConfirmationDialog,
    //MyTasksComponent,
    //MyAttendanceTimeSheetComponent,
    MemberMemberhshipAttendance,
    /* Staff Profile */
    //StaffProfilePopupComponent,
    StaffBasicInfoComponent,
    POSClassAttendanceComponent,

    PartPaymentComponent,
    SavePartialPaymentComponent,
    RefundPaymentComponent,
    BadDebtComponent,
    MembershipViewComponent,
    RedeemMembershipComponent,
    SaleVoidComponent,
    PaymentFailedComponent,

    ViewFormComponent,
    FillFormComponent,
    UaeStripeConnectComponent,
    FavouriteViewComponent
  ],
  providers: [
    TimeFormatterPipe,
    TrimPipe,
    EmailValidatePipe,
    MatDialogService
  ]
})
export class SharedModule { }

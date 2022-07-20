import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { WizardforCompanySetup } from 'src/app/helper/config/app.enums';

@Component({
  selector: 'app-signup',
  templateUrl: './register.company.component.html'
})
export class SignupComponent implements OnInit {

  @ViewChild('stepper') stepper: MatStepper;

  activeTabIndex: number = 0;
  showPrevious: boolean;
  showContinue: boolean = true;
  showSave: boolean;

  companySetupWizard = WizardforCompanySetup

  constructor() { }

  ngOnInit() {
  }

  onPrevious() {
    this.stepper.previous();
    this.activeTabIndex = this.stepper.selectedIndex;
    this.setPerviousContinueButtonVisibility(this.activeTabIndex);
  }

  onContinue() {
    if (this.activeTabIndex === this.companySetupWizard.CompanyInfo) {
      this.stepper.next();
    }
    else if (this.activeTabIndex === this.companySetupWizard.BranchInfo) {
      this.stepper.next();
    }
    else if (this.activeTabIndex === this.companySetupWizard.SoftwareAdminInfo) {
      this.stepper.next();
    }
    else if (this.activeTabIndex === this.companySetupWizard.ModuleSetup) {
      this.stepper.next();
    }
    this.activeTabIndex = this.stepper.selectedIndex;
    this.setPerviousContinueButtonVisibility(this.activeTabIndex);
  }

  onSave() {
    this.onReset();
  }

  onReset() {
    this.stepper.reset();
    this.activeTabIndex = this.stepper.selectedIndex;
    this.setPerviousContinueButtonVisibility(this.activeTabIndex);
  }

  setPerviousContinueButtonVisibility(index: number) {
    if (index === this.companySetupWizard.CompanyInfo) {
      this.showPrevious = false;
      this.showContinue = true;
      this.showSave = false;
    }
    else if (index === this.companySetupWizard.BranchInfo) {
      this.showPrevious = true;
      this.showContinue = true;
      this.showSave = false;
    }
    else if (index === this.companySetupWizard.SoftwareAdminInfo) {
      this.showPrevious = true;
      this.showContinue = true;
      this.showSave = false;
    }
    else if (index === this.companySetupWizard.ModuleSetup) {
      this.showPrevious = true;
      this.showContinue = true;
      this.showSave = false;
    }
    else if (index === this.companySetupWizard.PaymentSetup) {
      this.showPrevious = true;
      this.showContinue = false;
      this.showSave = true;
    }
  }
}

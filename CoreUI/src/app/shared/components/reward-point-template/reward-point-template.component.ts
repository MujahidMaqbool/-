import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RewardProgramDetailViewModel } from '@app/models/customer.reward.programs.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'reward-point-template',
  templateUrl: './reward-point-template.component.html'
})
export class RewardPointTemplateComponent implements OnInit {
  @Input('optinRewardProgram') optinRewardProgram: RewardProgramDetailViewModel;
  @Input('isCustomerProfile') isCustomerProfile:boolean;
  @Output() onJoin = new EventEmitter<any>();
  @Output() onBackRewardProgram = new EventEmitter();
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  // this.optinRewardProgram.Description = this.sanitizer.bypassSecurityTrustHtml(this.optinRewardProgram.Description)
  }
  //#region  Events
  onBack() {
    this.onBackRewardProgram.emit();
  }

  onSkipAndNext() {
    let emitedRewardProgram: any = {
      cutomerViewedRewardProgramID: this.optinRewardProgram.RewardProgramID,
      isCutomerViewedRewardProgramSkipped: true
    }
    this.onJoin.emit(emitedRewardProgram);
  }

  onJoinAndNext() {

    let emitedRewardProgram: any = {
      cutomerViewedRewardProgramID: this.optinRewardProgram.RewardProgramID,
      isCutomerViewedRewardProgramSkipped: false
    }
    this.onJoin.emit(emitedRewardProgram);
  }
}

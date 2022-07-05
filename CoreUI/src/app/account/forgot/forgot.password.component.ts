import { Component, OnInit } from '@angular/core';
import { Messages } from '@app/helper/config/app.messages';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot.password.component.html'
})
export class ForgotComponent implements OnInit {

  staffEmail: string;
  invalidEmail: boolean;
  hasError: boolean;

  messages = Messages;

  constructor() { }

  ngOnInit() {
  }

  onSendPassword(){
    
  }

}


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailValidate'
})
export class EmailValidatePipe implements PipeTransform {

  isEmailValid: boolean;

  transform(email: any): boolean {
    let regexp = new RegExp(/^([a-zA-Z0-9_\-\.]+)@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/);
    return regexp.test(email);
}
}

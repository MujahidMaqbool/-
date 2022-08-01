/********************** Angular Refrences *********************/
import { Component} from '@angular/core';



@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
})

export class WelcomeComponent {

  slideConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "dots": false,
    "autoplay": true,
    "infinite": false,
    "autoplaySpeed": 5000 //set for 30 sec
  };

}

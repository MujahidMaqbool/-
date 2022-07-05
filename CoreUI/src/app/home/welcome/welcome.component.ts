import { Component, OnInit, ViewChild } from '@angular/core';

/********************** Service & Models *********************/

/********************** Configurations *********************/

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

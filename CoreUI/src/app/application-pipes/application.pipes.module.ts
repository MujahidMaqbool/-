import { NgModule } from "@angular/core";
import { CustomDatePipe } from "./custom.date.pipe";
import { TimeFormatPipe } from './time-format.pipe';
import { BranchDateFormatPipe } from './branch-date-format.pipe';
import { SafeHtmlPipe } from "./safe.html.pipe";


@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ 
    CustomDatePipe, 
    TimeFormatPipe, BranchDateFormatPipe,SafeHtmlPipe
  ],
  exports: [
    CustomDatePipe,
    TimeFormatPipe,
    BranchDateFormatPipe,
    SafeHtmlPipe
  ],
  providers: [
    TimeFormatPipe,
    CustomDatePipe,
  ]
})
export class ApplicationPipesModule {}
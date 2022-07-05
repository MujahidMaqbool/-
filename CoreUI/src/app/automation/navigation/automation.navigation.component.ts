/********************** Angular References *********************/
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
/********************** Services & Models *********************/
/* Services */




@Component({
    selector: 'automation-navigation',
    templateUrl: './automation.navigation.component.html'
})

export class AutomationNavigationComponent implements OnInit {

    automationID: number = 0;
    constructor(
        private _route: ActivatedRoute
    ) {
        this.getAutomationRuleIDFromRoute();

    }

    ngOnInit() {

    }

    getAutomationRuleIDFromRoute() {
        return new Promise<boolean>((isPromiseResolved, reject) => {
            this._route.paramMap.subscribe(async (params) => {
                this.automationID = await +params.get('AutomationID');
                if (this.automationID > 0) {
                    isPromiseResolved(true);
                }
                else {
                    isPromiseResolved(false);
                }
            });
        });
    }



}
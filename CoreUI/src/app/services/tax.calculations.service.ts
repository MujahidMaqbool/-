import { Injectable } from "@angular/core";
import { DecimalPipe } from '@angular/common';

@Injectable({ providedIn: 'root' })

export class TaxCalculation {
    constructor(private _decimalPipe: DecimalPipe) {

    }

    public getTaxAmount(taxPercentage: number, price: number, roundNumber?: number) {
        let taxAmount = 0;
        taxAmount = price * taxPercentage / 100;
        return this.getRoundValue(taxAmount, roundNumber);
    }

    public getRoundValue(value: any, roundNumber?: number) {
        let _value = value ? value : 0;
        roundNumber = roundNumber ? roundNumber : 2;
        let _roundNumber = "1." + roundNumber + "-" + roundNumber;
        if (typeof (_value) == "string") {
            _value = parseFloat(_value);
        }
        return parseFloat(this._decimalPipe.transform(_value, _roundNumber).replace(/,/g, ""));
    }

    public getTwoDecimalDigit(twoDecimal:number):any{
       return twoDecimal.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    }
}


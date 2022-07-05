export class NumberValidator {

    constructor() { }

    /**
     * @return returns true/false
     * @param: parameter is type number
     * @summary: validation allow null value and greater than zero
     */
    public AllowNullAndNotAllowZero(num: any) {
        return num != "" && Number(num) == 0 ? true : false;;
    }

   /**
     * @return returns true/false
     * @param: parameter is type number
     * @summary: validation greater than zero
     */
    public NotAllowNullAndZero(num: any){
        return Number(num) == 0 ? true : false;
    }

    /**
     * @return returns Number
     * @param: parameter is type string
     * @summary: Not allow decimal
     */
    public NotAllowDecimalValue(val: string){
        let result;
        if(val != "" && val != null && val != undefined){
            if ( /[^0-9]+/.test(val) ){
                result = Number(val.toString().replace(/[^0-9]*/g,""));
            } else{
                result = Number(val);
            }
            return result;
        }
        return val;
    }
}
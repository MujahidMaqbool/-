import { CustomerType } from "./config/app.enums";
import { Messages } from "./config/app.messages";
import { ImagesPlaceholder } from "./config/app.placeholder";
import { variables } from "./config/app.variable";

/* Messages */
let messages = Messages;

let customerType = CustomerType;

export class AppUtilities {
    static setCustomerImagePath(): string {
        let setCustomerImagePath = localStorage.getItem(variables.CompanyID);
        return setCustomerImagePath
    }

    static setOtherImagePath(): string {
        let setCustomerImagePath = localStorage.getItem(variables.CompanyID) + '/BR' + localStorage.getItem(variables.BranchID);
        return setCustomerImagePath
    }
    static setOtherImagePathForCompanyOnly(): string {
        let setCustomerImagePath = localStorage.getItem(variables.CompanyID);
        return setCustomerImagePath
    }
    static setStaffImagePath(): string {
        let setCustomerImagePath = localStorage.getItem(variables.CompanyID);
        return setCustomerImagePath
    }

    static getPerItemDiscount(item: any) {
        return ((item.PricePerSession * item.DiscountPercentage) / 100);
    }

    static getServiceClassTotalDiscount(item: any) {
        if (item.IsMembershipBenefit && item.IsFree && !item.IsBenefitsSuspended) {
            return (item.PricePerSession);
        }
        else if (item.IsMembershipBenefit && !item.IsFree && !item.IsBenefitsSuspended) {
            return ((item.PricePerSession * item.DiscountPercentage) / 100);
        }
        else {
            return 0;
        }
    }

    static getDiscountPercentage(discount: number, pricePerSession: number): number {
        return (discount / pricePerSession) * 100;
    }

    static getCustomerTypeName(customerTypeId: number, messageCode: number, responseMessage: any) {
        var ctName = "";
        switch (customerTypeId && messageCode) {
            case customerType.Client && -18:
                ctName = "Client";
                ctName = messages.Confirmation.Archieved_Proceed_As_Customer.replace("{0}", ctName);
                break;
            case customerType.Lead && -18:
                ctName = "Lead";
                ctName = messages.Confirmation.Archieved_Proceed_As_Lead.replace("{0}", ctName);
                break;
            case customerType.Member && -18:
                ctName = "Member";
                ctName = messages.Confirmation.Archieved_Proceed_As_Member.replace("{0}", ctName);
                break;
            case responseMessage.isFromMember && -21:
                ctName = 'Member';
                ctName = messages.Confirmation.Archieved_Member_Proceed_As_Member.replace("{0}", ctName);
                break;
            case responseMessage.isFromClient &&  -21:
                ctName = 'Client';
                ctName = messages.Confirmation.Archieved_Member_Proceed_As_Member.replace("{0}", ctName);
                break;
            case responseMessage.isFromLead && -21:
                ctName = 'Lead';
                ctName = messages.Confirmation.Archieved_Member_Proceed_As_Member.replace("{0}", ctName);
                break;
            case customerType.Client && -46:
                ctName = responseMessage.MessageText.replace(/Staff/gi, "Customer");
                break;
            case customerType.Lead && -46:
                ctName = responseMessage.MessageText.replace(/Staff/gi, "Customer");
                break;
            case customerType.Member && -46:
                ctName = responseMessage.MessageText.replace(/Staff/gi, "Customer");
                break;

            //assign customerTypeID after disscus with fazeel 
            case customerType.Client === customerTypeId && 1:
                ctName = "Client";
                ctName = messages.Confirmation.Proceed_As_Lead.replace("{0}", ctName);
                break;
            case customerType.Lead === customerTypeId && 1:
                ctName = "Lead";
                ctName = messages.Confirmation.Proceed_As_Lead.replace("{0}", ctName);
                break;
            case customerType.Member === customerTypeId && 1:
                ctName = "Member";
                ctName = messages.Confirmation.Proceed_As_Lead.replace("{0}", ctName);
                break;
        }
        return ctName;
    }

    static setCustomerTypeMessage(responseMessage: any): string {
        var _customerTypeMessage = AppUtilities.getCustomerTypeName(responseMessage.CustomerTypeID, responseMessage.MessageCode, responseMessage);
        // switch (responseMessage.MessageCode) {
        //     case -18:
        //         if ()
        //             _customerTypeMessage = messages.Confirmation.Archieved_Proceed_As_Lead.replace("{0}", _customerTypeMessage);
        //         break;

        //     case -46:
        //         _customerTypeMessage = responseMessage.MessageText.replace(/Staff/gi, "Customer")
        //         break;

        //     default:
        //         _customerTypeMessage = messages.Confirmation.Proceed_As_Lead.replace("{0}", _customerTypeMessage);
        //         break

        // }
        return _customerTypeMessage;
    }

    static setUserImage(Gender: string): string {
        if (Gender == 'Female') {
            return ImagesPlaceholder.female;
        } else if (Gender == 'Male') {
            return ImagesPlaceholder.male;
        } else if (Gender == 'Non-binary') {
            return ImagesPlaceholder.nonBinary;
        } else {
            return ImagesPlaceholder.user;
        }
    }
}
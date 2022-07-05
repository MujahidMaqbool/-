import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchProductByName' })
export class SearchProductByNameFilter implements PipeTransform {
    transform(products: any[], searchText: string) {
        let filteredProducts = [];
        if (products && products.length > 0) {
            filteredProducts = products.filter(item => item.Name && item.Name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);

            if (!filteredProducts || filteredProducts.length <= 0) {
                filteredProducts = products.filter(item => item.Code && item.Code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
            }

            if (!filteredProducts || filteredProducts.length <= 0) {
                filteredProducts = [-1]
            }
        }
        return filteredProducts
    }
}

@Pipe({ name: 'searchProductByCode' })
export class SearchProductByCodeFilter implements PipeTransform {
    transform(products: any[], searchText: string) {
        let filteredProducts = [];

        if (products && products.length > 0) {
            filteredProducts = products.filter(item => item.Code && item.Code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);

            if (!filteredProducts || filteredProducts.length <= 0) {
                filteredProducts = [-1]
            }
        }
        return filteredProducts;
    }
}

@Pipe({ name: 'searchProductByCategory' })
export class searchProductByCategoryFilter implements PipeTransform {
    transform(products: any[], selectedCategory: any) {
        let filteredProducts = [];
        if(selectedCategory){
         
            filteredProducts = products && products.length > 0 ? products.filter(item => item.ProductCategoryID && item.ProductCategoryID == selectedCategory) : [];

            if (!filteredProducts || filteredProducts.length <= 0) {
                filteredProducts = [-1]
            }

        } else{
            filteredProducts = products;
        }

        return filteredProducts;
    }
}

@Pipe({ name: 'searchClassByCategory' })
export class searchClassByCategoryFilter implements PipeTransform {
    transform(classes: any[], selectedCategory: any) {
        let filteredClasses = [];
        if(selectedCategory){
         
            filteredClasses = classes && classes.length > 0 ? classes.filter(item => item.ClassCategoryID && item.ClassCategoryID == selectedCategory) : [];

            if (!filteredClasses || filteredClasses.length <= 0) {
                filteredClasses = [-1]
            }

        } else{
            filteredClasses = classes;
        }

        return filteredClasses;
    }
}

@Pipe({ name: 'searchServiceByCategory' })
export class searchServiceByCategoryFilter implements PipeTransform {
    transform(services: any[], selectedCategory: any) {
        let filteredServices = [];
        if(selectedCategory){
         
            filteredServices = services && services.length > 0 ? services.filter(item => item.ServiceCategoryID && item.ServiceCategoryID == selectedCategory) : [];

            if (!filteredServices || filteredServices.length <= 0) {
                filteredServices = [-1]
            }

        } else{
            filteredServices = services;
        }

        return filteredServices;
    }
}

@Pipe({ name: 'servicePackageDurationFilter' })
export class ServicePackageDurationFilter implements PipeTransform {
    transform(servicePackages: any[], serviceId: number) {
        return servicePackages && servicePackages.length > 0 ? servicePackages.filter(item => item.ServiceID && item.ServiceID == serviceId) : [];
    }
}

@Pipe({ name: "staffListFilter" })
export class StaffListFilter implements PipeTransform {
    transform(staffList: any[], staffPositionId: number) {
        if (staffPositionId == 0) {
            return staffList && staffList.length > 0 ? staffList : [];
        } else {
            return staffList && staffList.length > 0 ? staffList.filter(item => item.staffPositionID && item.staffPositionID == staffPositionId) : [];
        }
    }
}

@Pipe({ name: "posAttendeeNameFilter" })
export class posAttendeeNameFilter implements PipeTransform {
    transform(attendeeList: any[], searchText: string) {
        let filteredAttendees = [];
        if (attendeeList && attendeeList.length > 0) {
            filteredAttendees = attendeeList.filter(item => item.CustomerName && item.CustomerName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);

            if (!filteredAttendees || filteredAttendees.length <= 0) {
                filteredAttendees = [-1]
            }
        }
        return filteredAttendees
        //return attendeeList && attendeeList.length > 0 ? attendeeList.filter(attendee => attendee.CustomerName && attendee.CustomerName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) : [];
    }
}

// @Pipe({ name: 'searchProductByDate' })
// export class SearchProductByDateFilter implements PipeTransform {
//     transform(posItems: POSItem[], searchText: string) {
//         return posItems.filter(item => item.Title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
//     }
// }

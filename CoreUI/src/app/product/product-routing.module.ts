import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationProductComponent } from './navigation/product.navigation.component';
import { SearchCategoriesComponent } from './categories/search/search.categories.component';
import { AttributesSearchComponent } from './attributes/search/search.attribute.component';
import { SearchSuppliersComponent } from './suppliers/search/search.suppliers.component';
import { SaveSupplierComponent } from './suppliers/save/save.supplier.component';
import { SearchBrandsComponent } from './brands/search/search.brands.component';
import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Product } from 'src/app/helper/config/app.module.page.enums';
import { SearchProductsComponent } from './products/search/search.products.component';
import { SaveProductComponent } from './products/save/save.products.component';
import { SearchPurchaseOrderComponent } from './purchase-order/search/search.purchase.order.component';
import { SavePurchaseOrderComponent } from './purchase-order/save/save.prchase.order.component';


const routes: Routes = [

  {
    path: '',
    component: NavigationProductComponent,
    children: [

      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
      {
        path: 'categories',
        component: SearchCategoriesComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Category_View }
      },
      {
        path: 'attributes',
        component: AttributesSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Attribute_View }
      },
      {
        path: 'suppliers',
        component: SearchSuppliersComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Supplier_View }
      },
      {
        path: 'suppliers/details/:ID',
        component: SaveSupplierComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Supplier_Save }
      },
      {
        path: 'brands',
        component: SearchBrandsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Brand_View }
      },
      {
        path: 'products',
        component: SearchProductsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Product_View }
      },
      {
        path: 'products/details/:ID',
        component: SaveProductComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.Product_Save }
      },
      {
        path: 'purchase-order',
        component: SearchPurchaseOrderComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.PO_View }
      },
      {
        path: 'purchase-order/details/:ID',
        component: SavePurchaseOrderComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Product, page: ENU_Permission_Product.PO_Save }
      },
      { path: '**', redirectTo: 'products', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }

/****Angular references ****/
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';

/****3rd party imports ********/
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';

import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { SortablejsModule } from 'ngx-sortablejs';
/****Services **********/
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";

/****Components ********/
import { ProductRoutingModule } from 'src/app/product/product-routing.module';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';

import { SearchCategoriesComponent } from './categories/search/search.categories.component';
import { SaveCategoryComponent } from './categories/save/save.category.component';
import { ViewCategoryComponent } from './categories/view/view.category.component';
import { AttributesSearchComponent } from './attributes/search/search.attribute.component';
import { ViewAttributeComponent } from './attributes/view/view.attribute.component';
import { SaveAttributeComponent } from './attributes/save/save.attribute.component';
import { NavigationProductComponent } from './navigation/product.navigation.component';
import { SaveSupplierComponent } from './suppliers/save/save.supplier.component';
import { SearchSuppliersComponent } from './suppliers/search/search.suppliers.component';
import { SharedModule } from 'src/app/shared/shared-module';
import { SearchBrandsComponent } from './brands/search/search.brands.component';
import { SaveBrandComponent } from './brands/save/save.brand.component';
import { ViewBrandComponent } from './brands/view/view.brand.component';
import { ViewSupplierComponent } from './suppliers/view/view.supplier.component';
import { SearchProductsComponent } from './products/search/search.products.component';
import { SaveProductComponent } from './products/save/save.products.component';
import { ViewProductComponent } from './products/view/view.products.component';
import { ProductPriceComponent } from './products/product-price/product.price.component';
import { SaveProductPriceComponent } from './products/product-price/save/save.product.price.component';
import { ProductVariantComponent } from './products/product-variant/product.variant.component';
import { EditInventoryComponent } from './products/edit-inventory/edit.inventory.component';
import { BulkUpdateComponent } from './products/edit-inventory/bulk-update/bulk.update.component';

import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { SavePackagingComponent } from './products/product-price/save/packaging/packaging.component';
import { SearchPurchaseOrderComponent } from './purchase-order/search/search.purchase.order.component';
import { SavePurchaseOrderComponent } from './purchase-order/save/save.prchase.order.component';
import { ViewPurchaseOrderComponent } from './purchase-order/view/view.purchase.order.component';
import { SavePurchaseItemsComponent } from './purchase-order/save/add-product/save.add.po.product.component';
import { ReceiveOrderComponent } from './purchase-order/receive-order/receive.order.component';
import { EmailOrderComponent } from './purchase-order/email-order/email.order.component';
import { BulkUpdatePriceComponent } from './products/product-price/save/bulk.update.price.component';
import { RestoreVariantComponent } from './products/product-variant/restore-variant/restore.variant.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProductRoutingModule,
    RouterModule,
    InternationalPhoneNumberModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatStepperModule,
    MatTooltipModule,
    MatSelectModule,
    MatIconModule,
    SharedPaginationModule,
    DragDropModule,
    SharedModule,
    ApplicationPipesModule,
    ApplicationDialogSharedModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  declarations: [
    SearchCategoriesComponent,
    SaveCategoryComponent,
    ViewCategoryComponent,
    AttributesSearchComponent,
    ViewAttributeComponent,
    SaveAttributeComponent,
    NavigationProductComponent,
    SaveSupplierComponent,
    SearchSuppliersComponent,
    SearchBrandsComponent,
    SaveBrandComponent,
    ViewBrandComponent,

    ViewSupplierComponent,
    SearchProductsComponent,
    SaveProductComponent,
    ViewProductComponent,
    ProductPriceComponent,
    SaveProductPriceComponent,
    ProductVariantComponent,
    EditInventoryComponent,
    BulkUpdateComponent,
    SavePackagingComponent,

    SearchPurchaseOrderComponent,
    SavePurchaseOrderComponent,
    ViewPurchaseOrderComponent,
    SavePurchaseItemsComponent,
    ReceiveOrderComponent,
    EmailOrderComponent,
    BulkUpdatePriceComponent,
    RestoreVariantComponent,
  ],
  entryComponents: [
    ViewAttributeComponent,
    SaveBrandComponent,
    ViewBrandComponent,
    BulkUpdatePriceComponent,
    ViewSupplierComponent,
    SaveProductComponent,
    ProductVariantComponent,
    EditInventoryComponent,
    SavePackagingComponent,
    RestoreVariantComponent,
    ViewPurchaseOrderComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    },
    MatDialogService
  ]
})
export class ProductModule { }

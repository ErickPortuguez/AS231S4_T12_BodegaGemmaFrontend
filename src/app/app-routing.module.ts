// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './domain/dashboard/dashboard.component';
import { ProductComponent } from './domain/product/product.component';
import { CategoryComponent } from './domain/category/category.component';
import { ClientComponent } from './domain/client/client.component';
import { SellerComponent } from './domain/seller/seller.component';
import { SupplierComponent } from './domain/supplier/supplier.component';
import { SaleComponent } from './domain/sale/sale.component';
import { PurchaseComponent } from './domain/purchase/purchase.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component'; // Importa el componente "Mi cuenta"

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'categories',
        component: CategoryComponent,
      },
      {
        path: 'products',
        component: ProductComponent,
      },
      {
        path: 'clients',
        component: ClientComponent,
      },
      {
        path: 'sellers',
        component: SellerComponent,
      },
      {
        path: 'suppliers',
        component: SupplierComponent,
      },
      {
        path: 'sales',
        component: SaleComponent,
      },
      {
        path: 'purchases',
        component: PurchaseComponent,
      },
      {
        path: 'account',
        component: AccountComponent, // Añade la ruta "Mi cuenta"
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { Routes } from '@angular/router';
import { ProductFormComponent } from './features/products/pages/product-form/product-form.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products'
    },
    {
        path: 'products',
        loadComponent: () =>
            import(
                './features/products/pages/product-list/product-list.component'
            ).then(m => m.ProductListComponent)
    },
    {
        path: 'products/new',
        component: ProductFormComponent
    },
    {
        path: 'products/edit/:id',
        component: ProductFormComponent
    },
    {
        path: '**',
        redirectTo: 'products'
    },

];

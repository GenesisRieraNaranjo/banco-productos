import { CommonModule } from '@angular/common';
import { Component,OnInit,inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { FinancialProduct } from '../../../../core/models/financial-product';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, take } from 'rxjs';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ConfirmDialogComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit{
  
  private readonly productService = inject(ProductService);

  products: FinancialProduct[]= [];

  searchTerm= '';
  successMessage ='';
  showSuccessDialog = false;
  pageSize = 5;
  currentPage =1;

  isLoading = false;

  readonly skeletonRows = Array.from(
    { length: 5 },
    (_, index) => index
  );

  isDeleting = false;
  errorMessage ='';
  deleteErrorMessage = '';

  selectedProduct: FinancialProduct | null = null;
  openedMenuId: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts():void{
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data ?? [];
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los productos. Inténtalo nuevamente.';
        this.isLoading = false;
      }
    });
  }


  get filteredProducts(): FinancialProduct[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.products;
    }
    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term)
    );
  }


  get paginatedProducts():FinancialProduct[] {
    const start =(this.currentPage -1)* this.pageSize;
    return this.filteredProducts.slice(
      start, start + this.pageSize
    );
  }


  get totalPages() :number{
    return Math.max(
      1, Math.ceil(this.filteredProducts.length/this.pageSize)
    )
  }


  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;
    this.currentPage = 1;
    this.closeMenu();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSize = Number(select.value);
    this.currentPage = 1;
    this.closeMenu();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.closeMenu();
    }
  }

  trackById(index: number, product: FinancialProduct):string{
    return product.id;
  }


  toggleMenu(id: string): void {
    this.openedMenuId = this.openedMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openedMenuId = null;
  }

  openDeleteModal(product: FinancialProduct): void {
    if (this.isDeleting || this.showSuccessDialog) {
      return;
    }

    this.selectedProduct = product;
    this.deleteErrorMessage = '';
    this.errorMessage = '';
    this.closeMenu();
  }

  closeDeleteModal(): void {
    if (this.isDeleting) {
      return;
    }

    this.selectedProduct = null;
    this.deleteErrorMessage = '';
  }

  confirmDelete(): void {
    if (!this.selectedProduct || this.isDeleting) {
      return;
    }
    const productId = this.selectedProduct.id;

    this.isDeleting = true;
    this.deleteErrorMessage = '';
    this.successMessage = '';

    this.productService.deleteProduct(productId)
      .pipe(
        take(1),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe({
        next: () => {
          this.products = this.products.filter(
            product => product.id !== productId
          );
          this.currentPage = Math.min(
            this.currentPage,
            this.totalPages
          );
          this.selectedProduct = null;
          this.successMessage ='El producto se eliminó exitosamente.';
          this.showSuccessDialog = true;
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.selectedProduct = null;

            this.errorMessage ='El producto ya no existe. Se actualizará el listado.';
            this.loadProducts();
            return;
          }
          if (error.status === 0) {
            this.deleteErrorMessage ='No se pudo conectar con el servidor. Inténtalo nuevamente.';
            return;
          }
          this.deleteErrorMessage ='No se pudo eliminar el producto. Inténtalo nuevamente.';
        }
      });
  }


  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    this.successMessage = '';
  }

  

}

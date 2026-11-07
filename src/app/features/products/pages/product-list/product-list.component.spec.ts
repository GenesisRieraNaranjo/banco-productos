import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { FinancialProduct } from '../../../../core/models/financial-product';

describe('ProductListComponent', () => {

  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProducts: FinancialProduct[] = Array.from(
    { length: 12 },
    (_, index) => ({
      id: `producto-${index + 1}`,
      name: `Producto Financiero ${index + 1}`,
      description: `Descripción del producto financiero ${index + 1}`,
      logo: 'https://example.com/logo.png',
      date_release: '2026-11-07',
      date_revision: '2027-11-07'
    })
  );

  beforeEach(async () => {

    productServiceSpy = jasmine.createSpyObj<ProductService>(
      'ProductService',
      [
        'getProducts',
        'deleteProduct'
      ]
    );

    productServiceSpy.getProducts.and.returnValue(
      of({ data: mockProducts })
    );

    productServiceSpy.deleteProduct.and.returnValue(
      of({ message: 'Producto eliminado' })
    );

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: productServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // ==========================================
  // CREACIÓN Y CARGA
  // ==========================================

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los productos al iniciar', () => {
    expect(productServiceSpy.getProducts).toHaveBeenCalled();

    expect(component.products.length).toBe(12);

    expect(component.isLoading).toBeFalse();
  });

  it('debería manejar una respuesta sin productos', () => {
    productServiceSpy.getProducts.and.returnValue(
      of({ data: [] })
    );

    component.loadProducts();

    expect(component.products.length).toBe(0);
    expect(component.currentPage).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('debería mostrar un error cuando falla la carga', () => {
    productServiceSpy.getProducts.and.returnValue(
      throwError(() => new Error('Error de conexión'))
    );

    component.loadProducts();

    expect(component.errorMessage).toContain(
      'No se pudieron cargar los productos'
    );

    expect(component.isLoading).toBeFalse();
  });

  it('debería mantener el skeleton mientras carga', () => {
    const pendingRequest = new Subject<{
      data: FinancialProduct[];
    }>();

    productServiceSpy.getProducts.and.returnValue(
      pendingRequest.asObservable()
    );

    component.loadProducts();

    expect(component.isLoading).toBeTrue();
    expect(component.skeletonRows.length).toBe(5);

    pendingRequest.next({ data: mockProducts });
    pendingRequest.complete();

    expect(component.isLoading).toBeFalse();
  });

  // ==========================================
  // BÚSQUEDA
  // ==========================================

  it('debería mostrar todos los productos sin búsqueda', () => {
    component.searchTerm = '';

    expect(component.filteredProducts.length).toBe(12);
  });

  it('debería filtrar productos por nombre', () => {
    component.searchTerm = 'Producto Financiero 1';

    expect(component.filteredProducts.length).toBe(4);
  });

  it('debería filtrar productos por ID', () => {
    component.searchTerm = 'producto-5';

    expect(component.filteredProducts.length).toBe(1);

    expect(component.filteredProducts[0].id).toBe('producto-5');
  });

  it('debería filtrar productos por descripción', () => {
    component.products = [
      {
        ...mockProducts[0],
        description: 'Tarjeta exclusiva para clientes'
      },
      {
        ...mockProducts[1],
        description: 'Cuenta de ahorros tradicional'
      }
    ];

    component.searchTerm = 'exclusiva';

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('producto-1');
  });

  it('debería ignorar mayúsculas y espacios en la búsqueda', () => {
    component.searchTerm = '  PRODUCTO-5  ';

    expect(component.filteredProducts.length).toBe(1);
  });

  it('debería reiniciar la paginación al buscar', () => {
    component.currentPage = 2;
    component.openedMenuId = 'producto-1';

    const event = {
      target: { value: 'producto-3' }
    } as unknown as Event;

    component.onSearch(event);

    expect(component.searchTerm).toBe('producto-3');
    expect(component.currentPage).toBe(1);
    expect(component.openedMenuId).toBeNull();
  });

  // ==========================================
  // PAGINACIÓN
  // ==========================================

  it('debería mostrar cinco productos por página', () => {
    expect(component.pageSize).toBe(5);
    expect(component.paginatedProducts.length).toBe(5);
  });

  it('debería calcular correctamente el total de páginas', () => {
    expect(component.totalPages).toBe(3);
  });

  it('debería cambiar a una página válida', () => {
    component.changePage(2);

    expect(component.currentPage).toBe(2);
    expect(component.paginatedProducts[0].id).toBe('producto-6');
  });

  it('no debería permitir una página menor que uno', () => {
    component.changePage(0);

    expect(component.currentPage).toBe(1);
  });

  it('no debería permitir una página mayor al total', () => {
    component.changePage(10);

    expect(component.currentPage).toBe(1);
  });

  it('debería cambiar la cantidad de registros por página', () => {
    component.currentPage = 2;
    component.openedMenuId = 'producto-1';

    const event = {
      target: { value: '10' }
    } as unknown as Event;

    component.onPageSizeChange(event);

    expect(component.pageSize).toBe(10);
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(2);
    expect(component.openedMenuId).toBeNull();
  });

  it('debería mostrar al menos una página sin productos', () => {
    component.products = [];

    expect(component.totalPages).toBe(1);
    expect(component.paginatedProducts.length).toBe(0);
  });

  it('debería identificar productos por ID', () => {
    expect(component.trackById(0, mockProducts[0]))
      .toBe('producto-1');
  });

  // ==========================================
  // MENÚ DE ACCIONES
  // ==========================================

  it('debería abrir el menú de acciones', () => {
    component.toggleMenu('producto-1');

    expect(component.openedMenuId).toBe('producto-1');
  });

  it('debería cerrar el menú al seleccionar el mismo producto', () => {
    component.toggleMenu('producto-1');
    component.toggleMenu('producto-1');

    expect(component.openedMenuId).toBeNull();
  });

  it('debería cerrar el menú manualmente', () => {
    component.openedMenuId = 'producto-1';

    component.closeMenu();

    expect(component.openedMenuId).toBeNull();
  });

  // ==========================================
  // MODAL DE ELIMINACIÓN
  // ==========================================

  it('debería abrir el modal de eliminación', () => {
    component.openedMenuId = 'producto-1';

    component.openDeleteModal(mockProducts[0]);

    expect(component.selectedProduct).toEqual(mockProducts[0]);
    expect(component.openedMenuId).toBeNull();
  });

  it('no debería abrir el modal mientras elimina', () => {
    component.isDeleting = true;

    component.openDeleteModal(mockProducts[0]);

    expect(component.selectedProduct).toBeNull();
  });

  it('no debería abrir el modal si el diálogo de éxito está visible', () => {
    component.showSuccessDialog = true;

    component.openDeleteModal(mockProducts[0]);

    expect(component.selectedProduct).toBeNull();
  });

  it('debería cerrar el modal de eliminación', () => {
    component.selectedProduct = mockProducts[0];
    component.deleteErrorMessage = 'Error';

    component.closeDeleteModal();

    expect(component.selectedProduct).toBeNull();
    expect(component.deleteErrorMessage).toBe('');
  });

  it('no debería cerrar el modal mientras elimina', () => {
    component.selectedProduct = mockProducts[0];
    component.isDeleting = true;

    component.closeDeleteModal();

    expect(component.selectedProduct).toEqual(mockProducts[0]);
  });

  // ==========================================
  // ELIMINACIÓN
  // ==========================================

  it('debería eliminar un producto correctamente', () => {
    component.openDeleteModal(mockProducts[0]);

    component.confirmDelete();

    expect(productServiceSpy.deleteProduct)
      .toHaveBeenCalledWith('producto-1');

    expect(component.products.length).toBe(11);
    expect(component.selectedProduct).toBeNull();

    expect(component.showSuccessDialog).toBeTrue();

    expect(component.successMessage).toContain(
      'se eliminó exitosamente'
    );

    expect(component.isDeleting).toBeFalse();
  });

  it('no debería eliminar si no hay producto seleccionado', () => {
    component.selectedProduct = null;

    component.confirmDelete();

    expect(productServiceSpy.deleteProduct)
      .not.toHaveBeenCalled();
  });

  it('no debería eliminar si ya existe una eliminación en curso', () => {
    component.selectedProduct = mockProducts[0];
    component.isDeleting = true;

    component.confirmDelete();

    expect(productServiceSpy.deleteProduct)
      .not.toHaveBeenCalled();
  });

  it('debería ajustar la página después de eliminar', () => {
    component.products = [...mockProducts.slice(0, 6)];
    component.currentPage = 2;

    component.openDeleteModal(mockProducts[5]);
    component.confirmDelete();

    expect(component.products.length).toBe(5);
    expect(component.currentPage).toBe(1);
  });

  it('debería manejar un error HTTP 404 al eliminar', () => {
    productServiceSpy.deleteProduct.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      }))
    );

    component.openDeleteModal(mockProducts[0]);
    component.confirmDelete();

    expect(component.selectedProduct).toBeNull();
    expect(productServiceSpy.getProducts).toHaveBeenCalledTimes(2);
    expect(component.isDeleting).toBeFalse();
  });

  it('debería manejar errores de conexión al eliminar', () => {
    productServiceSpy.deleteProduct.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      }))
    );

    component.openDeleteModal(mockProducts[0]);
    component.confirmDelete();

    expect(component.deleteErrorMessage).toContain(
      'No se pudo conectar con el servidor'
    );

    expect(component.isDeleting).toBeFalse();
  });

  it('debería manejar errores HTTP 500 al eliminar', () => {
    productServiceSpy.deleteProduct.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      }))
    );

    component.openDeleteModal(mockProducts[0]);
    component.confirmDelete();

    expect(component.deleteErrorMessage).toContain(
      'No se pudo eliminar el producto'
    );

    expect(component.isDeleting).toBeFalse();
  });

  it('debería mantener el estado de eliminación mientras espera respuesta', () => {
    const pendingDelete = new Subject<{ message: string }>();

    productServiceSpy.deleteProduct.and.returnValue(
      pendingDelete.asObservable()
    );

    component.openDeleteModal(mockProducts[0]);
    component.confirmDelete();

    expect(component.isDeleting).toBeTrue();

    pendingDelete.next({ message: 'Producto eliminado' });
    pendingDelete.complete();

    expect(component.isDeleting).toBeFalse();
    expect(component.showSuccessDialog).toBeTrue();
  });

  // ==========================================
  // DIÁLOGO DE ÉXITO
  // ==========================================

  it('debería cerrar el diálogo de éxito', () => {
    component.showSuccessDialog = true;
    component.successMessage = 'Producto eliminado';

    component.closeSuccessDialog();

    expect(component.showSuccessDialog).toBeFalse();
    expect(component.successMessage).toBe('');
  });

});
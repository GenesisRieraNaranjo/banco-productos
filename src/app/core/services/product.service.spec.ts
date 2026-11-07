import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProductService } from './product.service';

import { FinancialProduct } from '../models/financial-product';

describe('ProductService', () => {

  let service: ProductService;
  let httpMock: HttpTestingController;

  const baseUrl = '/bp/products';

  const mockProduct: FinancialProduct = {
    id: 'trj-crd',
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero de prueba',
    logo: 'https://example.com/logo.png',
    date_release: '2026-11-07',
    date_revision: '2027-11-07'
  };

  

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductService);

    httpMock = TestBed.inject(HttpTestingController);

  });

  

  afterEach(() => {
    httpMock.verify();
  });

  // ==========================================
  // TEST 1 - CREACIÓN DEL SERVICIO
  // ==========================================

  it('debería crear el servicio correctamente', () => {

    expect(service).toBeTruthy();

  });

  // ==========================================
  // TEST 2 - OBTENER PRODUCTOS (GET)
  // ==========================================

  it('debería obtener la lista de productos', () => {

    const mockResponse = {
      data: [mockProduct]
    };

    service.getProducts().subscribe(response => {

      expect(response.data.length).toBe(1);

      expect(response.data[0].id).toBe('trj-crd');

      expect(response.data[0].name).toBe('Tarjeta de Crédito');

    });

    const request = httpMock.expectOne(baseUrl);

    expect(request.request.method).toBe('GET');

    request.flush(mockResponse);

  });

  // ==========================================
  // TEST 3 - CREAR PRODUCTO (POST)
  // ==========================================

  it('debería registrar un producto correctamente', () => {

    const mockResponse = {
      message: 'Producto creado',
      data: mockProduct
    };

    service.createProduct(mockProduct).subscribe(response => {

      expect(response.message).toBe('Producto creado');

      expect(response.data.id).toBe(mockProduct.id);

    });

    const request = httpMock.expectOne(baseUrl);

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual(mockProduct);

    request.flush(mockResponse);

  });

  // ==========================================
  // TEST 4 - ACTUALIZAR PRODUCTO (PUT)
  // ==========================================

  it('debería actualizar un producto correctamente', () => {

    const { id, ...updateData } = mockProduct;

    const mockResponse = {
      message: 'Producto actualizado',
      data: mockProduct
    };

    service.updateProduct(id, updateData).subscribe(response => {

      expect(response.message).toBe('Producto actualizado');

    });

    const request = httpMock.expectOne(
      `${baseUrl}/${id}`
    );

    expect(request.request.method).toBe('PUT');

    // El ID no debe enviarse en el body del PUT
    expect(request.request.body).toEqual(updateData);

    expect(request.request.body.id).toBeUndefined();

    request.flush(mockResponse);

  });

  // ==========================================
  // TEST 5 - ELIMINAR PRODUCTO (DELETE)
  // ==========================================

  it('debería eliminar un producto correctamente', () => {

    const mockResponse = {
      message: 'Producto eliminado'
    };

    service.deleteProduct(mockProduct.id).subscribe(response => {

      expect(response.message).toBe('Producto eliminado');

    });

    const request = httpMock.expectOne(
      `${baseUrl}/${mockProduct.id}`
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(mockResponse);

  });

  // ==========================================
  // TEST 6 - VERIFICAR ID EXISTENTE
  // ==========================================

  it('debería devolver true cuando el ID existe', () => {

    service.verifyProductId(mockProduct.id)
      .subscribe(exists => {

        expect(exists).toBeTrue();

      });

    const request = httpMock.expectOne(
      `${baseUrl}/verification/${mockProduct.id}`
    );

    expect(request.request.method).toBe('GET');

    request.flush(true);

  });

  // ==========================================
  // TEST 7 - VERIFICAR ID DISPONIBLE
  // ==========================================

  it('debería devolver false cuando el ID no existe', () => {

    service.verifyProductId('nuevo-id')
      .subscribe(exists => {

        expect(exists).toBeFalse();

      });

    const request = httpMock.expectOne(
      `${baseUrl}/verification/nuevo-id`
    );

    expect(request.request.method).toBe('GET');

    request.flush(false);

  });

  // ==========================================
  // TEST 8 - MANEJO DE ERROR HTTP 500
  // ==========================================

  it('debería propagar errores del servidor', () => {

    service.getProducts().subscribe({

      next: () => {
        fail('Se esperaba un error HTTP');
      },

      error: error => {

        expect(error.status).toBe(500);

        expect(error.statusText).toBe('Internal Server Error');

      }

    });

    const request = httpMock.expectOne(baseUrl);

    expect(request.request.method).toBe('GET');

    request.flush(
      {
        message: 'Error interno del servidor'
      },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

  });

});
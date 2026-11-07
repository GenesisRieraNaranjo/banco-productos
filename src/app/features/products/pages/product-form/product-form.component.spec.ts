import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';

import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { FinancialProduct } from '../../../../core/models/financial-product';

describe('ProductFormComponent', () => {

  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let router: Router;

  const mockProduct: FinancialProduct = {
    id: 'prod-001',
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero para clientes',
    logo: 'https://example.com/logo.png',
    date_release: '2099-01-15',
    date_revision: '2100-01-15'
  };

  function configureRoute(id: string | null = null): void {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: {
          paramMap: convertToParamMap(id ? { id } : {})
        }
      }
    });
  }

  async function setup(id: string | null = null): Promise<void> {

    productServiceSpy = jasmine.createSpyObj<ProductService>(
      'ProductService',
      [
        'getProducts',
        'createProduct',
        'updateProduct',
        'verifyProductId'
      ]
    );

    productServiceSpy.getProducts.and.returnValue(
      of({ data: [mockProduct] })
    );

    productServiceSpy.createProduct.and.returnValue(
      of({
        message: 'Producto creado',
        data: mockProduct
      })
    );

    productServiceSpy.updateProduct.and.returnValue(
      of({
        message: 'Producto actualizado',
        data: mockProduct
      })
    );

    productServiceSpy.verifyProductId.and.returnValue(
      of(false)
    );

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: productServiceSpy
        }
      ]
    }).compileComponents();

    configureRoute(id);

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  function fillValidForm(): void {
    component.form.patchValue({
      id: 'nuevo-001',
      name: 'Tarjeta Premium',
      description: 'Producto financiero para clientes premium',
      logo: 'https://example.com/premium.png',
      date_release: '2099-01-15',
      date_revision: '2100-01-15'
    });

    component.form.updateValueAndValidity();
  }

  // ==========================================
  // CREACIÓN DEL COMPONENTE
  // ==========================================

  it('debería crear el componente correctamente', async () => {
    await setup();

    expect(component).toBeTruthy();
  });

  it('debería iniciar en modo registro', async () => {
    await setup();

    expect(component.isEditMode).toBeFalse();
    expect(component.isLoading).toBeFalse();
    expect(component.isSaving).toBeFalse();
  });

  it('debería iniciar el formulario vacío', async () => {
    await setup();

    expect(component.idControl.value).toBe('');
    expect(component.nameControl.value).toBe('');
    expect(component.descriptionControl.value).toBe('');
    expect(component.logoControl.value).toBe('');
  });

  // ==========================================
  // VALIDACIONES
  // ==========================================

  it('debería invalidar un formulario vacío', async () => {
    await setup();

    expect(component.form.invalid).toBeTrue();
  });

  it('debería exigir un ID obligatorio', async () => {
    await setup();

    component.idControl.setValue('');

    expect(component.idControl.hasError('required')).toBeTrue();
  });

  it('debería exigir mínimo 3 caracteres en el ID', async () => {
    await setup();

    component.idControl.setValue('ab');

    expect(component.idControl.hasError('minlength')).toBeTrue();
  });

  it('debería rechazar un ID mayor a 10 caracteres', async () => {
    await setup();

    component.idControl.setValue('identificador-muy-largo');

    expect(component.idControl.hasError('maxlength')).toBeTrue();
  });

  it('debería exigir mínimo 5 caracteres en el nombre', async () => {
    await setup();

    component.nameControl.setValue('ABC');

    expect(component.nameControl.hasError('minlength')).toBeTrue();
  });

  it('debería rechazar nombres mayores a 100 caracteres', async () => {
    await setup();

    component.nameControl.setValue('A'.repeat(101));

    expect(component.nameControl.hasError('maxlength')).toBeTrue();
  });

  it('debería exigir mínimo 10 caracteres en la descripción', async () => {
    await setup();

    component.descriptionControl.setValue('Corta');

    expect(component.descriptionControl.hasError('minlength')).toBeTrue();
  });

  it('debería rechazar descripciones mayores a 200 caracteres', async () => {
    await setup();

    component.descriptionControl.setValue('A'.repeat(201));

    expect(component.descriptionControl.hasError('maxlength')).toBeTrue();
  });

  it('debería exigir el logo', async () => {
    await setup();

    component.logoControl.setValue('');

    expect(component.logoControl.hasError('required')).toBeTrue();
  });

  it('debería rechazar fechas de liberación anteriores', async () => {
    await setup();

    component.releaseControl.setValue('2020-01-01');

    expect(component.releaseControl.hasError('pastDate')).toBeTrue();
  });

  // ==========================================
  // FECHAS
  // ==========================================

  it('debería calcular automáticamente la fecha de revisión', async () => {
    await setup();

    component.releaseControl.setValue('2099-06-15');

    expect(component.revisionControl.value).toBe('2100-06-15');
  });

  it('debería limpiar la revisión si se elimina la liberación', async () => {
    await setup();

    component.releaseControl.setValue('2099-06-15');
    component.releaseControl.setValue('');

    expect(component.revisionControl.value).toBe('');
  });

  it('debería devolver la fecha mínima actual', async () => {
    await setup();

    const today = new Date();
    const expected = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    expect(component.minReleaseDate).toBe(expected);
  });

  // ==========================================
  // VALIDACIÓN VISUAL
  // ==========================================

  it('debería identificar un campo inválido y tocado', async () => {
    await setup();

    component.nameControl.setValue('');
    component.nameControl.markAsTouched();

    expect(component.isInvalid(component.nameControl)).toBeTrue();
  });

  it('no debería mostrar error en un campo sin tocar', async () => {
    await setup();

    expect(component.isInvalid(component.nameControl)).toBeFalse();
  });

  it('debería identificar una fecha de revisión incorrecta', async () => {
    await setup();

    component.form.patchValue({
      date_release: '2099-01-15',
      date_revision: '2099-02-15'
    });

    component.revisionControl.markAsTouched();

    expect(component.revisionInvalid).toBeTrue();
  });

  // ==========================================
  // REGISTRO
  // ==========================================

  it('no debería guardar un formulario inválido', async () => {
    await setup();

    component.saveProduct();

    expect(productServiceSpy.createProduct).not.toHaveBeenCalled();
  });

  it('debería registrar un producto válido', fakeAsync(() => {
    let ready = false;

    setup().then(() => {
      fillValidForm();

      // El ID utiliza updateOn: blur y validación asíncrona.
      // Esperamos a que finalice antes de guardar.
      component.idControl.updateValueAndValidity();
      ready = true;
    });

    tick();
    expect(ready).toBeTrue();

    tick(300);

    component.saveProduct();

    expect(productServiceSpy.createProduct).toHaveBeenCalled();
    expect(component.showSuccessDialog).toBeTrue();
    expect(component.isSaving).toBeFalse();
  }));

  it('debería mostrar un mensaje de éxito al registrar', fakeAsync(() => {
    setup().then(() => {
      fillValidForm();
      component.idControl.updateValueAndValidity();
    });

    tick();
    tick(300);

    component.saveProduct();

    expect(component.successMessage).toContain(
      'se registró exitosamente'
    );
  }));

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  it('debería manejar un error HTTP 400 al guardar', fakeAsync(() => {
    setup().then(() => {
      fillValidForm();
      component.idControl.updateValueAndValidity();

      productServiceSpy.createProduct.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );
    });

    tick();
    tick(300);

    component.saveProduct();

    expect(component.errorMessage).toContain(
      'Los datos enviados no son válidos'
    );
  }));

  it('debería manejar un error HTTP 404 al guardar', fakeAsync(() => {
    setup().then(() => {
      fillValidForm();
      component.idControl.updateValueAndValidity();

      productServiceSpy.createProduct.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );
    });

    tick();
    tick(300);

    component.saveProduct();

    expect(component.errorMessage).toContain(
      'El producto ya no existe'
    );
  }));

  it('debería manejar un error de conexión', fakeAsync(() => {
    setup().then(() => {
      fillValidForm();
      component.idControl.updateValueAndValidity();

      productServiceSpy.createProduct.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 0 }))
      );
    });

    tick();
    tick(300);

    component.saveProduct();

    expect(component.errorMessage).toContain(
      'No se pudo conectar'
    );
  }));

  it('debería manejar un error HTTP 500 al guardar', fakeAsync(() => {
    setup().then(() => {
      fillValidForm();
      component.idControl.updateValueAndValidity();

      productServiceSpy.createProduct.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
    });

    tick();
    tick(300);

    component.saveProduct();

    expect(component.errorMessage).toContain(
      'Ocurrió un error al guardar'
    );
  }));

  // ==========================================
  // EDICIÓN
  // ==========================================

  it('debería activar el modo edición', async () => {
    await setup('prod-001');

    expect(component.isEditMode).toBeTrue();
    expect(component.idControl.disabled).toBeTrue();
  });

  it('debería cargar los datos del producto existente', async () => {
    await setup('prod-001');

    expect(component.nameControl.value).toBe('Tarjeta de Crédito');
    expect(component.descriptionControl.value)
      .toBe('Producto financiero para clientes');
  });

  it('debería mostrar error si el producto no existe', async () => {
    await setup('no-existe');

    expect(component.productNotFound).toBeTrue();
    expect(component.errorMessage).toContain(
      'No se encontró el producto solicitado'
    );
  });

  it('debería actualizar un producto existente', async () => {
    await setup('prod-001');

    component.nameControl.setValue('Tarjeta Actualizada');

    component.saveProduct();

    expect(productServiceSpy.updateProduct).toHaveBeenCalled();
    expect(component.showSuccessDialog).toBeTrue();
  });

  it('no debería enviar el ID en el cuerpo de actualización', async () => {
    await setup('prod-001');

    component.saveProduct();

    const args = productServiceSpy.updateProduct.calls.mostRecent().args;

    expect(args[0]).toBe('prod-001');
    expect((args[1] as any).id).toBeUndefined();
  });

  // ==========================================
  // REINICIO
  // ==========================================

  it('debería reiniciar el formulario de registro', async () => {
    await setup();

    component.nameControl.setValue('Producto temporal');

    component.resetForm();

    expect(component.nameControl.value).toBe('');
  });

  it('debería restaurar los datos originales en edición', async () => {
    await setup('prod-001');

    component.nameControl.setValue('Nombre modificado');

    component.resetForm();

    expect(component.nameControl.value).toBe('Tarjeta de Crédito');
    expect(component.idControl.disabled).toBeTrue();
  });

  it('no debería reiniciar mientras guarda', async () => {
    await setup();

    component.nameControl.setValue('Producto temporal');
    component.isSaving = true;

    component.resetForm();

    expect(component.nameControl.value).toBe('Producto temporal');
  });

  // ==========================================
  // DIÁLOGO Y NAVEGACIÓN
  // ==========================================

  it('debería cerrar el diálogo de éxito y navegar', async () => {
    await setup();

    const navigateSpy = spyOn(router, 'navigate')
      .and.returnValue(Promise.resolve(true));

    component.showSuccessDialog = true;

    component.closeSuccessDialog();

    expect(component.showSuccessDialog).toBeFalse();

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

});
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { revisionDateValidator, todayOrFutureValidator } from '../../validators/product.validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, switchMap, take, timer } from 'rxjs';
import { FinancialProduct, UpdateProductResponse } from '../../../../core/models/financial-product';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit{

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService)
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);


  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  private productId: string | null = null;
  private originalProduct: FinancialProduct | null = null;

  productNotFound = false;
  showSuccessDialog = false;
  

  readonly form = this.fb.nonNullable.group(
    {
      id:this.fb.nonNullable.control(
        '',
        {
          validators:[
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(10)
          ],
          asyncValidators: [
            this.uniqueIdValidator()
          ],
          updateOn: 'blur'
        }
      ),
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200)
        ]
      ],
      logo: [
        '',
        [
          Validators.required
        ]
      ],
      date_release: [
        '',
        [
          Validators.required,
          todayOrFutureValidator()
        ]
      ],
      date_revision: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators:[revisionDateValidator()]
    }
  );

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.productId !== null;

    if (this.isEditMode) {
      this.form.controls.id.disable({
        emitEvent: false
      });

      this.loadProduct();
    }

    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const revision = this.calculateRevisionDate(value);

        this.form.controls.date_revision.setValue(revision);
      });
  }


  private uniqueIdValidator(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ) => {
      const id = String(control.value ?? '').trim();
      if(!id || id.length < 3 || id.length > 10){
        return of(null);
      }
      return timer(300).pipe(
        switchMap(() => 
          this.productService.verifyProductId(id)
        ),
        map(exists => 
            exists
            ? {idExists:true}
            : null
        ),
        catchError(() =>
          of({verificationFailed: true})
        ),
        take(1)
      );
    };
  }


  private loadProduct(): void {
    if (!this.productId) {
      return;
    }

    this.isLoading = true;
    this.productNotFound = false;
    this.errorMessage = '';

    this.productService.getProducts()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {

          const product = response.data.find(
            item => item.id === this.productId
          );

          if (!product) {
            this.productNotFound = true;
            this.errorMessage =
              'No se encontró el producto solicitado.';
            return;
          }

          this.originalProduct = { ...product };

          this.form.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: this.formatDate(product.date_release),
            date_revision: this.formatDate(product.date_revision)
          }, {
            emitEvent: false
          });

          this.form.markAsPristine();
          this.form.markAsUntouched();
          this.form.updateValueAndValidity({
            emitEvent: false
          });
        },

        error: (error: HttpErrorResponse) => {

          this.productNotFound = true;

          this.errorMessage = error.status === 0
            ? 'No se pudo conectar con el servidor.'
            : 'No se pudo cargar la información del producto.';
        }
      });
  }

  private formatDate(value: string): string {
    if (!value) {
      return '';
    }

    return value.slice(0, 10);
  }



  private calculateRevisionDate(releaseDate: string): string {
    if (!releaseDate) return '';

    const parts = releaseDate.split('-').map(Number);

    if (parts.length !== 3) return '';

    const [year, month, day] = parts;

    const revision = new Date(
      Date.UTC(year + 1, month - 1, day)
    );

    if (
      revision.getUTCFullYear() !== year + 1 ||
      revision.getUTCMonth() !== month - 1 ||
      revision.getUTCDate() !== day
    ) {
      return '';
    }

    return revision.toISOString().slice(0, 10);
  }


  get minReleaseDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      today.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get idControl(){
    return this.form.controls.id;
  }

  get nameControl(){
    return this.form.controls.name;
  }

  get descriptionControl(){
    return this.form.controls.description;
  }

  get logoControl(){
    return this.form.controls.logo;
  }

  get releaseControl(){
    return this.form.controls.date_release;
  }

  get revisionControl(){
    return this.form.controls.date_revision;
  }

  isInvalid(
    control: AbstractControl
  ):boolean {
    return control.invalid && 
    (control.touched || control.dirty);
  }

  get revisionInvalid(): boolean {
    return (
      this.form.hasError('invalidRevisionDate') ||
      this.form.controls.date_revision.invalid
    ) && (
      this.form.controls.date_revision.touched ||
      this.form.controls.date_release.touched
    );
  }

  resetForm(): void {
    if (this.isSaving || this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode && this.originalProduct) {

      const product = this.originalProduct;

      this.form.reset({
        id: product.id,
        name: product.name,
        description: product.description,
        logo: product.logo,
        date_release: this.formatDate(product.date_release),
        date_revision: this.formatDate(product.date_revision)
      }, {
        emitEvent: false
      });

      this.form.controls.id.disable({
        emitEvent: false
      });

      this.form.updateValueAndValidity({
        emitEvent: false
      });

      return;
    }

    if (!this.isEditMode) {
      this.form.reset();
    }
  }

  saveProduct(): void {
    if (
      this.isSaving ||
      this.isLoading ||
      this.productNotFound ||
      (this.isEditMode && !this.originalProduct)
    ) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.form.markAllAsTouched();

    if (this.form.invalid || this.form.pending) {
      return;
    }

    const values = this.form.getRawValue();

    const product: FinancialProduct = {
      id: values.id.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      logo: values.logo.trim(),
      date_release: values.date_release,
      date_revision: values.date_revision
    };

    this.isSaving = true;

    const request$ = this.isEditMode && this.productId
      ? this.productService.updateProduct(
          this.productId,
          this.toUpdateRequest(product)
        )
      : this.productService.createProduct(product);

    request$
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode
            ? 'El producto se actualizó exitosamente.'
            : 'El producto se registró exitosamente.';

          this.showSuccessDialog = true;
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.errorMessage =
              'Los datos enviados no son válidos. Revisa el formulario.';
          } else if (error.status === 404) {
            this.errorMessage =
              'El producto ya no existe.';
          } else if (error.status === 0) {
            this.errorMessage =
              'No se pudo conectar con el servidor.';
          } else {
            this.errorMessage =
              'Ocurrió un error al guardar el producto.';
          }
        }
      });
  }

  private toUpdateRequest(
    product: FinancialProduct
  ): UpdateProductResponse {
    const { id, ...payload } = product;
    return payload;
  }

  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    void this.router.navigate(['/products']);
  }


}

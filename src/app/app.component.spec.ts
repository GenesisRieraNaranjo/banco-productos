import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  // ==========================================
  // TEST 1 - CREACIÓN DEL COMPONENTE
  // ==========================================

  it('debería crear el componente principal', () => {

    expect(component).toBeTruthy();

  });

  // ==========================================
  // TEST 2 - TÍTULO DE LA APLICACIÓN
  // ==========================================

  it('debería tener el título banco-productos', () => {

    expect(component.title).toBe('banco-productos');

  });

  // ==========================================
  // TEST 3 - ROUTER OUTLET
  // ==========================================

  it('debería contener el router-outlet', () => {

    const compiled: HTMLElement = fixture.nativeElement;

    const routerOutlet = compiled.querySelector('router-outlet');

    expect(routerOutlet).not.toBeNull();

  });

});
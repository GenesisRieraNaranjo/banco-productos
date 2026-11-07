import { FormControl, FormGroup } from '@angular/forms';

import {
  todayOrFutureValidator,
  revisionDateValidator
} from './product.validators';

describe('Product Validators', () => {

  // ==========================================
  // VALIDACIÓN DE FECHA DE LIBERACIÓN
  // ==========================================

  describe('todayOrFutureValidator', () => {

    const validator = todayOrFutureValidator();

    // ==========================================
    // TEST 1 - FECHA ACTUAL
    // ==========================================

    it('debería aceptar la fecha actual', () => {

      const today = new Date();

      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
      ].join('-');

      const control = new FormControl(todayString);

      expect(validator(control)).toBeNull();

    });

    // ==========================================
    // TEST 2 - FECHA FUTURA
    // ==========================================

    it('debería aceptar una fecha futura', () => {

      const control = new FormControl('2099-12-31');

      expect(validator(control)).toBeNull();

    });

    // ==========================================
    // TEST 3 - FECHA ANTERIOR
    // ==========================================

    it('debería rechazar una fecha anterior', () => {

      const control = new FormControl('2020-01-01');

      expect(validator(control)).toEqual({
        pastDate: true
      });

    });

    // ==========================================
    // TEST 4 - FECHA VACÍA
    // ==========================================

    it('debería permitir un valor vacío', () => {

      const control = new FormControl('');

      expect(validator(control)).toBeNull();

    });

    // ==========================================
    // TEST 5 - FECHA INEXISTENTE
    // ==========================================

    it('debería rechazar una fecha inexistente', () => {

      const control = new FormControl('2026-02-30');

      expect(validator(control)).toEqual({
        invalidDate: true
      });

    });

    // ==========================================
    // TEST 6 - FORMATO INCORRECTO
    // ==========================================

    it('debería rechazar una fecha con formato incorrecto', () => {

      const control = new FormControl('07/11/2026');

      expect(validator(control)).toEqual({
        invalidDate: true
      });

    });

    // ==========================================
    // TEST 7 - VALOR NO STRING
    // ==========================================

    it('debería rechazar un valor que no sea texto', () => {

      const control = new FormControl(12345);

      expect(validator(control)).toEqual({
        invalidDate: true
      });

    });

    // ==========================================
    // TEST 8 - AÑO BISIESTO VÁLIDO
    // ==========================================

    it('debería aceptar el 29 de febrero de un año bisiesto futuro', () => {

      const control = new FormControl('2028-02-29');

      expect(validator(control)).toBeNull();

    });

    // ==========================================
    // TEST 9 - AÑO NO BISIESTO
    // ==========================================

    it('debería rechazar el 29 de febrero de un año no bisiesto', () => {

      const control = new FormControl('2027-02-29');

      expect(validator(control)).toEqual({
        invalidDate: true
      });

    });

  });

  // ==========================================
  // VALIDACIÓN DE FECHA DE REVISIÓN
  // ==========================================

  describe('revisionDateValidator', () => {

    const validator = revisionDateValidator();

    // ==========================================
    // FUNCIÓN AUXILIAR
    // ==========================================

    function createForm(
      release: string,
      revision: string
    ): FormGroup {

      return new FormGroup({
        date_release: new FormControl(release),
        date_revision: new FormControl(revision)
      });

    }

    // ==========================================
    // TEST 10 - REVISIÓN CORRECTA
    // ==========================================

    it('debería aceptar una revisión exactamente un año después', () => {

      const form = createForm(
        '2026-11-07',
        '2027-11-07'
      );

      expect(validator(form)).toBeNull();

    });

    // ==========================================
    // TEST 11 - REVISIÓN ANTERIOR
    // ==========================================

    it('debería rechazar una fecha de revisión anterior', () => {

      const form = createForm(
        '2026-11-07',
        '2026-12-07'
      );

      expect(validator(form)).toEqual({
        invalidRevisionDate: true
      });

    });

    // ==========================================
    // TEST 12 - REVISIÓN POSTERIOR
    // ==========================================

    it('debería rechazar una revisión mayor a un año', () => {

      const form = createForm(
        '2026-11-07',
        '2028-11-07'
      );

      expect(validator(form)).toEqual({
        invalidRevisionDate: true
      });

    });

    // ==========================================
    // TEST 13 - LIBERACIÓN VACÍA
    // ==========================================

    it('debería permitir una fecha de liberación vacía', () => {

      const form = createForm(
        '',
        '2027-11-07'
      );

      expect(validator(form)).toBeNull();

    });

    // ==========================================
    // TEST 14 - REVISIÓN VACÍA
    // ==========================================

    it('debería permitir una fecha de revisión vacía', () => {

      const form = createForm(
        '2026-11-07',
        ''
      );

      expect(validator(form)).toBeNull();

    });

    // ==========================================
    // TEST 15 - FECHA DE LIBERACIÓN INVÁLIDA
    // ==========================================

    it('debería rechazar una fecha de liberación inválida', () => {

      const form = createForm(
        '2026-02-30',
        '2027-02-28'
      );

      expect(validator(form)).toEqual({
        invalidRevisionDate: true
      });

    });

    // ==========================================
    // TEST 16 - FECHA DE REVISIÓN INVÁLIDA
    // ==========================================

    it('debería rechazar una fecha de revisión inválida', () => {

      const form = createForm(
        '2026-11-07',
        '2027-02-30'
      );

      expect(validator(form)).toEqual({
        invalidRevisionDate: true
      });

    });

    // ==========================================
    // TEST 17 - CAMBIO DE AÑO
    // ==========================================

    it('debería aceptar una revisión al año siguiente', () => {

      const form = createForm(
        '2026-12-31',
        '2027-12-31'
      );

      expect(validator(form)).toBeNull();

    });

    // ==========================================
    // TEST 18 - AÑO BISIESTO
    // ==========================================

    it('debería aceptar una revisión desde un año bisiesto', () => {

      const form = createForm(
        '2028-02-28',
        '2029-02-28'
      );

      expect(validator(form)).toBeNull();

    });

  });

});
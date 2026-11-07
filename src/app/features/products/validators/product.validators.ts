import {AbstractControl, ValidationErrors,ValidatorFn} from '@angular/forms';

    function parseDate(value: unknown): Date | null {
        if(typeof value !== 'string') return null;
        const  parts = value.split('-').map(Number);
        if(parts.length !== 3) return null;

        const [year, month, day] = parts;
        if(!year|| !month || !day) return null;

        const date = new Date(Date.UTC(year, month -1, day));

        if(
            date.getUTCFullYear() !==year ||
            date.getUTCMonth() !== month -1 ||
            date.getUTCDate() !== day
        ){
            return null;
        }
        return date;
    }


    export function todayOrFutureValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if(!control.value) return null;
            const date = parseDate(control.value);

            if(!date) return { invalidDate: true};
            const today = new Date();

            const currentDate = Date.UTC(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            );
            return date.getTime() >= currentDate
            ? null
            : { pastDate:true};
        };

    }


    export function revisionDateValidator(): ValidatorFn{
        return (control: AbstractControl): ValidationErrors | null => {
            const release = control.get('date_release')?.value;
            const revision = control.get('date_revision')?.value;

            if(!release|| !revision)return null;
            const releaseDate = parseDate(release);
            const revisionDate = parseDate(revision);

            if(!releaseDate || !revisionDate){
                return {invalidRevisionDate: true};
            }

            const expected = new Date(releaseDate);
            expected.setUTCFullYear(expected.getUTCFullYear() + 1);

            return revisionDate.getTime() == expected.getTime()
            ? null
            : {invalidRevisionDate: true};
        };
    }
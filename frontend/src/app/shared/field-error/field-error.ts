import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-field-error',
  template: `
    @if (touched() && errors().length > 0) {
      @for (error of errors(); track $index) {
        <p class="field-error">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
          {{ error.message || 'El valor ingresado no es válido.' }}
        </p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldError {
  readonly errors = input<readonly ValidationError.WithFieldTree[]>([]);
  readonly touched = input(false);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { B2BUser, B2BUserService } from '@spartacus/core';
import { FormUtils } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { CurrentUserService } from '../current-user.service';
import { UserFormService } from '../form/user-form.service';

@Component({
  selector: 'cx-user-edit',
  templateUrl: './user-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditComponent {
  protected code$: Observable<string> = this.currentUserService.code$;

  protected user$: Observable<B2BUser> = this.code$.pipe(
    tap((code) => this.userService.load(code)),
    switchMap(() => this.currentUserService.model$),
    // we have side effects here, we want the to run only once
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected form$: Observable<FormGroup> = this.user$.pipe(
    map((user) => this.userFormService.getForm(user))
  );

  // We have to keep all observable values consistent for a view,
  // that's why we are wrapping them into one observable
  viewModel$ = this.form$.pipe(
    withLatestFrom(this.user$, this.code$),
    map(([form, user, customerId]) => ({ form, customerId, user }))
  );

  constructor(
    protected userService: B2BUserService,
    protected userFormService: UserFormService,
    protected currentUserService: CurrentUserService
  ) {}

  save(customerId: string, form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      FormUtils.deepUpdateValueAndValidity(form);
    } else {
      form.disable();
      this.userService.update(customerId, form.value);

      this.currentUserService.launch('userDetails', { customerId });
    }
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CostCenter, RoutingService } from '@spartacus/core';
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { CurrentCostCenterService } from '../current-cost-center.service';
import { CostCenterFormService } from '../form/cost-center-form.service';
import { CostCenterService } from '../../../core/services/cost-center.service';
import { FormUtils } from '@spartacus/storefront';

@Component({
  selector: 'cx-cost-center-edit',
  templateUrl: './cost-center-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostCenterEditComponent {
  /**
   * The code of the current cost center
   */
  protected code$ = this.currentCostCenterService.code$;

  /**
   * The model of the current cost center.
   *
   * It reloads the model when the code of the current cost center changes.
   */
  protected costCenter$: Observable<
    CostCenter
  > = this.currentCostCenterService.code$.pipe(
    tap((code) => this.costCenterService.load(code)),
    switchMap((code) => this.costCenterService.get(code)),
    shareReplay({ bufferSize: 1, refCount: true }) // we have side effects here, we want the to run only once
  );

  protected form$: Observable<FormGroup> = this.costCenter$.pipe(
    map((costCenter) => this.costCenterFormService.getForm(costCenter))
  );

  // We have to keep all observable values consistent for a view,
  // that's why we are wrapping them into one observable
  viewModel$ = this.form$.pipe(
    withLatestFrom(this.costCenter$, this.code$),
    map(([form, costCenter, code]) => ({ form, code, costCenter }))
  );

  constructor(
    protected costCenterService: CostCenterService,
    protected currentCostCenterService: CurrentCostCenterService,
    protected costCenterFormService: CostCenterFormService,
    protected activatedRoute: ActivatedRoute,
    // we can't do without the router as the routingService is unable to
    // resolve the parent routing params. `paramsInheritanceStrategy: 'always'`
    // would actually fix that.
    protected routingService: RoutingService
  ) {}

  save(costCenterCode: string, form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      FormUtils.deepUpdateValueAndValidity(form);
    } else {
      form.disable();
      this.costCenterService.update(costCenterCode, form.value);

      this.routingService.go({
        cxRoute: 'costCenterDetails',
        params: form.value,
      });
    }
  }
}

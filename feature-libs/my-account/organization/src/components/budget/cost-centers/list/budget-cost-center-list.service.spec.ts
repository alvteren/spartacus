import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Budget, CostCenterService, EntitiesModel } from '@spartacus/core';
import { Table, TableService, TableStructure } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { BudgetCostCenterListService } from './budget-cost-center-list.service';

const mockCostCenterEntities: EntitiesModel<Budget> = {
  values: [
    {
      code: 'first',
      selected: true,
    },
    {
      code: 'second',
      selected: false,
    },
    {
      code: 'third',
      selected: true,
    },
  ],
};

class MockCostCenterService {
  getBudgets(): Observable<EntitiesModel<Budget>> {
    return of(mockCostCenterEntities);
  }
}

@Injectable()
export class MockTableService {
  buildStructure(type): Observable<TableStructure> {
    return of({ type });
  }
}

describe('BudgetCostCenterListService', () => {
  let service: BudgetCostCenterListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        BudgetCostCenterListService,
        {
          provide: CostCenterService,
          useClass: MockCostCenterService,
        },
        {
          provide: TableService,
          useClass: MockTableService,
        },
      ],
    });
    service = TestBed.inject(BudgetCostCenterListService);
  });

  it('should inject service', () => {
    expect(service).toBeTruthy();
  });

  it('should filter selected cost-centers', () => {
    let result: Table<Budget>;
    service.getTable().subscribe((table) => (result = table));
    expect(result.data.length).toEqual(2);
    expect(result.data[0].code).toEqual('first');
    expect(result.data[1].code).toEqual('third');
  });
});

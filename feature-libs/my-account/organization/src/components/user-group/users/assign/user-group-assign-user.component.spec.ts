import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule, B2BUser, UrlTestingModule } from '@spartacus/core';
import {
  Table,
  TableModule,
  SplitViewTestingModule,
} from '@spartacus/storefront';
import { of } from 'rxjs';
import { UserGroupAssignUserComponent } from './user-group-assign-user.component';
import { UserGroupAssignUserService } from './user-group-assign-user.service';
import { IconTestingModule } from 'projects/storefrontlib/src/cms-components/misc/icon/testing/icon-testing.module';

const userGroupCode = 'userGroupCode';

const mockUserList: Table<B2BUser> = {
  data: [
    {
      uid: 'user-1',
      customerId: 'user-1',
      name: 'b1',
      selected: false,
    },
    {
      uid: 'user-2',
      customerId: 'user-2',
      name: 'b2',
      selected: false,
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  structure: { type: '' },
};

class MockActivatedRoute {
  parent = {
    parent: {
      params: of({ code: userGroupCode }),
    },
  };
  snapshot = {};
}

class MockUserGroupUserListService {
  getTable(_code) {
    return of(mockUserList);
  }
  toggleAssign() {}
}

describe('UserGroupAssignUserComponent', () => {
  let component: UserGroupAssignUserComponent;
  let fixture: ComponentFixture<UserGroupAssignUserComponent>;
  let service: UserGroupAssignUserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        I18nTestingModule,
        UrlTestingModule,
        SplitViewTestingModule,
        TableModule,
        IconTestingModule,
      ],
      declarations: [UserGroupAssignUserComponent],
      providers: [
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        {
          provide: UserGroupAssignUserService,
          useClass: MockUserGroupUserListService,
        },
      ],
    }).compileComponents();
    service = TestBed.inject(UserGroupAssignUserService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAssignUserComponent);
    component = fixture.componentInstance;
  });

  // not sure why this is needed, but we're failing otherwise
  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have users', () => {
    let result;
    component.dataTable$.subscribe((data) => (result = data));
    expect(result).toEqual(mockUserList);
  });

  it('should get users from service by code', () => {
    spyOn(service, 'getTable');
    fixture.detectChanges();
    expect(service.getTable).toHaveBeenCalled();
  });

  describe('with table data', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });
    it('should have cx-table element', () => {
      const el = fixture.debugElement.query(By.css('cx-table'));
      expect(el).toBeTruthy();
    });
    it('should not show is-empty message', () => {
      const el = fixture.debugElement.query(By.css('p.is-empty'));
      expect(el).toBeFalsy();
    });

    it('should assign a user', () => {
      spyOn(service, 'toggleAssign');
      component.toggleAssign('userGroupCode', 'user-1', true);
      expect(service.toggleAssign).toHaveBeenCalledWith(
        'userGroupCode',
        'user-1',
        true
      );
    });

    it('should unassign a user', () => {
      spyOn(service, 'toggleAssign');
      component.toggleAssign('userGroupCode', 'user-1', false);
      expect(service.toggleAssign).toHaveBeenCalledWith(
        'userGroupCode',
        'user-1',
        false
      );
    });
  });

  describe('without table data', () => {
    beforeEach(() => {
      spyOn(service, 'getTable').and.returnValue(of(null));
      fixture.detectChanges();
    });
    it('should not have cx-table element', () => {
      const el = fixture.debugElement.query(By.css('cx-table'));
      expect(el).toBeFalsy();
    });
    it('should not show is-empty message', () => {
      const el = fixture.debugElement.query(By.css('p.is-empty'));
      expect(el).toBeTruthy();
    });
  });
});

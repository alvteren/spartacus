import { ChangeDetectionStrategy } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Configurator,
  GenericConfigurator,
  I18nTestingModule,
} from '@spartacus/core';
import {
  IconLoaderService,
  IconModule,
  ICON_TYPE,
} from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { ConfigComponentTestUtilsService } from '../../../shared/testing/config-component-test-utils.service';
import { ConfigUtilsService } from '../../service/config-utils.service';
import { ConfigAttributeHeaderComponent } from './config-attribute-header.component';

export class MockIconFontLoaderService {
  useSvg(_iconType: ICON_TYPE) {
    return false;
  }
  getStyleClasses(_iconType: ICON_TYPE): string {
    return 'fas fa-exclamation-circle';
  }
  addLinkResource() {}
  getHtml(_iconType: ICON_TYPE) {}
  getFlipDirection(): void {}
}

let isCartEntryOrGroupVisited = true;
class MockConfigUtilsService {
  isCartEntryOrGroupVisited(): Observable<boolean> {
    return of(isCartEntryOrGroupVisited);
  }
}

describe('ConfigAttributeHeaderComponent', () => {
  let classUnderTest: ConfigAttributeHeaderComponent;
  let fixture: ComponentFixture<ConfigAttributeHeaderComponent>;

  const owner: GenericConfigurator.Owner = {
    id: 'PRODUCT_CODE',
    type: GenericConfigurator.OwnerType.CART_ENTRY,
  };

  const currentAttribute: Configurator.Attribute = {
    name: 'attributeId',
    uiType: Configurator.UiType.RADIOBUTTON,
    images: [
      {
        url: 'someImageURL',
      },
    ],
  };
  let htmlElem: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, IconModule],
      declarations: [ConfigAttributeHeaderComponent],
      providers: [
        { provide: IconLoaderService, useClass: MockIconFontLoaderService },
        { provide: ConfigUtilsService, useClass: MockConfigUtilsService },
      ],
    })
      .overrideComponent(ConfigAttributeHeaderComponent, {
        set: {
          changeDetection: ChangeDetectionStrategy.Default,
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigAttributeHeaderComponent);
    classUnderTest = fixture.componentInstance;
    htmlElem = fixture.nativeElement;
    classUnderTest.attribute = currentAttribute;
    classUnderTest.attribute.label = 'label of attribute';
    classUnderTest.attribute.name = '123';
    classUnderTest.owner = owner;
    classUnderTest.groupId = 'testGroup';
    classUnderTest.attribute.required = false;
    classUnderTest.attribute.incomplete = true;
    classUnderTest.attribute.uiType = Configurator.UiType.RADIOBUTTON;
    classUnderTest.groupType = Configurator.GroupType.ATTRIBUTE_GROUP;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(classUnderTest).toBeTruthy();
  });

  describe('Render corresponding part of the component', () => {
    it('should render a label', () => {
      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'label'
      );
      ConfigComponentTestUtilsService.expectElementToContainText(
        expect,
        htmlElem,
        '.cx-config-attribute-label',
        'label of attribute'
      );
      const id = htmlElem
        .querySelector('.cx-config-attribute-label')
        .getAttribute('id');
      expect(id.indexOf('123')).toBeGreaterThan(
        0,
        'id of label does not contain the StdAttrCode'
      );
      expect(
        htmlElem
          .querySelector('.cx-config-attribute-label')
          .getAttribute('aria-label')
      ).toEqual(classUnderTest.attribute.label);
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-icon'
      );
    });

    it('should render a label as required', () => {
      classUnderTest.attribute.required = true;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-icon'
      );
    });

    it('should render an image', () => {
      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-img'
      );
    });
  });

  describe('Get required message key', () => {
    it('should return a single-select message key for radio button attribute type', () => {
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'singleSelectRequiredMessage'
      );
    });

    it('should return a single-select message key for ddlb attribute type', () => {
      classUnderTest.attribute.uiType = Configurator.UiType.DROPDOWN;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'singleSelectRequiredMessage'
      );
    });

    it('should return a single-select message key for single-selection-image attribute type', () => {
      classUnderTest.attribute.uiType =
        Configurator.UiType.SINGLE_SELECTION_IMAGE;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'singleSelectRequiredMessage'
      );
    });

    it('should return a multi-select message key for check box list attribute type', () => {
      classUnderTest.attribute.uiType = Configurator.UiType.CHECKBOXLIST;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'multiSelectRequiredMessage'
      );
    });

    it('should return a multi-select message key for multi-selection-image list attribute type', () => {
      classUnderTest.attribute.uiType =
        Configurator.UiType.MULTI_SELECTION_IMAGE;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'multiSelectRequiredMessage'
      );
    });

    it('should return no key for not implemented attribute type', () => {
      classUnderTest.attribute.uiType = Configurator.UiType.NOT_IMPLEMENTED;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'singleSelectRequiredMessage'
      );
    });

    it('should return no key for read only attribute type', () => {
      classUnderTest.attribute.uiType = Configurator.UiType.READ_ONLY;
      expect(classUnderTest.getRequiredMessageKey()).toContain(
        'singleSelectRequiredMessage'
      );
    });
  });

  describe('Required message at the attribute level', () => {
    it('should render a required message if attribute has been set, yet.', () => {
      classUnderTest.attribute.required = true;
      classUnderTest.attribute.uiType = Configurator.UiType.RADIOBUTTON;
      classUnderTest.ngOnInit();
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });

    it('should render a required message if the group has already been visited.', () => {
      classUnderTest.owner.type = GenericConfigurator.OwnerType.PRODUCT;
      isCartEntryOrGroupVisited = true;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });

    it("shouldn't render a required message if attribute has not been added to the cart yet.", () => {
      classUnderTest.owner.type = GenericConfigurator.OwnerType.PRODUCT;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });

    it("shouldn't render a required message if attribute is not required.", () => {
      classUnderTest.attribute.required = false;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });

    it("shouldn't render a required message if attribute is complete.", () => {
      classUnderTest.attribute.incomplete = true;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });

    it("shouldn't render a required message if ui type is string.", () => {
      classUnderTest.attribute.uiType = Configurator.UiType.STRING;
      fixture.detectChanges();
      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-label-required-error-msg'
      );
    });
  });

  describe('Conflict text at the attribute level', () => {
    it('should render conflict icon with corresponding message if attribute has conflicts.', () => {
      classUnderTest.attribute.hasConflicts = true;
      classUnderTest.groupType = Configurator.GroupType.ATTRIBUTE_GROUP;
      fixture.detectChanges();

      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-conflict-msg-container'
      );

      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-conflict-icon-container'
      );
    });

    it('should render conflict message without icon container if conflict message is not displayed in the configuration.', () => {
      classUnderTest.attribute.hasConflicts = true;
      classUnderTest.groupType = Configurator.GroupType.CONFLICT_GROUP;
      fixture.detectChanges();

      ConfigComponentTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-conflict-msg-container'
      );

      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-conflict-icon-container'
      );
    });

    it("shouldn't render conflict message if attribute has no conflicts.", () => {
      classUnderTest.attribute.hasConflicts = false;
      fixture.detectChanges();

      ConfigComponentTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-config-attribute-conflict-container'
      );
    });
  });

  describe('Verify attribute type', () => {
    it("should return 'true'", () => {
      classUnderTest.groupType = Configurator.GroupType.ATTRIBUTE_GROUP;
      fixture.detectChanges();
      expect(classUnderTest.isAttributeGroup(classUnderTest.groupType)).toBe(
        true
      );
    });

    it("should return 'false'", () => {
      classUnderTest.groupType = Configurator.GroupType.CONFLICT_GROUP;
      fixture.detectChanges();
      expect(classUnderTest.isAttributeGroup(classUnderTest.groupType)).toBe(
        false
      );
    });
  });

  describe('Get conflict message key', () => {
    it("should return 'configurator.conflict.viewConflictDetails' conflict message key", () => {
      classUnderTest.groupType = Configurator.GroupType.ATTRIBUTE_GROUP;
      fixture.detectChanges();
      expect(
        classUnderTest.getConflictMessageKey(classUnderTest.groupType)
      ).toEqual('configurator.conflict.viewConflictDetails');
    });

    it("should return 'configurator.conflict.viewConfigurationDetails' conflict message key", () => {
      classUnderTest.groupType = Configurator.GroupType.CONFLICT_GROUP;
      fixture.detectChanges();
      expect(
        classUnderTest.getConflictMessageKey(classUnderTest.groupType)
      ).toEqual('configurator.conflict.viewConfigurationDetails');
    });
  });
});

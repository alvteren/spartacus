import { TestBed } from '@angular/core/testing';
import {
  AuthRedirectService,
  BaseSiteService,
  ExternalJsFileLoader,
  GlobalMessageService,
  GlobalMessageType,
  LanguageService,
  OCC_USER_ID_CURRENT,
  User,
  UserService,
  UserToken,
  WindowRef,
} from '@spartacus/core';
import { Observable, of, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CdcConfig } from '../../config';
import { CdcAuthService } from './cdc-auth.service';
import { CdcJsService } from './cdc-js.service';

const sampleCdcConfig: CdcConfig = {
  cdc: [
    {
      baseSite: 'electronics-spa',
      javascriptUrl: 'sample-url',
      sessionExpiration: 120,
    },
  ],
};

const mockToken = {
  userId: 'user@sap.com',
  refresh_token: 'foo',
  access_token: 'testToken-access-token',
} as UserToken;

class BaseSiteServiceStub {
  getActive(): Observable<string> {
    return of();
  }
}
class LanguageServiceStub {
  getActive(): Observable<string> {
    return of();
  }
}

declare var window: Window;

interface Window {
  gigya?: any;
}

class ExternalJsFileLoaderMock {
  public load(
    _src: string,
    _params?: Object,
    _callback?: EventListener
  ): void {}
}

class MockCdcAuthService {
  authorizeWithCustomCdcFlow(): void {}

  getUserToken(): Observable<UserToken> {
    return of();
  }
}

class MockUserService {
  updatePersonalDetails(_userDetails: User): void {}
}

class MockAuthRedirectService {
  redirect() {}
}

class MockGlobalMessageService {
  remove(_type: GlobalMessageType, _index?: number) {}
}

class MockSubscription {
  unsubscribe() {}

  add() {}
}

const gigya = {
  accounts: {
    addEventHandlers: () => {},
  },
};

const mockedWindowRef = {
  nativeWindow: {
    gigya: gigya,
  },
};

describe('CdcJsService', () => {
  let service: CdcJsService;
  let baseSiteService: BaseSiteService;
  let languageService: LanguageService;
  let externalJsFileLoader: ExternalJsFileLoader;
  let auth: CdcAuthService;
  let globalMessageService: GlobalMessageService;
  let authRedirectService: AuthRedirectService;
  let userService: UserService;
  let winRef: WindowRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CdcConfig, useValue: sampleCdcConfig },
        { provide: BaseSiteService, useClass: BaseSiteServiceStub },
        { provide: LanguageService, useClass: LanguageServiceStub },
        { provide: ExternalJsFileLoader, useClass: ExternalJsFileLoaderMock },
        { provide: CdcAuthService, useClass: MockCdcAuthService },
        { provide: GlobalMessageService, useClass: MockGlobalMessageService },
        { provide: AuthRedirectService, useClass: MockAuthRedirectService },
        { provide: ExternalJsFileLoader, useClass: ExternalJsFileLoaderMock },
        { provide: UserService, useClass: MockUserService },
        { provide: WindowRef, useValue: mockedWindowRef },
        { provide: Subscription, useValue: MockSubscription },
      ],
    });

    service = TestBed.inject(CdcJsService);
    baseSiteService = TestBed.inject(BaseSiteService);
    languageService = TestBed.inject(LanguageService);
    externalJsFileLoader = TestBed.inject(ExternalJsFileLoader);
    auth = TestBed.inject(CdcAuthService);
    globalMessageService = TestBed.inject(GlobalMessageService);
    authRedirectService = TestBed.inject(AuthRedirectService);
    userService = TestBed.inject(UserService);
    winRef = TestBed.inject(WindowRef);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should load the CDC script', () => {
      spyOn(service, 'loadCdcJavascript').and.stub();

      service.initialize();

      expect(service.loadCdcJavascript).toHaveBeenCalled();
    });
  });

  describe('didLoad', () => {
    it('should return CDC script loading state', () => {
      spyOn(externalJsFileLoader, 'load').and.callFake((_a, _b, loadCb) => {
        loadCb({} as Event);
      });

      service
        .didLoad()
        .pipe(take(1))
        .subscribe((val) => expect(val).toBe(false));

      service.loadCdcJavascript();

      service
        .didLoad()
        .pipe(take(1))
        .subscribe((val) => expect(val).toBe(false));
    });
  });

  describe('didScriptFailToLoad', () => {
    it('should return CDC script loading error state', () => {
      spyOn(externalJsFileLoader, 'load').and.callFake(
        (_a, _b, _c, errorCb) => {
          errorCb({} as Event);
        }
      );

      service
        .didScriptFailToLoad()
        .pipe(take(1))
        .subscribe((val) => expect(val).toBe(false));

      service.loadCdcJavascript();

      service
        .didScriptFailToLoad()
        .pipe(take(1))
        .subscribe((val) => expect(val).toBe(false));
    });
  });

  describe('loadCdcScript', () => {
    it('should load CDC script', () => {
      const site = 'electronics-spa';
      const language = 'en';

      spyOn(externalJsFileLoader, 'load');
      spyOn(baseSiteService, 'getActive').and.returnValue(of(site));
      spyOn(languageService, 'getActive').and.returnValue(of(language));

      service.loadCdcJavascript();

      expect(externalJsFileLoader.load).toHaveBeenCalledWith(
        'sample-url&lang=en',
        undefined,
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(winRef.nativeWindow['__gigyaConf']).toEqual({
        include: 'id_token',
      });
    });

    it('should not load CDC script if it is not configured', () => {
      const site = 'electronics';
      const language = 'en';

      spyOn(externalJsFileLoader, 'load');
      spyOn(baseSiteService, 'getActive').and.returnValue(of(site));
      spyOn(languageService, 'getActive').and.returnValue(of(language));

      service.initialize();

      expect(externalJsFileLoader.load).not.toHaveBeenCalled();
    });
  });

  describe('registerEventListeners', () => {
    it('should register event listeners and remove message and redirect on loading the token', () => {
      const site = 'electronics-spa';
      const language = 'en';

      spyOn(externalJsFileLoader, 'load').and.callFake(() => {
        service['registerEventListeners']('electronics-spa');
      });
      spyOn(baseSiteService, 'getActive').and.returnValue(of(site));
      spyOn(languageService, 'getActive').and.returnValue(of(language));
      spyOn(authRedirectService, 'redirect');
      spyOn(globalMessageService, 'remove');

      const testToken = { ...mockToken, userId: OCC_USER_ID_CURRENT };
      spyOn(auth, 'getUserToken').and.returnValue(of(testToken));
      spyOn(service as any, 'addCdcEventHandlers').and.stub();

      service.loadCdcJavascript();

      expect(service['addCdcEventHandlers']).toHaveBeenCalledWith(
        'electronics-spa'
      );
      expect(globalMessageService.remove).toHaveBeenCalledWith(
        GlobalMessageType.MSG_TYPE_ERROR
      );
      expect(authRedirectService.redirect).toHaveBeenCalled();
    });
  });

  describe('addCdcEventHandlers', () => {
    it('should add event handlers for CDC login', () => {
      spyOn(winRef.nativeWindow['gigya'].accounts, 'addEventHandlers');

      service['addCdcEventHandlers']('electronics-spa');

      expect(
        winRef.nativeWindow['gigya'].accounts.addEventHandlers
      ).toHaveBeenCalledWith({ onLogin: jasmine.any(Function) });
    });
  });

  describe('onLoginEventHandler', () => {
    it('should login user when on login event is triggered', () => {
      spyOn(auth, 'authorizeWithCustomCdcFlow');

      const response = {
        UID: 'UID',
        UIDSignature: 'UIDSignature',
        signatureTimestamp: 'signatureTimestamp',
        id_token: 'id_token',
      };

      service.onLoginEventHandler('electronics-spa', response);

      expect(auth.authorizeWithCustomCdcFlow).toHaveBeenCalledWith(
        response.UID,
        response.UIDSignature,
        response.signatureTimestamp,
        response.id_token,
        'electronics-spa'
      );
    });

    it('should not login user when on login event have empty payload', () => {
      spyOn(auth, 'authorizeWithCustomCdcFlow');

      service.onLoginEventHandler('electronics-spa');

      expect(auth.authorizeWithCustomCdcFlow).not.toHaveBeenCalled();
    });
  });

  describe('onProfileUpdateEventHandler', () => {
    it('should update personal details when response have data', () => {
      spyOn(userService, 'updatePersonalDetails');
      const response = {
        profile: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
      };

      service.onProfileUpdateEventHandler(response);

      expect(userService.updatePersonalDetails).toHaveBeenCalledWith({
        firstName: response.profile.firstName,
        lastName: response.profile.lastName,
      });
    });

    it('should not update personal details when response is empty', () => {
      spyOn(userService, 'updatePersonalDetails');

      service.onProfileUpdateEventHandler();

      expect(userService.updatePersonalDetails).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from any subscriptions when destroyed', () => {
      spyOn(service['subscription'], 'unsubscribe');
      service.ngOnDestroy();
      expect(service['subscription'].unsubscribe).toHaveBeenCalled();
    });
  });
});

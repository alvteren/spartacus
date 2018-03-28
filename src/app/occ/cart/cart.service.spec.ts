import { TestBed } from '@angular/core/testing';
import { OccCartService } from './cart.service';
import { ConfigService } from '../config.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ProductImageConverterService } from '../../product/converters';

const userId = '123';
const cartId = '456';
const toMergeCart = { guid: '123456' };
const cartData = 'mockCartData';
const mergedCart = 'mergedCart';

const usersEndpoint = '/users';
const cartsEndpoint = '/carts/';
const BASIC_PARAMS =
  'DEFAULT,deliveryItemsQuantity,totalPrice(formattedValue),' +
  'entries(totalPrice(formattedValue),product(images(FULL)))';

const DETAILS_PARAMS =
  'DEFAULT,deliveryItemsQuantity,totalPrice(formattedValue),totalTax(formattedValue),' +
  'totalPriceWithTax(formattedValue),entries(totalPrice(formattedValue),product(images(FULL)))';

class MockConfigService {
  server = {
    baseUrl: '',
    occPrefix: ''
  };

  site = {
    baseSite: ''
  };

  authentication = {
    client_id: '',
    client_secret: '',
    userToken: {}
  };
}

describe('OccCartService', () => {
  let service: OccCartService;
  let config: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCartService,
        ProductImageConverterService,
        { provide: ConfigService, useClass: MockConfigService }
      ]
    });

    service = TestBed.get(OccCartService);
    httpMock = TestBed.get(HttpTestingController);
    config = TestBed.get(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('load all carts', () => {
    it('should load all carts for given user', () => {
      service.loadAllCarts(userId).subscribe(result => {
        expect(result).toEqual([cartData]);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url === usersEndpoint + `/${userId}` + cartsEndpoint
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush([cartData]);
    });
  });

  describe('load cart details', () => {
    it('should load cart details for given userId and cartId', () => {
      service.loadCart(userId, cartId).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url === usersEndpoint + `/${userId}` + cartsEndpoint + `${cartId}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('fields')).toEqual(BASIC_PARAMS);
      mockReq.flush(cartData);
    });
  });

  describe('load cart details', () => {
    it('should load cart details for given userId, cartId and details flag', () => {
      service.loadCart(userId, cartId, true).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url === usersEndpoint + `/${userId}` + cartsEndpoint + `${cartId}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('fields')).toEqual(DETAILS_PARAMS);
      mockReq.flush(cartData);
    });
  });

  describe('create a cart', () => {
    it('should able to create a new cart for the given user ', () => {
      service.createCart(userId).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.url === usersEndpoint + `/${userId}` + cartsEndpoint
        );
      });

      expect(mockReq.request.params.get('fields')).toEqual(BASIC_PARAMS);

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('merge a cart', () => {
    it('should able to merge a cart to current one for the given user ', () => {
      service.createCart(userId, cartId, toMergeCart.guid).subscribe(result => {
        expect(result).toEqual(mergedCart);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.url === usersEndpoint + `/${userId}` + cartsEndpoint
        );
      });

      expect(mockReq.request.params.get('oldCartId')).toEqual(cartId);

      expect(mockReq.request.params.get('toMergeCartGuid')).toEqual(
        toMergeCart.guid
      );

      expect(mockReq.request.params.get('fields')).toEqual(BASIC_PARAMS);

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mergedCart);
    });
  });

  describe('add entry to cart', () => {
    it('should add entry to cart for given user id, cart id, product code and product quantity', () => {
      service.addCartEntry(userId, cartId, '147852', 5).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.url ===
            usersEndpoint + `/${userId}` + cartsEndpoint + cartId + '/entries'
        );
      });

      expect(mockReq.request.headers.get('Content-Type')).toEqual(
        'application/x-www-form-urlencoded'
      );

      expect(mockReq.request.params.get('code')).toEqual('147852');

      expect(mockReq.request.params.get('qty')).toEqual('5');

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('remove an entry from cart', () => {
    it('should remove entry from cart for given user id, cart id and entry number', () => {
      service.removeCartEntry(userId, cartId, '147852').subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'DELETE' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/entries/' +
              '147852'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('create an address for cart', () => {
    it('should create address for cart for given user id, cart id and address', () => {
      const mockAddress = 'mockAddress';

      service
        .createAddressOnCart(userId, cartId, mockAddress)
        .subscribe(result => {
          expect(result).toEqual(cartData);
        });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/addresses/' +
              'delivery'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('set an address for cart', () => {
    it('should set address for cart for given user id, cart id and address id', () => {
      const mockAddressId = 'mockAddressId';

      service.setDeliveryAddress(userId, cartId, mockAddressId);

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'PUT' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/addresses/' +
              'delivery'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('addressId')).toEqual(mockAddressId);
    });
  });

  describe('get all supported delivery modes for cart', () => {
    it('should get all supported delivery modes for cart for given user id and cart id', () => {
      service.getSupportedDeliveryModes(userId, cartId).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/deliverymodes'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('get delivery mode for cart', () => {
    it('should delivery modes for cart for given user id and cart id', () => {
      service.getDeliveryMode(userId, cartId).subscribe(result => {
        expect(result).toEqual(cartData);
      });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/deliverymode'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('set delivery mode for cart', () => {
    it('should set modes for cart for given user id, cart id and delivery mode id', () => {
      const mockDeliveryModeId = 'mockDeliveryModeId';

      service
        .setDeliveryMode(userId, cartId, mockDeliveryModeId)
        .subscribe(result => {
          expect(result).toEqual(cartData);
        });

      const mockReq = httpMock.expectOne(req => {
        return (
          req.method === 'PUT' &&
          req.url ===
            usersEndpoint +
              `/${userId}` +
              cartsEndpoint +
              cartId +
              '/deliverymode'
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('deliveryModeId')).toEqual(
        mockDeliveryModeId
      );
      mockReq.flush(cartData);
    });
  });
});

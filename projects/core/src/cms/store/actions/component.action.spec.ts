import { CmsComponent } from '../../../model/cms.model';
import {
  entityFailMeta,
  entityLoadMeta,
  entitySuccessMeta,
} from '../../../state/utils/entity-loader/entity-loader.action';
import { COMPONENT_ENTITY } from '../cms-state';
import { CmsActions } from './index';

describe('Cms Component Actions', () => {
  const test_uid = 'test_uid';

  describe('LoadComponent Actions', () => {
    describe('LoadComponent', () => {
      it('should create an action', () => {
        const payload = test_uid;
        const action = new CmsActions.LoadCmsComponent(payload);
        expect({ ...action }).toEqual({
          type: CmsActions.LOAD_CMS_COMPONENT,
          payload: payload,
          meta: entityLoadMeta(COMPONENT_ENTITY, test_uid),
        });
      });
    });

    describe('LoadComponentFail', () => {
      it('should create an action', () => {
        const payload = { message: 'Load Error' };
        const action = new CmsActions.LoadCmsComponentFail(test_uid, payload);

        expect({ ...action }).toEqual({
          type: CmsActions.LOAD_CMS_COMPONENT_FAIL,
          payload,
          meta: entityFailMeta(COMPONENT_ENTITY, test_uid, payload),
        });
      });
    });

    describe('LoadComponentSuccess', () => {
      it('should create an action', () => {
        const component: CmsComponent = {
          uid: 'comp1',
          typeCode: 'SimpleBannerComponent',
        };
        const action = new CmsActions.LoadCmsComponentSuccess(component);

        expect({ ...action }).toEqual({
          type: CmsActions.LOAD_CMS_COMPONENT_SUCCESS,
          payload: component,
          meta: entitySuccessMeta(COMPONENT_ENTITY, 'comp1'),
        });
      });
    });
  });

  describe('GetComponentFromPage Action', () => {
    describe('Get Component from Page', () => {
      it('should create an action', () => {
        const component1: CmsComponent = { uid: 'uid1' };
        const component2: CmsComponent = { uid: 'uid2' };
        const action = new CmsActions.CmsGetComponentFromPage([
          component1,
          component2,
        ]);
        expect({ ...action }).toEqual({
          type: CmsActions.CMS_GET_COMPONENET_FROM_PAGE,
          payload: [component1, component2],
          meta: entitySuccessMeta(COMPONENT_ENTITY, ['uid1', 'uid2']),
        });
      });
    });
  });
});

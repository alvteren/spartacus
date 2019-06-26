import {
  EntityFailAction,
  EntityLoadAction,
  EntitySuccessAction,
} from '../../../state/utils/entity-loader/entity-loader.action';
import { NAVIGATION_DETAIL_ENTITY } from '../cms-state';

export const LOAD_CMS_NAVIGATION_ITEMS = '[Cms] Load NavigationEntry items';
export const LOAD_CMS_NAVIGATION_ITEMS_FAIL =
  '[Cms] Load NavigationEntry items Fail';
export const LOAD_CMS_NAVIGATION_ITEMS_SUCCESS =
  '[Cms] Load NavigationEntry items Success';

export class LoadCmsNavigationItems extends EntityLoadAction {
  readonly type = LOAD_CMS_NAVIGATION_ITEMS;
  constructor(public payload: { nodeId: string; items: any[] }) {
    super(NAVIGATION_DETAIL_ENTITY, payload.nodeId);
  }
}

export class LoadCmsNavigationItemsFail extends EntityFailAction {
  readonly type = LOAD_CMS_NAVIGATION_ITEMS_FAIL;
  constructor(nodeId: string, public payload: any) {
    super(NAVIGATION_DETAIL_ENTITY, nodeId, payload);
  }
}

export class LoadCmsNavigationItemsSuccess extends EntitySuccessAction {
  readonly type = LOAD_CMS_NAVIGATION_ITEMS_SUCCESS;
  constructor(public payload: { nodeId: string; components: any[] }) {
    super(NAVIGATION_DETAIL_ENTITY, payload.nodeId);
  }
}

// action types
export type CmsNavigationEntryItemAction =
  | LoadCmsNavigationItems
  | LoadCmsNavigationItemsFail
  | LoadCmsNavigationItemsSuccess;

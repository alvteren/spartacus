import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AuthGuard,
  CmsConfig,
  ConfigModule,
  I18nModule,
} from '@spartacus/core';
import { CmsPageGuard } from 'projects/storefrontlib/src/cms-structure/guards/cms-page.guard';
import { PageLayoutComponent } from 'projects/storefrontlib/src/cms-structure/page/page-layout/page-layout.component';
import { CartSharedModule } from '../../../cart/cart-shared/cart-shared.module';
import { OrderDetailsSharedModule } from '../../../myaccount';
import { OrderApprovalDetailFormComponent } from './order-approval-detail-form/order-approval-detail-form.component';
import { OrderApprovalDetailHeadlineComponent } from './order-approval-detail-headline/order-approval-detail-headline.component';
import { OrderApprovalDetailTotalsComponent } from './order-approval-detail-totals/order-approval-detail-totals.component';

const moduleComponents = [
  OrderApprovalDetailFormComponent,
  OrderApprovalDetailHeadlineComponent,
  OrderApprovalDetailTotalsComponent,
];

@NgModule({
  imports: [
    CartSharedModule,
    CommonModule,
    I18nModule,
    OrderDetailsSharedModule,
    RouterModule.forChild([
      {
        path: null,
        canActivate: [AuthGuard, CmsPageGuard],
        component: PageLayoutComponent,
        data: { cxRoute: 'orderApprovalDetails' },
      },
    ]),
    ConfigModule.withConfig(<CmsConfig>{
      cmsComponents: {
        OrderApprovalDetailFormComponent: {
          component: OrderApprovalDetailFormComponent,
          guards: [AuthGuard],
        },
        OrderApprovalDetailHeadlineComponent: {
          component: OrderApprovalDetailHeadlineComponent,
          guards: [AuthGuard],
        },
        OrderApprovalDetailTotalsComponent: {
          component: OrderApprovalDetailTotalsComponent,
          guards: [AuthGuard],
        },
      },
    }),
  ],
  declarations: [...moduleComponents],
  exports: [...moduleComponents],
  entryComponents: [...moduleComponents],
})
export class OrderApprovalDetailsModule {}

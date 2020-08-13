import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { I18nModule, UrlModule } from '@spartacus/core';
import {
  GenericConfiguratorModule,
  IconModule,
  KeyboardFocusModule,
  SpinnerModule,
} from '@spartacus/storefront';
import { InteractiveConfigurationModule } from './interactive-configuration.module';
import { OverviewModule } from './overview.module';
/**
 * Exposes the variant configurator
 */
@NgModule({
  imports: [
    CommonModule,
    UrlModule,
    FormsModule,
    I18nModule,
    ReactiveFormsModule,
    InteractiveConfigurationModule,
    OverviewModule,
    NgSelectModule,
    SpinnerModule,
    IconModule,
    KeyboardFocusModule,
    GenericConfiguratorModule,
  ],
})
export class VariantConfiguratorModule {
  static forRoot(): ModuleWithProviders<VariantConfiguratorModule> {
    return {
      ngModule: VariantConfiguratorModule,
    };
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  GenericConfigurator,
  GenericConfigUtilsService,
  OrderEntry,
} from '@spartacus/core';
import { ModalService } from '../../../../shared/components/modal/modal.service';

@Component({
  selector: 'cx-configure-cart-entry',
  templateUrl: './configure-cart-entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigureCartEntryComponent {
  @Input() cartEntry: OrderEntry;
  @Input() readOnly: boolean;
  @Input() msgBanner: boolean;
  @Input() disabled: boolean;

  public getOwnerType(): GenericConfigurator.OwnerType {
    return this.cartEntry.orderCode !== undefined
      ? GenericConfigurator.OwnerType.ORDER_ENTRY
      : GenericConfigurator.OwnerType.CART_ENTRY;
  }

  public getEntityKey(): string {
    return this.cartEntry.orderCode !== undefined
      ? this.genericConfigUtilsService.getComposedOwnerId(
          this.cartEntry.orderCode,
          this.cartEntry.entryNumber
        )
      : '' + this.cartEntry.entryNumber;
  }

  public getRoute(): string {
    const configuratorType = this.cartEntry.product.configuratorType;
    return this.readOnly
      ? 'configureOverview' + configuratorType
      : 'configure' + configuratorType;
  }

  public getDisplayOnly(): boolean {
    return this.readOnly;
  }

  getReason(): string {
    if (this.readOnly) {
      return 'Display Configuration';
    } else {
      if (this.msgBanner) {
        return 'Resolve Issues';
      }
      return 'Edit Configuration';
    }
  }

  closeActiveModal(): void {
    this.modalService.closeActiveModal(this.getReason());
  }

  constructor(
    private genericConfigUtilsService: GenericConfigUtilsService,
    private modalService: ModalService
  ) {}
}

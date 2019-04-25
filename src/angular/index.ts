import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  IterableDiffers,
  NgModule,
  NO_ERRORS_SCHEMA
} from '@angular/core';

import { CardStack } from '../';
import {
  CardStackViewItemDirective,
  TEMPLATED_ITEMS_COMPONENT,
  TemplatedItemsComponent,
  TemplateKeyDirective
} from './stack-items.component';

@Component({
  selector: 'CardStack',
  template: `
    <DetachedContainer>
      <Placeholder #loader></Placeholder>
    </DetachedContainer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TEMPLATED_ITEMS_COMPONENT,
      useExisting: forwardRef(() => CardStackComponent)
    }
  ]
})
export class CardStackComponent extends TemplatedItemsComponent {
  public get nativeElement(): CardStack {
    return this.templatedItemsView;
  }

  protected templatedItemsView: CardStack;

  constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers) {
    super(_elementRef, _iterableDiffers);
  }
}

@NgModule({
  declarations: [CardStackComponent, TemplateKeyDirective, CardStackViewItemDirective],
  exports: [CardStackComponent, TemplateKeyDirective, CardStackViewItemDirective],
  schemas: [NO_ERRORS_SCHEMA]
})
export class CardStackModule {
}

import { ElementRef, IterableDiffers } from '@angular/core';
import { CardStack } from '../';
import { TemplatedItemsComponent } from './stack-items.component';
export declare class CardStackComponent extends TemplatedItemsComponent {
    readonly nativeElement: CardStack;
    protected templatedItemsView: CardStack;
    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers);
}
export declare class CardStackModule {
}

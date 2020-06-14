import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import { KeyedTemplate, Property, Template, View } from 'tns-core-modules/ui/core/view';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';

export declare class CardStack extends CardStackCommon {
  private _androidViewId;
  private _indicatorViewId;
  private _pagerIndicatorLayoutParams;
  _childrenCount: any;

  constructor();

  readonly topPosition: number;
  readonly android: any;
  readonly ios: any;

  public next(direction: string): any;

  public previous(): any;

  createNativeView(): any;

  onLoaded(): void;

  initNativeView(): void;

  refresh(): void;

  onLayout(left: any, top: any, right: any, bottom: any): void;

  private _getDataItem;

  onItemsChanged(data: any): void;
}


declare class CardStackPagerAdapterClassInner extends androidx.viewpager.widget.PagerAdapter {
  private owner;

  constructor(owner: WeakRef<CardStack>);

  getCount(): any;

  getItemPosition(item: any): number;

  isViewFromObject(view: any, _object: any): boolean;

  instantiateItem(container: any, index: any): any;

  destroyItem(container: any, index: any, _object: any): any;

  saveState(): android.os.Bundle;

  restoreState(state: any, loader: any): void;
}

declare class CardStackPageChangedListener extends androidx.viewpager.widget.ViewPager.SimpleOnPageChangeListener {
  private owner;

  constructor(owner: WeakRef<CardStack>);

  onPageSelected(position: any): void;

  onPageScrollStateChanged(state: any): void;

  onPageScrolled(position: any, positionOffset: any, positionOffsetPixels: any): void;
}

export declare class CardStackCommon extends GridLayout {

  public static draggingEvent: string;
  public static swipedEvent: string;
  public static canceledEvent: string;
  public static rewoundEvent: string;
  public static loadedEvent: string;
  public static disappearedEvent: string;
  public static appearedEvent: string;

  ios: any;
  android: any;
  items: ObservableArray<any>;
  itemTemplate: string | Template;
  itemTemplates: string | Array<KeyedTemplate>;
  selectedIndex: any;
  showIndicator: boolean;
  indicatorColor: any;
  indicatorColorUnselected: any;
  bounce: any;
  finite: any;
  indicatorAnimation: any;
  debug: boolean;

  constructor();

  next(direction: string): void;

  previous(): void;

}

export declare class CardStackItem extends StackLayout {
  constructor();

  onLoaded(): void;
}

export declare namespace knownTemplates {
  const itemTemplate = 'itemTemplate';
}

export declare const itemTemplateProperty: Property<CardStackCommon, any>;
export declare const itemsProperty: Property<CardStackCommon, ObservableArray<any>>;
export declare const selectedIndexProperty: Property<CardStackCommon, number>;

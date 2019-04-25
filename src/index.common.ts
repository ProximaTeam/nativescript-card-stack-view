import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import { KeyedTemplate, Observable, Property, Template } from 'tns-core-modules/ui/core/view';
import {
  addWeakEventListener,
  removeWeakEventListener
} from 'tns-core-modules/ui/core/weak-event-listener/weak-event-listener';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { isNullOrUndefined, isNumber } from 'tns-core-modules/utils/types';
import { parse } from 'tns-core-modules/ui/builder';

export class CardStackUtil {
  public static debug: boolean = false;
}

export enum CLogTypes {
  info,
  warning,
  error
}

export const ITEMLOADING = 'itemLoading';

export const CLog = (type: CLogTypes = 0, ...args) => {
  if (CardStackUtil.debug) {
    if (type === 0) {
      // Info
      console.log('NativeScript-CardStack: INFO', args);
    } else if (type === 1) {
      // Warning
      console.log('NativeScript-CardStack: WARNING', args);
    } else if (type === 2) {
      console.log('NativeScript-CardStack: ERROR', args);
    }
  }
};

export class CardStackCommon extends GridLayout {

  views: Array<any> = [];

  public static draggingEvent = 'dragging';
  public static swipedEvent = 'swiped';
  public static canceledEvent = 'canceled';
  public static rewoundEvent = 'rewound';
  public static loadedEvent = 'loaded';
  public static disappearedEvent = 'disappeared';
  public static appearedEvent = 'appeared';

  public visibleCount: number = 3;
  public ios: any;
  public android: any;
  public items: ObservableArray<Observable>;
  public topPosition;
  public itemTemplate: string | Template;
  public itemTemplates: string | Array<KeyedTemplate>;
  public selectedIndex = 0;
  public options: ICardStackOptions;

  public set debug(value: boolean) {
    CardStackUtil.debug = value;
  }

  constructor() {
    super();
  }

  _createTemplateView() {
    const view = parse(this.itemTemplate, this);
    this.views.push(view);
    this.addChild(view);

    return view;
  }

}

export class CardStackItem extends StackLayout {
  constructor() {
    super();
    CLog(CLogTypes.info, `CardStackItem constructor...`);
  }

  onLoaded() {
    super.onLoaded();
  }
}

export namespace knownMultiTemplates {
  export const itemTemplates = 'itemTemplates';
}

export namespace knownCollections {
  export const items = 'items';
}

export namespace knownTemplates {
  export const itemTemplate = 'itemTemplate';
}

// Common
export const itemTemplateProperty = new Property<CardStackCommon, any>({
  name: 'itemTemplate',
  affectsLayout: true,
  valueChanged: (view: any, oldValue, newValue) => {
    view.refresh(true);
  }
});
itemTemplateProperty.register(CardStackCommon);

export const itemsProperty = new Property<CardStackCommon, ObservableArray<any>>({
  name: 'items',
  affectsLayout: true,
  valueChanged: onItemsChanged
});
itemsProperty.register(CardStackCommon);

export const optionsProperty = new Property<CardStackCommon, ObservableArray<any>>({
  name: 'options',
  valueChanged: () => {

  }
});
optionsProperty.register(CardStackCommon);

export const selectedIndexProperty = new Property<CardStackCommon, number>({
  name: 'selectedIndex',
  defaultValue: 0,
  valueConverter: value => {
    return +value;
  },
  valueChanged: (view, oldValue, newValue) => {
    view.selectedIndex = newValue;
  }
});
selectedIndexProperty.register(CardStackCommon);

function onItemsChanged(view: any, oldValue, newValue) {

  if (oldValue instanceof ObservableArray) {
    removeWeakEventListener(oldValue, ObservableArray.changeEvent, view.refresh, view);
  }

  if (newValue instanceof ObservableArray) {
    addWeakEventListener(newValue, ObservableArray.changeEvent, view.refresh, view);
  }

  if (!isNullOrUndefined(view.items) && isNumber(view.items.length)) {
    view.refresh(false);
  }
}

export interface ICardStackOptions {
  visibleCount?: number;
}

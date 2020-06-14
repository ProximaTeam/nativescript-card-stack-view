/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />

import { View } from 'tns-core-modules/ui/core/view';
import { isNullOrUndefined, isNumber } from 'tns-core-modules/utils/types';

import {
  CardStackCommon,
  CLog,
  CLogTypes,
  ITEMLOADING
} from './index.common';
import { fromObject } from 'tns-core-modules/data/observable';

export * from './index.common';

declare const com: any;

function notifyForItemAtIndex(
  owner,
  nativeView: any,
  view: any,
  eventName: string,
  index: number
) {
  let args = {
    eventName: eventName,
    object: owner,
    index: index,
    view: view,
    ios: undefined,
    android: nativeView
  };
  owner.notify(args);
  return args;
}

export class CardStack extends CardStackCommon {

  public _childrenCount; // public so it's accessible inside extended classes using WeakRef
  private _cardStackLayoutManager;
  private _cardStackView;

  constructor() {
    super();

    CLog(CLogTypes.info, 'CardStack constructor...');

  }

  get android(): any {
    return this.nativeView;
  }

  get adapter(): androidx.viewpager.widget.PagerAdapter {
    return this.android.getAdapter();
  }

  public get topPosition() {
    return this._cardStackLayoutManager.getTopPosition();
  }

  public get selectedIndex() {
    return this.topPosition;
  }

  public set selectedIndex(value) {
    //
  }

  createNativeView() {

    if (this.options && this.visibleCount) {
      this.visibleCount = this.options.visibleCount;
    }

    const containerLayout = new android.widget.LinearLayout(this._context);
    containerLayout.setLayoutParams(new android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.MATCH_PARENT));
    containerLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    this._cardStackView = new com.yuyakaido.android.cardstackview.CardStackView(this._context);

    return this._cardStackView;
  }

  onLoaded() {
    super.onLoaded();
    this.notify({
      eventName: CardStackCommon.loadedEvent,
      object: this
    });
  }

  initNativeView() {

    ensureCardStackAdapterClass();

    const pageListener = new com.yuyakaido.android.cardstackview.CardStackListener(
      {
        onCardDragging: (side, ratio) => {
          const args: any = {
            eventName: CardStackCommon.draggingEvent,
            object: fromObject({
              side: side.name(), // Left, Right
              ratio
            })
          };
          this.notify(args);
        },
        onCardAppeared: (view, position) => {
          this.notify({
            eventName: CardStackCommon.appearedEvent,
            object: fromObject({
              view,
              position: position
            })
          });
        },
        onCardSwiped: (direction) => {
          this.notify({
            eventName: CardStackCommon.swipedEvent,
            object: fromObject({
              direction: String(direction),
              position: this.topPosition - 1
            })
          });
        },
        onCardDisappeared: (view, position) => {
          this.notify({
            eventName: CardStackCommon.disappearedEvent,
            object: fromObject({
              view,
              position: position
            })
          });
        },
        onCardCanceled: () => {
          this.notify({
            eventName: CardStackCommon.canceledEvent,
            object: fromObject({
              position: this.topPosition
            })
          });
        },
        onCardRewound: () => {
          this.notify({
            eventName: CardStackCommon.rewoundEvent,
            object: fromObject({
              position: this.topPosition
            })
          });
        }
      }
    );

    const adapter = new CardStackAdapterClass(this.items, new WeakRef(this));

    this._cardStackLayoutManager = new com.yuyakaido.android.cardstackview.CardStackLayoutManager(this._context, pageListener);
    this._cardStackLayoutManager.setStackFrom(com.yuyakaido.android.cardstackview.StackFrom.Top);
    this._cardStackLayoutManager.setVisibleCount(this.visibleCount);
    this._cardStackLayoutManager.setTranslationInterval(8.0);
    this._cardStackLayoutManager.setScaleInterval(0.95);
    this._cardStackLayoutManager.setSwipeThreshold(0.15);
    this._cardStackLayoutManager.setMaxDegree(20.0);
    this._cardStackLayoutManager.setDirections(com.yuyakaido.android.cardstackview.Direction.HORIZONTAL);
    this._cardStackLayoutManager.setCanScrollHorizontal(true);
    this._cardStackLayoutManager.setCanScrollVertical(true);
    this._cardStackLayoutManager.setSwipeableMethod(com.yuyakaido.android.cardstackview.SwipeableMethod.AutomaticAndManual);
    this._cardStackLayoutManager.setOverlayInterpolator(new android.view.animation.LinearInterpolator());

    this._cardStackView.setAdapter(adapter);
    this._cardStackView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.MATCH_PARENT));
    this._cardStackView.setLayoutManager(this._cardStackLayoutManager);

    this.refresh();
  }

  refresh(event = null) {

    if (event) {

      if (event.action === 'add') {
        if (isNullOrUndefined(this.items) || !isNumber(this.items.length)) {
          return;
        }
        if (!this.nativeView) {
          return;
        }

        // get the adapter
        const adapter = this._cardStackView.getAdapter();
        if (adapter) {
          adapter.notifyItemRangeInserted(this.items.length - event.addedCount, event.addedCount);
        }
      }

    } else {

      if (isNullOrUndefined(this.items) || !isNumber(this.items.length)) {
        return;
      }
      if (!this.nativeView) {
        return;
      }

      // get the adapter
      const adapter = this._cardStackView.getAdapter();
      if (adapter) {
        adapter.notifyDataSetChanged();
      }
    }
  }

  public next(direction: string = 'RIGHT') {
    if (direction === 'RIGHT') {
      const setting = new com.yuyakaido.android.cardstackview.SwipeAnimationSetting.Builder()
        .setDirection(com.yuyakaido.android.cardstackview.Direction.Right)
        .setDuration(com.yuyakaido.android.cardstackview.Duration.Normal.duration)
        .setInterpolator(new android.view.animation.AccelerateInterpolator())
        .build();
      this._cardStackLayoutManager.setSwipeAnimationSetting(setting);
      this._cardStackView.swipe();
    } else {
      const setting = new com.yuyakaido.android.cardstackview.SwipeAnimationSetting.Builder()
        .setDirection(com.yuyakaido.android.cardstackview.Direction.Left)
        .setDuration(com.yuyakaido.android.cardstackview.Duration.Normal.duration)
        .setInterpolator(new android.view.animation.AccelerateInterpolator())
        .build();
      this._cardStackLayoutManager.setSwipeAnimationSetting(setting);
      this._cardStackView.swipe();
    }
  }

  public previous() {

    const setting = new com.yuyakaido.android.cardstackview.RewindAnimationSetting.Builder()
      .setDirection(com.yuyakaido.android.cardstackview.Direction.Bottom)
      .setDuration(com.yuyakaido.android.cardstackview.Duration.Normal.duration)
      .setInterpolator(new android.view.animation.DecelerateInterpolator())
      .build();
    this._cardStackLayoutManager.setRewindAnimationSetting(setting);
    this._cardStackView.rewind();
  }

  public onLayout(left, top, right, bottom) {
    CLog(CLogTypes.info, `onLayout...`);
    View.layoutChild(this, this, 0, 0, right - left, bottom - top);
  }

  private _getDataItem(index) {
    CLog(CLogTypes.info, `_getDataItem...`);
    return this.items.getItem ? this.items.getItem(index) : this.items[index];
  }


  public onItemsChanged(data) {
    CLog(CLogTypes.info, `_onItemsChanged...`);
    this.refresh();
  }
}

let CardStackAdapterClass;

function ensureCardStackAdapterClass() {
  if (CardStackAdapterClass) {
    return;
  }

  class CardStackAdapter extends androidx.recyclerview.widget.RecyclerView.Adapter<any> {

    private owner: WeakRef<any>;
    private items: Array<any> = [];

    constructor(items: Array<any>, owner: WeakRef<any>) {
      super();
      this.items = items;
      this.owner = owner;
      return global.__native(this);
    }

    onCreateViewHolder(container: android.view.ViewGroup, type) {

      const view = this.owner.get()._createTemplateView();

      if (view.parent !== this.owner.get()) {
        this.owner.get().addChild(view);
      } else {
        view.parent.android.removeView(view.android);
      }

      view.nativeView.setId(android.view.View.generateViewId());

      return new ViewHolder(view.nativeView);

    }

    onBindViewHolder(holder, position) {

      if (!holder) {
        return;
      }

      this.owner.get().views.forEach((view) => {
        if (holder.itemView === view.nativeView) {
          let _args: any = notifyForItemAtIndex(
            this.owner.get(),
            view ? view.nativeView : null,
            view,
            ITEMLOADING,
            position
          );
          view.bindingContext = this.owner.get().items.getItem(position);
        }
      });

    }

    getItemCount() {
      let result;
      if (isNullOrUndefined(this.owner.get().items) || !isNumber(this.owner.get().items.length)) {
        result = this.owner ? this.owner.get()._childrenCount : 0;
      } else {
        result = this.owner ? this.owner.get().items.length : 0;
      }
      CLog(CLogTypes.info, `CardStackAdapter getCount result = ${result}`);
      return result;
    }
  }

  CardStackAdapterClass = CardStackAdapter;

}

class ViewHolder extends androidx.recyclerview.widget.RecyclerView.ViewHolder {
  constructor(view) {
    super(view);
    return global.__native(this);
  }
}

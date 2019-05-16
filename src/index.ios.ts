/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./objc!MDCSwipeToChoose.d.ts" />

import { screen } from 'tns-core-modules/platform';
import { isNullOrUndefined, isNumber } from 'utils/types';
import {
  CardStackCommon, ITEMLOADING
} from './index.common';
import { Observable, View } from 'tns-core-modules/ui/core/view';
import { fromObject } from 'tns-core-modules/data/observable';

export * from './index.common';

declare var MDCSwipeToChooseDelegate;

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
    ios: nativeView,
    android: undefined
  };
  owner.notify(args);
  return args;
}

class MDCSwipeDelegateImpl extends NSObject {

  public static ObjCProtocols = [MDCSwipeToChooseDelegate];
  _owner: WeakRef<CardStack>;

  public static initWithOwner(owner: WeakRef<CardStack>): MDCSwipeDelegateImpl {
    const delegate = MDCSwipeDelegateImpl.alloc().init() as MDCSwipeDelegateImpl;
    delegate._owner = owner;
    return delegate;
  }

  viewDidCancelSwipe(view: UIView) {
    this._owner.get()._onSwipeCancelled();
  }

  viewWasChosenWithDirection(view: UIView, direction: MDCSwipeDirection) {
    this._owner.get()._onSwipe(view, direction);
  }

  // viewShouldBeChosenWithDirection(view: UIView, direction: MDCSwipeDirection) {
  //   console.log('Should be chosen with direction');
  // }

}

export class CardStack extends CardStackCommon {

  public _ios: MDCSwipeToChooseView;
  public itemTemplate;

  private _delegate;
  private _viewMap: Map<number, ChoosePersonView> = new Map<number, ChoosePersonView>();
  private _visibleArray: Array<ChoosePersonView> = [];

  constructor() {
    super();
    this._delegate = MDCSwipeDelegateImpl.initWithOwner(new WeakRef<CardStack>(this));
  }

  get ios(): any {
    return this._ios;
  }

  get topPosition() {
    return this.selectedIndex;
  }

  createNativeView() {

    if (this.options && this.visibleCount) {
      this.visibleCount = this.options.visibleCount;
    }

    this._ios = MDCSwipeToChooseView.alloc().initWithFrame(CGRectMake(0, 0, screen.mainScreen.widthDIPs, screen.mainScreen.heightDIPs));
    return this._ios;
  }

  initNativeView() {
    // ...
  }

  disposeNativeView() {
    this.removeChildren();
  }

  onLoaded() {
    super.onLoaded();
    this.refresh();
    this.notify({
      eventName: CardStackCommon.loadedEvent,
      object: this
    });
  }

  _onSwipe(view, direction) {

    this.notify({
      eventName: CardStackCommon.swipedEvent,
      object: fromObject({
        direction: direction === 2 ? 'Right' : 'Left',
        position: this.topPosition
      })
    });
    this.selectedIndex++;
    this.updateStackAfterSwipe();
  }

  _onSwipeCancelled() {
    this.notify({
      eventName: CardStackCommon.canceledEvent,
      object: fromObject({
        position: this.selectedIndex
      })
    });
  }

  refresh(event = null) {

    if (event) {

      if (event.action === 'add') {
        if (isNullOrUndefined(this.items) || !isNumber(this.items.length)) {
          return;
        }
        if (!this._ios) {
          return;
        }

        if (this._viewMap.size < this.items.length) {

          const cardsInVisibleStack = this._viewMap.size - this.selectedIndex;
          const toAddCount = this.visibleCount - cardsInVisibleStack;

          let n = 0;
          for (let i = this.selectedIndex + cardsInVisibleStack; i < this.selectedIndex + cardsInVisibleStack + toAddCount; i++) {
            if (this.items.getItem(i)) {
              this._createCard(this.items.getItem(i), cardsInVisibleStack + n, i);
              n++;
            }
          }

        }

      }

    } else {
      if (isNullOrUndefined(this.items) || !isNumber(this.items.length)) {
        return;
      }
      if (!this._ios) {
        return;
      }
      this.resetCards();
    }
    return;

  }

  public next(direction: string = 'RIGHT') {

    if (this._ios) {

      const item = this._viewMap.get(this.selectedIndex);
      if (!item) {
        return;
      }

      if (direction === 'RIGHT') {
        (<any>item).mdc_swipe(MDCSwipeDirection.Right);
      } else {
        (<any>item).mdc_swipe(MDCSwipeDirection.Left);
      }
    }
  }

  public previous() {

    if (this.selectedIndex === 0) {
      return;
    }

    this.selectedIndex = this.selectedIndex - 1;

    this._viewMap.forEach((card, index) => {
      card.removeFromSuperview();
    });

    for (let i = this.selectedIndex; i < this.selectedIndex + this.visibleCount; i++) {
      const item = this.items.getItem(i);
      if (item) {
        this._createCard(item, i - this.selectedIndex, i);
      }
    }

    this.notify({
      eventName: CardStackCommon.rewoundEvent,
      object: fromObject({
        position: this.selectedIndex
      })
    });

  }

  updateStackAfterSwipe() {

    if (this.selectedIndex + this.visibleCount <= this.items.length) {
      this._createCard(this.items.getItem(this.selectedIndex + this.visibleCount - 1), this.visibleCount - 1, this.selectedIndex + this.visibleCount - 1);
    }

    for (let i = this.selectedIndex + 1; i < (this.selectedIndex + this.visibleCount); i++) {

      const cardView = this._viewMap.get(i);
      if (!cardView) {
        return;
      }

    }
  }

  _onCardPan(state: MDCPanState) {

    if (state.direction === 1 || state.direction === 2) {
      this.notify({
        eventName: CardStackCommon.draggingEvent,
        object: fromObject({
          side: state.direction === 1 ? 'Left' : 'Right',
          ratio: state.thresholdRatio
        })
      });
    }

    for (let i = this.selectedIndex + 1; i <= (this.selectedIndex + this.visibleCount); i++) {

      const cardView = this._viewMap.get(i);
      if (!cardView) {
        return;
      }

      cardView.updatePosition(state.thresholdRatio, i - this.selectedIndex);

    }

  }

  resetCards() {

    if (isNullOrUndefined(this.items) || !isNumber(this.items.length)) {
      return;
    }

    if (this.selectedIndex >= this.items.length - 1) {
      return;
    }

    this.items.forEach((item, i) => {

      if (i < this.visibleCount) {
        const cardView = this._createCard(item, i, i);
      }

    });

  }

  _createCard(item: Observable, visibleStackPosition: number, index: number): ChoosePersonView {


    const cgRect = CGRectMake(0, 0, CGRectGetWidth(this._ios.frame), CGRectGetHeight(this._ios.frame));

    let personViewHolder: any = ChoosePersonView.initWithOwnerFrameItemPositionDelegate(new WeakRef(this), cgRect, item, visibleStackPosition, this._delegate);

    // console.log('Create card: ', index);

    if (index === 0) {
      this._ios.addSubview(personViewHolder);
    } else {
      this._ios.insertSubviewBelowSubview(personViewHolder, this._viewMap.get(index - 1));
    }

    let _args: any = notifyForItemAtIndex(
      this,
      personViewHolder.templateView ? personViewHolder.templateView.nativeView : null,
      personViewHolder.templateView,
      ITEMLOADING,
      index
    );

    this._viewMap.set(index, personViewHolder);

    return personViewHolder;

  }

  public onItemsChanged(data) {
    if (!isNullOrUndefined(this.items) && isNumber(this.items.length)) {
      this.refresh();
    }
  }

  private _getDataItem(index) {
    return this.items.getItem ? this.items.getItem(index) : this.items[index];
  }
}

class ChoosePersonView extends MDCSwipeToChooseView {

  item: any;
  owner: WeakRef<CardStack>;
  templateView;
  frontViewFrame: CGRect;
  cardOffset = 10;

  public static initWithOwnerFrameItemPositionDelegate(owner: WeakRef<CardStack>, frame: CGRect, item: Observable, position: number, delegate): ChoosePersonView {

    const cardOffset = 5;

    let options: MDCSwipeToChooseViewOptions = MDCSwipeToChooseViewOptions.alloc().init();
    options.delegate = delegate;
    options.onPan = ((state: MDCPanState) => {
      owner.get()._onCardPan(state);
    });

    const yOffset = ((position * cardOffset));

    let viewFrame = CGRectMake(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
    const view: ChoosePersonView = <ChoosePersonView>ChoosePersonView.alloc().initWithFrameOptions(viewFrame, options);
    view.item = item;
    view.frontViewFrame = CGRectMake(frame.origin.x, frame.origin.y, CGRectGetWidth(frame), CGRectGetHeight(frame));
    view.likedView.hidden = true;
    view.nopeView.hidden = true;
    view.owner = owner;
    view.cardOffset = cardOffset;
    view.layer.borderWidth = 0;
    view.templateView = owner.get()._createTemplateView();

    view.templateView.bindingContext = item;

    view.addSubview(view.templateView.nativeView);
    const topCenter = CGPointMake(CGRectGetMidX(viewFrame), CGRectGetMinY(viewFrame));
    view.layer.anchorPoint = CGPointMake(0.5, 0);
    view.layer.position = topCenter;
    view.transform = CGAffineTransformMakeScale(1 - position / 20, 1 - position / 20);
    view.center = CGPointMake(frame.size.width / 2, -yOffset);

    return view;

  }

  public setFrameBasedOnPosition(position: number) {
    ChoosePersonView.animateWithDurationAnimations(0.2, () => {
      // this.frame = CGRectMake(0, -(10 * position), CGRectGetWidth(this.frontViewFrame), CGRectGetHeight(this.frontViewFrame));
    });
  }

  public updatePosition(ratio: number, position: number) {

    const topCenter = CGPointMake(CGRectGetMidX(this.frame), CGRectGetMinY(this.frame));
    this.layer.anchorPoint = CGPointMake(0.5, 0);
    this.layer.position = topCenter;

    const currentScale = 1 - position / 20;
    const nextScale = 1 - ((position - 1) / 20);
    const scale = currentScale + (ratio * (nextScale - currentScale));
    this.transform = CGAffineTransformMakeScale(scale, scale);

    if (ratio < 1) {
      this.center = CGPointMake(this.frontViewFrame.size.width / 2, -(this.cardOffset * position) + (ratio * this.cardOffset));
    } else {
      ChoosePersonView.animateWithDurationAnimations(0.2, () => {
        this.center = CGPointMake(this.frontViewFrame.size.width / 2, -(this.cardOffset * position) + (ratio * this.cardOffset));
      });
    }

  }

}

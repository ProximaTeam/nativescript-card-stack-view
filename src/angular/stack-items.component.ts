import {
  AfterContentInit,
  ContentChild,
  Directive,
  DoCheck,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Host,
  Inject,
  InjectionToken,
  Input,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ɵisListLikeIterable as isListLikeIterable
} from '@angular/core';
import { ItemEventData } from 'tns-core-modules/ui/list-view';
import { KeyedTemplate, View } from 'tns-core-modules/ui/core/view';
import { LayoutBase } from 'tns-core-modules/ui/layouts/layout-base';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { profile } from 'tns-core-modules/profiling';

import { getSingleViewRecursive, InvisibleNode, registerElement } from 'nativescript-angular/element-registry';
import { isEnabled as isLogEnabled } from 'tns-core-modules/trace';
import { CardStackItem } from '../index.common';
import { CardStack } from '../';
import { isBlank } from 'nativescript-angular/lang-facade';

registerElement('CardStack', () => CardStack);
registerElement('CardStackItem', () => CardStackItem);

const NG_VIEW = '_ngViewRef';

export class ItemContext {
  constructor(
    public $implicit?: any,
    public item?: any,
    public index?: number,
    public even?: boolean,
    public odd?: boolean
  ) {
  }
}

export interface SetupItemViewArgs {
  view: EmbeddedViewRef<any>;
  data: any;
  index: number;
  context: ItemContext;
}

export abstract class TemplatedItemsComponent implements DoCheck, OnDestroy, AfterContentInit {
  public abstract get nativeElement(): CardStack;

  protected templatedItemsView: CardStack;
  protected _items: any;
  protected _differ: IterableDiffer<KeyedTemplate>;
  protected _templateMap: Map<string, KeyedTemplate>;
  private _selectedIndex: number;
  @ViewChild('loader', { read: ViewContainerRef })
  loader: ViewContainerRef;

  @Output()
  public setupItemView = new EventEmitter<SetupItemViewArgs>();

  @ContentChild(TemplateRef)
  itemTemplateQuery: TemplateRef<ItemContext>;

  itemTemplate: TemplateRef<ItemContext>;

  @Input()
  get items() {
    return this._items;
  }

  set items(value: any) {
    this._items = value;
    let needDiffer = true;
    if (value instanceof ObservableArray) {
      needDiffer = false;
    }
    if (needDiffer && !this._differ && isListLikeIterable(value)) {
      this._differ = this._iterableDiffers
        .find(this._items)
        .create((_index, item) => {
          return item;
        });
    }

    this.templatedItemsView.items = this._items;
  }


  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(value) {
    this._selectedIndex = value;
    this.templatedItemsView.selectedIndex = this._selectedIndex;
  }

  ngAfterViewInit() {

    if (!isBlank(this._selectedIndex)) {
      setTimeout(() => {
        this.templatedItemsView.selectedIndex = this._selectedIndex;
      });
    }
  }

  constructor(
    _elementRef: ElementRef,
    private _iterableDiffers: IterableDiffers
  ) {
    this.templatedItemsView = _elementRef.nativeElement;

    this.templatedItemsView.on('itemLoading', this.onItemLoading, this);
  }

  ngAfterContentInit() {
    if (isLogEnabled()) {
      console.log('TemplatedItemsView.ngAfterContentInit()');
    }
    this.setItemTemplates();
  }

  ngOnDestroy() {
    this.templatedItemsView.off('itemLoading', this.onItemLoading, this);
  }

  private setItemTemplates() {

    if (!this.items) return;
    this.itemTemplate = this.itemTemplateQuery;
    this.templatedItemsView.itemTemplate = this.getItemTemplateViewFactory(this.itemTemplateQuery);
    if (this._templateMap) {
      if (isLogEnabled()) {
        console.log('Setting templates');
      }

      const templates: KeyedTemplate[] = [];
      this._templateMap.forEach(value => {
        templates.push(value);
      });
      this.templatedItemsView.itemTemplates = templates;
    }
  }

  public registerTemplate(key: string, template: TemplateRef<ItemContext>) {
    if (isLogEnabled()) {
      console.log(`registerTemplate for key: ${key}`);
    }

    if (!this._templateMap) {
      this._templateMap = new Map<string, KeyedTemplate>();
    }

    const keyedTemplate = {
      key,
      createView: this.getItemTemplateViewFactory(template)
    };

    this._templateMap.set(key, keyedTemplate);
  }

  @profile
  public onItemLoading(args: ItemEventData) {
    if (!args.view && !this.itemTemplate) {
      return;
    }

    if (!this.items) return;

    const index = args.index;
    const items = (<any>args.object).items;
    const currentItem =
      typeof items.getItem === 'function' ? items.getItem(index) : items[index];
    let viewRef: EmbeddedViewRef<ItemContext>;

    if (args.view) {
      if (isLogEnabled()) {
        console.log(`onItemLoading: ${index} - Reusing existing view`);
      }

      viewRef = args.view[NG_VIEW];

      if (
        !viewRef &&
        args.view instanceof LayoutBase &&
        args.view.getChildrenCount() > 0
      ) {
        viewRef = args.view.getChildAt(0)[NG_VIEW];
      }

      if (!viewRef && isLogEnabled()) {
        console.log(
          `ViewReference not found for item ${index}. View recycling is not working`
        );
      }
    }

    if (!viewRef) {
      if (isLogEnabled()) {
        console.log(`onItemLoading: ${index} - Creating view from template`);
      }

      viewRef = this.loader.createEmbeddedView(
        this.itemTemplate,
        new ItemContext(),
        0
      );
      args.view = getItemViewRoot(viewRef);
      args.view[NG_VIEW] = viewRef;
    }

    this.setupViewRef(viewRef, currentItem, index);

    this.detectChangesOnChild(viewRef, index);
  }

  public setupViewRef(
    viewRef: EmbeddedViewRef<ItemContext>,
    data: any,
    index: number
  ): void {
    const context = viewRef.context;
    context.$implicit = data;
    context.item = data;
    context.index = index;
    context.even = index % 2 === 0;
    context.odd = !context.even;

    this.setupItemView.next({
      view: viewRef,
      data: data,
      index: index,
      context: context
    });
  }

  protected getItemTemplateViewFactory(
    template: TemplateRef<ItemContext>
  ): () => View {
    return () => {
      const viewRef = this.loader.createEmbeddedView(
        template,
        new ItemContext(),
        0
      );

      const resultView = getItemViewRoot(viewRef);
      resultView[NG_VIEW] = viewRef;

      return resultView;
    };
  }

  @profile
  private detectChangesOnChild(
    viewRef: EmbeddedViewRef<ItemContext>,
    index: number
  ) {
    if (isLogEnabled()) {
      console.log(`Manually detect changes in child: ${index}`);
    }

    viewRef.markForCheck();
    viewRef.detectChanges();
  }

  ngDoCheck() {
    if (this._differ) {
      if (isLogEnabled()) {
        console.log('ngDoCheck() - execute differ');
      }

      const changes = this._differ.diff(this._items);
      if (changes) {
        if (isLogEnabled()) {
          console.log('ngDoCheck() - refresh');
        }

        this.templatedItemsView.refresh();
      }
    }
  }
}

export interface ComponentView {
  rootNodes: Array<any>;

  destroy(): void;
}

export type RootLocator = (nodes: Array<any>, nestLevel: number) => View;

export function getItemViewRoot(
  viewRef: ComponentView,
  rootLocator: RootLocator = getSingleViewRecursive
): View {
  return rootLocator(viewRef.rootNodes, 0);
}

export const TEMPLATED_ITEMS_COMPONENT = new InjectionToken<TemplatedItemsComponent>('TemplatedItemsComponent');

@Directive({
  selector: '[cardStackItem]'
})
export class CardStackViewItemDirective implements OnInit {
  private item: CardStackItem;

  constructor(
    private templateRef: TemplateRef<any>,
    @Inject(TEMPLATED_ITEMS_COMPONENT)
    @Host()
    private owner: TemplatedItemsComponent,
    private viewContainer: ViewContainerRef
  ) {
  }

  private ensureItem() {
    if (!this.item) {
      this.item = new CardStackItem();
    }
  }

  private applyConfig() {
    this.ensureItem();
  }

  ngOnInit() {
    this.applyConfig();

    const viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
    // Filter out text nodes and comments
    const realViews = viewRef.rootNodes.filter(node =>
      !(node instanceof InvisibleNode));

  }
}

@Directive({ selector: '[cardStackTemplateKey]' })
export class TemplateKeyDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    @Inject(TEMPLATED_ITEMS_COMPONENT)
    @Host()
    private comp: TemplatedItemsComponent
  ) {
  }

  @Input()
  set cardStackTemplateKey(value: any) {
    if (this.comp && this.templateRef) {
      this.comp.registerTemplate(value, this.templateRef);
    }
  }
}

# NativeScript Card Stack View

A Tinder like card stack view component for NativeScript for iOS and Android with support for Angular.

| Platform | Supported   |                                      NativeView                                       |
| -------- | :-------:   | :-----------------------------------------------------------------------------------: |
| iOS      |    Yes      |              [MDCSwipeToChoose](https://github.com/modocache/MDCSwipeToChoose)              |
| Android  |    Yes      | [CardStackView](https://github.com/yuyakaido/CardStackView) |

## Demo screen capture

| iOS                                                                                              | Android                                                                                                  |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| ![iOS](screenshots/screencap_ios_comp.gif) | ![Android](screenshots/screencap_android_comp.gif) |

## Warning

This plugin is a work in progress. All key features should work but please test thoroughly before deploying to production and report any issues.

The angular demo is properly setup. The core should work but the demo is very basic.

## Installation

Run `tns plugin add nativescript-card-stack-view` in the ROOT directory of your project. You must clean your project after adding a plugin with native dependencies. This can be done by executing `tns platform remove android` (or ios) and then `tns platform add android` (or ios). The newer versions of the NS CLI, provide a `clean` command that does this in one script if you like that option as well.

## Usage

For any implementation make sure you use `ObservableArray<Observable>` for the items. You can push to the array and have the cards appear as they are added but any other array manipulations could result in issues. If you a have a specific case in mind write an issue. 

#### Core

_Make sure you include the namespace on the Page element:_

```xml
xmlns:ns="nativescript-card-stack-view"
```

```xml
<ns:CardStack id="cardStack" height="100%" width="100%" color="white" dragging="onDrag" swiped="onSwiped" items="{{ myDataArray }}">
    <ns:CardStack.itemTemplate>
        <ns:CardStackItem backgroundColor="#ff0000" verticalAlignment="middle" margin="15" borderRadius="6">
            <GridLayout>
                <Image src="{{image}}" stretch="aspectFill" height="100%" width="100%"  borderRadius="6"/>
                <Label text="{{title}}" horizontalAlignment="center" backgroundColor="#50000000" height="30" />
                <Label text="WOW" horizontalAlignment="center" backgroundColor="#50000000" height="30" marginTop="50" />
            </GridLayout>
        </ns:CardStackItem>
    </ns:CardStack.itemTemplate>

</ns:CardStack>
```

#### Angular

Import the module:

```typescript
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    ...,
    CardStackModule // Import the module!
  ],
  declarations: [AppComponent],
  ...
})
```

Create the layout:

```xml
<CardStack #cardStack
           [items]="items"
           (swiped)="onSwiped($event)"
           (dragging)="onDrag($event)"
           (canceled)="onDragCancel($event)"
           (loaded)="onStackLoaded($event)"
           [options]="cardStackOptions">

  <ng-template let-i="index" let-item="item">
    <!-- Your template here -->
  </ng-template>
</CardStack>
```

#### Events

| Event | Description |
| --- | --- |
| swiped | Fires when the cards is swiped and returns direction (`"Left"`,`"Right"`) | `string` |
| dragging | Fires when dragging occurs | `DragEvent` |
| canceled | Fires when card swiping canceled and returns position of the card in the array | `number` |
| loaded | Fires when the `CardStack` is loaded ant returns the instance | `CardStack` |

#### Properties

| Name | Description |
| --- | --- |
| selectedIndex | Current front card index |

*DragEvent*
```typescript
{
  side :string; // `"Left"`,`"Right"` 
  ratio: number; // 0-1 ratio of center to right or left edge  
}
```

## Attributes - Common

- **items** (must be used with `itemTemplate` or `ng-template`, see demo)

- **options** _optional_

```typescript
{
  visibleCount: number; // how many cards should be visible in the stack
}
```

Assign a data-array to generate the slides and apply the bindingContext. If `items` is populated then you must use the template-option.

## Changelog


**0.0.2**

- Added LICENSE

**0.0.1**

- Initial release

## Author

- [FranciZ](https://github.com/FranciZ)

## Resources

Used the nativescript-carousel plugin as a scaffold.

Learned from:

- [triniwiz/nativescript-pager](https://github.com/triniwiz/nativescript-pager)
- [manijak/nativescript-carousel](https://github.com/manijak/nativescript-carousel)

## Help

I will accept pull requests that improve this and assign credit.

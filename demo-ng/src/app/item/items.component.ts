import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { CardStack } from 'nativescript-card-stack-view';
import { Device, isIOS } from 'tns-core-modules/platform';
import { ItemService } from './item.service';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { fromObject, Observable } from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page';
import * as utils from 'tns-core-modules/utils/utils';
import { DEVICE } from 'nativescript-angular';
import { AnimationCurve } from 'tns-core-modules/ui/enums';

const items = [
    {
        title: 'Stacy, 28',
        color: '#b3cde0',
        image: '~/assets/images/image_1.jpg',
        status: 'default',
        description: 'Simple but crazy! How crazy? Swipe right and find out!'
    },
    {
        title: 'Barbara, 24',
        color: '#b3cde0',
        image: '~/assets/images/image_2.jpg',
        status: 'default',
        description: 'Looking for something special'
    },
    {
        title: 'Alex, 31',
        color: '#b3cde0',
        image: '~/assets/images/3.jpg',
        status: 'default',
        description: 'Don\'t be an ahole!'
    },
    {
        title: 'Emily, 22',
        color: '#b3cde0',
        image: '~/assets/images/4.jpg',
        status: 'default',
        description: 'Vegans only!'
    },
    {
        title: 'Karen, 33',
        color: '#b3cde0',
        image: '~/assets/images/5.jpg',
        status: 'default',
        description: 'I love a good steak!'
    }
];

@Component({
    selector: 'ns-items',
    moduleId: module.id,
    templateUrl: './items.component.html'
})
export class ItemsComponent implements OnInit, AfterViewInit {
    @ViewChild('cardStack', { static: true }) cardStackRef: ElementRef;
    @ViewChild('cardStackContainer', { static: true }) cardStackContainer: ElementRef;
    items: ObservableArray<Observable> = new ObservableArray([
        fromObject({
            title: 'Stacy, 28',
            color: '#b3cde0',
            image: '~/assets/images/image_1.jpg',
            status: 'default',
            description: 'Simple but crazy! How crazy? Swipe right and find out!'
        }),
        fromObject({
            title: 'Barbara, 24',
            color: '#b3cde0',
            image: '~/assets/images/image_2.jpg',
            status: 'default',
            description: 'Looking for something special'
        }),
        fromObject({
            title: 'Alex, 31',
            color: '#b3cde0',
            image: '~/assets/images/3.jpg',
            status: 'default',
            description: 'Don\'t be an ahole!'
        }),
        fromObject({
            title: 'Emily, 22',
            color: '#b3cde0',
            image: '~/assets/images/4.jpg',
            status: 'default',
            description: 'Vegans only!'
        }),
        fromObject({
            title: 'Karen, 33',
            color: '#b3cde0',
            image: '~/assets/images/5.jpg',
            status: 'default',
            description: 'I love a good steak!'
        })
    ]);

    isIOS = isIOS;

    stackHeight = 0;

    horizontalDirection;

    cardStackOptions = {
        visibleCount: 2
    };

    constructor(private itemService: ItemService, private page: Page) {
        page.actionBarHidden = true;
    }

    ngOnInit(): void {

        setInterval(() => {

            if (this.items.length < 500) {
                this.items.push(fromObject(items[Math.floor(Math.random() * items.length)]));
            }

        }, 10);


        setTimeout(() => {
            this.items.push(fromObject({
                title: 'Pam, 26',
                color: '#b3cde0',
                image: '~/assets/images/6.jpg',
                status: 'default',
                description: 'My sun allergy is a bi***...'
            }));
        }, 500);

        setTimeout(() => {
            this.items.push(fromObject({
                title: 'Erin, 28',
                color: '#b3cde0',
                image: '~/assets/images/7.jpg',
                status: 'default',
                description: 'I never settle, only the best!'
            }));
        }, 1000);

    }

    onStackLoaded(event) {
        setTimeout(() => {
            this.stackHeight = utils.layout.toDeviceIndependentPixels(this.cardStackRef.nativeElement.getMeasuredHeight());
        });
    }

    ngAfterViewInit() {
        // ...

    }

    get cardStackMargin() {
        if (isIOS) {
            return '0';
        } else {
            return '25 10 5 10';
        }
    }

    onSwiped(event) {
        this.items.getItem(event.object.position).set('status', 'default');
    }

    onDragCancel() {
        if (!this.items.getItem(this.cardStackRef.nativeElement.topPosition)) {
            return;
        }
        this.items.getItem(this.cardStackRef.nativeElement.topPosition).set('status', 'default');
    }

    onDrag(event) {

        if (!this.items.getItem(this.cardStackRef.nativeElement.topPosition)) {
            return;
        }

        if (event.object.side === 'Left' || event.object.side === 'Right') {
            this.horizontalDirection = event.object.side;
        }

        if (event.object.ratio > 0.20) {

            if (this.horizontalDirection === 'Left') {
                const item = this.items.getItem(this.cardStackRef.nativeElement.topPosition);
                if (item && item.get('status') !== 'negative') {
                    this.items.getItem(this.cardStackRef.nativeElement.topPosition).set('status', 'negative');
                }
            } else if (this.horizontalDirection === 'Right') {
                const item = this.items.getItem(this.cardStackRef.nativeElement.topPosition);
                if (item) {
                    if (item && item.get('status') !== 'positive') {
                        this.items.getItem(this.cardStackRef.nativeElement.topPosition).set('status', 'positive');
                    }
                }
            }

        } else {
            if (this.items.getItem(this.cardStackRef.nativeElement.topPosition).get('status') === 'default') {
                return;
            }
            this.items.getItem(this.cardStackRef.nativeElement.topPosition).set('status', 'default');
        }

    }

    restore() {
        console.log('Restore tap');

        const cardStack = this.cardStackRef.nativeElement as CardStack;
        cardStack.previous();
        const item = this.items.getItem(cardStack.topPosition);
        if (!item) {
            return;
        }
        item.set('status', 'default');
    }

    reject() {
        const cardStack = this.cardStackRef.nativeElement as CardStack;
        const item = this.items.getItem(cardStack.topPosition);
        if (!item) {
            return;
        }
        item.set('status', 'negative');
        cardStack.next('LEFT');
    }

    superLike() {
        const cardStack = this.cardStackRef.nativeElement as CardStack;
        const item = this.items.getItem(cardStack.topPosition);
        if (!item) {
            return;
        }
        item.set('status', 'positive');
        cardStack.next('RIGHT');
    }

    like() {
        const cardStack = this.cardStackRef.nativeElement as CardStack;
        const item = this.items.getItem(cardStack.topPosition);
        if (!item) {
            return;
        }
        item.set('status', 'positive');
        cardStack.next('RIGHT');
    }

    superMessage() {
        const cardStack = this.cardStackRef.nativeElement as CardStack;
        const item = this.items.getItem(cardStack.topPosition);
        if (!item) {
            return;
        }
        item.set('status', 'positive');
        cardStack.next('RIGHT');
    }

}

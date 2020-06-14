import { CardStack } from 'nativescript-card-stack-view';
import { fromObject, Observable } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

let cardStackView: CardStack;
const pageData = new Observable();
const myDataArray = new ObservableArray([
  fromObject({
    title: 'Stacy, 28',
    color: '#b3cde0',
    image: '~/res/image_1.jpg',
    status: 'default',
    description: 'Simple but crazy'
  }),
  fromObject({
    title: 'Barbara, 24',
    color: '#b3cde0',
    image: '~/res/image_2.jpg',
    status: 'default',
    description: 'Looking for something special'
  }),
  fromObject({
    title: 'Alex, 31',
    color: '#b3cde0',
    image: '~/res/3.jpg',
    status: 'default',
    description: 'Don\'t be an ahole!'
  }),
  fromObject({
    title: 'Emily, 22',
    color: '#b3cde0',
    image: '~/res/4.jpg',
    status: 'default',
    description: 'Vegans only!'
  }),
  fromObject({
    title: 'Karen, 33',
    color: '#b3cde0',
    image: '~/res/5.jpg',
    status: 'default',
    description: 'I love a good steak!'
  }),
  fromObject({
    title: 'Pam, 26',
    color: '#b3cde0',
    image: '~/res/6.jpg',
    status: 'default',
    description: 'My sun allergy is a bi***...'
  }),
  fromObject({
    title: 'Erin, 28',
    color: '#b3cde0',
    image: '~/res/7.jpg',
    status: 'default',
    description: 'I never settle, only the best!'
  })
]);
pageData.set('myDataArray', myDataArray);

exports.pageLoaded = args => {
  var colors = ['#C4FFCF', '#B9E8B3', '#E7FFD1', '#DEE8B3', '#FFFCC4'];
  var page = args.object;
  page.bindingContext = pageData;
  cardStackView = page.getViewById('cardStackView');

  setInterval(() => {
    let i = myDataArray.length + 1;
    myDataArray.push(
      fromObject({
        title: `Slide ${i}`,
        color: '#03396c',
        image: '~/res/04.jpg'
      }));
    // myDataArray.getItem(0).set('title', 'Slide 1 changed');
  }, 2000);


  setInterval(() => {
    // myDataArray.forEach((o) => {
    //   o.set('color', colors[Math.floor(colors.length * Math.random())]);
    // });
  }, 1000);

  setInterval(() => {
    // cardStackView.next('LEFT');
    // myDataArray.getItem(0).set('title', 'CHANGED');
  }, 700);

  setInterval(() => {
    // cardStackView.previous();
  }, 2000);

};

exports.selectPageEvent = args => {
  if (!cardStackView) return;
  cardStackView.selectedIndex = 2;
};

exports.myScrollingEvent = args => {
  // console.log('Scrolling: ' + args.state.offset);
};

exports.onDrag = event => {
  // console.log('Dragging: ', event.object.side);
};

exports.onSwiped = event => {
  // console.log('Dragging: ', event.object.direction);
  // console.log('Position: ', cardStackView.topPosition);
  // console.log('title: ', myDataArray.getItem(cardStackView.topPosition).get('title'));
};

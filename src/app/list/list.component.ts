import { Component, HostBinding, Input, HostListener, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { IntervalCollection } from './intervalTree';


// const compose = (...args) => data => args.reduceRight((acc, x) => x(acc), data);
// const curry = fn => {
//   const len = fn.length;
//   return (...args) =>
//     len === args.length
//       ? fn.apply(null, args)
//       : curry(fn.bind(null, ...args));
// };

const createRow = x => ({
  ...x,
  elements: new IntervalCollection(init(x.elements, y => y))
});

const init = (elements: any[], fn) => {
  return elements.reduce((acc: any, x: any) => {
    return {
      offset: acc.offset + x.height,
      items: [
        ...acc.items,
        {
          start: acc.offset,
          end: acc.offset + x.height,
          value: fn(x)
        }
      ]
    };
  }, { offset: 0, items: [] }).items;
};

const VIEW_PORT_HEIGHT = 500;
const VIEW_PORT_WIDTH = 1200;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  public view: any[];

  private collection: IntervalCollection;
  private up = 0;
  private bottom = VIEW_PORT_HEIGHT;

  public left = 0;
  public right = VIEW_PORT_WIDTH;

  @HostBinding('class.container') containerClass = true;

  @HostBinding('style.height')
  height = `${VIEW_PORT_HEIGHT}px`;

  get scrollerHeight() {
    return this.collection.max();
  }

  get scrollerWidth() {
    return this.view.length && this.view[0].elements.max();
  }

  translate: string;

  @Input()
  set data(items: any[]) {

    this.collection = new IntervalCollection(init(items, createRow));
    this.view = this.collection.range(0, VIEW_PORT_HEIGHT * 3);

    this.bottom = this.view.length * 100;
    this.up = 0;

    this.left = 0;
    this.right = VIEW_PORT_WIDTH;
  }

  @HostListener('scroll', ['$event']) onscroll({ target }) {
    const { scrollTop, offsetHeight, scrollLeft, offsetWidth } = target;

    const viewPortHeight = offsetHeight;

    if (scrollTop < this.up || scrollTop + offsetHeight > this.bottom) {
      const newUp = scrollTop - Math.max(viewPortHeight / 2, 0);
      const newBottom = scrollTop + viewPortHeight * 3;

      this.view = this.collection.range(newUp, newBottom);

      this.up = newUp;
      this.bottom = newBottom;

      this.translate = `translate(${scrollLeft}px, ${scrollTop}px)`;
    }

    if (scrollLeft < this.left || scrollLeft + offsetWidth > this.right) {
      this.left = scrollLeft;
      this.right = scrollLeft + VIEW_PORT_WIDTH;

      this.translate = `translate(${scrollLeft}px, ${scrollTop}px)`;
    }

  }
}

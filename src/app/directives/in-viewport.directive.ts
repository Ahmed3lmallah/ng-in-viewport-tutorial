import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[appInViewport]'
})
export class InViewportDirective {

  @Output() public appInViewport: EventEmitter<any> = new EventEmitter();
  @Input() public inViewportOptions: string;
  private _intersectionObserver? : IntersectionObserver;

  constructor (
    private _element: ElementRef
  ) {}

}

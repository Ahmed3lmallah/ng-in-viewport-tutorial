import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[appInViewport]'
})
export class InViewportDirective {

  @Output() public appInViewport: EventEmitter<any> = new EventEmitter();
  @Input() public inViewportOptions: string;
  private _intersectionObserver?: IntersectionObserver;

  constructor(
    private _element: ElementRef
  ) {}

  public ngAfterViewInit() {
    console.log(this.inViewportOptions);
    this._intersectionObserver = new IntersectionObserver(entries => {
      this.checkForIntersection(entries);
    }, JSON.parse(this.inViewportOptions));
    this._intersectionObserver.observe((this._element.nativeElement) as Element);
  }

  private checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (this.checkIfIntersecting(entry)) {
        this.appInViewport.emit({target: this._element});
        this._intersectionObserver.unobserve((this._element.nativeElement) as Element);
        this._intersectionObserver.disconnect();
      }
    });
  }

  private checkIfIntersecting(entry: IntersectionObserverEntry) {
    return (entry as any).isIntersecting && entry.target === this._element.nativeElement;
  }
}

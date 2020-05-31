# How to detect when an Element gets in the viewport in Angular 9

## Introduction

In this tutorial we are going to learn how to trigger an action when an HTML element comes into viewport, gets visible in the screen during scrolling. Perhaps we want our images to only load when we scroll down to where they are visible. This is known as lazy loading. Another use case would be infinite scrolling, where we load more items to the page when we reach the bottom. Maybe we just want to create effects or change the CSS styling of the element by adding or removing specific class names when they come into viewport.

### TL;DR

We can use the **Intersection Observer API** to detect when an element gets in the viewport and trigger an action based on that detection. To learn how to use the API, jump straight to [Using Intersection Observer API](#using-intersection-observer-api) section, or continue reading for more background.

There are multiple [JQuery plugins](https://plugins.jquery.com/tag/viewport/) that can be used for that purpose, including *isInViewport.js*, *Qoopido Emerge* and *jQuery ScrollSpy*. Another npm package based on JQuery that can be used for the same purpose is [jquery-waypoints](https://www.npmjs.com/package/jquery-waypoints). However, **using JQuery with Angular is  considered a bad practice and should be avoided, unless apsolutely necassary**. This [Stack Overflow answer](https://stackoverflow.com/questions/14994391/thinking-in-angularjs-if-i-have-a-jquery-background?answertab=active#tab-top) explains why.

There are two ways we can use in Angular to know when an element gets into viewport during scrolling:

* Listening to the window `scroll` events
* Observing the Element for visibility using the **Intersection Observer API:** [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## Listening to the window `scroll` event

This is considered the old way of detecting elements getting in the viewport. Scroll events can have performance issues, such as page freezing and can cause time lag. According to this [Medium Story by Vamsi Vempati](https://medium.com/angular-in-depth/a-modern-solution-to-lazy-loading-using-intersection-observer-9280c149bbc), the drawbacks are:

* Listening to the `scroll` event can cause performance issues as the calculations will be run on the main thread.
* The calculation is performed each time there is a scroll on the page which is bad if the element is well below the view port.
* The calculation can be very expensive if there are a lot of elements we want to detect on the page.

For that reason, it is recommended to use Intersection Observer Api as it has been developed for this very purpose and it is [almost supported by all modern browsers](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Browser_compatibility).

Read the following article to learn more about the [The Old Way : Listening to the scroll Event](https://usefulangle.com/post/113/javascript-detecting-element-visible-during-scroll).

## Using Intersection Observer API

The Intersection Observer API makes it possible to detect when an element intersects with the viewport. The API allows us to register a callback function that is executed when the element of interest enters or exits the viewport, which means that the API is asynchronous — monitoring element for visibility is not done on the main thread, which gives us a major performance boost.

The Intersection Observer API can tell whether the target element and the screen overlap (through `isIntersecting` property), and calculate the percentage of visibility of the element in relation to the viewport (through `intersectionRatio` property).

We can set a **threshold** in the options when we create a new `IntersectionObserver` object, which can be any number between 0 and 1. This value represents the viewable area of the target element in the screen. The default threshold value is 0 which represents no area of element is visible. A value of 0.25 represents about 25% area is viewable in screen. Value of 1 means element is fully viewable in screen. We can even specify multiple thresholds as an array of values — [0, 0.25, 1].

Intersection Observer will fire a callback function, once any of the threshold values is passed in either direction. For example if you have set threshold to 0.25, callback function will be invoked everytime when viewable area becomes greater than 25% or becomes less than 25%. Refer to this [codepen](https://codepen.io/anon/pen/vjWEqO) and [usefulangle.com](https://usefulangle.com/demos/118/intersection-observer-demo.html) demos of Intersection Observer with various thresholds.

> *To get an in-depth understanding of the Intersection Observer API, I recommend reading the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) or [Javascript Intersection Observer API Explained in Detail](https://usefulangle.com/post/118/javascript-intersection-observer) post by [Useful Angle](https://usefulangle.com/). This [Medium Story by Vamsi Vempati](https://medium.com/angular-in-depth/a-modern-solution-to-lazy-loading-using-intersection-observer-9280c149bbc) discusses how to use Intersection Observer API to lazy load images. Additionally, the two following npm packages implement Intersection Observer API: [ng-in-viewport](https://k3nsei.gitbook.io/ng-in-viewport/) and [ng-defer-load](https://www.npmjs.com/package/@trademe/ng-defer-load).*

## Tutorial - How to use Intersection Observer API

Using Intersection Observer API comprises the following steps:

* Create a new intersection observer
* Watch the element we wish to lazy load for visibility changes
* When the element is in viewport, emit an event, then stop watching it for visibility changes.

And we can wrap all this functionality into a custom Angular directive.

## Creating the Angular Directive

Angular CLI can be used to initialize a new Angular project using the following bash command: `ng new ng-in-viewport-tutorial`, then `cd ng-in-viewport-tutorial`, finally generate the directive using the following command: `ng g d directives/in-viewport`

The directive will have an output event *appInViewport* which can be used in any component to perform an action when the element is in viewport. It will also have an optional input *inViewportOptions* that can be set in the component with the **threshold** options.

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

## Create a new intersection observer and watch the element

Once the component’s view has been fully initialized, we create a new intersection observer. This takes in two parameters:

1. A callback function which is executed when the percentage of the visible target element crosses a threshold.
1. An object to customize the observer where we can specify the desired threshold value(s) at which the callback function should be executed. If we do not specify *inViewportOptions* in the component, the default threshold value is used — {} which corresponds to 0.

        public ngAfterViewInit() {
            this._intersectionObserver = new IntersectionObserver(entries => {
                this.checkForIntersection(entries);
                }, (this.inViewportOptions ? JSON.parse(this.inViewportOptions) : {}));
            this._intersectionObserver.observe((this._element.nativeElement) as Element);
        }

## Check, emit, then unobserve and disconnect

The callback function `checkForIntersection` would have logic to check if the element is intersecting. If the element is intersecting, we emit the target element using the output event `inViewportAction`, stop watching the element and disconnect the intersection observer.

    private checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
            if(this.checkIfIntersecting(entry)) {
                this.appInViewport.emit({target: this._element});
                this._intersectionObserver.unobserve((this._element.nativeElement) as Element);
                this._intersectionObserver.disconnect();
            }
        });
    }

    private checkIfIntersecting(entry: IntersectionObserverEntry) {
        return (entry as any).isIntersecting && entry.target === this._element.nativeElement;
    }

## Using the Directive

The directive should be added automatically to the list of imports in the module corresponding to your component since we used the Angular CLI, so we can use the directive with any element that we wish to observe. We simply use `(appInViewport)` to use the directive and listen to events emitted from it. Optionally, we can specifiy the `inViewportOptions`. It accepts a JSON string in the following format: `'{ &quot;threshold&quot;: [threshold value] }'`

* Note: in HTML, double quotes are escaped by `&quot;`

        <h1>Demo: How to Use Intersection Observer API?</h1>
        <ul class="list">
            <li class="list-item inactive"
                (appInViewport)="onIntersection($event)"
                [inViewportOptions]="'{ &quot;threshold&quot;: [1] }'"
                *ngFor="let number of numbers;">
                <span>{{(number+1)}}</span>
            </li>
        </ul>

In the component's `.ts` file, we generate an array for demo purposes, and set the *onIntersection* action to simply add a class name, `active`, that would allow us to change the styling of the items in the list.  

    numbers: number[];

    constructor() {
        this.numbers = Array(25).fill(0).map((x,i)=>i);
    }

    onIntersection({target}: { target: ElementRef }) {
        target.nativeElement.classList.add("active");
    }

Finally, some CSS styling.

    h1 {
     text-align: center;
    }

    ul.list {
        margin: 0;
        padding: 24px;
        display: block;
        list-style: none;
    }

    ul.list > li.list-item {
        width: 100%;
        height: 25vh;
        margin-top: 20px;
        margin-bottom: 20px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color .25s ease-in-out, color .25s ease-in-out;
    }

    ul.list:not(:first-child) {
        margin-top: 12px;
    }

    .inactive {
        background-color: #CCCCCC;
        color: rgba(#000000, .85);
    }

    .active {
        background-color: #00C853;
        color: rgba(#FFFFFF, .85);
    }

    li.active > span {
        font-weight: 700;
        font-size: 40px;
        color: #FFFFFF;
    }

A working example of the above code can be seen on [StackBlitz](https://stackblitz.com/edit/ng-in-viewport-tutorial).

## Conclusion

In this article, different ways to detect HTML elements getting in the viewport were mentioned. The first was by using JQuery, the second was by listening to `scroll` events, and the third and is considered to be the modern way was to use the **Intersection Observer API**. We have shown how the API works in theory, and followed a simple tutorial of making a directive that can be used to simply emit an event when an element gets in viewport. The emitted event can be then used to perform custom actions on the elements, such as:

* Infinite Scrolling where you see more content as you scroll
* Lazy Loading images to only display them when the user gets to them, so it does not increase the initial page load time
* Performing tasks such as Animations only when the user sees the result

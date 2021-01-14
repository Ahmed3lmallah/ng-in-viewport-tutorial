import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-in-viewport';
  numbers: number[];

  constructor() {
    this.numbers = Array(25).fill(0).map((x,i)=>i);
  }

  onIntersection({target}: { target: ElementRef }) {
    // target.nativeElement.classList.add("active");
  }
}

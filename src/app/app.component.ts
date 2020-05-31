import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ng-in-viewport';
  numbers: number[];

  constructor() {
    this.numbers = Array(25).fill(0).map((x,i)=>i);
  }

  ngOnInit() {
    console.log(this.numbers);
  }

  onIntersection({target}: { target: ElementRef }) {
    console.log(target);
    target.nativeElement.classList.add("active");
  }
}

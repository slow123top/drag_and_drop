import { Component, Renderer2, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DndModule } from 'dnd';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('resizeDiv') resizeDiv: ElementRef;
  title = 'farris-dnd';

  originalX: number;
  originalY: number;

  originalWidth: number;
  originalHeight: number;

  originalTop: number;

  mouseMoveEvent: any;
  mouseUpEvent: any;

  cellInfo = [
    // { cols: 1, rows: 1, x: 0, y: 2, identify: 'aa', bgColor: 'red' },
    { cols: 1, rows: 1, x: 1, y: 2, identify: 'bb', bgColor: 'green' },
    { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
    { cols: 1, rows: 1, x: 3, y: 2, identify: 'd', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 4, y: 2, identify: 'f', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 5, y: 2, identify: 'cgc', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
    // { cols: 1, rows: 1, x: 2, y: 2, identify: 'cc', bgColor: 'blue' },
  ];
  detalY: number;


  constructor(private render: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    // console.log(this.el.nativeElement.querySelector('.dnd-container'));
    // const child = this.el.nativeElement.querySelector('.dnd-container-child');
    // console.log(`offsetWidth:${child.offsetWidth}`);
    // console.log(`offsetHeight:${child.offsetHeight}`);
    // console.log(`offsetTop:${child.offsetTop}`);
    // console.log(`offsetLeft:${child.offsetLeft}`);
    // console.log(`clientWidth:${child.clientWidth}`);
    // console.log(`clientHeight:${child.clientHeight}`);
    // console.log(`clientTop:${child.clientTop}`);
    // console.log(`scrollWidth:${child.scrollWidth}`);
    // console.log(`scrollHeight:${child.scrollHeight}`);
    // console.log(`scrollTop:${child.scrollTop}`);
    // console.log(`left:${child.style.left}`);
    // console.log(`top:${child.top}`);

    // console.log(`clientWidth:${child.offsetWidth}`);
    // console.log(`clientWidth:${child.offsetWidth}`);
  }
  trackById(index, item) {
    return item.identify;
  }

  drop(e) {
    console.log(e);
  }

  mousedown(e) {
    e.preventDefault();
    this.originalX = e.clientX;
    this.originalY = e.clientY;

    // this.originalWidth = this.originalX - e.offsetX;
    // this.originalHeight = this.originalY - e.offsetY;

    const { width, height, top } = this.resizeDiv.nativeElement.getBoundingClientRect();
    this.originalTop = top;
    // if (!this.originalWidth) {

    this.originalWidth = width;
    // }

    // if (!this.originalHeight) {

    this.originalHeight = height;
    // }

    this.mouseMoveEvent = this.mousemove.bind(this);
    this.mouseUpEvent = this.mouseup.bind(this);
    // this.mouseMoveEvent = this.render.listen(document, 'mousemove', mouseMoveEvent);
    document.addEventListener('mousemove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);

    // this.mouseUpEvent = this.render.listen(document, 'mouseup', mouseUpEvent);
  }

  mousemove(e) {
    this.detalY = e.clientY - this.originalY;
    this.resizeDiv.nativeElement.style.height = `${this.originalHeight - this.detalY}px`;
    this.resizeDiv.nativeElement.style.top = `${this.originalTop + this.detalY}px`;
    // this.render.setStyle(this.resizeDiv.nativeElement, 'height', `${this.originalHeight - this.detalY}px`);
    // this.render.setStyle(this.resizeDiv.nativeElement, 'top', `${this.originalTop + this.detalY}px`);
  }

  mouseup() {
    // this.mouseMoveEvent();
    document.removeEventListener('mousemove', this.mouseMoveEvent);
    this.originalTop = this.originalTop + this.detalY;
    this.originalHeight = this.originalHeight - this.detalY;
  }

  removeGrid(e: any, grid: any) {
    this.cellInfo.splice(this.cellInfo.findIndex(cell => grid.identify === cell.identify), 1);
  }


}

import {
  Component, OnInit, Input, ElementRef, Renderer2, OnChanges, ViewChild, ComponentFactoryResolver,
  ViewContainerRef, AfterContentInit, ContentChildren, QueryList, Output, EventEmitter, NgZone, ChangeDetectorRef
} from '@angular/core';
import { DndOptions } from './dnd.interface';
import { DndRenderService } from './service/dnd-render.service';
import { DndService } from './service/dnd.service';
import { DndGridOptions } from './dnd-grid/dnd-grid.interface';
// import { DndGridComponent } from './dnd-grid/dnd-grid.component';
@Component({
  selector: 'dnd',
  templateUrl: './dnd.component.html',
  styleUrls: ['./dnd.component.css']
})
export class DndComponent implements OnInit, OnChanges {
  // 网格容器配置
  @Input() cols: number;
  @Input() rows: number;

  // 容器拖拽属性
  // 是否可拖拽
  @Input() draggable = true;
  // 元素是否可交换
  @Input() swapable = true;
  // 允许外部拖入
  @Input() externalDragIn = true;
  // 网格允许伸缩
  @Input() resizable = true;
  // event
  // @Output() dragStartCallback = new EventEmitter();
  @Output() dropCallback = new EventEmitter();
  // 容器配置
  // 容器尺寸
  width: number;
  height: number;

  // 容器位置
  left: number;
  top: number;

  // 最小单位尺寸
  cellWidth: number;
  cellHeight: number;

  // 网格集合
  grids = [];

  // 外边距
  // margin: 0;
  @Input() marginLeft: 0;
  @Input() marginRight: 0;
  @Input() marginTop: 0;
  @Input() marginBottom: 0;

  // 划分布局
  layoutColumns: any;
  layoutRows: any;

  @ViewChild('viewRef', { read: ViewContainerRef }) content: ViewContainerRef;

  // 容器内的格子  用于划分容器
  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private render: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  ngOnInit() {
    this.render.setStyle(this.el.nativeElement, 'margin', `${this.marginTop}px ${this.marginRight}px
    ${this.marginBottom}px ${this.marginLeft}px`);
    this.initDndContainer();
    this.ngZone.runOutsideAngular(() => {
      if (this.externalDragIn) {
        const dragOverEvent = this.dragOver.bind(this);
        const dropEvent = this.drop.bind(this);
        this.el.nativeElement.addEventListener('dragover', dragOverEvent);
        this.el.nativeElement.addEventListener('drop', dropEvent);
      }
    });
  }

  ngOnChanges() {
  }


  /* dragover */
  dragOver(e: any) {
    e.preventDefault();
  }

  // drop event
  drop(e: any) {
    const offsetDndContainerLeft = e.clientX - this.left;
    const offsetDndContainerTop = e.clientY - this.top;
    // 计算坐标
    const x = Math.floor(offsetDndContainerLeft / this.cellWidth);
    const y = Math.floor(offsetDndContainerTop / this.cellHeight);
    // 检测冲突
    // // const conflictGrid = this.dndService.checkPositionConflicts(this.dndCells, { x, y });
    // if (!conflictGrid) {
    //   // 如果不冲突  即空单元格  可放置  动态创建dndGrid
    //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DndGridComponent);
    //   const newDndGridCmp = this.content.createComponent(componentFactory);
    //   this.cells.reset([newDndGridCmp.instance, ...this.cells.toArray()]);
    //   newDndGridCmp.instance.x = x;
    //   newDndGridCmp.instance.y = y;
    //   newDndGridCmp.instance.rows = 1;
    //   newDndGridCmp.instance.cols = 1;
    //   newDndGridCmp.instance.identify = '1111';
    //   newDndGridCmp.instance.cellHeight = this.cellHeight;
    //   newDndGridCmp.instance.cellWidth = this.cellWidth;
    //   // newDndGridCmp.instance.setSize();
    //   // newDndGridCmp.instance.setPosition();
    //   newDndGridCmp.instance.ngOnInit();
    //   // const dragStartEvent = newDndGridCmp.
    //   // newDndGridCmp.location.nativeElement.addEventListener('dragstart', dragStartEvent);
    //   // newDndGridCmp.injector.get
    // } else {
    //   // todo
    //   // 网格自动布局
    // }
  }

  // 添加网格
  addGrid(grid: any) {
    grid.doSetSize(grid.cols * this.cellWidth, grid.rows * this.cellHeight);
    grid.doSetPosition(grid.x * this.cellWidth, grid.y * this.cellHeight);
    this.grids.push(grid);
  }

  // 删除网格
  removeGrid(item: any) {
    this.grids.splice(this.grids.findIndex(grid => grid.identify === item.identify), 1);
    this.initDndContainer();
    this.render.setStyle(this.el.nativeElement, 'width', `${this.width}px`);
    this.render.setStyle(this.el.nativeElement, 'height', `${this.height}px`);
    this.grids.forEach(grid => {
      grid.doSetSize(grid.cols * this.cellWidth, grid.rows * this.cellHeight);
      grid.doSetPosition(grid.x * this.cellWidth, grid.y * this.cellHeight);
    });
    // this.changeDetectorRef.markForCheck();
  }

  // 初始化容器
  initDndContainer() {
    const { width, height, top, left } = this.el.nativeElement.getBoundingClientRect();
    console.log(this.el.nativeElement.getBoundingClientRect());
    // 初始化容器尺寸
    this.width = width;
    this.height = height;

    // 初始化容器位置
    this.left = left;
    this.top = top;

    // 初始化单元格尺寸
    this.cellWidth = this.width / this.cols;
    this.cellHeight = this.height / this.rows;

    // 划分布局
    this.layoutColumns = this.divideGrid().columns;
    this.layoutRows = this.divideGrid().rows;
  }

  /* 检测位置冲突 */
  checkPositionConflicts(coordinate: { x: number, y: number }) {
    const conflictCell = this.grids.find(cell => cell.x === coordinate.x && cell.y === coordinate.y);
    if (!conflictCell) {
      return false;
    }
    return conflictCell;
  }






  public trackByIndex(index, item) {
    return index;
  }

  // 列格子样式
  private getColumnStyle(i: number) {
    return {
      top: '0px',
      left: `${i * this.cellWidth}px`,
      width: `${this.cellWidth}px`,
      height: `${this.height}px`
    };
  }


  // 行格子样式
  private getRowStyle(i: number) {
    return {
      top: `${i * this.cellHeight}px`,
      left: '0px',
      width: `${this.width}px`,
      height: `${this.cellHeight}px`
    };
  }

  /* 划分布局 */
  private divideGrid() {
    return {
      columns: Array(this.cols).fill(0).map((ele, index) => {
        return {
          index,
          position: this.getColumnStyle(index)
        };
      }),
      rows: Array(this.rows).fill(0).map((ele, index) => {
        return {
          index,
          position: this.getRowStyle(index)
        };
      })
    };
  }
}

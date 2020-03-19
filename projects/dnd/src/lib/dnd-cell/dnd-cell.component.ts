import { Component, OnInit, Input, ElementRef, Renderer2, NgZone, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DndCellOptions } from './dnd-cell-interface';
import { DndComponent } from '../dnd.component';
import { DndService } from '../service/dnd.service';
@Component({
  selector: 'farris-dnd-cell',
  templateUrl: './dnd-cell.component.html',
  styleUrls: ['./dnd-cell.component.css']
})
export class DndCellComponent implements OnInit, DndCellOptions, OnDestroy {

  // 单元格占据cols和rows
  @Input() cols: number;
  @Input() rows: number;

  // 单元格左上角坐标  定义位置
  @Input() x: number;
  @Input() y: number;
  // 单元格标识  唯一
  @Input() identify: string;
  // dragstart emit
  @Output() afterDragStart = new EventEmitter();
  // dragover emit
  @Output() dragOverCallback = new EventEmitter();
  // dragend emit
  @Output() afterDragEnd = new EventEmitter();

  // 上次位置
  lastX: number;
  lastY: number;
  // 单元格尺寸
  cellWidth: number;
  cellHeight: number;

  // 当前网格尺寸
  size: any;

  // 鼠标初始位置
  initialMouseLeft: number;
  initialMouseTop: number;

  // 单元格初始位置
  initialCellLeft: number;
  initialCellTop: number;

  // event
  mouseDownEvent: any;
  dragStartEvent: any;
  dragOverEvent: any;
  dragEndEvent: any;

  // drag标记
  // 正在拖拽中
  dragging: boolean;
  // 所有格子组合
  dndCells: DndCellComponent[];

  // 拖拽容器
  dndContainer: DndComponent;
  // 单元格配置
  // 是否可交换
  swapable: boolean;

  // 单元格顺序
  // order: number;

  constructor(
    private el: ElementRef,
    private render: Renderer2,
    private ngZone: NgZone,
    private dndService: DndService) { }

  ngOnInit() {


    // 获取初始化单元格尺寸
    this.dndService.initCellSize.subscribe(result => {
      this.cellWidth = result.cellWidth;
      this.cellHeight = result.cellHeight;
      this.size = {
        width: this.cols * this.cellWidth,
        height: this.rows * this.cellHeight
      };
    });

    // 获取单元格组合
    this.dndService.dndContainer.subscribe((result: DndComponent) => {
      this.dndContainer = result;
      // 是否可拖拽
      if (this.dndContainer.draggable) {
        this.render.setAttribute(this.el.nativeElement, 'draggable', 'true');
      }
      // 是否可交换
      this.swapable = this.dndContainer.swapable;
      // 网格组合
      this.dndCells = this.dndContainer.dndCells;
    });

    // 避免脏值检测
    this.ngZone.runOutsideAngular(() => {
      // 绑定mousedown事件
      // 绑定dragstart事件
      this.dragStartEvent = this.dragStart.bind(this);
      this.el.nativeElement.addEventListener('dragstart', this.dragStartEvent);
    });
  }

  ngOnDestroy() {
    // 解绑
    this.el.nativeElement.removeEventListener(this.dragStartEvent);
    this.el.nativeElement.removeEventListener(this.dragEndEvent);
  }

  // 当前网格尺寸
  setSize() {
    this.render.setStyle(this.el.nativeElement, 'width', `${this.size.width}px`);
    this.render.setStyle(this.el.nativeElement, 'height', `${this.size.height}px`);
  }

  // 当前网格位置
  setPosition() {
    // this.render.setStyle(this.el.nativeElement, 'transform', `translate(${this.x * this.cellWidth}px,${this.y * this.cellHeight}px)`);
    this.render.setStyle(this.el.nativeElement, 'left', `${this.x * this.cellWidth}px`);
    this.render.setStyle(this.el.nativeElement, 'top', `${this.y * this.cellHeight}px`);
  }

  // dragstart 传递参数  并且绑定dragover dragEnd事件
  private dragStart(e: any) {
    // 初始化上次位置
    this.lastX = this.x;
    this.lastY = this.y;
    this.dragging = true;
    // e.dataTransfer.setData('text', this.identify);
    // 获取初始化鼠标和单元格位置
    this.recordInitialPosition(e);
    // 绑定 dragover  dragEnd
    this.ngZone.runOutsideAngular(() => {
      this.dragOverEvent = this.dragOver.bind(this);
      this.dragEndEvent = this.dragEnd.bind(this);
      document.addEventListener('dragover', this.dragOverEvent);
      this.el.nativeElement.addEventListener('dragend', this.dragEndEvent);
    });
  }


  // dragOver  对象是document
  dragOver(e: any) {
    if (!this.dragging) {
      return;
    }
    // todo
    // 计算当前单元格的位置  检查是否存在冲突
    e.preventDefault();
    this.calculateOffsetPosition(e);
  }

  // dragEnd 对象是当前网格
  dragEnd(e: any) {
    // 确定位置
    // console.log(`lastX:${this.lastX}`, `lastY:${this.lastY}`);
    // this.calculateCellPosition(e);
    // this.setPosition();
    // 解绑
    this.dragging = false;
    // 解绑dragOver
    document.removeEventListener('dragover', this.dragOverEvent);
  }


  // 移动过程  计算网格位置
  private calculateOffsetPosition(e) {
    // 获取偏移坐标
    const offsetCoordinate = this.cellOffsetXY(e);
    // 位置冲突且不是同一个网格  dragover会出现同一个网格冲突的状况  通过identify标识来检测
    const conflictCell = this.dndService.checkPositionConflicts(this.dndCells, offsetCoordinate);
    if (conflictCell && conflictCell.identify !== this.identify) {
      // 如果允许交换 则交换网格
      if (this.swapable) {
        this.dndService.swapCell(this, conflictCell);
        conflictCell.setPosition();
      }
      // 如果不允许交换  冲突网格要移位 todo
    } else {
      this.x = offsetCoordinate.x;
      this.y = offsetCoordinate.y;

    }
    // 没有冲突的情况
    this.setPosition();
    // this.checkScope();
  }



  // 鼠标按下  记录单元格位置以及鼠标位置
  @HostListener('mousedown', ['$event'])
  mouseDown(ev: any) {
    // this.recordInitialPosition(ev);
  }

  // 鼠标按下   改变鼠标样式
  @HostListener('mouseup', ['$event'])
  mouseUpEvent(ev: any) {
  }


  // 记录初始位置
  private recordInitialPosition(e: any) {
    this.initialMouseLeft = e.clientX;
    this.initialMouseTop = e.clientY;
    this.initialCellLeft = this.initialMouseLeft - e.offsetX;
    this.initialCellTop = this.initialMouseTop - e.offsetY;
  }

  // 检测是否越界
  checkScope() {
    const { width, height, left, top } = this.dndContainer;
    // const { clientX, clientY } = e;
    const clientRect = this.el.nativeElement.getBoundingClientRect();
    if (clientRect.left < left) {
      this.render.setStyle(this.el.nativeElement, 'left', `${left}px`);
    }
    if (clientRect.top < top) {
      this.render.setStyle(this.el.nativeElement, 'top', `${top}px`);
    }
    if (clientRect.right > left + width) {
      this.render.setStyle(this.el.nativeElement, 'left', `${left + width - this.size.width}px`);
    }
    if (clientRect.bottom > top + height) {
      this.render.setStyle(this.el.nativeElement, 'top', `${top + height - this.size.height}px`);
    }
    return false;
  }

  // 获取网格偏移坐标
  private cellOffsetXY(e: any) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    // 计算方法 偏移量+初始化位置  根据坐标计算位置
    return {
      x: Math.round((mouseX - this.initialMouseLeft + this.initialCellLeft) / this.cellWidth),
      y: Math.round((mouseY - this.initialMouseTop + this.initialCellTop) / this.cellHeight)
    };
  }


}

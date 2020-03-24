import { Component, OnInit, Input, ElementRef, Renderer2, NgZone, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DndGridOptions } from './dnd-grid.interface';
import { DndComponent } from '../dnd.component';
import { DndService } from '../service/dnd.service';
import { DndResizeService } from '../service/dnd-resize.service';
@Component({
  selector: 'dnd-grid',
  templateUrl: './dnd-grid.component.html',
  styleUrls: ['./dnd-grid.component.css']
})
export class DndGridComponent implements DndGridOptions, OnInit, OnDestroy {

  @Input() options: DndGridOptions;
  // 单元格占据cols和rows
  @Input() cols: number;
  @Input() rows: number;

  // 单元格左上角坐标  定义位置
  @Input() x = -1;
  @Input() y = -1;
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
  // get size() {
  //   return {
  //     width: this.cols * this.cellWidth,
  //     height: this.rows * this.cellHeight
  //   };
  // }

  width: number;
  height: number;

  // 鼠标初始位置
  originalMouseLeft: number;
  originalMouseTop: number;
  // originalMouse

  // 单元格初始位置
  originalGridLeft: number;
  originalGridTop: number;
  originalGridBottom: number;
  originalGridRight: number;


  // 缩放事件
  resizeDirection: string;
  mouseDownEvent: any;
  mouseMoveEvent: any;
  mouseUpEvent: any;

  // 拖拽事件
  dragStartEvent: any;
  dragOverEvent: any;
  dragEndEvent: any;
  // drag标记
  // 正在拖拽中
  dragging: boolean;
  moving: boolean;
  // 所有格子组合
  dndCells: DndGridComponent[];

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
    private dndService: DndService,
    private resizeService: DndResizeService) { }

  ngOnInit() {
    // 获取初始化单元格尺寸
    this.dndService.initCellSize.subscribe(result => {
      this.cellWidth = result.cellWidth;
      this.cellHeight = result.cellHeight;
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

      // 绑定resize事件
    });
    this.render.setStyle(this.el.nativeElement, 'transition', '.3s');


  }

  ngOnDestroy() {
    // 解绑
    this.el.nativeElement.removeEventListener(this.dragStartEvent);
    this.el.nativeElement.removeEventListener(this.dragEndEvent);
  }

  // 当前网格尺寸
  doSetSize(width: number, height: number) {
    this.render.setStyle(this.el.nativeElement, 'width', `${width}px`);
    this.render.setStyle(this.el.nativeElement, 'height', `${height}px`);
  }

  // 当前网格位置
  doSetPosition(left: number, top: number) {
    // this.render.setStyle(this.el.nativeElement, 'transform', `translate(${this.x * this.cellWidth}px,${this.y * this.cellHeight}px)`);
    this.render.setStyle(this.el.nativeElement, 'left', `${left}px`);
    this.render.setStyle(this.el.nativeElement, 'top', `${top}px`);
    // this.initialCellTop = this.y * this.cellHeight;
    // this.initialCellLeft = this.x * this.cellWidth;
  }

  // dragstart 传递参数  并且绑定dragover dragEnd事件
  dragStart(e: any) {
    this.dragging = true;
    // 初始化上次位置
    this.lastX = this.x;
    this.lastY = this.y;
    // e.dataTransfer.setData('text', this.identify);
    // 获取初始化鼠标和单元格位置
    const { mouseX, mouseY } = this.originalMouseXY(e);
    const { top, left } = this.originalSize();
    this.originalMouseLeft = mouseX;
    this.originalMouseTop = mouseY;
    this.originalGridLeft = left;
    this.originalGridTop = top;

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
    // 解绑
    this.dragging = false;
    // 解绑dragOver
    document.removeEventListener('dragover', this.dragOverEvent);
  }
  // 拖拽过程  计算网格位置
  private calculateOffsetPosition(e: any) {
    // 获取偏移坐标
    const offsetCoordinate = this.dndOffsetXY(e);
    // 位置冲突且不是同一个网格  dragover会出现同一个网格冲突的状况  通过identify标识来检测
    const conflictCell = this.dndService.checkPositionConflicts(this.dndCells, offsetCoordinate);
    if (conflictCell && conflictCell.identify !== this.identify) {
      // 如果允许交换 则交换网格
      if (this.swapable) {
        this.dndService.swapGrid(this, conflictCell);
        conflictCell.doSetPosition(conflictCell.x * conflictCell.cellWidth, conflictCell.y * conflictCell.cellHeight);
      }
      // 如果不允许交换  冲突网格要移位 todo
    } else {
      // 没有冲突的情况
      this.x = offsetCoordinate.x;
      this.y = offsetCoordinate.y;
    }
    this.doSetPosition(this.x * this.cellWidth, this.y * this.cellHeight);
    // this.checkScope();
  }

  // resize handler mousedown
  mousedown(e: any) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.target.classList.contains('dnd-grid-resize-handler')) {
      return;
    }
    this.resizeDirection = e.target.classList.item(1).split('-')[1];
    // 清除转变时间
    this.render.setStyle(this.el.nativeElement, 'transition', 'none');
    // 初始化移动前位置
    this.originalMouseLeft = this.originalMouseXY(e).mouseX;
    this.originalMouseTop = this.originalMouseXY(e).mouseY;
    const { top, left, width, height, bottom, right } = this.originalSize();
    this.originalGridTop = top;
    this.originalGridLeft = left;
    this.originalGridBottom = bottom;
    this.originalGridRight = right;
    this.height = height;
    this.width = width;


    this.ngZone.runOutsideAngular(() => {
      this.mouseMoveEvent = this.mousemove.bind(this);
      this.mouseUpEvent = this.mouseup.bind(this);
      document.addEventListener('mousemove', this.mouseMoveEvent);
      document.addEventListener('mouseup', this.mouseUpEvent);
    });
  }

  mousemove(e: any) {
    // 鼠标当前位置
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const mouseXY = {
      mouseX,
      mouseY
    };
    // 鼠标上次位置
    const originalXY = {
      originalX: this.originalMouseLeft,
      originalY: this.originalMouseTop
    };
    // 不同方向 缩放调整位置
    const { width, height, left, top } = this.resizeService.resizeByDirection({ width: this.width, height: this.height },
      { left: this.originalGridLeft, top: this.originalGridTop }, this.resizeOffsetXY(originalXY, mouseXY))[this.resizeDirection];
    // 重新设置网格尺寸和位置
    this.doSetSize(width, height);
    this.doSetPosition(left, top);
  }

  mouseup(e: any) {
    document.removeEventListener('mousemove', this.mouseMoveEvent);
    this.render.setStyle(this.el.nativeElement, 'transition', '.3s');

  }



  // 鼠标初始位置
  private originalMouseXY(e: any) {
    return {
      mouseX: e.clientX,
      mouseY: e.clientY
    };
  }
  // 网格原始位置及尺寸
  private originalSize() {
    return this.el.nativeElement.getBoundingClientRect();
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
      // this.render.setStyle(this.el.nativeElement, 'left', `${left + width - this.size.width}px`);
    }
    if (clientRect.bottom > top + height) {
      // this.render.setStyle(this.el.nativeElement, 'top', `${top + height - this.size.height}px`);
    }
    return false;
  }

  // 获取网格拖拽偏移坐标
  private dndOffsetXY(e: any) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    // 计算方法 偏移量+初始化位置  根据坐标计算位置
    return {
      x: Math.round((mouseX - this.originalMouseLeft + this.originalGridLeft) / this.cellWidth),
      y: Math.round((mouseY - this.originalMouseTop + this.originalGridTop) / this.cellHeight)
    };
  }


  /* 获取缩放网格偏移量 */
  private resizeOffsetXY(originalXY: any, mouseXY: any) {
    // 当前鼠标位置
    const { mouseX, mouseY } = mouseXY;
    // 上次鼠标位置
    const { originalX, originalY } = originalXY;
    return {
      offsetX: mouseX - originalX,
      offsetY: mouseY - originalY
    };
  }
}

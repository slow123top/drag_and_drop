import { Component, OnInit, Input, ElementRef, Renderer2, NgZone, OnDestroy, Output, EventEmitter } from '@angular/core';
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
  resizeMouseDownEvent: any;
  resizeMouseMoveEvent: any;
  resizeMouseUpEvent: any;

  // 拖拽事件
  dndMouseDown: any;
  dragStartEvent: any;
  dragOverEvent: any;
  dragEndEvent: any;
  // drag标记
  // 正在拖拽中
  dragging: boolean;
  moving: boolean;
  // 所有格子组合

  // 单元格配置
  // order: number;
  constructor(
    private el: ElementRef,
    private render: Renderer2,
    private ngZone: NgZone,
    private dndService: DndService,
    private resizeService: DndResizeService,
    private gridContainer: DndComponent) {
  }

  ngOnInit() {
    // 添加grid
    this.gridContainer.addGrid(this);
    this.render.setStyle(this.el.nativeElement, 'transition', '.2s');
    this.dndMouseDown = this.gridMouseDown.bind(this);
    this.el.nativeElement.addEventListener('mousedown', this.dndMouseDown);

    // 添加变换延时
  }

  ngOnDestroy() {
    // 解绑
    if (this.dragStartEvent) {
      this.el.nativeElement.removeEventListener('dragstart', this.dragStartEvent);
    }
    if (this.dragEndEvent) {
      this.el.nativeElement.removeEventListener('dragend', this.dragEndEvent);
    }
    if (this.resizeMouseUpEvent) {
      document.removeEventListener('mouseup', this.resizeMouseUpEvent);
    }
  }

  // 设置当前网格尺寸
  doSetSize(width: number, height: number) {
    this.render.setStyle(this.el.nativeElement, 'width', `${width}px`);
    this.render.setStyle(this.el.nativeElement, 'height', `${height}px`);
  }

  // 设置当前网格位置
  doSetPosition(left: number, top: number) {
    this.render.setStyle(this.el.nativeElement, 'left', `${left}px`);
    this.render.setStyle(this.el.nativeElement, 'top', `${top}px`);
  }

  gridMouseDown(e: any) {
    if (!this.gridContainer.draggable) {
      return;
    }
    // 避免脏值检测
    this.ngZone.runOutsideAngular(() => {
      // 绑定mousedown事件
      // 绑定dragstart事件
      this.el.nativeElement.draggable = true;
      this.dragStartEvent = this.dragStart.bind(this) || null;
      this.el.nativeElement.addEventListener('dragstart', this.dragStartEvent);
      // 绑定resize事件
    });

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
    this.originalMouseLeft = mouseX;
    this.originalMouseTop = mouseY;
    this.originalGridLeft = this.el.nativeElement.offsetLeft;
    this.originalGridTop = this.el.nativeElement.offsetTop;
    // 绑定 dragover  dragEnd
    this.ngZone.runOutsideAngular(() => {
      this.dragOverEvent = this.dragOver.bind(this) || null;
      this.dragEndEvent = this.dragEnd.bind(this) || null;
      document.addEventListener('dragover', this.dragOverEvent);
      this.el.nativeElement.addEventListener('dragend', this.dragEndEvent);
    });
  }


  // dragOver  对象是document
  dragOver(e: any) {
    if (!this.dragging) {
      return;
    }
    // 计算当前单元格的位置  检查是否存在冲突
    e.preventDefault();
    this.calculateOffsetPosition(e);
  }

  // dragEnd 对象是当前网格
  dragEnd(e: any) {
    // 解绑
    this.dragging = false;
    // 解绑dragOver
    if (this.dragOverEvent) {
      document.removeEventListener('dragover', this.dragOverEvent);
    }
  }
  // 拖拽过程  计算网格位置
  private calculateOffsetPosition(e: any) {
    // 获取偏移坐标
    const offsetCoordinate = this.dndOffsetXY(e);
    // 位置冲突且不是同一个网格  dragover会出现同一个网格冲突的状况  通过identify标识来检测
    const conflictCell = this.gridContainer.checkPositionConflicts(offsetCoordinate);
    if (conflictCell && conflictCell.identify !== this.identify) {
      // 如果允许交换 则交换网格
      if (this.gridContainer.swapable) {
        this.dndService.swapGrid(this, conflictCell);
        conflictCell.doSetPosition(conflictCell.x * this.gridContainer.cellWidth, conflictCell.y * this.gridContainer.cellHeight);
      }
      // 如果不允许交换  冲突网格要移位 todo
    } else {
      // 没有冲突的情况
      this.x = offsetCoordinate.x;
      this.y = offsetCoordinate.y;
      // 越界处理
      this.checkScope(this.x * this.gridContainer.cellWidth, this.y * this.gridContainer.cellHeight);
    }

    this.doSetPosition(this.x * this.gridContainer.cellWidth, this.y * this.gridContainer.cellHeight);
  }

  // 鼠标按下事件
  resizeMousedown(e: any) {
    if (!e.target.classList.contains('dnd-grid-resize-handler')) {
      return;
    }
    if (!this.gridContainer.resizable) {
      return;
    }
    this.resizeDirection = e.target.classList.item(1).split('-')[1];
    // 清除转变时间
    this.render.setStyle(this.el.nativeElement, 'transition', 'none');
    // 初始化移动前位置
    this.originalMouseLeft = this.originalMouseXY(e).mouseX;
    this.originalMouseTop = this.originalMouseXY(e).mouseY;
    // const { top, left, width, height, bottom, right } = this.originalSize();
    this.originalGridTop = this.el.nativeElement.offsetTop;
    this.originalGridLeft = this.el.nativeElement.offsetLeft;
    this.height = this.el.nativeElement.offsetHeight;
    this.width = this.el.nativeElement.offsetWidth;

    // 绑定鼠标事件
    this.ngZone.runOutsideAngular(() => {
      this.resizeMouseMoveEvent = this.resizeMousemove.bind(this) || null;
      this.resizeMouseUpEvent = this.resizeMouseup.bind(this) || null;
      document.addEventListener('mousemove', this.resizeMouseMoveEvent);
      document.addEventListener('mouseup', this.resizeMouseUpEvent);
    });
  }

  // 鼠标移动事件
  resizeMousemove(e: any) {
    e.preventDefault();
    e.stopPropagation();
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
      { left: this.originalGridLeft, top: this.originalGridTop },
      this.resizeService.resizeOffsetXY(originalXY, mouseXY))[this.resizeDirection];
    // 重新设置网格尺寸和位置
    this.doSetSize(width, height);
    this.doSetPosition(left, top);
  }

  // 鼠标抬起事件
  resizeMouseup(e: any) {
    if (this.resizeMouseMoveEvent) {
      document.removeEventListener('mousemove', this.resizeMouseMoveEvent);
    }
    this.render.setStyle(this.el.nativeElement, 'transition', '.2s');
  }

  // 鼠标初始位置
  private originalMouseXY(e: any) {
    return {
      mouseX: e.clientX,
      mouseY: e.clientY
    };
  }

  // 比较网格与容器的相对距离 检测是否越界
  private checkScope(currentOffsetLeft: number, currentOffsetTop: number) {
    // 容器尺寸
    const containerWidth = this.gridContainer.width;
    const containerHeight = this.gridContainer.height;
    // 网格尺寸
    const width = this.cols * this.gridContainer.cellWidth;
    const height = this.rows * this.gridContainer.cellHeight;
    // 合法边界大小
    const leftOffset = 0;
    const rightOffset = containerWidth - width;
    const topOffset = 0;
    const bottomOffset = containerHeight - height;
    // 左右
    const realOffsetLeft = Math.min(Math.max(currentOffsetLeft, leftOffset), rightOffset);
    // 上下
    const realOffsetTop = Math.min(Math.max(currentOffsetTop, topOffset), bottomOffset);
    // 重新计算坐标
    this.x = Math.round(realOffsetLeft / this.gridContainer.cellWidth);
    this.y = Math.round(realOffsetTop / this.gridContainer.cellHeight);
  }

  // 获取网格拖拽偏移坐标
  private dndOffsetXY(e: any) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    // 计算方法 偏移量+初始化位置  根据坐标计算位置
    return {
      x: Math.round((mouseX - this.originalMouseLeft + this.originalGridLeft) / this.gridContainer.cellWidth),
      y: Math.round((mouseY - this.originalMouseTop + this.originalGridTop) / this.gridContainer.cellHeight)
    };
  }

}

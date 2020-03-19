import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DndCellComponent } from '../dnd-cell/dnd-cell.component';
// 拖拽事件
@Injectable({ providedIn: 'root' })
export class DndService {

    // 初始化小单元格尺寸 父子组件共享
    public initCellSize = new Subject<any>();

    // 拖拽容器
    public dndContainer = new Subject<any>();
    constructor() {
    }

    dragStart(ev: any) {

    }

    dragOver(ev: any) {
        ev.preventDefault();
    }

    dragEnd(ev) {

    }

    drop(ev) {

    }

    /* 检测位置冲突 */
    checkPositionConflicts(cellGroup: any[], coordinate: any) {
        const conflictCell = cellGroup.find(cell => cell.x === coordinate.x && cell.y === coordinate.y);
        if (!conflictCell) {
            return false;
        }
        return conflictCell;
    }

    /* 交换网格 */
    swapCell(draggedCell: DndCellComponent, swapedCell: DndCellComponent) {
        // 保存被交换的网格位置
        swapedCell.lastX = swapedCell.x;
        swapedCell.lastY = swapedCell.y;

        // 被交换网格的新位置
        swapedCell.x = draggedCell.lastX;
        swapedCell.y = draggedCell.lastY;

        // 拖拽网格新位置
        draggedCell.x = swapedCell.lastX;
        draggedCell.y = swapedCell.lastY;

        // 保存拖拽网格的位置
        draggedCell.lastX = draggedCell.x;
        draggedCell.lastY = draggedCell.y;
    }

}

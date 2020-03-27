import { Injectable } from '@angular/core';
import { ResizeDirection } from '../dnd-grid/dnd-grid.interface';
// 拖拽事件
@Injectable({ providedIn: 'root' })
export class DndResizeService {

    constructor() {
    }

    /* 根据方向 变换尺寸和位置 */
    resizeByDirection(size: any, position: any, offsetXY: any) {
        const resizeInfo = { ...size, ...position, ...offsetXY };
        const sizeAndPosition = { ...size, ...position };
        // 八个方向的尺寸和位置变换
        return {
            [ResizeDirection.North]: this[ResizeDirection.North](sizeAndPosition, resizeInfo),
            [ResizeDirection.South]: this[ResizeDirection.South](sizeAndPosition, resizeInfo),
            [ResizeDirection.West]: this[ResizeDirection.West](sizeAndPosition, resizeInfo),
            [ResizeDirection.East]: this[ResizeDirection.East](sizeAndPosition, resizeInfo),
            [ResizeDirection.South_West]: this[ResizeDirection.West](this[ResizeDirection.South](sizeAndPosition, resizeInfo), resizeInfo),
            [ResizeDirection.South_East]: this[ResizeDirection.East](this[ResizeDirection.South](sizeAndPosition, resizeInfo), resizeInfo),
            [ResizeDirection.North_East]: this[ResizeDirection.East](this[ResizeDirection.North](sizeAndPosition, resizeInfo), resizeInfo),
            [ResizeDirection.North_West]: this[ResizeDirection.West](this[ResizeDirection.North](sizeAndPosition, resizeInfo), resizeInfo)
        };
    }

    // north方向
    n(defaultInfo: any, info: any) {
        // deep copy
        const cloneDefaultInfo = Object.assign({}, defaultInfo);
        cloneDefaultInfo.height = info.height - info.offsetY;
        cloneDefaultInfo.top = info.top + info.offsetY;
        return cloneDefaultInfo;
    }

    // south方向
    s(defaultInfo: any, info: any) {
        const cloneDefaultInfo = Object.assign({}, defaultInfo);
        cloneDefaultInfo.height = info.height + info.offsetY;
        return cloneDefaultInfo;
    }

    // west方向
    w(defaultInfo: any, info: any) {
        const cloneDefaultInfo = Object.assign({}, defaultInfo);
        cloneDefaultInfo.width = info.width - info.offsetX;
        cloneDefaultInfo.left = info.left + info.offsetX;
        return cloneDefaultInfo;
    }

    // east方向
    e(defaultInfo: any, info: any) {
        const cloneDefaultInfo = Object.assign({}, defaultInfo);
        cloneDefaultInfo.width = info.width + info.offsetX;
        return cloneDefaultInfo;
    }


    /* 获取缩放网格偏移量 */
    resizeOffsetXY(originalXY: any, mouseXY: any) {
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

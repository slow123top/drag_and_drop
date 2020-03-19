import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DndRenderService {

    constructor() {
    }

    // dnd 列样式
    getColumnStyle(index: number, width: number, height: number) {
        // 第几行  从0开始
        return {
            top: '0px',
            left: `${index * width}px`,
            width: `${width}px`,
            height: `${800}px`
        };
    }

    // dnd行样式
    getRowStyle(index: number, width: number, height: number) {
        // 第几行  从0开始
        return {
            top: `${index * height}px`,
            left: '0px',
            width: `${1000}px`,
            height: `${height}px`
        };
    }
}

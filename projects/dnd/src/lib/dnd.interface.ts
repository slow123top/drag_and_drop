import { DndCellOptions } from './dnd-cell/dnd-cell-interface';

export interface DndOptions {
    // 尺寸
    width?: number;
    height?: number;
    // 分几行几列
    cols?: number;
    rows?: number;
    // 单元格配置
    cells: DndCellOptions[];
}

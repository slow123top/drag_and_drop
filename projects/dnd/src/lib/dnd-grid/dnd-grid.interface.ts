export interface DndGridOptions {
    // 尺寸
    width?: number;
    height?: number;
    // 占据行列尺寸
    cols: number;
    rows: number;
    // 坐标
    x: number;
    y: number;
    // 标识
    identify: string;
    // 顺序
    order?: number;
}


export enum ResizeDirection {
    South = 's',
    West = 'w',
    North = 'n',
    East = 'e',
    South_West = 'sw',
    North_West = 'nw',
    South_East = 'se',
    North_East = 'ne',
}

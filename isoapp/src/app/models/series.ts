import { List } from "../shared/list";

export const ChartShapes = [
    'circle',
    'cross',
    'square',
    'triangle'
];

export interface Series {
    xAxis: string;
    yAxis: string;
    width: number;
    height: number;
    series: Array<DataSeries>;
    xLog: boolean;
    yLog: boolean;
    cache?: boolean;
}

export interface DataSeries {
    samples: List<number>;
    selected: boolean;
    data: List<DataSeriesPoint>;
    shape: DataSeriesShape;
    name: string;
}

export interface Point { value: number; um?: string };

export interface DataSeriesPoint {
    x: Point;
    y: Point;
}

export interface DataSeriesShape {
    color: string;
    shape: string;
}

export interface SpiderData {
    label: string;
    y?: number;
}

export interface SpiderSeries {
    sample: string;
    data: Array<SpiderData>;
}

export interface SpiderDiagram {
    width: number;
    height: number;
    series: Array<SpiderSeries>;
}

export const DATA_SERIES = '_DATA_SERIES_';
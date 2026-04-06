export interface Reservoir {
    id: number;
    name: string;
    element: string;
    value: number;
    um?: string;
    info?: string;
    reference?: string;
    source?: string;
    doi?: string;
    error?: number;
    errorType?: string;
    selected?: boolean;
}
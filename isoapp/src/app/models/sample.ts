export interface ChemComponent {
    component: string;
    value: string;
    isIsotope: boolean;
    um?: string;
    uncertainty?: number;
    uncertaintyType?: string;
    technique?: string;
    refstd?: string;
}

export interface SampleElement {
    field: string;
    value?: string;
}

export interface Sample {
    datasetId?: number;
    id?: number;
    fields: Array<SampleElement>;
    components: Array<ChemComponent>;
}

export interface Helper {
    attributes: Array<SampleElement>;
}

export interface Matrix {
    matrix: string;
    nodeId: number;
    parentNodeId?: number;
    selected?: boolean;
}

export interface MatrixNode {
    node: string;
    parent?: string;
    children?: Array<string>;
}

export function buildMatrixTree(matrices: Array<Matrix>): MatrixNode {    
    let root: MatrixNode = { node: matrices[0].matrix };
    return root;
}

export function getMatrixRoots(m: Array<Matrix>): Array<Matrix> {
    let result = new Array<Matrix>();
    for (let item of m) {
        if (!item.parentNodeId) {
            result.push(item);
        }
    }
    return result;
}



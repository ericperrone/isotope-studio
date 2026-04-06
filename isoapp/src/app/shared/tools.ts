import { EndMemberItem } from "../services/common/geo-model.service";
import { GridItem } from "./components/grid/grid.component";

export const UM_SEP1 = '[';
export const UM_SEP2 = ']';

export function toPPM(item: EndMemberItem): number {
    let result = parseFloat(item.value);
    let um = item.um;
    if (!um && item.name.indexOf(UM_SEP1) > -1 && item.name.indexOf(UM_SEP2) > -1) {
        um = item.name.substring(1 + item.name.indexOf(UM_SEP1));
        um = um.substring(0, um.length - 1);
    }
    if (!!um && um.length > 0) {
        um = um.toUpperCase();
        switch (um) {
            case 'PPB':
                result = 1000 * result;
                break;
            case 'PPT':
                result = 1000000 * result;
                break;
            case 'WT%':
                result = 10000 * result;
                break;
        }
    }
    return result;
}

export function getElementName(e: string): string {
    let i = e.indexOf(UM_SEP1);
    if (i > -1)
        return e.substring(0, i).trim();
    return e;
}

export function locateByValue(v: Array<string>, item: string): number {
    for (let i = 0; i < v.length; i++) {
        if (v[i] === item)
            return i;
    }
    return -1;
}

export function distinct(vector: Array<string>): Array<string> {
    let nVector = new Array<string>;
    let index = new Map<string, string>();

    for (let v of vector) {
        let w = v.toLowerCase();
        if (!index.get(w)) {
            index.set(w, v);
            nVector.push(v);
        }
    }

    return nVector;
}

export function deleteByValue(vector: Array<string>, value: string): Array<string> {
    let nVector = new Array<string>;
    let toBeDeleted = value.toLowerCase();
    for (let v of vector) {
        if (v.toLowerCase() !== toBeDeleted) {
            nVector.push(v);
        }
    }

    return nVector;
}

export interface GeoGoordinates {
    latitude: number;
    longitude: number;
}

export function epsg3857to4326(lat3857: number, long3857: number): GeoGoordinates {
    const e_value = 2.7182818284;
    const X = 20037508.34;

    const long4326 = (long3857 * 180) / X;

    let lat4326 = lat3857 / (X / 180);
    const exponent = (Math.PI / 180) * lat4326;

    lat4326 = Math.atan(Math.pow(e_value, exponent));
    lat4326 = lat4326 / (Math.PI / 360);
    lat4326 = lat4326 - 90;

    return { latitude: lat4326, longitude: long4326 };
}

export function saveCsvFile(csv: string): void {
    const universalBOM = "\uFEFF";
    window.open("data:text/csv;charset=utf-16," + encodeURIComponent(universalBOM + csv));
}

export function isEmpty(object: any): boolean {
    let obj = '' + JSON.stringify(object);
    return obj === '{}' || obj === 'undefined' || obj === 'null';
}

export function update(table: Array<Array<GridItem>>, item: GridItem): void {
    let r = item.row;
    let c = item.col;

    let element = find(table, r, c);
    if (!!element) {
        element = item;
    }
}

export function find(table: Array<Array<GridItem>>, r: number, c: number): GridItem | undefined {
    let X = table.length;
    let Y = table[0].length;

    for (let i = 0; i < X; i++) {
        for (let j = 0; j < Y; j++) {
            if (table[i][j].row == r && table[i][j].col == c)
                return table[i][j];
        }
    }

    return undefined;
}

export function mergeCols(table: Array<Array<GridItem>>, targetCol: number, tbm: Array<number>): Array<Array<GridItem>> {
    let nRighe = table.length;
    let nColonne = table[0].length;
    let targetIndex = 0;

    for (let c = 0; c < nColonne; c++) {
        if (table[0][c].col === targetCol) {
            targetIndex = c;
            break;
        }
    }

    console.log(targetIndex);

    let srcIndex = new Array<number>();
    for (let i = 0; i < tbm.length; i++) {
        for (let c = 0; c < nColonne; c++) {
            if (table[0][c].col === tbm[i]) {
                srcIndex.push(c);
                break;
            }
        }
        console.log(srcIndex);
    }

    for (let c of srcIndex) {
        for (let r = 0; r < nRighe; r++) {
            table[r][c].visible = false;
            if (r > 0 && ('' + table[r][targetIndex].content).trim().length === 0) {
                table[r][targetIndex].content = table[r][c].content;
                table[r][targetIndex].visible = true;
            }
        }
    }

    console.log(table);

    return table;
}
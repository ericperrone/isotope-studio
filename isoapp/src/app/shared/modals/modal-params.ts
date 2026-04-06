export interface ModalParams {
    headerText?: string;
    bodyText?: string;
    list?: Array<DataListItem>;
    idList?: Array<string>;
    id?: string;
    choices?: Array<ExclusiveChoice>;
    anyParams?: any;
}

export interface DataListItem {
    key: string;
    value: string;
}

export interface ExclusiveChoice {
    text: string;
    value: number;
    color?: string;
    icon?: string;
}

export const CONFIRM = 'confirm';
export const CANCEL = 'cancel';
export interface Dataset {
    fileName: string;
    keywords: string;
    id?: number;
    ref: string;
    authors: string;
    year: number;
    processed: boolean;
    metadata: string;
}

export interface DatesetFullLink {
    ref: string;
    metadata: string;
}

export interface DatasetCache {
    datasetid: number;
    fieldname: string;
    fieldtype: string;
    nfieldtype?: number;
    um?: string;
    technique?: string;
    error?: number;
    errortype?: string;
}
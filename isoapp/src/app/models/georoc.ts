import { UM_SEP1, UM_SEP2, isEmpty } from "../shared/tools";
import { Author } from "./author";
import { Dataset } from "./dataset";
import { Sample, SampleElement, ChemComponent } from "./sample";
import { ChemElements, Isotopes, checkIsotope } from 'src/app/shared/const';

export interface GeorocFullData {
    authors?: Array<Author>;
    dataset?: Dataset;
    sample?: Sample;
    matrix?: Array<string>;
    // metadata?: string;
}

export interface GeorocAuthor {
    firstName?: string;
    lastName?: string;
    personID?: number;
}

export interface GeorocRef {
    doi?: string;
    journal?: string;
    pages?: string;
    ref_num?: number;
    title?: string;
    year: number;

}

export interface GeorocReference {
    samplingfeatureid: number;
    authors: Array<GeorocAuthor>;
    // reference: GeorocRef;
    externalIdentifier?: string;
    doi?: string;
    journal?: string;
    pages?: string;
    ref_num?: number;
    title?: string;
    publicationYear: number;
    citationID: number;
    publisher?: string;
    citationLink?: string;
    volume?: string;
    issue?: string;
    firstPage?: string;
    lastPage?: string;
    bookTitle?: string;
    editors?: string;
}

export interface GeorocResult {
    itemName: string;
    value: number;
    unit: string;
}

export interface GeorocBatchData {
    results?: Array<GeorocResult>;
}

export interface GeorocData {
    sampleNum?: number;
    sampleID?: number;
    sampleName: string;
    //results?: Array<GeorocResult>;
    batchData?: Array<GeorocBatchData>;
    uniqueID?: string;
    batches?: Array<number>;
    references?: Array<GeorocReference>;
    locationNames?: Array<string>;
    locationTypes?: Array<string>;
    elevationMin?: string;
    elevationMax?: string;
    landOrSea?: string;
    rockTypes?: Array<GeorocRockType>;
    rockClasses?: Array<string>;
    rockTextures?: Array<string>;
    materials?: Array<string>;
    minerals?: Array<string>;
    inclusionTypes?: Array<string>;
    locationNum?: number;
    latitude?: number;
    longitude?: number;
    latitudeMin?: string;
    latitudeMax?: string;
    longitudeMin?: string;
    longitudeMax?: string;
    tectonicSetting?: string;
    method?: Array<string>;
    comment?: Array<string>;
    institutions?: Array<string>;
    itemName?: Array<string>;
    itemGroup?: Array<string>;
    standardNames?: Array<string>;
    standardValues?: Array<number>;
    values?: Array<number>;
    units?: Array<string>;
}

export interface GeorocRockType {
    value: string;
    label: string;
    id: number;
}

export interface GeorocNative {
    numItems: number;
    data?: Array<GeorocData>;
}

export function toGeorocFullData(gData: GeorocData): GeorocFullData {
    let fullData: GeorocFullData = {};
    if (!isEmpty(gData)) {
        fullData.authors = getAuthors(gData);
        fullData.dataset = getDataset(gData);
        fullData.sample = buildSample(gData);
        fullData.matrix = getRockTypes(gData);
        // fullData.metadata = getMetadata(gData);
    }

    return fullData;
}

function buildSample(data: GeorocData): Sample {
    let sample: Sample = { fields: new Array<SampleElement>, components: new Array<ChemComponent>() };
    let d = data;
    if (!!d && !!d.batchData && !!d.batchData[0].results) {
        for (let i = 0; i < d.batchData[0].results?.length; i++) {
            let cc: ChemComponent = {
                component: d.batchData[0].results[i].itemName, // + (!!d.batchData[0].results[i].unit ? ' ' + UM_SEP1 + d.batchData[0].results[i].unit + UM_SEP2 : ''),
                value: '' + d.batchData[0].results[i].value,
                isIsotope: checkIsotope(d.batchData[0].results[i].itemName),
                um: d.batchData[0].results[i].unit
            };
            sample.components.push(cc);
        }
        sample.fields.push({ field: 'SAMPLE NAME', value: d.sampleName });
        sample.fields.push({ field: 'LATITUDE', value: '' + d.latitude });
        sample.fields.push({ field: 'LONGITUDE', value: '' + d.longitude });
        sample.fields.push({ field: 'GEOROC_ID', value: '' + d.sampleID });
        let loc = '';
        if (!!d.locationNames)
            for (let i = 0; i < d.locationNames.length; i++) {
                // sample.fields.push({ field: 'LOCATION ' + (i + 1), value: d.locationNames[i] });
                loc += d.locationNames[i] + '::';
            }
        sample.fields.push({ field: 'LOCATIONS', value: loc });
    }
    return sample;
}

function getMetadata(data: GeorocData): string {
    let meta = '@';
    let d = data;
    if (!!d.references) {
        let ref = d.references[0];
        if (!!ref.bookTitle) {
            meta += 'book{';
        } else if (!!ref.journal) {
            meta += 'article{';
        } else {
            return meta;
        }
        meta += '' + ref.citationID;
        if (!!ref.authors && !!ref.publicationYear) {
            meta += '' + ref.authors[0].lastName + ref.publicationYear;
        }
        meta += ',';
        meta += 'title={' + ref.title + '},';
        if (!!ref.journal) {
            meta += 'journal = {' + ref.journal + '},';
        }
        if (!!ref.bookTitle) {
            meta += 'journal = {' + ref.bookTitle + '},';
        }
        if (!!ref.volume) {
            meta += 'volume = {' + ref.volume + '},';
        }
        if (!!ref.firstPage && !!ref.lastPage) {
            meta += 'pages = {' + ref.firstPage + '-' + ref.lastPage + '},';
        }
        if (!!ref.externalIdentifier) {
            meta += 'url = {' + ref.externalIdentifier + '},';
        }
        if (!!ref.publicationYear) {
            meta += 'year = {' + ref.publicationYear + '},';
        }
        if (!!ref.publisher) {
            meta += 'publisher = {' + ref.publisher + '},';
        }
        if (!!ref.authors) {
            meta += 'author = {';
            for (let i = 0; i < ref.authors.length - 2; i++) {
                meta += ref.authors[i].lastName + ' ' + ref.authors[i].firstName + ' and ';
            }
            meta += ref.authors[ref.authors.length - 1].lastName + ' ' + ref.authors[ref.authors.length - 1].firstName;
            meta += '}';
        }

        meta += '}';
    }
    return meta;
}

function getDataset(data: GeorocData): Dataset {
    let dataset: Dataset = { fileName: '_GEOROC_', keywords: '', ref: '', authors: '', year: 0, processed: true, metadata: '' };
    let d = data;
    if (!!d.references) {
        for (let ref of d.references) {
            // dataset.ref = ref.doi ? ref.doi : '';
            dataset.ref = ref.externalIdentifier ? ref.externalIdentifier : '';
            dataset.year = ref.publicationYear;
            for (let a of ref.authors) {
                dataset.authors += a.lastName + ',' + a.firstName + ';';
            }
            dataset.authors = dataset.authors.substring(0, dataset.authors.length - 1);
            let meta = ref.title?.toUpperCase().split(' ');
            if (!!meta) {
                for (let m of meta) {
                    if (m !== 'THE' && m !== 'OF' && m !== 'A' && m !== 'AN' && m !== 'FROM' && m !== 'TO'
                        && m !== 'FOR' && m !== 'IN' && m !== 'ON') {
                        dataset.keywords += m + ' ';
                    }
                }
                dataset.keywords = dataset.keywords.trim();
            }
            dataset.metadata = getMetadata(d);
        }
    }
    return dataset;
}

function getAuthors(data: GeorocData): Array<Author> {
    let authors = new Array<Author>();
    let d = data;
    if (!!d.references) {
        for (let r of d.references) {
            for (let a of r.authors) {
                let author: Author = { surname: '', name: '' };
                author.surname = a.lastName ? a.lastName : '';
                author.name = a.firstName ? a.firstName : '';
                if (author.surname.length > 0 && author.name.length > 0) {
                    authors.push(author);
                }
            }
        }
    }

    return authors;
}

function getRockTypes(data: GeorocData): Array<string> {
    let d = data;
    if (!!d.rockTypes && d.rockTypes.length > 0) {
        let rocks = [];
        for (let r of d.rockTypes) {
            rocks.push('' + r.label);
        }
        return rocks;
    }
    return [];
}
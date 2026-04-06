export const ItinerisKeywords = [
    'ITINERIS_Document', 'Sample Name',	'Location',	'Location_Details',	
    'Latitude',	'Longitude', 'EPSG', 'Matrix', 'Matrix_Details', 'DOI',	
    'Authors',	'Year of Publication',	'Unit',	
     'Technique', 'Ref.Std.'
];

export function isItinerisTemplate(header: string[]): boolean {
    for (let h of header) {
        if (h.toLowerCase() === 'itineris_document')
            return true;
    }
    return false;
}

export function isItinerisKey(key: string): boolean {
    let keyl = key.toLowerCase();
    for (let k of ItinerisKeywords) {
        if (k.toLowerCase() === keyl) {
            return true;
        }
    }
    return false;
}

export const ChemElements = [
    'Ac',
    'Ag',
    'Al',
    'Am',
    'Ar',
    'As',
    'At',
    'Au',
    'B',
    'Ba',
    'Be',
    'Bh',
    'Bi',
    'Bk',
    'Br',
    'C',
    'Ca',
    'Cd',
    'Ce',
    'Cf',
    'Cl',
    'Cm',
    'Co',
    'Cr',
    'Cs',
    'Cu',
    'Db',
    'Ds',
    'Dy',
    'Er',
    'Es',
    'Eu',
    'F',
    'Fe',
    'Fm',
    'Fr',
    'Ga',
    'Gd',
    'Ge',
    'H',
    'He',
    'Hf',
    'Hg',
    'Ho',
    'Hs',
    'I',
    'In',
    'Ir',
    'K',
    'Kr',
    'La',
    'Li',
    'Lr',
    'Lu',
    'Md',
    'Mg',
    'Mn',
    'Mo',
    'Mt',
    'N',
    'Na',
    'Nb',
    'Nd',
    'Ne',
    'Ni',
    'No',
    'Np',
    'O',
    'Os',
    'P',
    'Pa',
    'Pb',
    'Pd',
    'Pm',
    'Po',
    'Pr',
    'Pt',
    'Pu',
    'Ra',
    'Rb',
    'Re',
    'Rf',
    'Rg',
    'Rh',
    'Rn',
    'Ru',
    'S',
    'Sb',
    'Sc',
    'Se',
    'Sg',
    'Si',
    'Sm',
    'Sn',
    'Sr',
    'Ta',
    'Tb',
    'Tc',
    'Te',
    'Th',
    'Ti',
    'Tl',
    'Tm',
    'U',
    'Cn',
    'Lv',
    'Og',
    'Mc',
    'Fl',
    'Ts',
    'Nh',
    'V',
    'W',
    'Xe',
    'Y',
    'Yb',
    'Zn',
    'Zr',
    'SiO2',
    'TiO2',
    'Al2O3',
    'Fe2O3',
    'Fe2O3 (Tot)',
    'FeO',
    'FeO (Tot)',
    'MgO',
    'CaO',
    'Na2O',
    'K2O',
    'P2O5',
    'MnO',
    'Cr2O3',
    'NiO',
    'CaCO3',
    'LOI',
    'H2O+',
    'H2O-',
    'H2O',
    'H2O (Tot)',
    'CO2',
    'F',
    'Cl',
    'SO4'
];

export const Isotopes = [
    '1H', 'H1',
    '2H', 'H2',
    '3H', 'H3',
    '4H', 'H4',
    '6Li', 'Li6',
    '7Li', 'Li7',
    '10B', 'B10',
    '11B', 'B11',
    '12C', 'C12',
    '13C', 'C13',
    '14C', 'C14',
    '14N', 'N14',
    '15N', 'N15',
    '16O', 'O16',
    '17O', 'O17',
    '18O', 'O18',
    '20Ne', 'Ne20',
    '21Ne', 'Ne21',
    '22Ne', 'Ne22',
    '24Mg', 'Mg24',
    '25Mg', 'Mg25',
    '26Mg', 'Mg26',
    '28Si', 'Si28',
    '29Si', 'Si29',
    '30Si', 'Si30',
    '32S', 'S32',
    '33S', 'S33',
    '34S', 'S34',
    '36S', 'S36',
    '36Cl', 'Cl36',
    '37Cl', 'Cl37',
    '36Ar', 'Ar36',
    '38Ar', 'Ar38',
    '40Ar', 'Ar40',
    '39K', 'K39',
    '40K', 'K40',
    '41K', 'K41',
    '40Ca', 'Ca40',
    '42Ca', 'Ca42',
    '43Ca', 'Ca43',
    '44Ca', 'Ca44',
    '46Ca', 'Ca46',
    '48Ca', 'Ca48',
    '50Cr', 'Cr50',
    '52Cr', 'Cr52',
    '53Cr', 'Cr53',
    '54Cr', 'Cr54',
    '54Fe', 'Fe54',
    '56Fe', 'Fe56',
    '57Fe', 'Fe57',
    '58Fe', 'Fe58',
    '58Ni', 'Ni58',
    '60Ni', 'Ni60',
    '61Ni', 'Ni61',
    '62Ni', 'Ni62',
    '64Ni', 'Ni64',
    '63Cu', 'Cu63',
    '65Cu', 'Cu65',
    '64Zn', 'Zn64',
    '66Zn', 'Zn66',
    '67Zn', 'Zn67',
    '68Zn', 'Zn68',
    '70Zn', 'Zn70',
    '78Kr', 'Kr78',
    '80Kr', 'Kr80',
    '82Kr', 'Kr82',
    '83Kr', 'Kr83',
    '84Kr', 'K384',
    '86Kr', 'Kr86',
    '85Rb', 'Rb85',
    '87Rb', 'Rb87',
    '84Sr', 'Sr84',
    '86Sr', 'Sr86',
    '87Sr', 'Sr87',
    '88Sr', 'Sr88',
    '92Mo', 'Mo92',
    '94Mo', 'Mo94',
    '95Mo', 'Mo95',
    '96Mo', 'Mo96',
    '97Mo', 'Mo97',
    '98Mo', 'Mo98',
    '100Mo', 'Mo100',
    '124Xe', 'Xe124',
    '126Xe', 'Xe126',
    '128Xe', 'Xe128',
    '129Xe', 'Xe129',
    '130Xe', 'Xe130',
    '131Xe', 'Xe131',
    '132Xe', 'Xe132',
    '134Xe', 'Xe134',
    '136Xe', 'Xe136',
    '142Nd', 'Nd142',
    '143Nd', 'Nd143',
    '144Nd', 'Nd144',
    '145Nd', 'Nd145',
    '146Nd', 'Nd146',
    '148Nd', 'Nd148',
    '150Nd', 'Nd150',
    '174Hf', 'Hf174',
    '175Hf', 'Hf175',
    '177Hf', 'Hf177',
    '178Hf', 'Hf178',
    '179Hf', 'Hf179',
    '180Hf', 'Hf180',
    '203Tl', 'Tl203',
    '205Tl', 'Tl205',
    '204Pb', 'Pb204',
    '206Pb', 'Pb206',
    '207Pb', 'Pb207',
    '208Pb', 'Pb208'
];

export function getElementByisotope(isotope: string): string {
    let element = '';
    let iso = isotope.toLowerCase();
    console.log(ChemElements);
    for (let ch of ChemElements) {
        let c = ch.toLowerCase();
        // console.log('c: ' + c);
        let match = iso.match(c);
        if (!!match) {
            if (match[0].length > element.length && match[0] !== iso)
            element = ch;
        }
    }
    return element;
}

export function checkChemElement(element: string): boolean {
    let ele = element;
    if (ele.indexOf('(') > 0) {
        ele = ele.split('(')[0].trim().trimEnd().trimStart();
    }
    if (ele.indexOf(' ') > 0) {
        ele = ele.split(' ')[0].trim().trimEnd().trimStart();
    }
    if (ele.indexOf('/') > 0) {
        ele = ele.split('/')[0].trim().trimEnd().trimStart();
    }
    for (let e of ChemElements) {
        if (e.toLowerCase() === ele.toLowerCase())
            return true;
    }
    return false;
}

export const FIELDS = [
    'rock', 'sampl', 'age', 'loca', 'latitude', 'longitude', 'material', 'mineral', 'ref', 'tect', 'type', 'name', 'serie',
    'alter', 'drill', 'geol', 'erupt', 'year', 'elevation', 'itineris_document', 'matrix', 'matrix_details', 'doi', 'authors',
    'uncertainty', 'technique', 'unit'
];

export const ITINERIS_RESERVED = [
    'uncertainty', 'technique', 'unit', 'typeofuncertainty', 'ref.std.', 'ref.std', 'refstd.', 'refstd'
];

export const CACHE_AUTH = '_CACHE_AUTH_';
export const CACHE_LINKS = '_CACHE_LINKS_';
export const CACHE_YEARS = '_CACHE_YEARS_';

export function checkField(field: string) {
    let f = field.toLowerCase();
    for (let e of FIELDS) {
        if (f.indexOf(e) >= 0) {
            return true;
        }
    }
    return false;
}

export function checkIsotope(element: string): boolean {
    let ele = element.toLowerCase().trim().trimEnd().trimStart();
    for (let isotope of Isotopes) {
        if (ele.indexOf(isotope.toLowerCase()) >= 0)
            return true;
    }
    return false;
}
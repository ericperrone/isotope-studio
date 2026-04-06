import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { StoreService, storeParam, storeType } from 'src/app/services/common/store.service';
import { DATA_GATHERING, DataGatheringSession } from 'src/app/data-processing/main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { SampleElement, ChemComponent, Sample } from 'src/app/models/sample';
import { trigger, style, animate, transition } from '@angular/animations';
import { checkChemElement, checkField, checkIsotope, isItinerisTemplate, ITINERIS_RESERVED } from 'src/app/shared/const';
import { Subscription } from 'rxjs';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { DatasetCache } from 'src/app/models/dataset';

export interface Col {
  name: string;
  col: number;
  type: SampleType;
  um?: string;
  utype?: string;
  error?: number;
}

export enum SampleType { FIELD = 1, CHEM, ISOTOPE, NONE };

export interface SampleItem {
  item: string;
  type: SampleType;
  um?: string;
  utype?: string;
  error?: number;
  technique?: string;
}

@Component({
  selector: 'app-sample-definition',
  templateUrl: './sample-definition.component.html',
  styleUrls: ['./sample-definition.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SampleDefinitionComponent extends DataGathering implements OnInit, OnDestroy {
  public ST = SampleType;
  public row: Array<string> = new Array<string>();
  public sampleDef: Array<SampleItem> = new Array<SampleItem>();
  public selectedStyle = 'transparent';
  public styles: storeType = [];
  public dataComposed = false;
  private subscription: Subscription | undefined;
  public buttonEnabled = false;
  public ums = new Array<string>();
  public uTypes = new Array<string>();
  public template = false;

  constructor(private router: Router,
    private datasetService: DatasetService,
    private geoModelService: GeoModelsService,
    private storeService: StoreService) {
    super();
    this.buttonEnabled = false;
  }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    console.log(session);
    if (!!session.selectedDataset && !!session.selectedDataset.id) {
      let s = this.datasetService.getCache(session.selectedDataset.id).subscribe(
        (res: any) => {
          console.log(res);
          s.unsubscribe();

          if (!!res) {
            this.sampleDef = new Array<SampleItem>();
            for (let r of res) {
              this.sampleDef.push(
                {
                  item: r.fieldName,
                  type: parseInt(r.fieldType),
                  um: r.um,
                  error: r.error,
                  utype: r.errorType,
                  technique: r.technique
                }
              );
            }
            console.log(this.sampleDef);
          }
          if (!session || !session.header) {
            this.router.navigate(['main-data-processing']);
          } else {
            this.session = session;
            console.log(session.header);
            this.template = isItinerisTemplate(session.header);
            this.loadUms();
          }
        }
      );
    }

  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadUms(): void {
    this.ums.length = 0;
    let s = this.geoModelService.getConversionTable().subscribe(
      (res: any) => {
        this.ums.push('');
        for (let r of res) {
          this.ums.push(r.um);
        }
        s.unsubscribe();
        let r = this.geoModelService.getUncertaintyType().subscribe(
          (res: any) => {
            console.log(res);
            this.uTypes.push('');
            for (let r of res) {
              this.uTypes.push(r);
            }
            r.unsubscribe();
            this.row = this.cleanRow(this.session);
            if (!this.sampleDef || this.sampleDef.length == 0)
              this.loadComponents();
            this.initStyles();
          }
        );
      }
    );
  }

  private loadComponents() {
    if (!!this.row) {
      this.sampleDef = new Array<SampleItem>();
      for (let r of this.row) {
        let item: SampleItem = { item: r, type: SampleType.CHEM };
        let a = r.indexOf('(');
        let b = r.indexOf(')');
        if (a > 0 && b > a) {
          item.um = this.geoModelService.checkUm(r.substring(a + 1, b), this.ums);
        }

        if (checkField(r)) {
          item.type = SampleType.FIELD;
          this.sampleDef.push(item);
          continue;
        }
        if (checkChemElement(r)) {
          this.sampleDef.push(item);
          continue;
        }
        if (checkIsotope(r)) {
          item.type = SampleType.ISOTOPE;
          this.sampleDef.push(item);
          continue;
        }
        item.type = SampleType.NONE;
        this.sampleDef.push(item);
      }
    }
    this.checkDataComposition();
  }

  private checkDataComposition(): void {
    for (let s of this.sampleDef) {
      if (s.type !== SampleType.NONE) {
        this.dataComposed = true;
        return;
      }
    }
    this.dataComposed = false;
  }

  public goNext(): void {
    if (this.dataComposed === false)
      return;
    this.updateSamples();
    this.buildPayload();
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
    // console.log(this.storeService.get(DATA_GATHERING));
    this.router.navigate(['save-data']);
  }

  public goPrevious(): void {
    this.router.navigate(['content-manager']);
  }

  public setStyle(si: SampleItem, type: SampleType): void {
    switch (type) {
      case SampleType.FIELD:
        this.styles[si.item] = 'lightseagreen';
        break;
      case SampleType.CHEM:
        this.styles[si.item] = 'lightsalmon';
        break;
      case SampleType.ISOTOPE:
        this.styles[si.item] = 'lightgreen';
        break;
      default:
        this.styles[si.item] = 'transparent';
        break;
    }
    si.type = type;
    this.checkDataComposition();
    // this.updateSamples();
    // this.buildPayload();
  }

  public updateSamples() {
    if (!!this.session && !!this.session.selectedDataset && !!this.session.selectedDataset.id) {
      let cache = new Array<DatasetCache>();
      this.session.fields = new Array<string>();
      this.session.chems = new Array<string>();
      this.session.isotopes = new Array<string>();
      for (let s of this.sampleDef) {
        cache.push({ datasetid: this.session.selectedDataset.id, fieldname: s.item, fieldtype: '' + s.type, um: s.um, error: s.error, errortype: s.utype });

        switch (s.type) {
          case SampleType.FIELD:
            this.session.fields.push(s.item);
            break;
          case SampleType.CHEM:
            this.session.chems.push(s.item);
            break;
          case SampleType.ISOTOPE:
            this.session.isotopes.push(s.item);
            break;
        }
        console.log(s);

      }
      console.log(this.session);
      let s = this.datasetService.pushCache(cache).subscribe(
        () => s.unsubscribe()
      );
    }
  }

  private buildPayload(): void {
    console.log(this.sampleDef);
    if (!!this.session.header && !!this.session.content) {
      let headerCols = new Array<Col>();
      for (let i = 0; i < this.session.header.length; i++) {
        for (let sd of this.sampleDef) {
          if (sd.item === this.session.header[i]) {
            headerCols.push({ name: sd.item, col: i, type: sd.type, um: sd.um, error: sd.error, utype: sd.utype });
            break;
          }
        }
      }

      let previousHc = headerCols[0];
      for (let i = this.session.headerPosition + 1; i <= this.session.endTable; i++) {
        let row = this.session.content[i];
        let sample: Sample = { fields: new Array<SampleElement>(), components: new Array<ChemComponent>() };
        for (let j = 0; j < row.length; j++) {
          let element = row[j];
          for (let k = 0; k < headerCols.length; k++) {
            let hc = headerCols[k];
            if (j === hc.col) {
              switch (hc.type) {
                case SampleType.FIELD:
                  if (!this.checkItinerisReserved(hc.name)) {
                    sample.fields.push({ field: hc.name, value: element });
                    previousHc = hc;
                  } else {
                    let key = hc.name.toLowerCase().trim();
                    key = key.replace(/ /g, '');
                    // let previousHc = headerCols[k - 1];
                    switch (key) {
                      case 'unit':
                        if (previousHc.type === SampleType.CHEM) {
                          sample.components[sample.components.length - 1].um = element;
                        }
                        break;
                      case 'technique':
                        if (previousHc.type === SampleType.ISOTOPE || previousHc.type === SampleType.CHEM) {
                          sample.components[sample.components.length - 1].technique = element;
                        }
                        break;
                      case 'uncertainty':
                        if (previousHc.type === SampleType.ISOTOPE || previousHc.type === SampleType.CHEM) {
                          sample.components[sample.components.length - 1].uncertainty = parseFloat(element);
                        }
                        break;
                      case 'typeofuncertainty':
                        if (previousHc.type === SampleType.ISOTOPE || previousHc.type === SampleType.CHEM) {
                          sample.components[sample.components.length - 1].uncertaintyType = element;
                        }
                        break;
                      case 'ref.std.':
                      case 'ref.std':
                      case 'refstd':
                      case 'refstd.':
                        if (previousHc.type === SampleType.ISOTOPE || previousHc.type === SampleType.CHEM) {
                          sample.components[sample.components.length - 1].refstd = element;
                        }
                        break;
                    }
                  }
                  break;
                case SampleType.CHEM:
                  sample.components.push({ component: hc.name, value: element, isIsotope: false, um: hc.um });
                  previousHc = hc;
                  break;
                case SampleType.ISOTOPE:
                  previousHc = hc;
                  sample.components.push({ component: hc.name, value: element, isIsotope: true, uncertainty: hc.error, uncertaintyType: hc.utype });
                  break;
              }
              break;
            }
          }
        }
        this.session.samples.push(sample);
      }

      this.storeService.push({ key: DATA_GATHERING, data: this.session });
      console.log(this.session);
    }
  }

  private checkItinerisReserved(key: string): boolean {
    let k = key.toLowerCase().trim();
    k = k.replace(/ /g, '');
    for (let r of ITINERIS_RESERVED) {
      if (k === r)
        return true;
    }
    return false;
  }

  private cleanRow(session: DataGatheringSession): Array<string> {
    let r = new Array<string>();
    if (!!session.header)
      for (let s of session.header) {
        if (!!s && s.length > 0) {
          r.push(s);
        }
      }
    return r;
  }

  private initStyles(): void {
    for (let s of this.sampleDef) {
      this.setStyle(s, s.type);
    }
  }

}

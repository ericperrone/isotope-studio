import { Component, OnInit, OnDestroy, Input, ViewChildren, HostListener } from '@angular/core';
import { EndMemberItem, GeoModel } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION, END_MEMBER, MULTIPLE_SELECTION_MODE, RESET_SELECTION_OUT, END_MEMBER_SET } from '../end-member/end-member.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModelsService, MixingModelPayload } from 'src/app/services/rest/geo-models.service';
import { saveCsvFile } from 'src/app/shared/tools';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/common/store.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotComponent, PLOT } from 'src/app/shared/modals/plot/plot.component';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';
import { ConversionDialogComponent, ConversionType } from 'src/app/shared/components/conversion-dialog/conversion-dialog.component';
import { AlertServiceService } from 'src/app/services/common/alert-service.service';

export const MIXING_CACHE = '_MIXING_CACHE_';
export const COMPUTABLES = '_COMPUTABLES_';

export interface MixingData {
  geoData?: any;
  outResult?: any;
}

interface MemberItem {
  endMemberName: string;
  value: string;
}

interface MixComputable {
  type: ConversionType;
  computables: Array<Computable>;
}

export interface Computable {
  endMemberName: string;
  elementName: string;
  elementNameCopy?: string;
  elementValue: string;
  elementUm?: string;
  selected?: boolean;
  elementValueCopy?: string;
  row: number;
  active: boolean;
  concentration: string;
  concentrationValue: string;
  concentrationUm?: string;
  isIsotope?: boolean;
}

export interface MixingResult {
  mix: number;
  samples: Array<{ member: string; element: string; f: number }>;
}

interface chartData {
  title: string;
  points: Array<number>;
}

interface ShowedRow {
  row: Array<string>;
}

interface DP {
  x: number;
  y: number;
}

interface ScaleAxis {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

@Component({
  selector: 'app-mixing',
  templateUrl: './mixing.component.html',
  styleUrls: ['./mixing.component.scss']
})
export class MixingComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    // console.log(event);
    if (!this.chartView)
      return;
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    this.chartSizeChange();
  }
  @Input('params') params: GeoModel | undefined;
  @ViewChildren('ratio') ratios: any;
  @ViewChildren('inverse') inverses: any;
  public members = new Array<MemberItem>();
  public endMembers: Array<EndMember> | undefined;
  public computables: Array<Computable> | undefined;
  public chartView = false;
  public submitOn = false;
  public ratio = new Array<boolean>();
  public inverse = new Array<boolean>();
  public isCollapsed = true;
  public result: Array<MixingResult> | undefined;
  public currentSelectionItem: any;
  public step: number = 0.05;
  public outResult = new Array<ShowedRow>();
  private tempResult = new Array<ShowedRow>();
  public resultReady = false;
  public addReady = false;
  public chartOptions: any;
  private subReset: Subscription | undefined;
  private subEndMemberSet: Subscription | undefined;
  public geoData = new Array<any>();
  private ref: any;
  public xPoint = 0;
  public yPoint = 0;
  public charts: any;
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);
  public fontSize = 16;
  public legendFontSize = 20;
  public changeSize = false;
  public fixedRatio = false;
  public selectOptions = new Array<EndMemberItem>();

  constructor(private eventGeneratorService: EventGeneratorService,
    private alertService: AlertServiceService,
    private modalService: NgbModal,
    private storeService: StoreService,
    public geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    this.storeService.clean(COMPUTABLES);
    console.log(' --- RESET ---');
    this.buildSelect();
    // console.log(this.params);
    let stored: MixingData = this.getCachedData();
    // console.log(this.params);
    // console.log(stored);

    // this.outResult = this.storeService.get(OUT_RESULT);
    this.outResult = stored.outResult;
    if (!this.outResult) {
      this.outResult = new Array<ShowedRow>();
    }
    // this.geoData = this.storeService.get(GEO_DATA);
    this.geoData = stored.geoData;
    if (!this.geoData) {
      this.geoData = new Array<any>();
    }

    this.subReset = this.eventGeneratorService.on(RESET_SELECTION_OUT).subscribe(
      event => {
        if (!!this.computables) {
          for (let i = 0; i < this.computables.length; i++) {
            if (this.computables[i].endMemberName === event.content) {
              this.computables[i].elementName = '';
              this.computables[i].elementValue = '';
              this.computables[i].isIsotope = false;
              this.ratio[i] = false;
              break;
            }
          }
        }
      }
    );

    this.subEndMemberSet = this.eventGeneratorService.on(END_MEMBER_SET).subscribe(
      event => {
        if (!!this.computables) {
          let c = this.getComputableByMemberName(event.content);
          if (!!c)
            this.selectMember(c);
          // console.log(c);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.subReset) {
      this.subReset.unsubscribe();
    }

    if (!!this.subEndMemberSet) {
      this.subEndMemberSet.unsubscribe();
    }
  }

  private buildSelect(): void {
    this.selectOptions.length = 0;
    if (!!this.params && !!this.params.endMembers) {
      for (let i = 0; i < this.params.endMembers.length; i++) {
        for (let j = 0; j < this.params.endMembers[i].length; j++) {
          if ('C' === this.params.endMembers[i][j].type) {
            this.selectOptions.push(this.params.endMembers[i][j]);
          }
        }
      }
    }
  }

  private getCachedData(): MixingData {
    let mixingData: MixingData = {};
    let stored = this.storeService.get(MIXING_CACHE);
    if (!!stored && !!stored.geoData) {
      mixingData.geoData = stored.geoData;
    }
    if (!!stored && !!stored.outResult) {
      mixingData.outResult = stored.outResult;
    }
    return mixingData;
  }

  private saveCachedData() {
    let mixingData: MixingData = {};
    let stored = this.storeService.get(MIXING_CACHE);
    if (!!stored) {
      mixingData = stored;
    }
    mixingData.geoData = this.geoData;
    mixingData.outResult = this.outResult;
    this.storeService.push({ key: MIXING_CACHE, data: mixingData }, this.eventGeneratorService);
  }

  public chartSizeChange() {
    this.changeSize = false;
    setTimeout(() => {
      if (this.fixedRatio) {
        this.chartWidth = 4 * this.chartHeight / 3;
      }
      this.chart();
    }, 50);
  }

  public close(): void {
    if (this.params?.modalRef) {
      this.params.modalRef.close();
    }
  }

  public reset(): void {
    this.eventGeneratorService.emit({ key: RESET_SELECTION });
    this.resetComputables();
    for (let a of this.ratios._results) {
      a.nativeElement.checked = false;
    }
    for (let a of this.inverses._results) {
      a.nativeElement.checked = false;
    }
    for (let i = 0; i < this.ratio.length; i++) {
      this.ratio[i] = false;
    }
    this.result = undefined;
    this.addReady = false;
    this.outResult = new Array<ShowedRow>();
    this.tempResult = new Array<ShowedRow>();
    this.resultReady = false;
    if (this.computables) {
      this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[0].endMemberName });
      this.onMemberSelection(this.computables[0]);
    }
  }

  public clean(): void {
    // this.storeService.clean(OUT_RESULT);
    // this.storeService.clean(GEO_DATA);
    this.storeService.clean(MIXING_CACHE, this.eventGeneratorService);
    this.outResult = new Array<ShowedRow>();
    this.geoData = new Array<any>();
  }

  public add(): void {
    if (!!this.computables) {
      this.resetComputables();
      for (let a of this.ratios._results) {
        a.nativeElement.checked = false;
      }
      for (let a of this.inverses._results) {
        a.nativeElement.checked = false;
      }
      for (let i = 0; i < this.ratio.length; i++) {
        this.ratio[i] = false;
      }
      for (let i = 0; i < this.ratio.length; i++) {
        this.ratio[i] = false;
        this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: false, active: this.computables[i].endMemberName, maxSelectable: 1 } });
      }
      if (this.computables) {
        this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[0].endMemberName });
        this.onMemberSelection(this.computables[0]);
      }
    }
  }

  private setIsIsotope(c: Computable): void {
    if (!!this.params && !!this.params.endMembers) {
      for (let i = 0; i < this.params.endMembers.length; i++) {
        for (let j = 0; j < this.params.endMembers[i].length; j++) {
          if (this.params.endMembers[i][j].name === c.elementName) {
            console.log(this.params.endMembers[i][j]);
            if ('I' === this.params.endMembers[i][j].type) {
              c.isIsotope = true;
            } else {
              c.isIsotope = false;
            }
            console.log(c);
            return;
          }
        }
      }
    }
  }

  private getComputableByMemberName(name: string): Computable | undefined {
    if (!!this.computables) {
      for (let c of this.computables) {
        if (c.endMemberName === name) {
          // this.setIsIsotope(c);
          // console.log(this.computables);
          return c;
        }
      }
    }
    return undefined;
  }

  // private getComputableByRow(row: number): Computable | undefined {
  //   if (!!this.computables) {
  //     for (let c of this.computables) {
  //       if (c.row === row)
  //         return c;
  //     }
  //   }
  //   return undefined;
  // }

  public getSelected(event: any): void {
    console.log(event);
    if (!!this.computables && !!this.endMembers) {
      let currentComputable = this.getComputableByMemberName(event.memberName);
      if (!!currentComputable) {
        if (!event.item.selected) {
          this.resetComputable(currentComputable);
        } else {
          if (!event.item.value || event.item.value.length === 0) {
            return;
          }
          if (!this.ratio[currentComputable.row]) {
            currentComputable.elementName = event.item.name;
            currentComputable.elementValue = event.item.value;
            currentComputable.elementUm = event.item.um;
            currentComputable.concentration = '';
            currentComputable.concentrationValue = '';

            if (event.item.type === 'I') { }
            // let element = this.getChemFromIsotope(event.item.name);
            // element = element.toLowerCase()
            // for (let em of this.endMembers) {
            //   if (em.name === event.memberName) {
            //     for (let m of em.member) {
            //       currentComputable.concentration = '';
            //       currentComputable.concentrationValue = '';
            //       if (m.name.toLowerCase().match(element) && m.name !== currentComputable.elementName && (!!m.value && m.value.length > 0)) {
            //         currentComputable.concentration = m.name;
            //         currentComputable.concentrationValue = m.value;
            //         break;
            //       }
            //     }
            //   }
            // }

            // } else {
            //   currentComputable.elementUm = event.item.um;
            //   currentComputable.concentration = '';
            //   currentComputable.concentrationValue = '';
            // }
          } else {
            currentComputable.elementName = currentComputable.elementName + ' / ' + event.item.name;
            currentComputable.elementValue = '' + (parseFloat(currentComputable.elementValue) / parseFloat(event.item.value));
          }
        }
      }
      for (let i = 0; i < this.computables.length; i++) {
        if (this.computables[i].elementName.length === 0 && this.computables[i].elementValue.length === 0) {
          this.ratio[i] = false;
          this.ratios._results[i].nativeElement.checked = false;
          this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: false, active: this.computables[i].endMemberName, maxSelectable: 1 } });
        }
      }
    }
    this.submitOn = this.checkComputables();
  }

  private checkComputables(): boolean {
    if (!!this.computables) {
      for (let c of this.computables) {
        if (!c.elementValue || c.elementValue.length === 0)
          return false;
      }
      return true;
    }
    return false;
  }

  public getAnalyzedMembers(event: any) {
    this.endMembers = event;
    this.computables = new Array<Computable>();
    this.ratio = new Array<boolean>();
    let n = 0;
    for (let em of event) {
      this.ratio.push(false);
      this.computables.push({ endMemberName: em.name, elementName: '', elementValue: '', concentration: '', concentrationValue: '', row: n, active: false });
      n++;
    }
    this.computables[0].active = true;
    this.eventGeneratorService.emit({ key: END_MEMBER, content: event[0].name })
  }

  public onMemberSelection(c: Computable) {
    if (!!this.computables) {
      for (let cc of this.computables) {
        cc.active = false;
      }
      c.active = true;
      this.eventGeneratorService.emit({ key: END_MEMBER, content: c.endMemberName });
    }
  }

  public selectMember(c: Computable) {
    if (!!this.computables) {
      for (let cc of this.computables) {
        cc.active = false;
      }
      c.active = true;
    }
  }

  // private getChemFromIsotope(isotope: string): string {
  //   let chem = '';
  //   chem = getElementByisotope(isotope);
  //   return chem;
  // }

  private resetComputables(): void {
    this.submitOn = false;
    if (!!this.computables) {
      for (let em of this.computables) {
        em.elementName = '';
        em.elementValue = '';
        !!em.concentrationValue ? em.concentrationValue = '' : '';
        !!em.concentration ? em.concentration = '' : '';
      }
    }
  }

  private resetComputable(c: Computable) {
    c.elementName = '';
    c.elementValue = '';
    !!c.concentrationValue ? c.concentrationValue = '' : '';
    !!c.concentration ? c.concentration = '' : '';
  }

  public onRatio(event: any, c: Computable) {
    if (!!this.computables) {
      this.ratio[c.row] = event.target.checked;
      if (!!event.target.checked) {
        this.inverses._results[c.row].nativeElement.checked = false;
        if (c.elementName.startsWith('1 /')) c.elementName = '' + c.elementNameCopy;
      }
      this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: event.target.checked, active: c.endMemberName, maxSelectable: event.target.checked ? 2 : 1 } });
    }
  }

  public onInverse(event: any, c: Computable) {
    if (!!this.computables) {
      this.inverse[c.row] = event.target.checked;
      if (!!event.target.checked) {
        c.elementNameCopy = '' + c.elementName;
        if (!c.elementName.startsWith(' 1 /')) c.elementName = '1 / ' + c.elementName;
        c.elementValueCopy = '' + c.elementValue;
        let v = parseFloat(c.elementValue);
        v = 1 / v;
        c.elementValue = '' + v;
        this.ratios._results[c.row].nativeElement.checked = false;
      } else {
        c.elementName = '' + c.elementNameCopy;
        c.elementValue = '' + c.elementValueCopy;
      }
    }
  }

  private finalChecks(): void {
    if (!!this.checkConcentration()) {
      this.checkComputablesUm();
    }
  }

  public setConcentrationValue(c: Computable, index: number): void {
    if (this.params && this.params.endMembers)
      for (let e of this.params?.endMembers[index]) {
        if (e.name === c.concentration) {
          let value = e.value.split(' [');
          let um = value[1] ? value[1].substring(0, value[1].indexOf(']')) : undefined;
          c.concentrationValue = value[0];
          c.concentrationUm = um;
          console.log(c);
          return;
        }
      }
  }

  private checkConcentration(): boolean {
    if (!!this.computables && this.computables.length > 0) {
      for (let c of this.computables) {
        this.setIsIsotope(c);
        if (c.isIsotope && !c.concentration) {
          console.log(c);
          this.alertService.alert('Warning', 'Found isotope ratio. Please select related element concentration');
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private checkSelectedComputables(): ConversionType {
    if (!!this.computables && this.computables.length > 0) {
      // i dati devono essere omogenei
      let um = new Array<string>();
      let umc = new Array<string>();

      // raccoglie le unita' di misura degli elementi scelti e delle
      // eventuali concentrazioni (se isotopi)
      for (let c of this.computables) {
        if (!!c.elementUm && c.elementValue.length > 0)
          um.push(c.elementUm);
        if (!!c.concentrationUm && c.concentrationValue.length > 0) {
          umc.push(c.concentrationUm);
        }
      }

      // uno dei due array non deve contenere elementi
      // altrimenti la scelta e' sbagliata
      if (um.length > 0 && umc.length > 0) {
        return ConversionType.ERROR;
      }

      let selected = um.length > 0 ? um : umc;
      let ret = um.length > 0 ? ConversionType.CHEM_ONLY : ConversionType.ISOTOPE_ONLY;

      let s0 = selected[0];
      for (let s of selected) {
        // se le unità di misura non sono omogenee e' richiesta una conversione
        if (s0.toLowerCase() !== s.toLowerCase())
          return ret;
      }
    }
    return ConversionType.NONE;
  }

  private checkComputablesUm(): void {
    if (!!this.computables && this.computables.length > 0) {
      console.log(this.computables);
      let conversionType = this.checkSelectedComputables();
      if (conversionType === ConversionType.ERROR) {
        let r = this.modalService.open(AlertComponent, { centered: true, backdrop: 'static' });
        r.componentInstance.params = { headerText: 'Error', bodyText: 'Not homogeneous elements. Please, correct your choice.' };
        let s = r.componentInstance.emitter.subscribe((result: any) => {
          console.log(result);
          r.close();
          s.unsubscribe();
        });
        return;
      }
      let oldComputables: MixComputable | undefined = this.storeService.get(COMPUTABLES);
      if (!!oldComputables) {
        // verificare con i precedenti risultati
      }

      if (conversionType !== ConversionType.NONE) {
        let r = this.modalService.open(ConversionDialogComponent, { centered: true, backdrop: 'static' });
        r.componentInstance.params = { 'computables': this.computables, 'type': conversionType };
        let s = r.componentInstance.emitter.subscribe((result: any) => {
          console.log(result);
          r.close();
          s.unsubscribe();
          this.computeMixing();
        })
      } else {
        this.computeMixing();
      }
    }
  }

  private computeMixing(): void {
    if (!!this.computables) {

      const payload = this.computables;
      let s = this.geoModelsService.mixingModel(payload, this.step).subscribe(
        (res: any) => {
          this.tempResult = new Array<ShowedRow>();
          this.result = res.results;
          this.geoData = [...this.geoData, ...res.geoData];
          // this.storeService.push({ key: GEO_DATA, data: this.geoData });

          if (!!this.result) {
            let nRow = this.result[0].samples.length;
            for (let n = 0; n < nRow; n++) {
              let r = new Array<string>();
              r.push(this.result[0].samples[n].member + ": " + this.result[0].samples[n].element);
              this.tempResult.push({ row: r });
            }
            let r = new Array<string>();
            r.push('MIX');
            this.tempResult.push({ row: r });

            for (let r of this.result) {
              for (let n = 0; n < nRow; n++) {
                this.tempResult[n].row.push('' + r.samples[n].f);
              }
              this.tempResult[this.tempResult.length - 1].row.push('' + r.mix);
            }
          }
          this.outResult = [...this.outResult, ...this.tempResult];
          // this.storeService.push({ key: OUT_RESULT, data: this.outResult });
          this.saveCachedData();
          this.resultReady = true;
          s.unsubscribe();
          this.addReady = true;
          this.add();
          // if (this.computables)
          //   this.computables.length = 0;
        }
      )
    }
  }

  public submit() {
    this.finalChecks();
    /****
    if (!!this.computables) {
      const payload = this.computables;
      let s = this.geoModelsService.mixingModel(payload, this.step).subscribe(
        (res: any) => {
          this.tempResult = new Array<ShowedRow>();
          this.result = res.results;
          this.geoData = [...this.geoData, ...res.geoData];
          // this.storeService.push({ key: GEO_DATA, data: this.geoData });

          if (!!this.result) {
            let nRow = this.result[0].samples.length;
            for (let n = 0; n < nRow; n++) {
              let r = new Array<string>();
              r.push(this.result[0].samples[n].member + ": " + this.result[0].samples[n].element);
              this.tempResult.push({ row: r });
            }
            let r = new Array<string>();
            r.push('MIX');
            this.tempResult.push({ row: r });

            for (let r of this.result) {
              for (let n = 0; n < nRow; n++) {
                this.tempResult[n].row.push('' + r.samples[n].f);
              }
              this.tempResult[this.tempResult.length - 1].row.push('' + r.mix);
            }
          }
          this.outResult = [...this.outResult, ...this.tempResult];
          // this.storeService.push({ key: OUT_RESULT, data: this.outResult });
          this.saveCachedData();
          this.resultReady = true;
          s.unsubscribe();
          this.addReady = true;
          this.add();
        }
      )
    } */
  }

  public export() {
    let out = '';
    if (!this.outResult || this.outResult.length === 0) {
      return;
    }

    let max = this.getMaxLength();

    for (let i = 0; i < max; i++) {
      for (let j = 0; j < this.outResult.length; j++) {
        out += (!!this.outResult[j].row[i] ? this.outResult[j].row[i] : '') + ';';
      }
      out += '\n';
      out = out.replace(/\./g, ',');
    }
    saveCsvFile(out);
  }

  private getCardinality(data: any): number {
    for (let i = 0; i < data.length; i++) {
      if (data[i].row[0] === 'MIX')
        return i;
    }
    return 0;
  }

  private compute(n: number): number {
    if (n === 1) {
      return 0;
    }
    return n - 1 + this.compute(n - 1);
  }

  private checkIsotopes(data: any): boolean {
    if (!!data) {
      for (let d of data) {
        for (let m of d.members) {
          if (!!m.concentration2 && 0 !== m.concentration2)
            return true;
        }
      }
    }
    return false;
  }

  private getBorder3(data: any): any {
    let dataPoint1 = new Array<any>();
    let dataPoint2 = new Array<any>();
    let dataPoint3 = new Array<any>();

    for (let i = 1; i < data[0].row.length; i++) {
      if (parseFloat(data[0].row[i]) === 0) {
        dataPoint1.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
      if (parseFloat(data[1].row[i]) === 0) {
        dataPoint2.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
      if (parseFloat(data[2].row[i]) === 0) {
        dataPoint3.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
    }
    dataPoint1 = dataPoint1.sort((a, b) => { return a.x - b.x });
    dataPoint2 = dataPoint2.sort((a, b) => { return a.x - b.x });
    dataPoint3 = dataPoint3.sort((a, b) => { return a.x - b.x });

    return { dp1: dataPoint1, dp2: dataPoint2, dp3: dataPoint3 };
  }

  private getScaleXY(dp: Array<DP>, epsilonX: number, epsilonY: number): ScaleAxis {
    let scale = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
    let dx = dp.sort((a, b) => { return (b.x - a.x) });
    console.log(dx);
    scale.xMin = dx[0].x - epsilonX;
    scale.xMax = dx[dx.length - 1].x + epsilonX;
    let dy = dp.sort((a, b) => { return (b.y - a.y) });
    console.log(dy);
    scale.yMin = dy[0].y - epsilonY;
    scale.yMax = dy[dy.length - 1].y + epsilonY;
    return scale;
  }

  public chart(): void {
    this.chartView = true;

    let stored = this.getCachedData();
    let data = stored.outResult;
    let geoData = stored.geoData;
    // console.log(geoData);

    let xText = geoData[0].members[0].element;
    let yText = geoData[1].members[0].element;

    let cardinality = this.getCardinality(data);
    if (cardinality !== 2 && cardinality !== 3)
      return;

    if (data.length > 0) {
      let chartsData = this.getChartsData(data);
      if (chartsData.length < 2) {
        this.chartView = false;
        return;
      }

      let charts = new Array();

      for (let i = 0; i < chartsData.length; i += 2) {
        if (i + 1 < chartsData.length) {
          let dp = new Array<any>();
          for (let k = 0; k < chartsData[i].points.length; k++) {
            dp.push({ x: chartsData[i].points[k], y: chartsData[i + 1].points[k] });
          }
          charts.push({
            type: cardinality === 3 ? 'scatter' : 'line',
            showInLegend: false,
            dataPoints: dp
          });
        }
      }


      let dpem = new Array<any>();

      if (cardinality === 3) {
        if (!this.checkIsotopes(geoData)) {
          for (let i = 0; i < geoData.length - 1; i++) {
            for (let j = 0; j < geoData[i].members.length; j++) {
              dpem.push({ x: geoData[i].members[j].concentration, y: geoData[i + 1].members[j].concentration });
            }
          }

          for (let j = 0; j < geoData[0].members.length; j++) {
            dpem.push({ x: geoData[0].members[j].concentration, y: geoData[geoData.length - 1].members[j].concentration });
          }

          charts.push({
            type: 'line',
            // lineColor: 'blue',
            // markerColor: 'blue',
            dataPoints: dpem
          });
        } else {
          let additional = this.getBorder3(data);
          charts.push({
            type: 'line',
            markerColor: 'blue',
            lineColor: 'blue',
            dataPoints: additional.dp1
          });
          charts.push({
            type: 'line',
            markerColor: 'blue',
            lineColor: 'blue',
            dataPoints: additional.dp2
          });
          charts.push({
            type: 'line',
            markerColor: 'blue',
            lineColor: 'blue',
            dataPoints: additional.dp3
          });
        }
      }

      let scale = this.getScaleXY(charts[0].dataPoints, 0.5, 0.5);
      console.log(scale);

      this.chartOptions = {
        animationEnabled: true,
        theme: "light2",
        exportEnabled: true,
        zoomEnabled: true,
        width: this.chartWidth,
        height: this.chartHeight,
        axisX: {
          title: '' + xText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize,
          // minimum: scale.xMax,
          // maximum: scale.xMin
        },
        axisY: {
          title: '' + yText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize,
          // minimum: scale.yMax,
          // maximum: scale.yMin
        },
        toolTip: {
          shared: true
        },
        legend: {
          cursor: "pointer",
          itemclick: function (e: any) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
              e.dataSeries.visible = false;
            } else {
              e.dataSeries.visible = true;
            }
            e.chart.render();
          }
        },
        data: charts
      }
    }
    console.log(this.chartOptions);
  }

  private getChartsData(data: any): Array<chartData> {
    let charts = new Array<chartData>();
    let title = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].row[0] === 'MIX') {
        let points = new Array();
        for (let j = 1; j < data[i].row.length; j++) {
          points.push(parseFloat(data[i].row[j]));
        }
        charts.push({
          title: title,
          points: points
        });
        title = '';
      } else
        title += data[i].row[0] + '; '
    }
    return charts;
  }

  private getMaxLength(): number {
    let max = this.outResult[0].row.length;
    for (let i = 1; i < this.outResult.length; i++) {
      if (max < this.outResult[i].row.length) {
        max = this.outResult[i].row.length;
      }
    }
    return max;
  }

  getChartInstance(chart: object) {
    this.charts = chart;
  }

  public plot(geoData: any, geoModelsService: GeoModelsService) {
    let that = this;
    this.ref = this.modalService.open(PlotComponent, { centered: true, backdrop: 'static' });
    this.ref.componentInstance.emitter.subscribe((result: any) => {
      if (result.cmd === PLOT) {
        this.xPoint = result.xPoint;
        this.yPoint = result.yPoint;
        if (!!this.chartOptions && !!this.chartOptions.data) {
          let data = [...this.chartOptions.data];
          let userData = undefined;
          for (let d of data) {
            if (!!d.name && d.name === 'User plotted point')
              userData = d;
          }
          if (!userData) {
            data.push({
              type: 'scatter',
              name: 'User plotted point',
              showInLegend: true,
              markerType: 'square',
              color: 'red',
              click: function (e: any) {
                console.log(e.dataPoint);
                let xs = new Array<MixingModelPayload>();
                let ys = new Array<MixingModelPayload>();

                xs = [...geoData[0].members];
                ys = [...geoData[1].members];

                let payload = {
                  xPoint: e.dataPoint.x,
                  yPoint: e.dataPoint.y,
                  xs: xs,
                  ys: ys
                };

                console.log(payload);

                let s = geoModelsService.mixingPlot(payload).subscribe(
                  (res: any) => {
                    console.log(res);
                    let ref = that.modalService.open(AlertComponent, { centered: true });
                    if (typeof (res) === 'string' && res.startsWith('Error')) {
                      let params: ModalParams = {
                        headerText: 'Info',
                        bodyText: 'The selected point cannot be produced by a mixing of the related endmembers.'
                      };
                      ref.componentInstance.params = params;
                    } else {
                      let list = [];
                      for (let i = 0; i < res.weights.length; i++) {
                        list.push({ key: res.geoData.xs[i].member, value: res.weights[i] })
                      }
                      let params: ModalParams = {
                        headerText: 'Info',
                        bodyText: 'The selected point can be produced by a mixing of the related endmembers.',
                        list: list
                      };
                      ref.componentInstance.params = params;
                    }
                    ref.componentInstance.emitter.subscribe(() => ref.close());
                    s.unsubscribe();
                  }
                );
              },
              dataPoints: [{ x: this.xPoint, y: this.yPoint }]
            });
          } else {
            userData.dataPoints.push({ x: this.xPoint, y: this.yPoint });
          }

          this.chartOptions.data.length = 0;
          this.charts.render();
          this.chartOptions.data = data;
          this.charts.render();
        }
      }
      this.ref.close();
    });
  }
}


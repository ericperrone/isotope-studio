import { Component, Input, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { ConversionTable } from 'src/app/models/conversion';
import { SpiderData, SpiderDiagram, SpiderSeries } from 'src/app/models/series';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { StoreService } from 'src/app/services/common/store.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { SPIDER_NORM, SpiderNormResult, SpiderNormalizationComponent } from 'src/app/shared/modals/spider-normalization/spider-normalization.component';
import { getElementName, locateByValue, saveCsvFile, toPPM } from 'src/app/shared/tools';

export const REE = ['La', 'Ce', 'Pr', 'Nd', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Yb', 'Lu'];

export interface SpiderNorm {
  method: string;
  keys: Array<string>;
  norm: any;
  order?: Array<string>;
}

@Component({
  selector: 'app-spider',
  templateUrl: './spider.component.html',
  styleUrls: ['./spider.component.scss']
})
export class SpiderComponent implements OnInit, OnDestroy {
  private sub: any;
  public onlyREE = false;
  public showChart = false;
  public norms: Array<SpiderNorm> = new Array<SpiderNorm>();
  public charts: any;
  public chartOptions: any;
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);;
  public fontSize = 16;
  public legendFontSize = 20;
  public changeSize = false;
  public ref: any;
  public selectedMethod = '';
  public theNorm: any;
  public spiderDiagram: SpiderDiagram = {
    width: this.chartWidth,
    height: this.chartHeight,
    series: new Array<SpiderSeries>()
  }
  public conversionTable = new Array<ConversionTable>();
  public fixedRatio = false;
  @Input('params') params: GeoModel | undefined;
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    console.log(event);
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    this.chartSizeChange();
  }

  constructor(private modalService: NgbModal, private geoModelsService: GeoModelsService,
    private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService) { }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.sub = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => {
        console.log(this.ref);
        if (this.ref) {
          this.ref.close();
        }
      }
    );

    this.loadConversionTable();
    this.checkAndConvert();

    console.log(this.params);

    if (this.params?.modalRef) {
      this.ref = this.params.modalRef;
    }

    let store = this.storeService.get(SPIDER_NORM);
    if (!store) {
      store = new Array<any>();
    }

    let s = this.geoModelsService.getNorms().subscribe(
      (res: any) => {
        for (let r of res) {
          let sn: SpiderNorm = { method: r.method, keys: [], norm: {} };
          let obj = JSON.parse(r.norm);
          let keys = Object.keys(obj);
          sn.keys = keys;
          if (!!r.ord) {
            sn.order = JSON.parse(r.ord);
          }
          for (let k of keys) {
            Object.defineProperty(sn.norm, k, { value: parseFloat(obj[k]) });
          }

          let found = false;
          for (let item of store) {
            if (sn.method === item.method) {
              found = true;
              break;
            }
          }
          if (!found)
            store.push(sn);
        }

        // let store = this.storeService.get(SPIDER_NORM);
        if (!!store) {
          for (let s of store)
            this.norms.push(s);
        }

        if (this.norms.length > 0)
          this.selectedMethod = this.norms[0].method;

        this.storeService.push({ key: SPIDER_NORM, data: store });
        s.unsubscribe();

        this.chartSizeChange();
        // console.log(this.norms);
      }
    );
  }

  private checkAndConvert(): void {
    if (!!this.params && !!this.params.endMembers)
      for (let em of this.params?.endMembers) {
        for (let item of em)
          if ('C' === item.type && item.value.indexOf(' [') > 0) {
            item.value = item.value.trim();
            let value = item.value.substring(0, item.value.indexOf(' ['));
            let um = item.value.substring(item.value.indexOf('[') + 1, item.value.indexOf(']'));
            item.value = this.convert(value, um);
            item.um = 'ppm';
          }
      }
  }

  private convert(value: string, um: string): string {
    let newValue = value;
    um = um.trim().toLowerCase();
    if ('ppm' !== um) {
      for (let ct of this.conversionTable) {
        if (ct.um.toLowerCase() === um) {
          let n = parseFloat(value) * ct.toPPM;
          newValue = '' + n;
          break;
        }
      }
    }
    return newValue;
  }

  private loadConversionTable(): void {
    let s = this.geoModelsService.getConversionTable().subscribe(
      (res: any) => {
        this.conversionTable = res;
        s.unsubscribe();
      }
    );
  }

  public handleREE(): void {
    this.chartSizeChange();
  }

  private setNorm(): void {
    console.log('setNorm() ' + this.selectedMethod);
    if (this.norms.length < 1)
      return;
    for (let n of this.norms) {
      if (n.method === this.selectedMethod) {
        this.theNorm = { ...n };
        // console.log(this.theNorm);
        return;
      }
    }
  }

  public getChartInstance(chart: object) {
    this.charts = chart;
  }

  public addNorm(): void {
    let refer = this.modalService.open(SpiderNormalizationComponent, { centered: true, backdrop: false, size: 'lg' });
    refer.componentInstance.params = this.selectedMethod;
    refer.componentInstance.emitter.subscribe((result: SpiderNormResult) => {
      console.log(result);
      if (result.status === CONFIRM && !!result.norm) {
        let found = false;
        for (let i = 0; i < this.norms.length; i++) {
          if (this.norms[i].method === result.norm.method) {
            this.norms[i] = result.norm;
            found = true;
            break;
          }
        }
        if (!found)
          this.norms.push(result.norm)
        this.saveInSession(result.norm);
        this.selectedMethod = result.norm.method;
        console.log('addNorm() ' + this.selectedMethod);
      }
      refer.close();
      this.chartSizeChange();

    });
  }

  private saveInSession(norm: any): void {
    let store = this.storeService.get(SPIDER_NORM);
    if (!store) {
      store = new Array<any>();
      this.storeService.push({ key: SPIDER_NORM, data: store });
    }

    for (let i = 0; i < store.length; i++) {
      if (norm.method === store[i].method) {
        store[i] = norm;
        return;
      }
    }
    store.push(norm);
  }

  public setSeries(): void {
    this.setNorm();
    if (!!this.params && !!this.params.endMembers && !!this.theNorm) {
      console.log(this.theNorm);
      this.spiderDiagram.series.length = 0;
      for (let em of this.params?.endMembers) {
        let ss: SpiderSeries = { sample: '', data: new Array<SpiderData>() };
        for (let item of em) {
          if (item.name.toLowerCase().indexOf('sample') >= 0) {
            ss.sample = item.value;
            continue;
          }
          if (item.type === 'C' || item.type === 'I') {
            // console.log(item);
            let name = getElementName(item.name);
            if (!!this.theNorm && !!this.theNorm.norm[name]) {
              if (item.value.length > 0) {
                if (!!this.onlyREE) {
                  if (locateByValue(REE, name) > -1) {
                    ss.data.push({ label: name, y: toPPM(item) / this.theNorm.norm[name] });
                  }
                } else {
                  ss.data.push({ label: name, y: toPPM(item) / this.theNorm.norm[name] });
                }
              } else {
                if (!!this.onlyREE) {
                  if (locateByValue(REE, name) > -1) {
                    ss.data.push({ label: name });
                  }
                } else {
                  ss.data.push({ label: name });
                }
              }
            }
          }
        }
        ss.data = ss.data.sort((a: SpiderData, b: SpiderData) => {
          let order = this.theNorm.order;
          if (!!order) {
            let posA = locateByValue(order, a.label);
            let posB = locateByValue(order, b.label);
            return posA - posB;
          }
          return 0
        });
        this.spiderDiagram.series.push(ss);
      }
    }
  }

  public chartSizeChange() {
    console.log('chartSizeChange() ' + this.selectedMethod)
    this.showChart = false;
    setTimeout(() => {
      if (this.fixedRatio) {
        this.chartWidth = 4 * this.chartHeight / 3;
      } else {
        this.chartWidth = Math.floor(window.innerWidth * 0.99);
        this.chartHeight = Math.floor(window.innerHeight * 0.8);
      }
      this.drawChart();
      this.showChart = true;
    }, 50);
  }

  public donwloadCsv(): void {
    let line = '';
    if (!!this.spiderDiagram && !!this.spiderDiagram.series) {
      line += 'Normalization: ' + this.selectedMethod + '\n';
      for (let s of this.spiderDiagram.series) {
        line += 'Sample name: ' + s.sample + '\n';
        for (let d of s.data) {
          line += d.label + ';' + d.y + "\n";
        }
      }
    }
    saveCsvFile(line);
  }

  private drawChart(): void {
    this.setSeries();
    // console.log(this.spiderDiagram);
    let data = new Array<any>();
    for (let s of this.spiderDiagram.series) {
      data.push({ type: 'line', showInLegend: true, name: s.sample, dataPoints: s.data });
    }

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: true,
      zoomEnabled: true,
      width: this.chartWidth,
      height: this.chartHeight,
      axisX: {
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        interval: 1
      },
      axisY: {
        title: 'Sample concentration / ' + this.selectedMethod,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        margin: 10,
        logarithmic: true
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        fontSize: this.legendFontSize,
        itemclick: function (e: any) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      },
      data: data
    }
  }

}

import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ConversionTable } from 'src/app/models/conversion';
import { EndMemberItem, GeoModel } from 'src/app/services/common/geo-model.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { distinct, saveCsvFile } from 'src/app/shared/tools';
import { EndMember } from '../end-member/end-member.component';
import { CONFIRM, ModalParams } from 'src/app/shared/modals/modal-params';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { TernaryModalComponent, TernaryOptions, TERNARY_CACHE } from './ternary-modal/ternary-modal.component';
import { StoreService } from 'src/app/services/common/store.service';

export interface Point2 {
  member?: string;
  x: number;
  y: number;
}

export interface Point3 {
  member?: string;
  a: number;
  b: number;
  c: number;
}

export interface CsvLine {
  member: string;
  a?: number;
  b?: number;
  c?: number;
  an?: number;
  bn?: number;
  cn?: number;
  x?: number;
  y?: number;
}

export const SQRT3 = 1.7320508;
const zero = 0.0001;

@Component({
  selector: 'app-ternary',
  templateUrl: './ternary.component.html',
  styleUrls: ['./ternary.component.scss']
})
export class TernaryComponent implements OnInit {
  @Input('params') params: GeoModel | undefined;
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    this.chartSizeChange();
  }
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);;
  public changeSize = false;
  public ref: any;
  public elementList = new Array<string>();
  public vertices = ['', '', ''];
  public vertices2 = ['', '', ''];
  public labels = ['', '', ''];
  public operators = [0, 0, 0];
  private verticesPoints = new Array<any>();
  private grid1Points = new Array<Array<any>>();
  private grid2Points = new Array<Array<any>>();
  public chartOptions: any;
  public lato: number = 1;
  public fontSize = 16;
  public showChart = false;
  public charts: any;
  public xyPoints = new Array<Point2>();
  public abcPoints = new Array<Point3>();
  public fixedRatio = false;
  public conversionTable = new Array<ConversionTable>();
  private ternaryOptions: TernaryOptions | undefined;

  constructor(private geoModelsService: GeoModelsService,
    private storeService: StoreService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    console.log(this.params);
    this.trimAll();
    this.ref = this.params?.modalRef;
    this.loadConversionTable();
  }

  private trimAll(): void {
    if (!!this.params && !!this.params.endMembers) {
      for (let em of this.params.endMembers)
        for (let e of em) {
          e.name = e.name.trim();
          e.type = e.type.trim();
          e.value = e.value.trim();
          e.um = !!e.um ? e.um.trim() : undefined;
        }
    }
  }

  private loadConversionTable(): void {
    let s = this.geoModelsService.getConversionTable().subscribe(
      (res: any) => {
        this.conversionTable = res;
        s.unsubscribe();
        this.buildElementsList();
      }
    );
  }

  public options(): void {
    let ref = this.modalService.open(TernaryModalComponent, { centered: true, backdrop: 'static' });
    if (this.ternaryOptions)
      ref.componentInstance.params = this.ternaryOptions;
    ref.componentInstance.emitter.subscribe(
      (response: TernaryOptions) => {
        console.log(response);
        ref.close();
        if (response.status === CONFIRM) {
          this.ternaryOptions = response;
          this.drawChart();
        }
      }
    );
  }

  public donwloadCsv(): void {
    let csv = '';
    csv += 'sample;'
      + this.labels[0] + ';' + this.labels[1] + ';' + this.labels[2] + ';'
      + this.labels[0] + ' norm.;' + this.labels[1] + ' norm.;' + this.labels[2] + ' norm.;' +
      'x;y\n';


    if (!!this.params && !!this.params.endMembers) {
      for (let e of this.params?.endMembers) {
        let csvLine: CsvLine = { member: '' };
        for (let m of e) {
          if (m.type === 'F' && m.name.toLowerCase().indexOf('sample') > -1) {
            csvLine.member = m.value;
          }
          if (m.type != 'F') {
            if (m.name == this.vertices[0]) {
              csvLine.a = parseFloat(m.value);
            } else if (m.name === this.vertices[1]) {
              csvLine.b = parseFloat(m.value);
            } else if (m.name === this.vertices[2]) {
              csvLine.c = parseFloat(m.value);
            }
          }
        }
        if (!!csvLine.a && !!csvLine.b && !!csvLine.c) {
          let sum = csvLine.a + csvLine.b + csvLine.c;
          csvLine.an = (csvLine.a / sum);
          csvLine.bn = (csvLine.b / sum);
          csvLine.cn = (csvLine.c / sum);
          csvLine.x = this.lato - csvLine.an - csvLine.bn * 0.5;
          csvLine.y = SQRT3 * 0.5 * csvLine.bn;
        }
        csv += csvLine.member + ';'
        csv += (csvLine.a ? csvLine.a : '') + ';';
        csv += (csvLine.b ? csvLine.b : '') + ';';
        csv += (csvLine.c ? csvLine.c : '') + ';';
        csv += (csvLine.an ? csvLine.an : '') + ';';
        csv += (csvLine.bn ? csvLine.bn : '') + ';';
        csv += (csvLine.cn ? csvLine.cn : '') + ';';
        csv += (csvLine.x ? csvLine.x : '') + ';';
        csv += (csvLine.y ? csvLine.y : '') + ';\n';
      }
    }

    saveCsvFile(csv);
  }

  public chartSizeChange() {
    if (this.vertices[0].trim().length === 0 || this.vertices[1].trim().length === 0 || this.vertices[2].trim().length === 0)
      return;
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

  public getChartInstance(chart: object) {
    this.charts = chart;
  }

  private checkConversion(): void {
    let p = new Array<Array<EndMemberItem>>();
    if (!!this.params?.endMembers) {
      for (let i = 0; i < this.vertices.length; i++) {
        p[i] = new Array<EndMemberItem>();
        for (let em of this.params?.endMembers) {
          for (let e of em) {
            if (e.name.toLowerCase().trim() == this.vertices[i].toLowerCase().trim()) {
              p[i].push(e);
            }
          }
        }
      }
    }
    // console.log(p);
    let conversionNeeded = [false, false, false];
    for (let i = 0; i < p.length; i++) {
      let um0 = this.getFirstUM(p[i]);
      if (um0.length === 0)
        continue;
      um0 = um0.toLowerCase().trim();
      for (let j = 0; j < p[i].length; j++) {
        if (!p[i][j].value || p[i][j].value.trim().length === 0)
          continue;
        if (!!p[i][j].um && p[i][j].um?.toLowerCase().trim() === um0)
          continue;
        conversionNeeded[i] = true;
        break;
      }
    }
    console.log(conversionNeeded);
    let message1 = 'WARNING: The unit of measurement for the elements ';
    let message2 = '';
    for (let i = 0; i < conversionNeeded.length; i++) {
      if (conversionNeeded[i] === true) {
        message2 += this.vertices[i] + ', '
      }
    }
    if (message2.length > 0) {
      message2 = message2.substring(0, message2.length - 2);
    }
    let message3 = ' is not homogeneous.'

    if (message2.length > 0) {
      let params: ModalParams = {
        headerText: 'Confirm request',
        bodyText: message1 + message2 + message3
      }
      let ref = this.modalService.open(AlertComponent, { centered: true });
      ref.componentInstance.params = params;
      ref.componentInstance.emitter.subscribe(
        (response: string) => {
          ref.close();
        }
      );
    }
  }

  private getFirstUM(v: Array<EndMemberItem>): string {
    for (let a of v) {
      if (!!a.um && a.um.length > 0)
        return a.um;
    }
    return '';
  }

  public checkElements(): void {
    if (this.vertices[0].trim().length === 0 || this.vertices[1].trim().length === 0 || this.vertices[2].trim().length === 0)
      return;
    if (this.vertices[0] != this.vertices[1] && this.vertices[0] != this.vertices[2] &&
      this.vertices[1] != this.vertices[2]) {
      this.checkConversion();
      this.chartSizeChange();
    }
  }

  public checkElements2(n: number): void {
    if (this.vertices2[n] === this.vertices[n]) {
      return;
    }
    if (this.operators[n] === 0)
      this.vertices2[n] = '';
    this.chartSizeChange();
  }

  public checkOperator(n: number): void {
    this.operators[n] = parseInt('' + this.operators[n]);
    if (this.operators[n] === 0)
      this.vertices2[n] = '';
    this.chartSizeChange();
  }

  private buildElementsList(): void {
    this.checkAndConvert();
    this.elementList.length = 0;
    this.elementList.push('');
    if (!!this.params && !!this.params.endMembers) {
      for (let e of this.params?.endMembers) {
        for (let item of e) {
          if (item.type != 'F') {
            this.elementList.push(item.name);
          }
        }
      }
      this.elementList = distinct(this.elementList);
      console.log(this.elementList);
      // this.checkElements();
      this.checkConversion();
    }
  }

  private checkAndConvert(): void {
    if (!!this.params && !!this.params.endMembers)
      for (let em of this.params?.endMembers) {
        for (let item of em)
          if ('C' === item.type && item.value.indexOf(' [') > 0) {
            item.value = item.value.trim();
            let value = item.value.substring(0, item.value.indexOf(' ['));
            let um = item.value.substring(item.value.indexOf('[') + 1, item.value.indexOf(']'));
            item.value = value.trim();
            item.um = um.trim();
            // item.value = this.convert(value, um);
            // item.um = 'ppm';
          }
      }
    console.log(this.params?.endMembers);
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


  private setLables(): void {
    for (let i = 0; i < this.vertices.length; i++) {
      switch (this.operators[i]) {
        case 0:
          this.labels[i] = this.vertices[i];
          break;
        case 1:
          this.labels[i] = this.vertices[i] + '+' + this.vertices2[i];
          break;
        case 2:
          this.labels[i] = this.vertices[i] + '/' + this.vertices2[i];
          break;
      }
    }
  }

  private setVerticesPoints(): void {
    this.setLables();
    let fontSize = 20;
    let orientation = 'vertical';
    this.verticesPoints.length = 0;
    this.verticesPoints.push({ indexLabel: this.labels[0], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero, y: zero });
    this.verticesPoints.push({ indexLabel: this.labels[2], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero + this.lato, y: zero });
    this.verticesPoints.push({ indexLabel: this.labels[1], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero + this.lato * 0.5, y: zero + this.lato * 0.5 * SQRT3 });
    this.verticesPoints.push({ x: zero, y: zero });
  }

  private buildPoints(): void {
    if (!!this.params && !!this.params.endMembers) {
      this.abcPoints.length = 0;

      for (let e of this.params?.endMembers) {
        let abc = { a: 0, b: 0, c: 0 };

        for (let m of e) {
          if (m.type != 'F') {
            if (m.name == this.vertices[0]) {
              abc.a = parseFloat(m.value);
            } else if (m.name === this.vertices[1]) {
              abc.b = parseFloat(m.value);
            } else if (m.name === this.vertices[2]) {
              abc.c = parseFloat(m.value);
            }
          }
        }

        for (let m of e) {
          if (m.type != 'F') {
            if (m.name == this.vertices2[0]) {
              if (this.operators[0] == 1)
                abc.a += parseFloat(m.value);
              else if (this.operators[0] == 2 && 0 !== parseFloat(m.value))
                abc.a /= parseFloat(m.value);
            } else if (m.name === this.vertices2[1]) {
              if (this.operators[1] == 1)
                abc.b += parseFloat(m.value);
              else if (this.operators[1] == 2 && 0 !== parseFloat(m.value))
                abc.b /= parseFloat(m.value);
            } else if (m.name === this.vertices2[2]) {
              if (this.operators[2] == 1)
                abc.c += parseFloat(m.value);
              else if (this.operators[2] == 2 && 0 !== parseFloat(m.value))
                abc.c /= parseFloat(m.value);
            }
          }
        }

        this.abcPoints.push(abc);
      }

      this.toPoint2();
    }
  }

  private toPoint2(): void {
    this.xyPoints.length = 0;
    for (let e of this.abcPoints) {
      let sum = e.a + e.b + e.c;
      let aa = (e.a / sum);
      let bb = (e.b / sum);
      let cc = (e.c / sum);
      this.xyPoints.push({ x: zero + (this.lato - aa - bb * 0.5), y: zero + SQRT3 * 0.5 * bb });
    }
  }

  private setGridPoints(): void {
    this.grid1Points = new Array<any>();
    this.grid2Points = new Array<any>();

    this.grid1Points.push([{ x: zero + 0.1, y: zero }, { x: zero + 0.05, y: zero + SQRT3 * 0.5 * 0.1 }]);
    this.grid1Points.push([{ x: zero + 0.2, y: zero }, { x: zero + 0.1, y: zero + SQRT3 * 0.5 * 0.2 }]);
    this.grid1Points.push([{ x: zero + 0.3, y: zero }, { x: zero + 0.15, y: zero + SQRT3 * 0.5 * 0.3 }]);
    this.grid1Points.push([{ x: zero + 0.4, y: zero }, { x: zero + 0.2, y: zero + SQRT3 * 0.5 * 0.4 }]);
    this.grid1Points.push([{ x: zero + 0.5, y: zero }, { x: zero + 0.25, y: zero + SQRT3 * 0.5 * 0.5 }]);
    this.grid1Points.push([{ x: zero + 0.6, y: zero }, { x: zero + 0.3, y: zero + SQRT3 * 0.5 * 0.6 }]);
    this.grid1Points.push([{ x: zero + 0.7, y: zero }, { x: zero + 0.35, y: zero + SQRT3 * 0.5 * 0.7 }]);
    this.grid1Points.push([{ x: zero + 0.8, y: zero }, { x: zero + 0.4, y: zero + SQRT3 * 0.5 * 0.8 }]);
    this.grid1Points.push([{ x: zero + 0.9, y: zero }, { x: zero + 0.45, y: zero + SQRT3 * 0.5 * 0.9 }]);

    this.grid2Points.push([{ x: zero + 0.1, y: zero }, { x: zero + 0.1 + (1 - 0.1) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.1) }]);
    this.grid2Points.push([{ x: zero + 0.2, y: zero }, { x: zero + 0.2 + (1 - 0.2) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.2) }]);
    this.grid2Points.push([{ x: zero + 0.3, y: zero }, { x: zero + 0.3 + (1 - 0.3) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.3) }]);
    this.grid2Points.push([{ x: zero + 0.4, y: zero }, { x: zero + 0.4 + (1 - 0.4) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.4) }]);
    this.grid2Points.push([{ x: zero + 0.5, y: zero }, { x: zero + 0.5 + (1 - 0.5) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.5) }]);
    this.grid2Points.push([{ x: zero + 0.6, y: zero }, { x: zero + 0.6 + (1 - 0.6) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.6) }]);
    this.grid2Points.push([{ x: zero + 0.7, y: zero }, { x: zero + 0.7 + (1 - 0.7) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.7) }]);
    this.grid2Points.push([{ x: zero + 0.8, y: zero }, { x: zero + 0.8 + (1 - 0.8) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.8) }]);
    this.grid2Points.push([{ x: zero + 0.9, y: zero }, { x: zero + 0.9 + (1 - 0.9) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.9) }]);
  }

  private drawChart(): void {
    this.showChart = true;
    let data = new Array<any>();
    this.setVerticesPoints();
    this.buildPoints();
    this.setGridPoints();
    for (let i = 0; i < 9; i++) {
      data.push({ type: 'line', showInLegent: false, name: '', color: '#cfcfcf', dataPoints: this.grid1Points[i] });
      data.push({ type: 'line', showInLegent: false, name: '', color: '#cfcfcf', dataPoints: this.grid2Points[i] });
    }
    data.push({ type: 'line', showInLegend: false, name: '', color: '#000000', dataPoints: this.verticesPoints });
    if (!!this.ternaryOptions && !!this.ternaryOptions.ternaryData) {
      data.push(
        {
          type: 'scatter',
          showInLegend: false,
          name: this.ternaryOptions.ternaryData.name && this.ternaryOptions.ternaryData.name.length > 0 ? this.ternaryOptions.ternaryData.name : '',
          color: this.ternaryOptions.ternaryData.color && this.ternaryOptions.ternaryData.color.length > 0 ? this.ternaryOptions.ternaryData.color : '#000000',
          markerType: this.ternaryOptions.ternaryData.shape && this.ternaryOptions.ternaryData.shape.length > 0 ? this.ternaryOptions.ternaryData.shape : undefined,
          dataPoints: this.xyPoints
        }
      );
    } else {
      data.push({ type: 'scatter', showInLegend: false, name: '', dataPoints: this.xyPoints });
    }

    let cache = this.getCachedData();
    if (!!cache) {
      for (let c of cache) {
        data.push(c);
      }
    }

    if (this.ternaryOptions && true == this.ternaryOptions.ternaryData?.cache) {
      this.cacheData(data);
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
        lineColor: '#ffffff',
        labelFontColor: '#ffffff',
        gridColor: '#ffffff',
        minimum: -0.01,
        maximun: 2.1
      },
      axisY: {
        tickColor: '#ffffff',
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        lineColor: '#ffffff',
        labelFontColor: '#ffffff',
        gridColor: '#ffffff',
        minimum: -0.01,
        maximun: 1
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        fontSize: this.fontSize,
        itemclick: function (e: any) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      },
      data: data // <--------- QUI
    }
  }

  private cacheData(data: Array<any>): void {
    let cache = this.storeService.get(TERNARY_CACHE);
    if (!cache) {
      cache = new Array<any>();
    }
    for (let d of data) {
      if (d.type === 'scatter') {
        cache.push(d);
      }
    }
    this.storeService.push({ key: TERNARY_CACHE, data: cache });
  }

  private getCachedData(): Array<any> | undefined {
    return this.storeService.get(TERNARY_CACHE);
  }
}
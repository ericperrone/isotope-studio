import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Series, DataSeries, DATA_SERIES, ChartShapes, DataSeriesPoint } from 'src/app/models/series';
import { StoreService } from 'src/app/services/common/store.service';
import { ModalParams, CANCEL, CONFIRM } from '../modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlottingComponent } from 'src/app/geo-modelling/plotting/plotting.component';
import { ComputableGridItem, GridItem, gridItem2Computable } from '../../components/grid/grid.component';
import { SampleService } from 'src/app/services/rest/sample.service';
import { DataGrid } from 'src/app/models/datagrid';
import { ConfirmComponent } from '../confirm/confirm.component';
import { List } from '../../list';
import { MIXING_CACHE } from 'src/app/geo-modelling/mixing/mixing.component';
import { ConversionDialogComponent, PlotConversionType } from '../../components/conversion-dialog/conversion-dialog.component';
import { EndMembersModalComponent, MIX_STORE } from 'src/app/geo-modelling/end-members-modal/end-members-modal.component';

export interface Range {
  min: number;
  max: number;
}

export const RGBColors = [
  '#4F81BC', '#C0504E', '#9BBB58', '#23BFAA', '#8064A1', '#4AACC5', '#F79647', '#7F6084', '#77A033', '#33558B', '#E59566', '#FFA500'
];

@Component({
  selector: 'app-data-plotting-series',
  templateUrl: './data-plotting-series.component.html',
  styleUrls: ['./data-plotting-series.component.scss']
})
export class DataPlottingSeriesComponent implements OnInit {
  private grid: Array<Array<GridItem>> | undefined;
  public xyEdit: boolean = true;
  public chartWidth: number = 1400;
  public chartHeight: number = 850;
  public xOperator = '0';
  public yOperator = '0';
  public ChartShapes = ChartShapes;
  public pointButtonEnabled = false;
  public color = '';
  public name = '';
  public dataSeries: Series = { xAxis: '', yAxis: '', width: this.chartWidth, height: this.chartHeight, series: [], xLog: false, yLog: false };
  public xAxis = new Array<string>();
  public yAxis = new Array<string>();
  public xData = new Array<number>();
  public yData = new Array<number>();
  public xSelected = '';
  public ySelected = '';
  public xSelected2 = '';
  public ySelected2 = '';
  public shape = 'circle';
  public xRange: Range = { min: -10000, max: 10000 };
  public yRange: Range = { min: -10000, max: 10000 };
  public xLog = false;
  public yLog = false;
  public selectedDataSeries: DataSeries | undefined;
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public dataGrid: DataGrid = new DataGrid(this.storeService);
  public onMix = false;
  public alertMx = false;
  public computables = new Array<Array<ComputableGridItem>>();

  constructor(private storeService: StoreService,
    private sampleService: SampleService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    let ds = this.storeService.get(DATA_SERIES);
    if (!!ds) {
      this.dataSeries = ds;
      if (this.dataSeries.xAxis && this.dataSeries.xAxis.length > 0 && this.dataSeries.yAxis && this.dataSeries.yAxis.length > 0) {
        this.xSelected = this.dataSeries.xAxis;
        this.ySelected = this.dataSeries.yAxis;
        this.xyEdit = true;
      }
    } else {
      this.addDataSeries();
    }
    if (!!this.params && !!this.params.list) {
      console.log(this.params);
      this.getComputables();
      console.log(this.computables);
      this.dataGrid.add(this.params.anyParams.headers, this.params.anyParams.selection);
      this.dataGrid.persist();
      let list = this.dataGrid.getElementList();
      for (let item of list) {
        this.xAxis.push(item);
        this.yAxis.push(item);
      }
    }
    this.checkStoredVars();
  }

  private getComputables(): void {
    this.computables = new Array<Array<ComputableGridItem>>();
    for (let i = 0; i < this.params?.anyParams.selection.length; i++) {
      this.computables.push(new Array<ComputableGridItem>());
      for (let j = 0; j < this.params?.anyParams.selection[i].length; j++) {
        let cgi: ComputableGridItem = gridItem2Computable(this.params?.anyParams.selection[i][j], this.params?.anyParams.headers[j].content);
        if (cgi.row > 0) {
          this.computables[i].push(cgi);
        }
      }
    }
  }

  private checkComputablesUm(): void {
    if (!!this.dataSeries) {
      let xa = this.dataSeries.xAxis;
      let ya = this.dataSeries.yAxis;
    }
  }

  private checkStoredVars(): void {
    let stored = this.storeService.get(MIX_STORE);
    if (!!stored) {
      this.alertMx = true;
    } else {
      this.alertMx = false;
    }
  }

  public xOperatorChange(): void {
    this.selectedChange();
  }

  public yOperatorChange(): void {
    this.selectedChange();
  }

  public xLogHandler(): void {
    this.getXYAxis();
    this.reassignPointsToSeries();
    this.setRange();
  }

  public yLogHandler(): void {
    this.getXYAxis();
    this.reassignPointsToSeries();
    this.setRange();
  }

  public selectedChange(): void {
    this.getXYAxis();
    this.reassignPointsToSeries();
    this.setRange();
  }

  private setRange(): void {
    let x = new Array<number>();
    let y = new Array<number>();
    this.xRange = { min: -10000, max: 10000 };
    this.yRange = { min: -10000, max: 10000 };
    if (!!this.dataSeries) {
      for (let s of this.dataSeries.series) {
        for (let d of s.data) {
          x.push(d.x.value);
          y.push(d.y.value);
        }
      }
      if (x.length > 0 && y.length > 0) {
        x = x.sort((a, b) => a - b);
        y = y.sort((a, b) => a - b);
        this.xRange = { min: x[0], max: x[x.length - 1] };
        this.yRange = { min: y[0], max: y[y.length - 1] };
      }
    }
    // console.log(this.xRange);
    // console.log(this.yRange);
  }

  private getFloatDataFromGrid(dataSeries: DataSeries): Array<DataSeriesPoint> {
    let points = new Array<DataSeriesPoint>();
    if (!!this.dataGrid && this.xSelected.length > 0 && this.ySelected.length > 0 && !!this.dataGrid.getGrid()) {
      this.grid = this.dataGrid.getGrid();
      // let header = this.dataGrid.getHeader();
      for (let s of dataSeries.samples) {
        let row = this.dataGrid.getGridRowById(s);
        if (row) {
          let xCol = 0;
          let xValue = 0;
          let yValue = 0;
          let xx = this.getFloatValue(row, this.xSelected, this.xSelected2, this.xOperator);
          let yy = this.getFloatValue(row, this.ySelected, this.ySelected2, this.yOperator);
          xValue = xx.value;
          yValue = yy.value;

          if (xValue != 0 && yValue != 0) {
            if (this.xLog && xValue > 0) {
              xValue = Math.log10(xValue);
              xx.value = xValue;
            }
            if (this.yLog && yValue > 0) {
              yValue = Math.log10(yValue);
              yy.value = yValue;
            }
            points.push({ x: xx, y: yy });
          }
        }
      }
    }
    return points;
  }

  // private getFloatValue2(select1: string, select2: string, operator: string): number {
  //   if (!!this.computables) {

  //   }
  // }

  private getStringValue(value: string) {
    if (value.indexOf('[') > 0) {
      value = value.substring(0, value.indexOf(' ['));
    }
    return value;
  }

  private getUm(item: string): string | undefined {
    item = item.trim();
    if (item.indexOf('[') > 0) {
      return item.substring(item.indexOf('[') + 1, item.indexOf(']'));
    }
    return undefined;
  }

  private getFloatValue(row: Array<GridItem>, select1: string, select2: string, operator: string): { value: number, um?: string } {
    let col = 0;
    let value = 0;
    let um = undefined;
    switch (operator) {
      default:
      case '0':
        col = this.dataGrid.getHeaderCol(select1);
        value = parseFloat(this.getStringValue(row[col].content));
        um = this.getUm(row[col].content);
        if (isNaN(value)) value = 0;
        break;
      case '1':
        col = this.dataGrid.getHeaderCol(select1);
        value = parseFloat(this.getStringValue(row[col].content));
        um = this.getUm(row[col].content);
        if (isNaN(value)) value = 0;
        if (value != 0)
          value = 1 / value;
        break;
      case '2':
        if (select2.length > 0) {
          col = this.dataGrid.getHeaderCol(select1);
          value = parseFloat(this.getStringValue(row[col].content));
          if (isNaN(value)) value = 0;
          let x2Col = this.dataGrid.getHeaderCol(select2);
          let x2Value = parseFloat(this.getStringValue(row[x2Col].content));
          if (isNaN(x2Value)) x2Value = 0;
          if (x2Value !== 0)
            value = value / x2Value;
        }
    }
    return { value: value, um: um };
  }

  private getXYAxis(): void {
    if (!!this.dataSeries && this.xSelected.length > 0 && this.ySelected.length > 0) {
      switch (this.xOperator) {
        default:
        case '0':
          this.dataSeries.xAxis = this.xSelected;
          break;
        case '1':
          this.dataSeries.xAxis = '1 / ' + this.xSelected;
          break;
        case '2':
          this.dataSeries.xAxis = this.xSelected + ' / ' + this.xSelected2;
      }
      switch (this.yOperator) {
        default:
        case '0':
          this.dataSeries.yAxis = this.ySelected;
          break;
        case '1':
          this.dataSeries.yAxis = '1 / ' + this.ySelected;
          break;
        case '2':
          this.dataSeries.yAxis = this.ySelected + ' / ' + this.ySelected2;
      }
      this.dataSeries.xLog = this.xLog;
      this.dataSeries.yLog = this.yLog;
      console.log(this.dataSeries);
    }
  }

  private isTheSameUm(um: Array<string>): boolean {
    if (um.length > 0) {
      let first = um[0];
      for (let u of um) {
        if (u !== first)
          return false;
      }
    }
    return true;
  }

  private checkPoints(points: Array<DataSeriesPoint>): void {
    console.log(points);
    let umX = [];
    let umY = [];
    for (let p of points) {
      let umx = p.x.um ? p.x.um.toLowerCase() : '';
      let umy = p.y.um ? p.y.um.toLowerCase() : '';
      umX.push(umx);
      umY.push(umy);
    }

    let x = this.isTheSameUm(umX);
    let y = this.isTheSameUm(umY);

    if (!x && y) {
      console.log(' CONVERSION NEEDED x');
      let r = this.modalService.open(ConversionDialogComponent, { centered: true, backdrop: 'static' });
      r.componentInstance.params = { 'plotData': points, 'type': PlotConversionType.X };
      let s = r.componentInstance.emitter.subscribe((result: any) => {
        console.log(result);
        r.close();
        s.unsubscribe();
      })
    } else if (x && !y) {
      console.log(' CONVERSION NEEDED y');
      console.log(' CONVERSION NEEDED x');
      let r = this.modalService.open(ConversionDialogComponent, { centered: true, backdrop: 'static' });
      r.componentInstance.params = { 'plotData': points, 'type': PlotConversionType.Y };
      let s = r.componentInstance.emitter.subscribe((result: any) => {
        console.log(result);
        r.close();
        s.unsubscribe();
      })
    } else if (!x && !y) {
      console.log(' CONVERSION NEEDED x & y');
      console.log(' CONVERSION NEEDED x');
      let r = this.modalService.open(ConversionDialogComponent, { centered: true, backdrop: 'static' });
      r.componentInstance.params = { 'plotData': points, 'type': PlotConversionType.BOTH };
      let s = r.componentInstance.emitter.subscribe((result: any) => {
        console.log(result);
        r.close();
        s.unsubscribe();
      })
    } else {
      console.log(' CONVERSION NOT NEEDED');
    }
  }

  private reassignPointsToSeries(): void {
    for (let ds of this.dataSeries.series) {
      ds.data = new List<DataSeriesPoint>();
      let points = this.getFloatDataFromGrid(ds);
      this.checkPoints(points);

      for (let p of points) {
        ds.data.only1Push(p);
      }
    }
    console.log(this.dataSeries);
    this.checkComputablesUm();
  }

  private deselectAll(): void {
    if (this.dataSeries && this.dataSeries.series) {
      for (let ds of this.dataSeries.series) {
        ds.selected = false;
      }
    }
  }

  public addDataSeries(): void {
    if (!!this.dataSeries) {
      this.deselectAll();
      this.dataSeries.series.push({ name: this.name, samples: new List(), data: new List<DataSeriesPoint>(), selected: true, shape: { color: RGBColors[this.dataSeries.series.length], shape: '' } });
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  private addDataToThisSeries(activeDataSeries: DataSeries): void {
    let ids = this.dataGrid.getSelectedIds();
    if (!!ids) {
      for (let id of ids) {
        activeDataSeries?.samples.only1Push(id);
      }
      if (!activeDataSeries.data) {
        activeDataSeries.data = new List<DataSeriesPoint>();
      }
      let points = this.getFloatDataFromGrid(activeDataSeries);
      this.checkPoints(points);
      for (let p of points) {
        activeDataSeries.data.only1Push(p);
      }
    }
    console.log(this.dataSeries);
  }

  public addDataToSeries(): void {
    if (!!this.dataSeries) {
      for (let ds of this.dataSeries.series) {
        if (ds.selected) {
          this.addDataToThisSeries(ds);
          break;
        }
      }
      this.setRange();
    }
  }

  public mix(): void {
    let ref = this.modalService.open(EndMembersModalComponent, { centered: true, size: 'lg', scrollable: true });
    ref.componentInstance.emitter.subscribe(
      () => { 
        this.checkStoredVars();
        ref.close();
      }
    );
  }

  public plot(): void {
    if (!!this.alertMx)
      this.dataSeries.cache = true;
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    console.log(this.dataSeries);
    let modalRef = this.modalService.open(PlottingComponent, { fullscreen: true });
    modalRef.componentInstance.params = { ref: modalRef };
  }

  private setAxisNames(): void {
    let xAxisText = '';
    let yAxisText = '';
    switch (this.xOperator) {
      case '0':
      default:
        xAxisText = this.xSelected;
        break;
      case '1':
        xAxisText = '1 / ' + this.xSelected
        break;
      case '2':
        xAxisText = this.xSelected + ' / ' + this.xSelected2;
        break;
    }

    if (this.xLog) {
      xAxisText = 'Log ( ' + xAxisText + ' )';
    }

    switch (this.yOperator) {
      case '0':
      default:
        yAxisText = this.ySelected;
        break;
      case '1':
        yAxisText = '1 / ' + this.ySelected
        break;
      case '2':
        yAxisText = this.ySelected + ' / ' + this.ySelected2;
        break;
    }

    if (this.yLog) {
      yAxisText = 'Log ( ' + yAxisText + ' )';
    }

    this.dataSeries.xAxis = xAxisText;
    this.dataSeries.yAxis = yAxisText;
  }

  public newSeries() {
    this.xyEdit = true;
    this.setAxisNames();
    if (this.dataSeries.series.length === 0) {
      this.dataSeries.series = [];
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  public reset(): void {
    let ref = this.modalService.open(ConfirmComponent, { centered: true });
    ref.componentInstance.params = {
      headerText: 'Confirm',
      bodyText: 'This operation will reset all stored information for the data plotting. Please, confirm'
    };
    let sub2 = ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        sub2.unsubscribe();
        if (response === CONFIRM) {
          this.resetSeries();
        }
      }
    );
  }

  public resetSeries() {
    this.xLog = false;
    this.yLog = false;
    this.xSelected = '';
    this.ySelected = '';
    this.xRange = { min: -10000, max: 10000 };
    this.yRange = { min: -10000, max: 10000 };
    this.xOperator = '0';
    this.yOperator = '0';
    this.dataSeries = { xAxis: '', yAxis: '', width: this.chartWidth, height: this.chartWidth, series: [], xLog: false, yLog: false };
    this.storeService.clean(DATA_SERIES);
    if (!!this.dataGrid) {
      this.dataGrid.reset();
    }
    this.xyEdit = true;
  }

  public select(ds: DataSeries) {
    this.deselectAll();
    this.selectedDataSeries = ds;
    ds.selected = true;
    this.pointButtonEnabled = true;
    // if (!!ds.selected) {
    //   this.selectedDataSeries = undefined;
    //   ds.selected = false;
    //   this.pointButtonEnabled = false;
    // } else {
    //   for (let d of this.dataSeries.series) {
    //     d.selected = false;
    //   }
    //   this.selectedDataSeries = ds;
    //   ds.selected = true;
    //   this.pointButtonEnabled = true;
    // }
  }

  public set() {
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
  }

  public close() {
    this.emitter.emit(CANCEL);
  }

  private getDataByIds(): void {
    if (this.dataSeries && this.dataSeries.series.length > 0) {
      for (let s of this.dataSeries.series) {
        let sampleList = s.samples;
        if (!!sampleList && sampleList.length > 0) {
          let r = this.sampleService.getSamplesById(sampleList).subscribe(
            (res: any) => {
              console.log(res);
              r.unsubscribe();
            }
          );
        }

      }
    }
  }

}

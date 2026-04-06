import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ConversionTable } from 'src/app/models/conversion';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { CANCEL, CONFIRM } from '../../modals/modal-params';
import { Computable } from 'src/app/geo-modelling/mixing/mixing.component';

export enum ConversionType { NONE = 0, BOTH, CHEM_ONLY, ISOTOPE_ONLY, ERROR };
export enum PlotConversionType { NONE = 0, X, Y, BOTH };
export enum DataTypes { MIXING = 0, PLOTTING, SPIDER, TERNARY };

@Component({
  selector: 'app-conversion-dialog',
  templateUrl: './conversion-dialog.component.html',
  styleUrls: ['./conversion-dialog.component.scss']
})
export class ConversionDialogComponent implements OnInit {
  private conversionType: ConversionType = ConversionType.NONE;
  private conversionPlotType: PlotConversionType = PlotConversionType.NONE;
  public conversionTable = new Array<ConversionTable>();
  private computables = new Array<Computable>();
  public emitter = new EventEmitter<any>();
  public UM = '';
  public dataType: DataTypes = DataTypes.MIXING;
  private outData: any;
  @Input() params: any;

  constructor(private geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    this.loadConversionTable();
    if (!!this.params.plotData) {
      this.initPlotSeries();
    } else if (!!this.params.ternaryData) {
      this.initTernary();
    } else {
      this.initComputables();
    }
   }

  private initComputables(): void {
    this.computables = this.params.computables;
    this.conversionType = this.params.type;
    this.dataType = DataTypes.MIXING;
  }

  private initPlotSeries(): void {
    this.dataType = DataTypes.PLOTTING;
    console.log(this.params.plotData);
  }

  private initTernary(): void {
    this.dataType = DataTypes.TERNARY;
    console.log(this.params.ternaryData);
  }

  public confirm(): void {
    switch (this.dataType) {
      case DataTypes.PLOTTING:
        this.managePlotSeries();
        break;
      case DataTypes.SPIDER:
        break;
      case DataTypes.TERNARY:
        break;
      case DataTypes.MIXING:
      default:
        this.manageComputables();
        break;
    }
    this.emitter.emit({ response: CONFIRM, data: this.outData });
  }

  private managePlotSeries(): void {
    switch (this.params.type) {
      case PlotConversionType.X:
        this.convertSeriesX();
        break;
      case PlotConversionType.Y:
        this.convertSeriesY();
        break;
      case PlotConversionType.BOTH:
        this.convertSeriesX();
        this.convertSeriesY();
        break;
      default:
        break;
    }
    this.outData = this.params.plotData;
  }

  private convertSeriesX(): void {
    for (let point of this.params.plotData) {
      if (point.x.um.toLowerCase() !== this.UM) {
        for (let ctItem of this.conversionTable) {
          if (ctItem.um.toLowerCase() === point.x.um.toLowerCase()) {
            let value = parseFloat(point.x.value) * ctItem.toPPM;
            if (this.UM === 'wt%')
              value /= 10000;
            point.x.value = value;
            point.x.um = this.UM;
            break;
          }
        }
      }
    }
  }

  private convertSeriesY(): void {
    for (let point of this.params.plotData) {
      if (point.y.um.toLowerCase() !== this.UM) {
        for (let ctItem of this.conversionTable) {
          if (ctItem.um.toLowerCase() === point.y.um) {
            let value = parseFloat(point.y.value) * ctItem.toPPM;
            if (this.UM === 'wt%')
              value /= 10000;
            point.y.value = value;
            point.y.um = this.UM;
            break;
          }
        }
      }
    }  
  }

  private manageComputables(): void {
    for (let c of this.computables) {
      switch (this.conversionType) {
        case ConversionType.CHEM_ONLY:
          this.convertChemOnly(c);
          break;
        case ConversionType.ISOTOPE_ONLY:
          this.convertIsotopeOnly(c);
          break;
        case ConversionType.BOTH:
          this.convertBoth(c);
          break;
      }
    }
    this.outData = this.computables;
  }

  private convertBoth(c: Computable): void {
    let currentUm = ('' + c.elementUm).toLowerCase();
    let currentConcentrationUm = ('' + c.concentrationUm).toLowerCase();
    if (currentUm !== this.UM) {
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.elementUm = this.UM;
          let value = parseFloat(c.elementValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.elementValue = '' + value;
        }
      }
    }
    if (currentConcentrationUm !== this.UM) {
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentConcentrationUm) {
          c.concentrationUm = this.UM;
          let value = parseFloat(c.concentrationValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.concentrationValue = '' + value;
        }
      }
    }
  }

  private convertChemOnly(c: Computable): void {
    let currentUm = ('' + c.elementUm).toLowerCase();
    if (currentUm !== this.UM)
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.elementUm = this.UM;
          let value = parseFloat(c.elementValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.elementValue = '' + value;
        }
      }
  }

  private convertIsotopeOnly(c: Computable): void {
    let currentUm = ('' + c.concentrationUm).toLowerCase();
    if (currentUm !== this.UM)
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.concentrationUm = this.UM;
          let value = parseFloat(c.concentrationValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.concentrationValue = '' + value;
        }
      }
  }

  public cancel(): void {
    this.emitter.emit({ response: CANCEL });
  }

  private loadConversionTable(): void {
    let s = this.geoModelsService.getConversionTable().subscribe(
      (res: any) => {
        this.conversionTable = res;
        s.unsubscribe();
      }
    );
  }
}

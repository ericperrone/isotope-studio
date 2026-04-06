import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ChartShapes } from 'src/app/models/series';
import { CANCEL, CONFIRM } from 'src/app/shared/modals/modal-params';

export interface TernaryData {
  name: string;
  cache: boolean;
  color?: string;
  shape?: string;
  series?: any;
}

export interface TernaryOptions {
  status: string;
  ternaryData?: TernaryData;
}

export const TERNARY_CACHE = '_TERNARY_CACHE_';

@Component({
  selector: 'app-ternary-modal',
  templateUrl: './ternary-modal.component.html',
  styleUrls: ['./ternary-modal.component.scss']
})
export class TernaryModalComponent implements OnInit {
  @Input() params: TernaryOptions | undefined;
  public emitter = new EventEmitter<TernaryOptions>();
  public ChartShapes = ChartShapes;
  ternaryData: TernaryData = {
    name: '',
    cache: true,
    color: '#f000a2',
    shape: 'cicrle'
  };

  constructor() { }

  ngOnInit(): void {
    if (this.params && this.params.ternaryData) {
      this.ternaryData = this.params.ternaryData;
    }
  }

  public close(): void {
    let result: TernaryOptions = {
      status: CANCEL
    }
    this.emitter.emit(result);
  }

  public set(): void {
    let result: TernaryOptions = {
      status: CONFIRM,
      ternaryData: this.ternaryData
    };
    this.emitter.emit(result);
  }

}

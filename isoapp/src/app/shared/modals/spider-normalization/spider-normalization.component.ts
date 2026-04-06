import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CANCEL, CONFIRM, ModalParams } from '../modal-params';
import { SpiderNorm } from 'src/app/geo-modelling/spider/spider.component';
import { StoreService } from 'src/app/services/common/store.service';

export interface SpiderNormResult {
  status: string;
  norm?: SpiderNorm;
}

export interface NormItem {
  element: string;
  value: number;
  position: number;
  excluded: boolean;
}

export const SPIDER_NORM = '_SPIDER_NORM_';

@Component({
  selector: 'app-spider-normalization',
  templateUrl: './spider-normalization.component.html',
  styleUrls: ['./spider-normalization.component.scss']
})
export class SpiderNormalizationComponent implements OnInit {
  @Input() params: string | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public normName = '';
  public order = ['Li', 'B', 'Sc', 'V', 'Cr', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Cs', 'Rb', 'Ba', 'Th', 'U', 'Nb', 'Ta', 'La', 'Ce', 'Pb', 'Pr', 'Sr', 'Nd', 'Sm', 'Zr', 'Hf', 'Eu', 'Gd', 'Tb', 'Dy', 'Y', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Mo', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Bi']
  public normItemList = new Array<NormItem>();
  public disabled = true;

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.initStoredNorm();
    // this.normItemList = new Array<NormItem>();
    // for (let i = 0; i < this.order.length; i++) {
    //   this.normItemList.push({ element: this.order[i], value: 0, position: i + 1, excluded: false });
    // }
    this.onModelChange();
  }

  public cancel() {
    let response: SpiderNormResult = { status: CANCEL };
    this.emitter.emit(response);
  }

  public confirm() {
    let sn: SpiderNorm = { method: this.normName, keys: this.order, order: this.order, norm: this.buildNorm() };
    let response: SpiderNormResult = { status: CONFIRM, norm: sn };
    this.emitter.emit(response);
  }

  private buildNorm(): any {
    let factor: any = {};
    for (let item of this.normItemList) {
      if (item.value !== 0 && !item.excluded) {
        factor[item.element] = item.value;
      }
    }
    return factor;
  }

  onModelChange(): void {
    if (this.normName.length <= 0) {
      this.disabled = true;
      return;
    }

    let atLeast = 0;
    let sum = 0;
    for (let item of this.normItemList) {
      sum += item.value;
      if (!item.excluded)
        atLeast++;
    }

    if (sum === 0 || atLeast === 0)
      this.disabled = true;
    else
      this.disabled = false;

  }

  initStoredNorm(): void {
    console.log(this.params);
    this.normItemList = new Array<NormItem>();
    if (!!this.params) {
      let store = this.storeService.get(SPIDER_NORM);
      if (!!store) {
        for (let i = 0; i < store.length; i++) {
          if (this.params === store[i].method) {
            this.normName = store[i].method;
            for (let n = 0; n < this.order.length; n++) {
              this.normItemList.push({ element: this.order[n], value: store[i].norm[this.order[n]], position: i + 1, excluded: false });
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this.order.length; i++) {
        this.normItemList.push({ element: this.order[i], value: 0, position: i + 1, excluded: false });
      }
    }
  }

  saveInSession(): void {
    let store = this.storeService.get(SPIDER_NORM);
    if (!store) {
      store = new Array<any>();
      this.storeService.push({ key: SPIDER_NORM, data: store });
    }

    for (let i = 0; i < store.length; i++) {
      if (this.normName === store[i].method) {
        store[i] = { method: this.normName, keys: this.order, order: this.order, norm: this.buildNorm() };
        return;
      }
    }
    store.push({ method: this.normName, keys: this.order, order: this.order, norm: this.buildNorm() });
  }

}

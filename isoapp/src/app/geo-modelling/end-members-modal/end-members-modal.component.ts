import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Computable, MixingResult } from '../mixing/mixing.component';
import { STORE_ALERT, StoreService } from 'src/app/services/common/store.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';

export const MIX_STORE = '_MIX_STORE_';

export interface MixStored {
  mix1: Array<MixingResult>,
  mix2: Array<MixingResult>,
  chart: any
}

export interface Item {
  element: string;
  value: number;
  concentration?: string;
  cValue?: number;
}

export interface ManualEndmemberItem {
  sampleName: string;
  items: Array<Item>;
}

@Component({
  selector: 'app-end-members-modal',
  templateUrl: './end-members-modal.component.html',
  styleUrls: ['./end-members-modal.component.scss']
})
export class EndMembersModalComponent implements OnInit {
  @Output() emitter = new EventEmitter<any>();
  public graph = false;
  private stored: MixStored | undefined;

  public endMembers: Array<ManualEndmemberItem> = [
    { sampleName: 'Sample01', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] },
    { sampleName: 'Sample02', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] },
    { sampleName: 'Sample03', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] }
  ];
  public include = false;
  public step = 1;
  private increment = 0.1;
  public label2 = ['x', 'y', ''];
  public label3 = ['a', 'b', 'c'];
  public labels = new Array<string>();

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private geoModelsService: GeoModelsService
  ) { }

  ngOnInit(): void {
    this.storeService.clean(MIX_STORE);
    this.labels = [...this.label2];
  }

  public reset() {
    this.step = 1;
    this.endMembers = [
      { sampleName: 'Sample01', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] },
      { sampleName: 'Sample02', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] },
      { sampleName: 'Sample03', items: [{ element: '', value: 0, cValue: 0 }, { element: '', value: 0, cValue: 0 }] }
    ];
    this.storeService.clean(MIX_STORE);
    let stored = {
      mix1: [],
      mix2: []
    }
    this.storeService.push({key: MIX_STORE, data: stored});
  }

  public cancel(): void {
    this.emitter.emit();
  }

  public setElement(value: string, index: number) {
    for (let em of this.endMembers) {
      em.items[index].element = value;
    }
  }

  public confirm(): void {
    this.computeMixing();
  }

  public manageThirdMember() {
    this.include = !this.include;
    this.step = 1;
    if (!this.include) {
      this.endMembers[2].items[0].value = 0;
      this.endMembers[2].items[1].value = 0;
      this.endMembers[2].items[0].cValue = 0;
      this.endMembers[2].items[1].cValue = 0;
      this.labels = [...this.label2];
    } else {
      this.labels = [...this.label3];
    }
  }

  private buildPayload(index: number): Array<Computable> {
    let payload = new Array<Computable>();
    for (let em of this.endMembers) {
      let item = em.items[index];
      if (em.sampleName.length == 0 || item.value === 0)
        continue;
      let c: Computable = {
        endMemberName: em.sampleName,
        elementName: item.element,
        elementValue: '' + item.value,
        row: 0,
        active: true,
        concentration: item.concentration ? item.concentration : '',
        concentrationValue: item.cValue && item.cValue > 0 ? '' + item.cValue : '',
      }
      payload.push(c);
    }
    return payload;
  }

  private computeMixing(): void {
    let payload = this.buildPayload(0);
    let s = this.geoModelsService.mixingModel(payload, this.increment).subscribe(
      (res: any) => {
        console.log(res);
        this.cacheMix(res.results);
        payload = this.buildPayload(1);
        let ss = this.geoModelsService.mixingModel(payload, this.increment).subscribe(
          (res: any) => {
            this.step++;
            console.log(res);
            this.cacheMix(res.results);
            ss.unsubscribe();
          }
        );
        s.unsubscribe();
      }
    );
  }

  private cacheMix(res: any): void {
    if (this.step === 1) {
      let stored = {
        mix1: res,
        mix2: []
      }
      this.storeService.push({ key: MIX_STORE, data: stored });
    } else {
      let stored = this.storeService.get(MIX_STORE);
      stored.mix2 = res;
      this.storeService.push({ key: MIX_STORE, data: stored });
      this.graph = true;
      this.eventGeneratorService.emit({key: STORE_ALERT, content: MIX_STORE});
    }
    // console.log(this.storeService.get(MIX_STORE));
  }

}

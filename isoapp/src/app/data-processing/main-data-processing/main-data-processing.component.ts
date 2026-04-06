import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/common/store.service';
import { Sample } from 'src/app/models/sample';
import { Dataset, DatasetCache } from 'src/app/models/dataset';

export const DATA_GATHERING = '_data_gathering_';
export interface DataGatheringSession {
  samples: Array<Sample>;
  key: string;
  selectedDataset?: Dataset,
  selectedFile?: string;
  selectedSheet?: string;
  header?: Array<string>;
  headerPosition: number;
  endTable: number;
  content?: Array<Array<string>>;
  fields?: Array<string>;
  chems?: Array<string>;
  isotopes?: Array<string>;
  cache?: Array<DatasetCache>;
}

@Component({
  selector: 'app-main-data-processing',
  templateUrl: './main-data-processing.component.html',
  styleUrls: ['./main-data-processing.component.scss']
})
export class MainDataProcessingComponent implements OnInit {

  constructor(private storeService: StoreService, private router: Router) { }

  ngOnInit(): void {
    this.storeService.clean(DATA_GATHERING);
    let session: DataGatheringSession = { samples: new Array<Sample>(), key: '', headerPosition: 0, endTable: 1 };
    this.storeService.push({ key: DATA_GATHERING, data: session });
  }

  public goNext(): void {
    this.router.navigate(['file-list']);    
  }

}

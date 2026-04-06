import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { EXPORT } from 'src/app/shared/components/grid/grid.component';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { Subscription } from 'rxjs';
import { MIXING_CACHE } from 'src/app/geo-modelling/mixing/mixing.component';
import { AuthorService } from 'src/app/services/rest/author.service';
import { CACHE_AUTH } from 'src/app/shared/const';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { AND } from '../common/query-connector/query-connector.component';
import { Matrix } from 'src/app/models/sample';

export const RESET_FILTER = '_RESET_FILTER_';
export const FILTER_KEY = '_FILTER_KEY_';

export interface GeoRegion {
  topLatitude: number;
  topLongitude: number;
  bottomLatitude: number;
  bottomLongitude: number;
}

export interface QueryFilter {
  ref: {connector: string, ref: string};
  authors: {connector: string, authors: string[]};
  keywords: {connector: string, keywords: string[]};
  geo?: {connector: string, geo: GeoRegion};
  year?: {connector: string, year: string};
  matrix?: {connector: string, matrix: Matrix};
}

export function initQueryFilter(): QueryFilter {
  return {ref: {connector: AND, ref: ''}, authors: {connector: AND, authors: []}, keywords: {connector: AND, keywords: []} };
}

@Component({
  selector: 'app-main-db-querying',
  templateUrl: './main-db-querying.component.html',
  styleUrls: ['./main-db-querying.component.scss']
})
export class MainDbQueryingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

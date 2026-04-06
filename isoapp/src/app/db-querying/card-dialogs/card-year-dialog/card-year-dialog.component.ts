import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { AND } from '../../common/query-connector/query-connector.component';


@Component({
  selector: 'app-card-year-dialog',
  templateUrl: './card-year-dialog.component.html',
  styleUrls: ['./card-year-dialog.component.scss']
})
export class CardYearDialogComponent implements OnInit {
  public years: Array<string> = new Array<string>();
  public dataSetYear = '';
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('yearlist') yearlist: ElementRef | undefined;
  private yearList = new Array<string>();

  constructor(private renderer: Renderer2,
    private storeService: StoreService,
    private datasetService: DatasetService) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    console.log(this.queryFilter);
    if (this.queryFilter) {
      this.dataSetYear = this.queryFilter.year ? this.queryFilter.year.year : '';
    }
    this.initCache();
  }

  private initCache(): void {
    this.yearList.length = 0;
    let s = this.datasetService.getYears().subscribe(
      (res: any) => {        
        for (let r of res) {
          this.yearList.push('' + r);
        }
        s.unsubscribe();
      }
    );
  }

  public getYears(): void {
    if (this.dataSetYear.length > 1) {
      Array.from(this.yearlist?.nativeElement.children).forEach(child => {
        this.renderer.removeChild(this.yearlist?.nativeElement, child);
      });
      for (let r of this.yearList) {
        if (r.toLowerCase().indexOf(this.dataSetYear) > -1) {
          const option = this.renderer.createElement('option');
          option.setAttribute('value', r);
          this.renderer.appendChild(this.yearlist?.nativeElement, option);
        }
      }
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    if (!!filter.year) {
      filter.year.year = this.dataSetYear;
    } else {
      filter.year = { connector: AND, year: this.dataSetYear };
    }
    
    this.storeService.push({ key: FILTER_KEY, data: filter });
    this.emitter.emit(CONFIRM);
  }
}

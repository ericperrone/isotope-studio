import { Component, OnInit, OnDestroy } from '@angular/core';
import { STORE_ALERT, StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { EXPORT } from 'src/app/shared/components/grid/grid.component';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { Subscription } from 'rxjs';
import { MIXING_CACHE } from 'src/app/geo-modelling/mixing/mixing.component';
import { AuthorService } from 'src/app/services/rest/author.service';
import { CACHE_AUTH } from 'src/app/shared/const';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { FILTER_KEY, QueryFilter, RESET_FILTER, initQueryFilter } from '../main-db-querying/main-db-querying.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { CONFIRM, ModalParams } from 'src/app/shared/modals/modal-params';
import { MIX_STORE } from 'src/app/geo-modelling/end-members-modal/end-members-modal.component';

@Component({
  selector: 'app-db-filters',
  templateUrl: './db-filters.component.html',
  styleUrls: ['./db-filters.component.scss']
})
export class DbFiltersComponent implements OnInit, OnDestroy {
  public queryDisabled = true;
  private storeAlert: any;
  public spinnerOn = false;
  public filterOn = true;
  public jsonTable = [];
  public jsonHeader = [];
  public gridContent: Array<Array<string>> | undefined;
  private sub: Subscription | undefined;
  public alertMx = false;

  constructor(private storeService: StoreService,
    private modalService: NgbModal,
    private authorService: AuthorService,
    private sampleService: SampleService,
    private datasetService: DatasetService,
    private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.checkStoredVars();
    this.storeAlert = this.eventGeneratorService.on(STORE_ALERT).subscribe(
      evt => {
        // if (MIXING_CACHE === evt.content) {
        //   this.checkStoredVars();
        // }
        if (MIX_STORE === evt.content) {
          this.checkStoredVars();
        }
      }
    );

    this.storeService.push({ key: FILTER_KEY, data: initQueryFilter() });
    this.sub = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => this.filterOn = true
    );

    this.storeService.clean(CACHE_AUTH);
    let s: any = this.authorService.getAuthors().subscribe(
      (res: any) => {
        this.storeService.push({ key: CACHE_AUTH, data: res });
        s.unsubscribe();
      }
    );
    let t: any = this.datasetService.getLinks().subscribe(
      res => t.unsubscribe()
    );
  }

  private checkStoredVars(): void {
    let stored = this.storeService.get(MIX_STORE);
    if (!!stored) {
      this.alertMx = true;
    } else {
      this.alertMx = false;
    }
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (!!this.storeAlert) {
      this.storeAlert.unsubscribe();
    }
  }

  public resetFilters(): void {
    this.eventGeneratorService.emit({ key: RESET_FILTER });
    this.queryDisabled = true;
  }

  public submitQuery(): void {
    // this.storeService.clean(OUT_RESULT);
    let mixCache = this.storeService.get(MIXING_CACHE);
    if (!!mixCache)
      mixCache.outResult = undefined;
    this.storeService.push({ key: MIXING_CACHE, data: mixCache });

    let filter: QueryFilter = this.storeService.get(FILTER_KEY);
    this.spinnerOn = true;
    this.sampleService.mainQueryTable(filter).subscribe(
      (res) => {
        console.log(res);
        // this.jsonHeader = res[0];
        // this.jsonTable = res.slice(1);
        if (res.status === 'success')
          this.gridContent = res.tBody;
        else
          this.gridContent = [];
        this.spinnerOn = false;
        this.filterOn = false;
      }
    );
  }

  public checkFilter(): void {
    let filter: QueryFilter = this.storeService.get(FILTER_KEY);
    console.log(filter);
    if (filter.authors.authors.length > 0 || filter.keywords.keywords.length > 0 || 
      filter.ref.ref.length > 0 || !!filter.geo || !!filter.year || !!filter.matrix) {
      this.queryDisabled = false;
    } else {
      this.queryDisabled = true;
    }
  }

  public export(): void {
    this.eventGeneratorService.emit({ key: EXPORT });
  }

  public onMxCache(): void {
    let params: ModalParams = {headerText: 'Confirm', bodyText: 'Found cached mixing results. Want you clean the cache?'};
    let ref = this.modalService.open(ConfirmComponent, {size: 'sm', backdrop: 'static', centered: true});
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        if (response === CONFIRM) {
          // this.storeService.clean(MIXING_CACHE, this.eventGeneratorService);
          this.storeService.clean(MIX_STORE, this.eventGeneratorService);
        }
      }
    );
  }

}

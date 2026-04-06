import { Component, OnDestroy, OnInit,  } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { GeoParams } from 'src/app/shared/components/geo/geo.component';
import { FILTER_KEY, QueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CANCEL, CONFIRM, DataListItem, ModalParams } from 'src/app/shared/modals/modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { GeorocService } from 'src/app/services/georoc/georoc.service';
import { GeorocData, GeorocFullData, GeorocNative, toGeorocFullData } from 'src/app/models/georoc';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { Subscription } from 'rxjs';
import { PROGRESS_TEXT, PROGRESS_INTERRUPT, ProgressComponent } from 'src/app/shared/modals/progress/progress.component';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { AND, OR } from 'src/app/db-querying/common/query-connector/query-connector.component';
import { Router } from '@angular/router';

const GEO_DATA_LOOP = '_GEO_DATA_LOOP_';

interface FinalReport {
  items: number;
  inserted: number;
  rejected: number;
}

@Component({
  selector: 'app-georoc-by-polygon',
  templateUrl: './georoc-by-polygon.component.html',
  styleUrls: ['./georoc-by-polygon.component.scss']
})
export class GeorocByPolygonComponent implements OnInit, OnDestroy {
  public params: GeoParams = {
    view: {
      center: [1249940, 4953450],
      zoom: 5,
      projection: 'EPSG:3857'
    },
    window: {
      onlyMap: true
    }
  }
  public spinnerOn = false;
  private sampleList = new Array<number>();
  private finalReport: FinalReport = { items: 0, inserted: 0, rejected: 0 };
  private sampleIndex = 0;
  private polygon = new Array<Array<number>>();
  private loop: Subscription | undefined;
  private interrupt: Subscription | undefined;
  private progress: any;

  constructor(private storeService: StoreService,
    private router: Router,
    private eventGeneratorService: EventGeneratorService,
    private georocService: GeorocService,
    private sampleService: SampleService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    let initial: QueryFilter = {
      authors: { connector: AND, authors: [''] },
      keywords: { connector: AND, keywords: ['']},
      ref: { connector: AND, ref: '' },
      geo: {
        connector: AND,
        geo: {
          topLatitude: 0,
          topLongitude: 0,
          bottomLatitude: 0,
          bottomLongitude: 0
        }
      }
    };

    this.storeService.push({ key: FILTER_KEY, data: initial });

    this.interrupt = this.eventGeneratorService.on(PROGRESS_INTERRUPT).subscribe(
      () =>  { 
        this.progress.close();
        this.loop?.unsubscribe();
        this.loop = undefined;
      }
    );

    this.loop = this.eventGeneratorService.on(GEO_DATA_LOOP).subscribe(
      () => {
        this.sampleIndex++;
        if (this.sampleIndex >= this.sampleList.length) {
          this.progress.close();
          // console.log(this.finalReport);

          let listInfo = new Array<DataListItem>();
          listInfo.push({ key: 'Processed', value: '' + this.finalReport.items });
          listInfo.push({ key: 'Inserted', value: '' + this.finalReport.inserted });
          listInfo.push({ key: 'Rejected', value: '' + this.finalReport.rejected + ' (already in database)' });

          let params: ModalParams = {
            headerText: 'Final report',
            list: listInfo
          };

          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = params;
          ref.componentInstance.emitter.subscribe(() => { this.finalReport = { items: 0, inserted: 0, rejected: 0 }; ref.close(); });
        } else {
          this.eventGeneratorService.emit({
            key: PROGRESS_TEXT,
            content: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
          });
          this.importSamples();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.storeService.clean(FILTER_KEY);
    if (!!this.loop) {
      this.loop.unsubscribe();
    }
    if (!!this.interrupt) {
      this.interrupt.unsubscribe();
    }
  }

  public getGeoSelection(event: any): void {
    console.log(event);
    if (event === CONFIRM) {


      let ref = this.modalService.open(ConfirmComponent, { centered: true });
      ref.componentInstance.params = {
        headerText: 'Confirm',
        bodyText: 'Please, confirm the search on the selected recatngle'
      };
      ref.componentInstance.emitter.subscribe(
        (response: string) => {
          ref.close();
          if (response === CONFIRM) {
            this.getSamplesList();
          }
        }
      );
    }
  }

  private getSamplesList(): void {
    let params = this.storeService.get(FILTER_KEY);
    console.log(params);
    this.setPolygon(params);
    this.spinnerOn = true;
    let sub = this.georocService.getSampleByPolygon(this.polygon).subscribe(
      (res: Array<number>) => {
        console.log(res);
        this.sampleList.length = 0;
        for (let r of res) {
          this.sampleList.push(r);
        }
        this.spinnerOn = false;
        this.finalReport.items = res.length;
        let ref = this.modalService.open(ConfirmComponent, { centered: true });
        ref.componentInstance.params = {
          headerText: 'Confirm',
          bodyText: 'Found ' + res.length + ' items. Please confirm data import.'
        };
        let sub2 = ref.componentInstance.emitter.subscribe(
          (response: string) => {
            ref.close();
            sub2.unsubscribe();
            if (response === CONFIRM) {
              this.sampleIndex = 0;
              this.progress = this.modalService.open(ProgressComponent, { centered: true, backdrop: 'static' });
              ref.componentInstance.params = {
                bodyText: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
              }
              this.importSamples();
            }
          }
        );
        sub.unsubscribe();
      }
    );
  }

  private setPolygon(params: QueryFilter): void {
    if (!!params.geo) {
      this.polygon.length = 0;
      this.polygon.push([params.geo.geo.topLongitude, params.geo.geo.topLatitude]);
      this.polygon.push([params.geo.geo.bottomLongitude, params.geo.geo.topLatitude]);
      this.polygon.push([params.geo.geo.bottomLongitude, params.geo.geo.bottomLatitude]);
      this.polygon.push([params.geo.geo.topLongitude, params.geo.geo.bottomLatitude]);
      this.polygon.push([params.geo.geo.topLongitude, params.geo.geo.topLatitude]);
    }
  }

  private importSamples(): void {
    if (this.sampleIndex >= this.sampleList.length) {
      console.log(this.finalReport);
      return;
    }
    let sampleData = this.georocService.getSampleFullData(this.sampleList[this.sampleIndex]).subscribe(
      (res: GeorocData) => {
        console.log(res);
        let fullData: GeorocFullData = toGeorocFullData(res);
        console.log(fullData);
        let s = this.sampleService.insertFullData(fullData).subscribe(
          (res: any) => {
            console.log(res);
            let r = parseInt(res.result);
            if (r === 1) {
              this.finalReport.inserted++;
            } else {
              this.finalReport.rejected++;
            }
            s.unsubscribe();
            this.eventGeneratorService.emit({ key: GEO_DATA_LOOP });
          }
        );
        sampleData.unsubscribe();
      }
    );
  }
}

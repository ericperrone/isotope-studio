import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { GeoComponent } from 'src/app/shared/components/geo/geo.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER, initQueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { Subscription } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';

@Component({
  selector: 'app-card-geo',
  templateUrl: './card-geo.component.html',
  styleUrls: ['./card-geo.component.scss']
})
export class CardGeoComponent implements OnInit, OnDestroy {
  public startLatitude = '';
  public startLongitude = '';
  public endLatitude = '';
  public endLongitude = '';
  public disabled = true;
  public queryFilter: QueryFilter = initQueryFilter();
  private sub: Subscription | undefined;
  private subModal: Subscription | undefined;
  private ref: any;

  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private decimalPipe: DecimalPipe, private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.resetFields();
        this.queryFilter.geo = undefined;
      }
    );

    this.subModal = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => {
        if (!!this.ref) {
          this.ref.close();
        }
      }
    );
  }

  public setConnector(event: any) {
    if (!this.queryFilter.geo) {
      this.queryFilter.geo = { connector: 'AND', geo: {bottomLatitude: 0, bottomLongitude: 0, topLatitude: 0, topLongitude: 0}}
      this.queryFilter.geo.connector = event;
    } else {
      this.queryFilter.geo.connector = event;
    }
    this.storeService.push({key: FILTER_KEY, data: this.queryFilter});
    this.emitter.emit(true);
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (!!this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  public editCard(): void {
    this.ref = this.modalService.open(GeoComponent, { fullscreen: true });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.resetFields();
        const fractionDigits = 4;
        const digitsInfo = `1.${fractionDigits}-${fractionDigits}`;
        this.startLatitude = '' + this.decimalPipe.transform(this.queryFilter.geo?.geo.topLatitude, digitsInfo);
        this.startLongitude = '' + this.decimalPipe.transform(this.queryFilter.geo?.geo.topLongitude, digitsInfo);
        this.endLatitude = '' + this.decimalPipe.transform(this.queryFilter.geo?.geo.bottomLatitude, digitsInfo);
        this.endLongitude = '' + this.decimalPipe.transform(this.queryFilter.geo?.geo.bottomLongitude, digitsInfo);
        this.emitter.emit(true);
      }
      this.ref.close()
    });

  }


  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.resetFields();
    this.queryFilter.geo = undefined;
    this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
    this.emitter.emit(true);
  }

  private resetFields(): void {
    this.startLatitude = '';
    this.startLongitude = '';
    this.endLatitude = '';
    this.endLongitude = '';
  }
}

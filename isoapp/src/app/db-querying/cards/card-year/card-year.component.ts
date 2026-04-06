import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER, initQueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CardRefDialogComponent } from '../../card-dialogs/card-ref-dialog/card-ref-dialog.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { Subscription } from 'rxjs';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { AND } from '../../common/query-connector/query-connector.component';
import { CardYearDialogComponent } from '../../card-dialogs/card-year-dialog/card-year-dialog.component';


@Component({
  selector: 'app-card-year',
  templateUrl: './card-year.component.html',
  styleUrls: ['./card-year.component.scss']
})
export class CardYearComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = initQueryFilter();
  public disabled = true;
  public year = '';
  private sub: Subscription | undefined;
  private subModal: Subscription | undefined;
  private ref: any;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.resetFilter();
      }
    );
    this.subModal = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () =>  {
        if (!!this.ref) {
          this.ref.close();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (!!this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  public setConnector(event: any) {
    if (!!this.queryFilter.year) {
      this.queryFilter.year.connector = event;
    } else {
      this.queryFilter.year = { connector: event, year: this.year };
    }
    this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
  }

  public editCard(): void {
    this.ref = this.modalService.open(CardYearDialogComponent, { centered: true });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.year = this.queryFilter.year?.year ? this.queryFilter.year?.year : '';
        this.emitter.emit(true);
      }
      this.ref.close();
    });
   }

  public setYear(): void {
    if (this.year.length < 1) {
      this.queryFilter.year = undefined;
    } else {
      if (!!this.queryFilter.year) {
        this.queryFilter.year.year = this.year;
      } else {
        this.queryFilter.year = { connector: AND, year: this.year };
      }
      this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
    }
  }

  public resetFilter(): void {
    this.year = '';
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.year = undefined;
    this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
    this.emitter.emit(true);
  }
}

import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER, initQueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CardRefDialogComponent } from '../../card-dialogs/card-ref-dialog/card-ref-dialog.component';
import { CANCEL, CONFIRM } from 'src/app/shared/modals/modal-params';
import { Subscription } from 'rxjs';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { RefDialogComponent } from '../../ref-dialog/ref-dialog.component';

@Component({
  selector: 'app-card-ref',
  templateUrl: './card-ref.component.html',
  styleUrls: ['./card-ref.component.scss']
})
export class CardRefComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = initQueryFilter();
  public disabled = true;
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
        this.queryFilter.ref.ref = '';
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
    this.queryFilter.ref.connector = event;
  }

  public editCard(): void {
    this.ref = this.modalService.open(CardRefDialogComponent, { centered: true });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.emitter.emit(true);
      }
      this.ref.close();
    });
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.ref.ref = '';
    this.storeService.push({key: FILTER_KEY, data: this.queryFilter});    
    this.emitter.emit(true);
  }

  public getRef(): void {
    this.ref = this.modalService.open(RefDialogComponent, { centered: true, size: 'xl' });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result !== CANCEL) {
        this.queryFilter.ref.ref = result;
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.emitter.emit(true);
      }
      this.ref.close();
    });   
  }
}

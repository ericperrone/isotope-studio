import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { StoreService } from 'src/app/services/common/store.service';
import { FILTER_KEY, initQueryFilter, QueryFilter, RESET_FILTER } from '../../main-db-querying/main-db-querying.component';
import { Subscription } from 'rxjs';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { CardMatrixDialogComponent } from '../../card-dialogs/card-matrix-dialog/card-matrix-dialog.component';
import { Matrix } from 'src/app/models/sample';

@Component({
  selector: 'app-card-matrix',
  templateUrl: './card-matrix.component.html',
  styleUrls: ['./card-matrix.component.scss']
})
export class CardMatrixComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = initQueryFilter();
  public disabled = true;
  public matrix: Matrix = { matrix: '', nodeId: 0 };
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  private sub: Subscription | undefined;
  private subModal: Subscription | undefined;
  private ref: any;

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.matrix = { matrix: '', nodeId: 0 };
        this.queryFilter.matrix = undefined;
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

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  public editCard(): void {
    this.ref = this.modalService.open(CardMatrixDialogComponent, { centered: true });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.matrix = this.queryFilter.matrix ? this.queryFilter.matrix.matrix : { matrix: '', nodeId: 0 };;

      }
      console.log(this.queryFilter);
      this.ref.close()
      this.emitter.emit(true);
    });
  }

  public setConnector(event: any) {
    if (this.queryFilter.matrix)
      this.queryFilter.matrix.connector = event;
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.matrix = undefined;
    this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
    this.matrix = { matrix: '', nodeId: 0 };;
    this.emitter.emit(true);
  }
}

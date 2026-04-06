import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER, initQueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { CardAuthorsDialogComponent } from '../../card-dialogs/card-authors-dialog/card-authors-dialog.component';
import { Subscription } from 'rxjs';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';

@Component({
  selector: 'app-card-authors',
  templateUrl: './card-authors.component.html',
  styleUrls: ['./card-authors.component.scss']
})
export class CardAuthorsComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = initQueryFilter();
  public disabled = true;
  public authors = '';
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
        this.authors = '';
        this.queryFilter.authors.authors = [];
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
    if (!!this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  public editCard(): void {
    this.ref = this.modalService.open(CardAuthorsDialogComponent, { centered: true });
    this.ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.authors = '';
        for (let key of this.queryFilter.authors.authors) {
          this.authors += key + ';';
        }
        this.authors = this.authors.trim();
        this.authors = this.authors.substring(0, this.authors.length - 1);
        this.emitter.emit(true);
      }
      this.ref.close()
    });
  }

  public setConnector(event: any) {
    this.queryFilter.authors.connector = event;
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.authors.authors = [];
    this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
    this.authors = '';
    this.emitter.emit(true);
  }

}

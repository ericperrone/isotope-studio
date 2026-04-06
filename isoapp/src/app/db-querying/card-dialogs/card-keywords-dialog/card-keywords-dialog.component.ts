import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { distinct } from 'src/app/shared/tools';

@Component({
  selector: 'app-card-keywords-dialog',
  templateUrl: './card-keywords-dialog.component.html',
  styleUrls: ['./card-keywords-dialog.component.scss']
})
export class CardKeywordsDialogComponent implements OnInit {
  public keywords = '';
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    console.log(this.queryFilter);
    if (!!this.queryFilter) {
      for (let k of this.queryFilter.keywords.keywords) {
        this.keywords += k + ' ';
      }
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    // let filter = this.storeService.get(FILTER_KEY);
    let temp = this.keywords.split(' ');
    temp = distinct(temp);
    if (this.queryFilter) {
      this.queryFilter.keywords.keywords = [];
      for (let t of temp) {
        if (t.length > 0)
        this.queryFilter.keywords.keywords.push(t);
      }
      this.storeService.push({ key: FILTER_KEY, data: this.queryFilter });
      this.emitter.emit(CONFIRM);
    }
  }
}

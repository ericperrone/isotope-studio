import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CANCEL, CONFIRM } from '../modal-params';

export interface ThesauriKeys {
  status: string;
  selected?: Array<string>;
}

@Component({
  selector: 'app-thesaurus',
  templateUrl: './thesaurus.component.html',
  styleUrls: ['./thesaurus.component.scss']
})
export class ThesaurusComponent implements OnInit {
  @Input() params: any;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public keys = new Array<string>();
  public page = 1;
  public pageSize = 10;
  public collectionSize = 0;
  public tableContent: Array<any> = new Array<any>();
  public ready = false;
  public selectedRow = -1;
  public selectedRowContent: any;

  constructor() {
  }

  ngOnInit(): void {
    this.collectionSize = this.params.data.length;
    console.log(this.params);
    let r = this.params.data[0];
    for (let key in r) {
      console.log('key: ' + key + ' value: ' + r[key]);
      this.keys.push(key);
    }
    this.refreshTable();
  }

  public refreshTable(): void {
    this.ready = false;
    this.tableContent = new Array<any>();
    for (let i = 0; i < this.pageSize; i++) {
      this.tableContent.push(this.params.data[this.page * this.pageSize + i - 1]);
    }
    console.log(this.tableContent);
    this.ready = true;
  }

  public close(): void {
    this.emitter.emit({status: CANCEL});
  }

  public select(): void {
    this.emitter.emit({status: CONFIRM, selected: this.selectedRowContent});
  }

  public onClick(row: any, i: number) {
    if (this.selectedRow === i) {
      this.selectedRow = -1;
      this.selectedRowContent = undefined;
    } else {
      this.selectedRow = i;
      this.selectedRowContent = row;
    }
  }

}

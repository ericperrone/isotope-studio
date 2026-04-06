import { Component, EventEmitter, OnInit } from '@angular/core';
import { DatesetFullLink } from 'src/app/models/dataset';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { CANCEL } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-ref-dialog',
  templateUrl: './ref-dialog.component.html',
  styleUrls: ['./ref-dialog.component.scss']
})
export class RefDialogComponent implements OnInit {
  public emitter = new EventEmitter<string>();
  public data: Array<DatesetFullLink>   = new Array<DatesetFullLink>();
  public ready = false;

  constructor(private datasetService: DatasetService) { }

  ngOnInit(): void {
    let s = this.datasetService.getLinksFull().subscribe(
      (res: any) => {
        this.data = res;
        console.log(res);
        s.unsubscribe();
        this.ready = true;
      }
    )
  }

  public selectRef(ref: string) {
    this.emitter.emit(ref);
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

}

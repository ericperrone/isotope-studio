import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Dataset } from 'src/app/models/dataset';
import { DatasetService } from 'src/app/services/rest/dataset.service';

@Component({
  selector: 'app-dataset-modal',
  templateUrl: './dataset-modal.component.html',
  styleUrls: ['./dataset-modal.component.scss']
})
export class DatasetModalComponent implements OnInit {
  @Input() params: Dataset | undefined;
  @Output() emitter = new EventEmitter<any>();
  public dataset: Dataset = {
    ref: '',
    authors: '',
    fileName: '',
    keywords: '',
    metadata: '',
    processed: false,
    year: 0,
    id: 0
  }

  constructor(private datasetService : DatasetService) { }

  ngOnInit(): void {
    if (!!this.params) {
      console.log(this.params);
      this.dataset = this.params;
    }
  }

  public cancel(): void {
    this.emitter.emit('Cancel');
  }

  public save(): void {
    let s = this.datasetService.updateDataset(this.dataset).subscribe(
      (res: any) => {
        s.unsubscribe();
        this.emitter.emit('Ok');
      }
    );
    
  }
}

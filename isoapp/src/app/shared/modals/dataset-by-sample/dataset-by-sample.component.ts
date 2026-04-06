import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CANCEL, ModalParams } from '../modal-params';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { Dataset } from 'src/app/models/dataset';

@Component({
  selector: 'app-dataset-by-sample',
  templateUrl: './dataset-by-sample.component.html',
  styleUrls: ['./dataset-by-sample.component.scss']
})
export class DatasetBySampleComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public dataset: Dataset | undefined;

  constructor(private datasetService: DatasetService) { }

  ngOnInit(): void {
    if (!!this.params && !!this.params.id) {
      const s = this.datasetService.getDatasetBySample(this.params?.id).subscribe(
        (res: any) => {
          // console.log(res);
          s.unsubscribe();
          this.dataset = {
            id: res.id,
            ref: res.ref,
            metadata: res.metadata,
            year: res.year,
            fileName: '',
            processed: true,
            keywords: res.keywords,
            authors: res.authors
          }

          if (!this.dataset.ref.startsWith('https://doi.org/')) {
            this.dataset.ref = 'https://doi.org/' + this.dataset.ref;
          }
        }
      );
    }
  }

  public close(): void {
    this.emitter.emit(CANCEL);
  }

}

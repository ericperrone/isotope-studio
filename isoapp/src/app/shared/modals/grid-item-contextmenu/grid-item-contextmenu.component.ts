import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams, ExclusiveChoice, CONFIRM, CANCEL } from '../modal-params';
import { SampleService } from 'src/app/services/rest/sample.service';


@Component({
  selector: 'app-grid-item-contextmenu',
  templateUrl: './grid-item-contextmenu.component.html',
  styleUrls: ['./grid-item-contextmenu.component.scss']
})
export class GridItemContextmenuComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public um = '';
  public technique = '';
  public uncertainty = '';
  public uncertaintyType = '';
  public refstd = '';
  public id = 0;

  constructor(private sampleService: SampleService) { }

  ngOnInit(): void {
    let s = this.sampleService.getSampleAttribute(parseInt('' + this.params?.id), '' + this.params?.headerText).subscribe(
      (res: any) => {
        s.unsubscribe();
        console.log(res);
        if (!!res.id && res.id > 0) {
          this.id = res.id;
          this.um = res.um ? res.um : '';
          this.technique = res.technique ? res.technique : '';
          this.uncertainty = res.uncertainty ? res.uncertainty : '';
          this.uncertaintyType = res.uncertaintyType ? res.uncertaintyType : '';
          this.refstd = res.refstd ? res.refstd : '';
        }
      }
    );
  }

  public emit(value: string) {
    this.emitter.emit(value);
  }

}

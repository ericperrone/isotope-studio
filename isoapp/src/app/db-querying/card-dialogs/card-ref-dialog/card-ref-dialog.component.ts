import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { DatasetService } from 'src/app/services/rest/dataset.service';

@Component({
  selector: 'app-card-ref-dialog',
  templateUrl: './card-ref-dialog.component.html',
  styleUrls: ['./card-ref-dialog.component.scss']
})
export class CardRefDialogComponent implements OnInit {
  public links: Array<string> = new Array<string>();
  public dataSetRef = '';
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('linklist') linklist: ElementRef | undefined;
  private refList = new Array<string>();

  constructor(private renderer: Renderer2,
    private storeService: StoreService,
    private datasetService: DatasetService) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    console.log(this.queryFilter);
    if (this.queryFilter) {
      this.dataSetRef = this.queryFilter.ref.ref;
    }
    this.initCache();
  }

  private initCache(): void {
    this.refList.length = 0;
    let s = this.datasetService.getLinks().subscribe(
      (res: any) => {
        console.log(res);
        for (let r of res) {
          this.refList.push(r);
        }
        // s.unsubscribe();
      }
    );
  }

  public getLinks() {
    if (this.dataSetRef.length > 1) {
      Array.from(this.linklist?.nativeElement.children).forEach(child => {
        this.renderer.removeChild(this.linklist?.nativeElement, child);
      });
      for (let r of this.refList) {
        if (r.toLowerCase().indexOf(this.dataSetRef) > -1) {
          const option = this.renderer.createElement('option');
          option.setAttribute('value', r);
          this.renderer.appendChild(this.linklist?.nativeElement, option);
        }
      }

      // let s = this.datasetService.getLinks(this.dataSetRef).subscribe(
      //   (res: any) => {
      //     Array.from(this.linklist?.nativeElement.children).forEach(child => {
      //       this.renderer.removeChild(this.linklist?.nativeElement, child);
      //     });
      //     for (let r of res) {
      //       const option = this.renderer.createElement('option');
      //       option.setAttribute('value', r);
      //       this.renderer.appendChild(this.linklist?.nativeElement, option);
      //     }
      //     s.unsubscribe();
      //   }
      // );
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    filter.ref.ref = this.dataSetRef;
    this.storeService.push({ key: FILTER_KEY, data: filter });
    this.emitter.emit(CONFIRM);
  }
}

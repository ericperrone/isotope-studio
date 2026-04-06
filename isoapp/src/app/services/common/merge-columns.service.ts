import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridItem } from 'src/app/shared/components/grid/grid.component';
import { MergeColumnsComponent } from 'src/app/shared/components/merge-columns/merge-columns.component';

@Injectable({
  providedIn: 'root'
})
export class MergeColumnsService {
  public ref: any;

  constructor(private modalService: NgbModal) { }

  public open(selectedCols: Array<Array<GridItem>>, caller: any): void {
    this.ref = this.modalService.open(MergeColumnsComponent, { centered: true, backdrop: 'static', size: 'xl' });
    this.ref.componentInstance.params = { content:  selectedCols};
    let s = this.ref.componentInstance.emitter.subscribe(
      (res: any) => {
        console.log(res);
        if ('confirm' === res) {
          caller.redraw(selectedCols);
        }
        this.ref.close();
        s.unsubscribe();
      }
    );

  }
}

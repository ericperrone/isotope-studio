import { Component, EventEmitter, OnInit } from '@angular/core';
import { CANCEL, CONFIRM } from 'src/app/shared/modals/modal-params';
import { FILTER_KEY, QueryFilter } from '../../main-db-querying/main-db-querying.component';
import { StoreService } from 'src/app/services/common/store.service';
import { AND } from '../../common/query-connector/query-connector.component';
import { MatrixService } from 'src/app/services/rest/matrix.service';
import { Matrix } from 'src/app/models/sample';

@Component({
  selector: 'app-card-matrix-dialog',
  templateUrl: './card-matrix-dialog.component.html',
  styleUrls: ['./card-matrix-dialog.component.scss']
})
export class CardMatrixDialogComponent implements OnInit {
  public emitter: EventEmitter<any> = new EventEmitter<any>();
  public selectedMatrix: Matrix = { matrix: '', nodeId: 0 };
  public activeMatrices: Array<Matrix> = new Array<Matrix>();
  public ready = false;
  public backDisabled = true;
  public forwardDisabled = true;

  constructor(private storeService: StoreService,
    private matrixService: MatrixService
  ) { }

  ngOnInit(): void {
    this.initMatrices();
  }

  public back(): void {
    this.getParent();
  }

  public forward(): void {
    this.forwardDisabled = true;
    this.getChildren();
  }

  public select(item: Matrix): void {
    for (let x of this.activeMatrices) {
      x.selected = undefined;
    }
    item.selected = true;
    this.selectedMatrix = item;
    this.forwardDisabled = false;
    this.getChildren();
    if (this.selectedMatrix.parentNodeId && this.selectedMatrix.parentNodeId > 0) {
      this.backDisabled = false;
    } else {
      this.backDisabled = true;
    }
  }

  public cancel(): void {
    this.emitter.emit(CANCEL);
  }

  public confirm(): void {
    let filter: QueryFilter = this.storeService.get(FILTER_KEY);
    if (!filter.matrix) {
      filter.matrix = { connector: AND, matrix: this.selectedMatrix };
    } else {
      filter.matrix.matrix = this.selectedMatrix;
    }
    this.storeService.push({ key: FILTER_KEY, data: filter });
    this.emitter.emit(CONFIRM);
  }

  private initMatrices(): void {
    this.selectedMatrix = { matrix: '', nodeId: 0 };
    this.backDisabled = true;
    this.activeMatrices = new Array<Matrix>();
    this.ready = false;
    let s = this.matrixService.getRoots().subscribe(
      (res: any) => {
        this.activeMatrices = res;
        this.ready = true;
        s.unsubscribe();
      }
    );
  }

  private getChildren(): void {
    this.activeMatrices = new Array<Matrix>();
    this.ready = false;
    let s = this.matrixService.getChildren(this.selectedMatrix.nodeId).subscribe(
      (res: any) => {
        this.activeMatrices = res;
        this.ready = true;
        this.backDisabled = false;
        if (this.activeMatrices.length === 0) {
          this.forwardDisabled = true;
        }
        s.unsubscribe();
      }
    );
  }

  private getParent(): void {
    this.activeMatrices = new Array<Matrix>();
    if (this.selectedMatrix.parentNodeId && this.selectedMatrix.parentNodeId > 0) {
      this.ready = false;
      let s = this.matrixService.getNode(this.selectedMatrix.parentNodeId).subscribe(
        (res: any) => {
          if (res.length === 0) {
            this.initMatrices();
          } else {
            this.selectedMatrix = res;
            this.getChildren();
            s.unsubscribe();
          }
        }
      );
    } else {
      this.initMatrices();
    }
  }
}

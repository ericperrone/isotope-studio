import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { GridItem } from '../grid/grid.component';
import { CANCEL, CONFIRM } from '../../modals/modal-params';
import { mergeCols, update } from '../../tools';

@Component({
  selector: 'app-merge-columns',
  templateUrl: './merge-columns.component.html',
  styleUrls: ['./merge-columns.component.scss']
})
export class MergeColumnsComponent implements OnInit {
  @Input('selectedCols') params: any;
  public emitter = new EventEmitter<any>();
  public tabella = new Array<Array<GridItem>>();
  public mergeable = false;
  public message = '';
  public step = 1;

  constructor() { }

  ngOnInit(): void {
    console.log(this.params);
    this.initTabella();
    if (this.params && this.params.content) {
      let RL = this.params.content[0].length;
      for (let c = 0; c < this.params.content.length; c++) {
        for (let r = 0; r < RL; r++) {
          this.tabella[r][c] = { ...this.params.content[c][r] };
        }
      }
    }
    console.log(this.tabella);
    // this.tabella = this.params.content;
  }

  private initTabella(): void {
    let RL = this.params.content[0].length
    for (let i = 0; i < RL; i++) {
      let riga = new Array<GridItem>();
      for (let j = 0; j < this.params.content.length; j++) {
        riga.push({ header: false, visible: false, selected: false, row: i, col: j, content: '', check: false, type: '' })
      }
      this.tabella.push(riga);
    }
    this.checkTabella();
  }

  public cancel(): void {
    this.emitter.emit(CANCEL);
  }

  public confirm(): void {
    let nRighe = this.tabella.length;
    let nColonne = this.tabella[0].length;

    for (let j = 0; j < nColonne; j++) {
      for (let i = 0; i < nRighe; i++) {
        this.update(this.tabella[i][j]);
      }
    }
    console.log(this.tabella);
    console.log(this.params);

    this.emitter.emit(CONFIRM);
  }

  private update(item: GridItem): void {
    let r = item.row;
    let c = item.col;

    let X = this.params.content.length;
    let Y = this.params.content[0].length;

    for (let i = 0; i < X; i++) {
      for (let j = 0; j < Y; j++) {
        if (this.params.content[i][j].row == r && this.params.content[i][j].col == c) {
          this.params.content[i][j].visible = item.visible;
          this.params.content[i][j].content = item.content;
        }
      }
    }
    // let element = this.find(r, c);
    // if (!!element) {
    //   element = item;
    // }
  }

  private find(r: number, c: number): GridItem | undefined {
    let X = this.params.content.length;
    let Y = this.params.content[0].length;

    for (let i = 0; i < X; i++) {
      for (let j = 0; j < Y; j++) {
        if (this.params.content[i][j].row == r && this.params.content[i][j].col == c)
          return this.params.content[i][j];
      }
    }

    return undefined;
  }

  private checkTabella(): void {
    let table = this.params.content;
    for (let r = 1; r < table[0].length; r++) {
      let p = 1;
      for (let c = 0; c < table.length; c++) {
        // console.log('Content: ' + table[r][c].content);
        p *= table[c][r].content.length;
      }
      if (p > 0) {
        this.mergeable = false;
        this.message = 'These columns can\'t be merged';
        return;
      }
    }
    this.message = 'Click the header of the column you want to merge the others into';
    this.mergeable = true;
  }

  public onClick(c: GridItem): void {
    if (c.header == false || this.mergeable == false)
      return;
    this.preview(c);
  }

  private preview(c: GridItem): void {
    let cols = new Array<number>();
    for (let t of this.tabella) {
      for (let tt of t) {
        if (tt.col != c.col && cols.find((element) => (element == tt.col)) == undefined) {
          cols.push(tt.col);
        }
      }
    }
    this.message = 'Press the confirmation button to merge columns';
    this.tabella = mergeCols(this.tabella, c.col, cols);
    this.step = 2;
  }

}

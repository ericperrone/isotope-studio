import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectBoxComponent } from '../../modals/select-box/select-box.component';
import { CANCEL, DataListItem, ModalParams } from '../../modals/modal-params';
import { saveCsvFile } from '../../tools';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';
import { GeoModelService, GeoModel, EndMemberItem } from 'src/app/services/common/geo-model.service';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { DataPlottingSeriesComponent } from '../../modals/data-plotting-series/data-plotting-series.component';
import { EndMembersModalComponent } from 'src/app/geo-modelling/end-members-modal/end-members-modal.component';
import { GridItemContextmenuComponent } from '../../modals/grid-item-contextmenu/grid-item-contextmenu.component';
import { DatasetBySampleComponent } from '../../modals/dataset-by-sample/dataset-by-sample.component';
import { SampleService } from 'src/app/services/rest/sample.service';
import { MergeColumnsService } from 'src/app/services/common/merge-columns.service';

const ALT = 'Alt';

export interface GridItemInfo {
  um?: string;
  uncertainty?: string;
  technique?: string;
  uncertaintyType?: string;
}

export interface GridItem {
  header: boolean;
  visible: boolean;
  selected: boolean;
  row: number;
  col: number;
  content: any;
  check: boolean;
  type: string;
  info?: GridItemInfo;
}

export interface ComputableGridItem {
  element: string;
  row: number;
  col: number;
  type: string;
  value: number;
  um?: string;
}

export function gridItem2Computable(gi: GridItem, element: string): ComputableGridItem {
  let cgi: ComputableGridItem = { element: '', row: -1, col: -1, type: '', value: -1 };
  if (!gi.header && gi.type !== 'F') {
    cgi.element = element;
    cgi.row = gi.row;
    cgi.col = gi.col;
    cgi.type = gi.type;
    if (gi.content.indexOf(' [') > 0) {
      let value = gi.content.substring(0, gi.content.indexOf(' ['));
      let um = gi.content.substring(gi.content.indexOf('[') + 1, gi.content.indexOf(']'));
      cgi.value = parseFloat(value);
      cgi.um = um;
    } else {
      cgi.value = parseFloat(gi.content);
    }
  }
  return cgi;
}

export const EXPORT = '_EXPORT_';
const GRID_LOOP = '_GRID_LOOP_';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy, OnChanges {
  @HostListener('body:keydown', ['$event'])
  manageKeyDown(event: any) {
    // console.log(event);
    // event.preventDefault();
    if (event.key === ALT) {
      this.AltKey = 1;
    }
    // console.log(event);
  }

  @HostListener('body:keyup', ['$event'])
  manageKeyUp(event: any) {
    // console.log(event);
    // event.preventDefault();
    if (event.key === ALT) {
      this.AltKey = 0;
    }
    // console.log(event);
  }

  @Input() gridContent: Array<Array<string>> | undefined;
  public dataset: Array<Array<string>> | undefined;
  public gridHeader = new Array<GridItem>();
  public selectedCols = new Array<number>();
  public selectedRowsIndex = new Array<number>();
  private originalHeader = new Array<string>();
  public gridCols = new Array<Array<GridItem>>();
  public gridRows = new Array<Array<GridItem>>();
  public screenRows = new Array<Array<GridItem>>();
  public gridCacheRows = new Array<Array<GridItem>>();
  public tableOn = false;
  public deleteFlag = false;
  private sub: Subscription | any;
  private subClose: Subscription | any;
  private ref: any;
  @ViewChild('maingrid') authlist: ElementRef | undefined;
  @ViewChild('gridbody') gridbody: ElementRef | undefined;
  public limit = 60;
  public index = 0;
  public table = new Array<Array<string>>();
  public downOk = true;
  public spinSelect = false;
  public spinDeselect = false;
  private firstSelection = -1;
  private AltKey = 0;

  constructor(private modalService: NgbModal,
    private mergeService: MergeColumnsService,
    private sampleService: SampleService,
    private eventGeneratorService: EventGeneratorService,
    private geoModelService: GeoModelService) { }

  ngOnInit(): void {
    this.sub = this.eventGeneratorService.on(EXPORT).subscribe(
      () => {
        if (!!this.gridHeader && this.gridHeader.length > 0) {
          saveCsvFile(this.buildCsv());
        }
      }
    );

    this.subClose = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => {
        if (!!this.ref) {
          this.ref.close();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (!!this.subClose) {
      this.subClose.unsubscribe();
    }
  }

  public redraw(selectedCols: Array<Array<GridItem>>): void {
    console.log('redraw');
    console.log(selectedCols);
    this.tableOn = false;

    for (let s of selectedCols) {
      for (let r of s) {
        if (r.header === true) {
          this.gridHeader[r.col].selected = false;
          this.gridHeader[r.col].visible = r.visible;
        } else {
          this.gridRows[r.row - 1][r.col].selected = false;
          this.gridRows[r.row - 1][r.col].visible = r.visible;
          this.gridRows[r.row - 1][r.col].content = r.content;
        }
      }
    }

    this.selectedCols.length = 0;

    setTimeout(() => {
      this.tableOn = true;
    }, 100);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.downOk = true;
    this.dataset = changes['gridContent'].currentValue;
    this.build(changes['gridContent'].currentValue);
  }

  public build(gridContent: Array<Array<string>>): void {
    if (!gridContent || gridContent.length <= 0) {
      return;
    }
    this.tableOn = false;
    this.index = 0;
    this.reset();

    this.originalHeader = gridContent[0];
    let header = new Array<string>();
    for (let oh of this.originalHeader) {
      let p = oh.indexOf('\\');
      if (p > 0) {
        header.push(oh.substring(2));
      }
    }

    this.table = gridContent.slice(1);
    this.gridCols[0] = new Array<GridItem>();

    let initialSize = this.limit > this.table.length ? this.table.length : this.limit;

    for (let i = 0; i < header.length; i++) {
      let type = this.originalHeader[i].charAt(0);
      let gridItem: GridItem = { header: true, visible: true, selected: false, row: 0, col: i, content: header[i], check: false, type: type };
      this.gridHeader.push(gridItem);
      this.gridCols[i] = new Array<GridItem>();
      this.gridCols[i][0] = gridItem;
    }

    for (let r = 0; r < initialSize; r++) {
      this.gridRows[r] = new Array<GridItem>();
      this.screenRows[r] = new Array<GridItem>();
      for (let c = 0; c < this.table[r].length; c++) {
        let type = this.originalHeader[c].charAt(0);
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: this.table[r][c], check: false, type: type };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
        this.screenRows[r][c] = gridItem;
      }
    }

    for (let r = initialSize; r < this.table.length; r++) {
      this.gridRows[r] = new Array<GridItem>();
      for (let c = 0; c < this.table[r].length; c++) {
        let type = this.originalHeader[c].charAt(0);
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: this.table[r][c], check: false, type: type };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
      }
    }

    this.gridCacheRows = [...this.gridRows];
    if (this.gridRows.length <= this.limit) {
      this.downOk = false;
    }

    if (this.screenRows.length < this.limit) {
      let lgt = this.screenRows.length;
      for (let r = lgt; r < this.limit; r++) {
        this.screenRows[r] = new Array<GridItem>();
        for (let c = 0; c < this.originalHeader.length; c++) {
          let type = this.originalHeader[c].charAt(0);
          let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: '', check: false, type: type };
          this.screenRows[r][c] = gridItem;
        }
      }
    }

    this.tableOn = true;
  }

  public up(): void {
    this.tableOn = false;
    this.downOk = true;
    this.index -= this.limit;
    if (this.index < 0) {
      this.index = 0;
    }
    let size = this.index + this.limit;
    this.screenRows.length = 0;
    for (let r = this.index; r < size; r++) {
      this.screenRows[r - this.index] = this.gridCacheRows[r];
    }
    this.tableOn = true;
  }

  public down(): void {
    this.tableOn = false;
    this.index += this.limit;
    let size = this.index + this.limit;
    if (size > this.gridCacheRows.length) {
      size = this.gridCacheRows.length;
      this.downOk = false;
    }
    this.screenRows.length = 0;
    for (let r = this.index; r < size; r++) {
      this.screenRows[r - this.index] = this.gridCacheRows[r];
    }
    this.tableOn = true;
  }

  private reset(): void {
    this.gridHeader = new Array<GridItem>();
    this.gridCols = new Array<Array<GridItem>>();
    this.gridRows = new Array<Array<GridItem>>();
    this.selectedCols = new Array<number>();
    this.selectedRowsIndex = new Array<number>();
    this.gridCacheRows = new Array<Array<GridItem>>();
    this.screenRows = new Array<Array<GridItem>>();
  }

  public onRightClick(gi: GridItem, event: any) {
    event.preventDefault();
    console.log(this.originalHeader);
    console.log(gi);
    console.log(this.gridRows[gi.row]);
    if (!!this.gridRows[gi.row]) {
      let itinerisId = this.gridRows[gi.row][0].content;
      let params: ModalParams = { id: '' + itinerisId, headerText: '' + this.gridHeader[gi.col].content };
      console.log(params);
      let ref = this.modalService.open(GridItemContextmenuComponent, { centered: true, size: 'md' });
      ref.componentInstance.params = params;
      ref.componentInstance.emitter.subscribe(
        (e: string) => {
          console.log(e);
          ref.close();
          let params: ModalParams = { id: '' + e };
          let ref2 = this.modalService.open(DatasetBySampleComponent, { centered: true, size: 'lg' });
          ref2.componentInstance.params = params;
          ref2.componentInstance.emitter.subscribe(
            () => {
              ref2.close();
            }
          );
        }
      );
    }
  }

  public onCheck(gi: GridItem, event: any) {
    event.preventDefault();
    if (this.AltKey === 0) {
      this.checkSelection(gi);
    } else {
      this.checkAltSelection(gi);
    }
  }

  private checkAltSelection(gi: GridItem) {
    // this.firstSelection = -1;    
    console.log(this.selectedRowsIndex);
    this.tableOn = false;
    if (this.selectedRowsIndex.length > 0)
      this.firstSelection = this.selectedRowsIndex[this.selectedRowsIndex.length - 1];

    if (this.selectedRowsIndex.every((currentValue) => currentValue != gi.row))
      this.selectedRowsIndex.push(gi.row);

    if (this.firstSelection < 0) {
      this.firstSelection = gi.row;
      for (let j = 0; j < this.gridRows[gi.row].length; j++) {
        this.gridRows[gi.row][j].selected = true;
      }
      console.log(this.selectedRowsIndex);
      this.tableOn = true;
      return;
    }

    if (gi.row > this.firstSelection) {
      for (let i = this.firstSelection + 1; i <= gi.row; i++) {
        if (!this.gridRows[i][0].visible)
          continue;
        if (this.selectedRowsIndex.every((currentValue) => currentValue != i))
          this.selectedRowsIndex.push(i);
        for (let j = 0; j < this.gridRows[i].length; j++) {
          this.gridRows[i][j].selected = true;
        }
      }
    } else {
      for (let i = this.firstSelection - 1; i >= gi.row; i--) {
        if (!this.gridRows[i][0].visible)
          continue;
        if (this.selectedRowsIndex.every((currentValue) => currentValue != i))
          this.selectedRowsIndex.push(i);
        for (let j = 0; j < this.gridRows[i].length; j++) {
          this.gridRows[i][j].selected = true;
        }
      }
    }
    console.log(this.selectedRowsIndex);
    this.tableOn = true;
  }

  private checkSelection(gi: GridItem) {
    this.tableOn = false;
    if (true == this.selectedRowsIndex.every((currentValue) => currentValue != gi.row)) {
      this.selectedRowsIndex.push(gi.row);
      for (let i = 0; i < this.gridRows[gi.row].length; i++) {
        this.gridRows[gi.row][i].selected = true;
      }
    } else {
      this.selectedRowsIndex.splice(this.selectedRowsIndex.indexOf(gi.row), 1);
      for (let i = 0; i < this.gridRows[gi.row].length; i++) {
        this.gridRows[gi.row][i].selected = false;
      }
    }
    this.tableOn = true;
  }


  public restoreAll(): void {
    if (!!this.dataset) {
      this.tableOn = false;
      this.build(this.dataset);
      this.tableOn = true;
      this.deleteFlag = false;
    }
  }

  public deselectItem(): void {
    this.gridCacheRows = [...this.gridRows];
    this.tableOn = false;
    this.screenRows.length = 0;
    for (let i = 0; i < this.limit; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }
    this.tableOn = true;
  }

  public merge(): void {
    // console.log(this.selectedCols);
    let cols = new Array<Array<GridItem>>();
    for (let x of this.selectedCols) {
      let col = new Array<GridItem>();
      // col.push(this.gridHeader[x])
      // col.push({ ...this.gridHeader[x] });
      col.push({ header: true, visible: true, selected: false, row: 0, col: x, content: this.gridHeader[x].content, check: false, type: this.gridHeader[x].type })
      if (this.gridContent)
        for (let i = 1; i < this.gridRows.length + 1; i++) {
         col.push({ header: false, visible: true, selected: false, row: i, col: x, content: this.gridContent[i][x], check: false, type: this.gridHeader[x].type });
        }
      cols.push(col);
    }

    console.log(cols);
    this.mergeService.open(cols, this);
  }

  public selectAll(): void {
    this.tableOn = false;
    this.spinSelect = true;
    this.gridCacheRows = [...this.gridRows];
    this.selectedRowsIndex.length = 0;
    for (let r of this.gridCacheRows) {
      for (let c of r) {
        c.selected = true;
      }
      this.selectedRowsIndex.push(r[0].row);
    }
    this.screenRows.length = 0;
    for (let i = 0; i < this.limit; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }
    this.spinSelect = false;
    this.tableOn = true;
    // console.log(this.selectedRowsIndex);
  }

  public deselectAll(): void {
    this.tableOn = false;
    this.spinDeselect = true;
    this.gridCacheRows = [...this.gridRows];
    for (let r of this.gridCacheRows) {
      for (let c of r) {
        c.selected = false;
      }
    }
    this.selectedRowsIndex.length = 0;
    this.screenRows.length = 0;
    for (let i = 0; i < this.limit; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }
    this.spinDeselect = false;
    this.firstSelection = -1;
    this.tableOn = true;
  }

  public selectCol(h: GridItem): void {
    console.log(this.gridRows);
    console.log(this.gridCols);
    console.log(this.gridHeader);

    this.tableOn = false;
    this.gridHeader[h.col].selected = true;
    for (let e of this.gridCols[h.col]) {
      e.selected = true;
    }
    this.tableOn = true;
    this.selectedCols.push(h.col);
  }

  public selectItem(h: GridItem): void {
    this.tableOn = false;

    let j = 0;
    let localCache = new Array<Array<GridItem>>();
    for (let i = 0; i < this.gridCacheRows.length; i++) {
      if (this.gridCacheRows[i][h.col].content.length > 0) {
        localCache[j] = this.gridCacheRows[i];
        j++;
      }
    }

    this.gridCacheRows.length = 0;
    for (let i = 0; i < localCache.length; i++) {
      this.gridCacheRows[i] = localCache[i];
    }

    let length = this.limit;
    if (this.gridCacheRows.length <= this.limit) {
      length = this.gridCacheRows.length;
      this.downOk = false;
    }

    this.screenRows.length = 0;
    for (let i = 0; i < length; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }

    this.tableOn = true;
  }

  public unselectCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].selected = false;
    for (let e of this.gridCols[h.col]) {
      e.selected = false;
    }
    this.tableOn = true;
    let helper = new Array<number>();
    for (let n of this.selectedCols) {
      if (n !== h.col) {
        helper.push(n);
      }
    }
    this.selectedCols = helper;
  }

  public hideCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].visible = false;
    for (let e of this.gridCols[h.col]) {
      e.visible = false;
    }
    this.tableOn = true;
    this.deleteFlag = true;
  }

  private buildCsv(): string {
    let csv = '';
    for (let h of this.gridHeader) {
      if (h.visible === true) {
        csv += h.content + ';';
      }
    }
    csv += '\n';

    for (let r of this.gridRows) {
      for (let item of r) {
        // console.log(this.gridHeader[item.col].content + ": " + item.content);
        if (item.visible === true) {
          csv += item.content + ';';
        }
      }
      csv += '\n';
    }
    return csv;
  }

  public use(): void {
    let members = new Array<Array<EndMemberItem>>();
    for (let s of this.selectedRowsIndex) {
      let row = this.gridRows[s];
      let member = new Array<EndMemberItem>();
      for (let c of row) {
        if (c.visible)
          member.push({ type: c.type, name: this.gridHeader[c.col].content, value: '' + c.content });
      }
      members.push(member);
    }

    let params: ModalParams = {
      choices: [
        { text: 'Plot data', value: 3, icon: 'fa-solid fa-chart-line' },
        { text: 'Spider diagram', value: 4, icon: 'fa-solid fa-spider' },
        { text: 'Ternary diagram', value: 5, icon: 'fa-solid fa-t' },
        { text: 'Mixing model', value: 0, icon: 'fa-solid fa-flask' },
        // { text: 'Crystallization mass balance', value: 1, icon: 'fa-brands fa-codepen' },
        // { text: 'Melting', value: 2, icon: 'fa-solid fa-dice-d20' },
      ]
    };

    let ref = this.modalService.open(SelectBoxComponent, { centered: true, size: 'sm', scrollable: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: number) => {
        ref.close();
        switch (response) {
          case 0:
            this.geoModelService.setModel({ selectedModel: 0, endMembers: members });
            this.ref = this.geoModelService.execute();
            break;
          case 4:
            this.geoModelService.setModel({ selectedModel: 2, endMembers: members });
            this.ref = this.geoModelService.execute();
            break;
          case 5:
            this.ref = this.geoModelService.setModel({ selectedModel: 5, endMembers: members });
            this.ref = this.geoModelService.execute();
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            let list = new Array<DataListItem>();
            let idList = new Array<string>();
            let params: ModalParams = {
              headerText: 'Manage plotting series',
              list: list,
              idList: idList
            }

            let ids = new Array<GridItem>();
            for (let h of this.gridHeader) {
              if (h.content === 'ITINERIS_ID') {
                ids = this.gridCols[h.col];
                break;
              }
            }

            // console.log(ids);
            for (let id of ids) {
              if (id.selected)
                params.idList?.push(id.content);
            }

            for (let h of this.gridHeader) {
              if (h.type !== 'F') {
                list.push({ key: h.content, value: h.content });
              }
            }

            let selcetedRowsData = new Array<Array<GridItem>>();
            for (let n of this.selectedRowsIndex) {
              selcetedRowsData.push(this.gridRows[n]);
            }
            console.log(selcetedRowsData);
            params.anyParams = { selection: selcetedRowsData, headers: this.gridHeader };
            console.log(params);
            let reff = this.modalService.open(DataPlottingSeriesComponent, { centered: true, size: 'lg', scrollable: true });
            reff.componentInstance.params = params;
            let rr = reff.componentInstance.emitter.subscribe(
              (response: any) => {
                if (response === CANCEL) {
                  reff.close();
                  rr.unsubscribe();
                } else {
                  console.log(response);
                  reff.close();
                  rr.unsubscribe();
                }
              }
            );
            break;
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      }
    );
  }

  public manualMix(): void {
    let ref = this.modalService.open(EndMembersModalComponent, { centered: true, size: 'xl', scrollable: true });
    ref.componentInstance.emitter.subscribe(
      () => ref.close()
    );
  }
}

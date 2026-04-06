import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, find } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CONFIRM, CANCEL, ModalParams } from 'src/app/shared/modals/modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { Helper, SampleElement } from 'src/app/models/sample';
import { SelectBoxComponent } from 'src/app/shared/modals/select-box/select-box.component';
import { SelectCsvSeparatorComponent } from 'src/app/shared/modals/select-csv-separator/select-csv-separator.component';

export const SAMPLE_KEYS = ['sample name', 'sample id', 'sample_name', 'sample_id', 'sample-name', 'sample-id', 'sample'];

@Component({
  selector: 'app-content-manager',
  templateUrl: './content-manager.component.html',
  styleUrls: ['./content-manager.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ContentManagerComponent extends DataGathering implements OnInit, OnDestroy {
  public selectedRow = ['\/'];
  public endTableRow = ['\/'];
  public headerRow = ['\/'];
  public spinnerOn = false;
  public showContent = false;
  public sheet: string = '';
  public content: Array<Array<string>> | undefined; // = new Array<Array<string>>();
  public pages: Array<Array<Array<string>>> = new Array<Array<Array<string>>>();
  private rowPerPage = 40;
  public pageIndex = 0;
  private subscription: Subscription | undefined;
  private eventListener: Subscription | undefined;
  private headerPoitions = new Array<any>();
  public mergeFlag = false;
  public separatorFlag = false;

  constructor(private router: Router,
    private eventGenerator: EventGeneratorService,
    private modalService: NgbModal,
    private storeService: StoreService,
    private cookieService: CookieService,
    private dataProcessingService: DataProcessingService) {
    super();
  }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    this.session = session;
    if (this.session && this.session.selectedFile) {
      let file = this.session.selectedFile.toLowerCase();
      if (!file.endsWith('.xls') && !file.endsWith('.xlsx')) {
        this.separatorFlag = true;
      }
    }

    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        let key = this.cookieService.get('xkey');
        const su = this.dataProcessingService.releaseContent(key).subscribe(
          (r) => {
            this.cookieService.delete('xkey');
            su.unsubscribe();
          }
        );
      }
    });

    this.eventListener = this.eventGenerator.on('confirm').subscribe(
      (res: any) => {
        // console.log(res);
        if (CONFIRM === '' + res.content) {
          this.mergeTables();
        }
      }
    );

    if (!session || (!session.selectedSheet && !session.content)) {
      this.router.navigate(['main-data-processing']);
    }

    if (!!session.selectedSheet) {
      this.sheet = session.selectedSheet;
      this.session = session;
      if (!!this.sheet && this.sheet.length > 0) {
        this.loadContent();
      }
    } else {
      this.content = this.session.content;
      this.formatContent();
      this.session.content = this.content;
      this.storeService.push({ key: DATA_GATHERING, data: this.session });
      this.findTableStart();
      this.findTableEnd();
      this.paginateContent();
    }

  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }

    if (!!this.eventGenerator) {
      this.eventListener?.unsubscribe();
    }
  }

  public changeSeparator(): void {
    let ref = this.modalService.open(SelectCsvSeparatorComponent, { centered: true });
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        console.log(response);
        ref.close();
        if (this.session.selectedFile && response !== 'close') {
          this.spinnerOn = true;
          let s = this.dataProcessingService.setSeparator(this.session.selectedFile, response).subscribe(
            (res) => {
              this.session.content = res;
              this.loadContent();
              this.spinnerOn = false;
              this.analyzeContent();
            }
          );
        }
      }
    );
  }

  private confirm(): void {
    let params: ModalParams = {
      headerText: 'Confirm request',
      bodyText: 'It seems that ' + this.headerPoitions.length + ' tables are present in this sheet. Would you try to produce an unique table?'
    }
    let ref = this.modalService.open(ConfirmComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        this.eventGenerator.emit({ key: 'confirm', content: response });
      }
    );
  }

  private loadContent(): void {
    if (!this.session.content) {
      this.spinnerOn = true;
      let s = this.dataProcessingService.getContentXlsx(this.sheet, this.session.key).subscribe(
        (data) => {
          if (typeof data === 'string') {
            s.unsubscribe();
            this.spinnerOn = false;
            alert(data);
            return;
          }
          this.content = data;
          s.unsubscribe();
          this.formatContent();
          this.session.content = this.content;
          this.storeService.push({ key: DATA_GATHERING, data: this.session });
          this.findTableStart();
          this.findTableEnd();
          this.paginateContent();
          this.spinnerOn = false;
          if (!!this.session.header) {
            this.selectedRow = this.session.header;
          }

          const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
            (r) => {
              console.log(r);
              su.unsubscribe();
            }
          );
        }

      );
    } else {
      this.session = this.storeService.get(DATA_GATHERING);
      this.content = this.session.content;
      this.findTableStart();
      this.findTableEnd();
      this.paginateContent();
      if (!!this.session.header) {
        this.selectedRow = this.session.header;
      }
    }
  }

  private formatContent() {
    let maxCols = 0;
    if (!this.content)
      return;
    for (let row of this.content) {
      maxCols = row.length > maxCols ? row.length : maxCols;
    }

    for (let row of this.content) {
      if (row.length < maxCols) {
        for (let i = row.length; i < maxCols; i++) {
          row.push('');
        }
      }
    }

    // this.deleteEmptyCols();
    this.analyzeContent();
  }

  private analyzeContent() {
    if (!this.content)
      return;
    let headerPoitions = [];
    for (let key of SAMPLE_KEYS) {
      for (let i = 0; i < this.content.length; i++) {
        for (let j = 0; j < this.content[i].length; j++) {
          if (key === this.content[i][j].toLowerCase()) {
            headerPoitions.push({ 'key': this.content[i][j], 'position': i });
          }
        }
      }
    }
    this.headerPoitions = new Array<any>();
    for (let item of headerPoitions) {
      this.headerPoitions.push(item);
    }
    if (this.headerPoitions.length > 1) {
      this.mergeFlag = true;
      this.confirm();
    }
  }

  private findTableStart() {
    if (!this.content) {
      return;
    }
    for (let key of SAMPLE_KEYS) {
      for (let i = 0; i < this.content.length; i++) {
        for (let j = 0; j < this.content[i].length; j++) {
          if (key === this.content[i][j].toLowerCase()) {
            this.headerRow = this.content[i];
            break;
          }
        }
      }
    }

  }

  private findTableEnd() {
    if (!this.content) {
      return;
    }
    for (let i = this.content.length - 1; i >= 0; i--) {
      for (let j = 0; j < this.content[i].length; j++) {
        if (this.content[i][j].length > 0) {
          this.endTableRow = this.content[i];
          return;
        }
      }
    }
  }

  private checkMergeble(): boolean {
    if (this.headerPoitions.length <= 1)
      return false;
    let key = this.headerPoitions[0]['key'];
    for (let h of this.headerPoitions) {
      if (h['key'] !== key)
        return false;
    }

    return true;
  }

  public mergeTables() {
    if (!this.checkMergeble())
      return;
    let mergeKey = this.headerPoitions[0]['key'];
    let newContent = new Array<Array<string>>();
    console.log(mergeKey);
    if (!!this.content) {
      let rowLength = this.content[0].length;
      let rowCount = this.headerPoitions[1]['position'] - this.headerPoitions[0]['position'];

      console.log('table dimensions: ' + rowCount + ' x ' + rowLength);

      let tables = new Array<Array<Array<string>>>();

      for (let n = 0; n < this.headerPoitions.length; n++) {
        let start = this.headerPoitions[n];
        tables[n] = new Array<Array<string>>();
        for (let i = start['position']; i < start['position'] + rowCount; i++) {
          let row = this.content[i];
          tables[n].push(row);
        }
        console.log(tables[n]);
      }

      this.transformToHelper(tables, mergeKey);
      this.mergeFlag = false;
    }
  }

  private purgeUndefined(tables: Array<Array<Array<string>>>): Array<Array<Array<string>>> {
    let t = new Array<Array<Array<string>>>();
    for (let i = 0; i < tables.length; i++) {
      let table = tables[i];
      t[i] = new Array<Array<string>>();
      if (!!table) {
        for (let element of table) {
          if (!!element) {
            t[i].push(element);
          }
        }
      }
    }
    return t;
  }

  private transformToHelper(tables: Array<Array<Array<string>>>, key: string) {
    let samples = new Array<Array<Array<Helper>>>();
    let sample: any;
    tables = this.purgeUndefined(tables);

    for (let n = 0; n < tables.length; n++) {
      if (!!tables[n]) {
        let header = tables[n][0];
        sample = new Array<Array<Helper>>();

        for (let i = 1; i < tables[n].length; i++) {
          let row = tables[n][i];
          let hRow = new Array<Helper>();
          for (let j = 0; j < header.length; j++) {
            if (header[j].length > 0) {
              let helper = { attributes: new Array<SampleElement>() };
              helper.attributes.push({ field: header[j], value: row[j] });
              hRow.push(helper);
            }
          }
          sample.push(hRow);
        }
        samples.push(sample);
      }
    }
    this.createNewContent(samples, key)
  }

  private sortTablesByKey(samples: Array<Array<Array<Helper>>>, key: string): Array<Array<Array<Helper>>> {
    let master = samples[0];
    let numRow = samples[0].length;
    let index = new Array<Helper>();
    // build the index
    for (let n = 0; n < numRow; n++) {
      let rowMaster = master[n];
      for (let element of rowMaster) {
        let field = element.attributes[0].field;
        if (field === key) {
          index.push(element);
        }
      }
    }

    // loop on others
    for (let i = 1; i < samples.length; i++) {
      let sortedTable = new Array<Array<Helper>>();
      let currentTable = samples[i];
      for (let indexKey of index) {
        let row = this.findByKey(currentTable, indexKey);
        if (!!row)
          sortedTable.push(row);
      }
      samples[i] = sortedTable;
    }

    return samples;
  }

  private findByKey(table: Array<Array<Helper>>, key: Helper): Array<Helper> | undefined {
    let numRows = table.length;
    for (let n = 0; n < numRows; n++) {
      let row = table[n];
      for (let element of row) {
        // let field = element.attributes[0].field;
        if (element.attributes[0].field === key.attributes[0].field &&
          element.attributes[0].value === key.attributes[0].value) {
          return row;
        }
      }
    }
    return undefined;
  }

  private createNewContent(samples: Array<Array<Array<Helper>>>, key: string) {
    samples = this.sortTablesByKey(samples, key);
    let newContent: Array<Array<string>> = new Array<Array<string>>();
    let header: Array<string> = new Array<string>();
    if (samples.length > 0) {
      let numRow = samples[0].length; // numero di righe del nuovo content

      // 1. build the header
      header = new Array<string>();
      let already = false;
      for (let i = 0; i < samples.length; i++) {
        let table = samples[i];
        let row = table[0];
        if (!!row) {
          for (let h of row) {
            let field = h.attributes[0].field;
            if (field === key) {
              if (already === false) {
                header.push(field);
                already = true;
              }
            } else {
              header.push(field);
            }
          }
        }
      }

      newContent.push(header);
      console.log(header);

      // 2. build all data --> questo funziona se sono ordinati!
      let usedKey = '';
      let row: any;
      for (let n = 0; n < numRow; n++) {
        let newRow = new Array<string>();
        already = false;
        for (let i = 0; i < samples.length; i++) {
          let table = samples[i];
          // if (i === 0)
          row = table[n]; // riga n-ma tabella i-ma
          // console.log(row.isArray());
          if (!!row) {
            for (let h of row) {
              // console.log(h);
              let field = h.attributes[0].field;
              let value = h.attributes[0].value;
              if (field === key) {
                if (already === false) {
                  usedKey = !!value ? value : '';
                  newRow.push(usedKey);
                  already = true;
                }
              } else {
                newRow.push(!!value ? value : '');
              }
            }
          }
        }
        newContent.push(newRow);
      }
    }
    console.log(newContent);
    this.content = newContent;
    this.session.content = this.content;
    this.findTableStart();
    this.findTableEnd();
    this.paginateContent();
  }

  private deleteEmptyCols() {
    if (!this.content)
      return;
    let maxCols = this.content[0].length;
    let maxRows = this.content.length;
    let toEliminate = [];

    for (let j = 0; j < maxCols; j++) {
      toEliminate[j] = 0;
    }

    for (let i = 0; i < maxRows; i++) {
      for (let j = 0; j < maxCols; j++) {
        if (this.content[i][j].length === 0) {
          toEliminate[j]++;
        }
      }
    }

    for (let i = 0; i < maxRows; i++) {
      let newRow = [];
      for (let j = 0; j < maxCols; j++) {
        if (toEliminate[j] < maxRows) {
          newRow.push(this.content[i][j]);
        }
      }
      this.content[i] = newRow;
    }
  }

  private paginateContent() {
    if (!this.content)
      return;
    this.pageIndex = 0;
    this.pages[this.pageIndex] = new Array<Array<string>>();
    for (let i = 0, j = 0; i < this.content.length; i++) {
      let row = this.content[i];
      if (j < this.rowPerPage) {
        this.pages[this.pageIndex].push(row);
        j++;
      } else {
        this.pageIndex++;
        this.pages[this.pageIndex] = new Array<Array<string>>();
        this.pages[this.pageIndex].push(row);
        j = 1;
      }
    }
    this.pageIndex = 0;
    this.showContent = true;
  }

  public next(): void {
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
    }
  }

  public previous(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  public first(): void {
    this.pageIndex = 0;
  }

  public last(): void {
    this.pageIndex = this.pages.length - 1;
  }

  public selectRow(row: Array<string>) {
    // this.selectedRow = row;
    let ref = this.modalService.open(SelectBoxComponent, { centered: true });
    ref.componentInstance.params = { bodyText: 'mark as:', choices: [{ text: 'table start (header)', value: 1, color: 'orange' }, { text: 'table end', value: 2, color: 'violet' }, { text: 'none', value: 0, color: 'gray' }] };
    ref.componentInstance.emitter.subscribe(
      (response: number) => {
        ref.close();
        console.log('response: ' + response);
        switch (response) {
          case 1:
            this.headerRow = row;
            break;
          case 2:
            this.endTableRow = row;
            break;
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      }
    );
  }

  private findRowPosition(row: Array<string>): number {
    if (row.length > 1 && !!this.session.content) {
      for (let i = this.session.content?.length - 1; i >= 0; i--) {
        let found = true;
        for (let j = 0; j < row.length; j++) {
          if (this.session.content[i][j] !== row[j]) {
            found = false;
            break;
          }
        }
        if (found === true)
          return i;
      }
    }
    return -1;
  }

  public checkSelected(row: Array<string>): boolean {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.selectedRow[i])
        return false;
    }
    return true;
  }

  public checkHeaderSelected(row: Array<string>): boolean {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.headerRow[i])
        return false;
    }
    return true;
  }

  public checkEndTableSelected(row: Array<string>): boolean {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.endTableRow[i])
        return false;
    }
    return true;
  }

  public goPrevious(): void {
    if (!!this.session && !!this.session.selectedFile) {
      let filename = this.session.selectedFile.toLowerCase();
      if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
        this.router.navigate(['file-process']);
        return;
      }
    }
    this.router.navigate(['file-list']);
  }

  public goNext(): void {
    if (this.endTableRow.length < 2 && this.headerRow.length < 2)
      return;
    this.session.header = this.headerRow;
    this.session.headerPosition = this.findRowPosition(this.headerRow);
    this.session.endTable = this.findRowPosition(this.endTableRow);
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
    this.router.navigate(['sample-definition']);
  }

}

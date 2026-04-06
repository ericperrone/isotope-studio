import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { StoreService } from 'src/app/services/common/store.service';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-content-manager-step2',
  templateUrl: './content-manager-step2.component.html',
  styleUrls: ['./content-manager-step2.component.scss'],
  animations: [
    trigger('fade', [ 
      transition('void => *', [
        style({ opacity: 0 }), 
        animate(1000, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class ContentManagerStep2Component extends DataGathering implements OnInit, OnDestroy {
  public selectedRow = ['\/'];
  public spinnerOn = false;
  public showContent = false;
  public sheet: string = '';
  public content: Array<Array<string>> | undefined; // = new Array<Array<string>>();
  public pages: Array<Array<Array<string>>> = new Array<Array<Array<string>>>();
  private rowPerPage = 40;
  public pageIndex = 0;
  private subscription: Subscription | undefined;

  constructor(private router: Router,
    private storeService: StoreService,
    private dataProcessingService: DataProcessingService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session || !session.selectedSheet) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.sheet = session.selectedSheet;
      this.session = session;
      if (this.sheet.length > 0)
        this.loadContent();
    }
    
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.router.navigated) {
          const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
            (r) => {
              console.log(r);
              su.unsubscribe();
            }
          );
        }
      }
    });

  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadContent(): void {
    this.session = this.storeService.get(DATA_GATHERING);
    this.content = this.session.content;
    if (!!this.session.content && !!this.session.endTable) {
      this.selectedRow = this.session.content[this.session.endTable];
    }
    this.paginateContent();
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
    this.selectedRow = row;
  }

  public checkSelected(row: Array<string>): boolean {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.selectedRow[i])
        return false;
    }
    return true;
  }

  public checkTableSelected(row: Array<string>): boolean {
    return true;
  }

  public checkHeaderSelected(row: Array<string>): boolean {
    if (!this.session.header)
      return false;
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.session.header[i])
        return false;
    }
    return true;
  }

  public goPrevious(): void {
    this.router.navigate(['content-manager']);
  }

  public goNext(): void {
    if (this.selectedRow.length < 2)
      return;
    this.session.endTable = this.saveTableEnd();
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
    console.log(this.session);
    this.router.navigate(['sample-definition']);
  }

  private saveTableEnd(): number {
    if (this.selectedRow.length > 1 && !!this.session.content) {
      for (let i = this.session.content?.length - 1; i > 0; i--) {
        let found = true;
        for (let j = 0; j < this.selectedRow.length; j++) {
          if (this.session.content[i][j] !== this.selectedRow[j]) {
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

}

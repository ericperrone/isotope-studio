import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { StoreService } from 'src/app/services/common/store.service';
import { NavigationStart, Router } from '@angular/router';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-file-process',
  templateUrl: './file-process.component.html',
  styleUrls: ['./file-process.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class FileProcessComponent extends DataGathering implements OnInit {
  public selected = '';
  public sheets = null;
  public key = '';
  public content = null;
  public spinnerOn = false;
  public fileName = '';
  private subscription: Subscription | undefined;

  constructor(private dataProcessingService: DataProcessingService,
    private router: Router,
    private cookieService: CookieService,
    private storeService: StoreService) { super(); }

  ngOnInit(): void {

    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);

    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && !!session && !!session.key && session.key.length <= 0) {
        let key = this.cookieService.get('xkey');
        const su = this.dataProcessingService.releaseContent(key).subscribe(
          (r) => {
            this.cookieService.delete('xkey');
            su.unsubscribe();
          }
        );
      }
    });

    if (!session || !session.selectedFile) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.fileName = session.selectedFile;
      if (!!session.selectedSheet)
        this.selected = session.selectedSheet;
      session.content = undefined;
      this.loadSheets();
      this.session = session;
    }
  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadSheets(): void {
    this.spinnerOn = true;
    let s = this.dataProcessingService.getSheets(this.fileName).subscribe(
      (data) => {
        if (typeof data === 'string') {
          s.unsubscribe();
          this.spinnerOn = false;
          alert(data);
          return;
        }
        this.sheets = data._sheets;
        this.key = data._key;
        this.session.key = this.key;
        this.cookieService.set('xkey', this.key);
        s.unsubscribe();
        this.spinnerOn = false;
      }
    )
  }

  public processSheet(sheet: string): void {
    this.selected = sheet;
    this.session.selectedSheet = this.selected;
    this.session.key = this.key;
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
  }

  public goNext(): void {
    if (this.selected.length < 1)
      return;
    this.router.navigate(['content-manager']);
  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

}

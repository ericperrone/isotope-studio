import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { GeorocData, GeorocFullData, GeorocNative, toGeorocFullData } from 'src/app/models/georoc';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeorocService } from 'src/app/services/georoc/georoc.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { CONFIRM, DataListItem, ModalParams } from 'src/app/shared/modals/modal-params';
import { PROGRESS_INTERRUPT, PROGRESS_TEXT, ProgressComponent } from 'src/app/shared/modals/progress/progress.component';

export const LOC_DATA_LOOP = '_LOC_DATA_LOOP_';

export interface GeorocLocation {
  name: string;
  color?: boolean;
}

interface FinalReport {
  location: String;
  items: number;
  inserted: number;
  rejected: number;
}

@Component({
  selector: 'app-georoc-by-locations',
  templateUrl: './georoc-by-locations.component.html',
  styleUrls: ['./georoc-by-locations.component.scss']
})
export class GeorocByLocationsComponent implements OnInit, OnDestroy {
  public spinnerOn = false;
  public locations: any;
  public cache: any;
  public filteredLocations: any;
  public selection: any;
  public selected = '';
  public previousSelection: any;
  public spinner2On = false;
  private sampleList = new Array<number>();
  public finalReport: FinalReport = {location: '', items: 0, inserted: 0, rejected: 0};
  private sampleIndex = 0;
  private loop: Subscription | undefined;
  private interrupt: Subscription | undefined;
  private progress: any;
  public spins = false;
  // @ViewChild('authlist') authlist: ElementRef | undefined;


  constructor(private geoRocService: GeorocService,
    private eventGeneratorService: EventGeneratorService,
    private sampleService: SampleService,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loadLocations();
    this.interrupt = this.eventGeneratorService.on(PROGRESS_INTERRUPT).subscribe(
      () => { 
        this.progress.close();
        this.eventGeneratorService.emit({key: CLOSE_ALL_MODALS});
        this.loop?.unsubscribe();
        this.loop = undefined;   
      }
    );

    this.loop = this.eventGeneratorService.on(LOC_DATA_LOOP).subscribe(
      () => {
        this.sampleIndex++;
        if (this.sampleIndex >= this.sampleList.length) {
          this.progress.close();
          // console.log(this.finalReport);
 
          let listInfo = new Array<DataListItem>();
          listInfo.push({ key: 'Location', value: '' + this.finalReport.location });
          listInfo.push({ key: 'Processed', value: '' + this.finalReport.items });
          listInfo.push({ key: 'Inserted', value: '' + this.finalReport.inserted });
          listInfo.push({ key: 'Rejected', value: '' + this.finalReport.rejected + ' (already in database)' });
        
          let params: ModalParams = {
            headerText: 'Final report',
            list: listInfo
          };

          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = params;
          ref.componentInstance.emitter.subscribe(() => { this.finalReport = {location: '', items: 0, inserted: 0, rejected: 0}; ref.close(); });
        } else {
          this.eventGeneratorService.emit({
            key: PROGRESS_TEXT,
            content: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
          });
          this.importSamples();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.loop) {
      this.loop.unsubscribe();
    }
    if (!!this.interrupt) {
      this.interrupt.unsubscribe();
    }
  }

  private loadLocations() {
    this.spinnerOn = true;
    let s = this.geoRocService.getLocations1List().subscribe(
      (res: any) => {
        this.spinnerOn = false;

        if (typeof res === 'string') {
          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = { headerText: 'ERROR', bodyText: res };
          ref.componentInstance.emitter.subscribe(() => { ref.close(); this.goPrevious() });
        } else {
          this.locations = res.sort(function (a: any, b: any) {
            return a.localeCompare(b);
          });
          this.cache = [...this.locations];
          this.loadFilteredLocations();
        }
        // console.log(this.filteredLocations);
      }
    );
  }

  private loadFilteredLocations() {
    this.filteredLocations = new Array<GeorocLocation>();
    for (let loc of this.cache) {
      this.filteredLocations.push({ name: loc });
    }
  }

  public filterLocations(): void {
    if (this.selected.length === 0) {
      this.cache = [...this.locations];
      this.loadFilteredLocations();
    } else {
      this.cache = [];
      for (let loc of this.locations) {
        if (loc.toLowerCase().indexOf(this.selected.toLowerCase()) > 0) {
          this.cache.push(loc);
        }
      }
      this.loadFilteredLocations();
    }
  }

  public select(location: any): void {
    console.log(location);
    if (this.previousSelection) {
      this.previousSelection.color = undefined;
    }
    location.color = 'orange';
    this.previousSelection = location;
    this.selection = location;
    this.selected = location.name;
  }

  public reset(): void {
    if (!!this.previousSelection)
      this.previousSelection.color = undefined;
    if (!!this.selection) {
      this.selection.name = '';
      this.selection.color = undefined;
    }

    this.previousSelection = undefined;
    this.selected = '';
    this.cache = [...this.locations];
    this.loadFilteredLocations();
  }

  
  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

  public use(): void {
    this.spinner2On = true;
    this.spins = true;
    let sub = this.geoRocService.getSamplesByLocation(this.selection.name).subscribe(
      (res: Array<number>) => {
        this.spinner2On = false;
        this.spins = false;
        this.sampleList.length = 0;
        for (let r of res) {
          this.sampleList.push(r);
        }
        console.log(res);
        console.log(this.sampleList);
        this.finalReport.location = this.selection.name;
        this.finalReport.items = res.length;
        let ref = this.modalService.open(ConfirmComponent, { centered: true });
        ref.componentInstance.params = {
          headerText: 'Confirm',
          bodyText: 'Found ' + res.length + ' items related to ' + this.selection.location + '.'
            + ' Please confirm data import.'
        };
        let sub2 = ref.componentInstance.emitter.subscribe(
          (response: string) => {
            ref.close();
            sub2.unsubscribe();
            if (response === CONFIRM) {
              this.sampleIndex = 0;
              
              this.progress = this.modalService.open(ProgressComponent, { centered: true, backdrop: 'static' });
              ref.componentInstance.params = {
                bodyText: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
              }
              this.importSamples();
            }
          }
        );
        sub.unsubscribe();
      }     
    );
  }

  private importSamples(): void {
    if (this.sampleIndex >= this.sampleList.length) {
      console.log(this.finalReport);
      return;
    }
    let sampleData = this.geoRocService.getSampleFullData(this.sampleList[this.sampleIndex]).subscribe(
      (res: GeorocData) => {
        // console.log(res);
        let fullData: GeorocFullData = toGeorocFullData(res);
        // console.log(fullData);
        let s = this.sampleService.insertFullData(fullData).subscribe(
          (res: any) => {
            console.log(res);
            let r = parseInt(res.result);
            if (r === 1) {
              this.finalReport.inserted ++;
            } else {
              this.finalReport.rejected ++;
            }
            s.unsubscribe();
            this.eventGeneratorService.emit({key: LOC_DATA_LOOP});
          }
        );
        sampleData.unsubscribe();
      }
    );
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from 'src/app/services/common/store.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { Subscription } from 'rxjs';
import { Sample } from 'src/app/models/sample';
import { ChemElements, Isotopes } from 'src/app/shared/const';
import { ElementsService } from 'src/app/services/rest/elements.service';

@Component({
  selector: 'app-save-data',
  templateUrl: './save-data.component.html',
  styleUrls: ['./save-data.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SaveDataComponent extends DataGathering implements OnInit, OnDestroy {
  public spinnerOn = false;
  private subscription: Subscription | undefined;
  private payloads = new Array<Array<Sample>>();

  constructor(private dataProcessingService: DataProcessingService,
    private sampleService: SampleService,
    private elementsService: ElementsService,
    private datasetService: DatasetService,
    private router: Router,
    private modalService: NgbModal,
    public storeService: StoreService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session || !session.header) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.session = session;
    }
    console.log(this.session);
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

  public goPrevious(): void {
    this.router.navigate(['sample-definition']);
  }

  public saveSamples(): void {
    this.spinnerOn = true;
    if (this.session.selectedDataset) {
      for (let s of this.session.samples) {
        s.datasetId = this.session.selectedDataset.id;
      }
    }

    const maxSize = 1000;

    let index = 0;

    for (let i = 0; i < this.session.samples.length; i += maxSize) {
      this.payloads[index] = new Array<Sample>();
      let limit = (this.session.samples.length - i) > maxSize ? maxSize : (this.session.samples.length - i);
      for (let j = 0; j < limit; j++) {
        this.payloads[index].push(this.session.samples[i + j]);
      }
      index++;
    }

    let n = 0;
    this.recursiveInsert(n, index);
  }

  private recursiveInsert(counter: number, limit: number): void {
    let s = this.sampleService.insertSample(this.payloads[counter]).subscribe(
      res => {
        s.unsubscribe();
        if (!!res.errorCode) {
          res.message = res.errorDetail.message;
          this.spinnerOn = false;
          this.displayMessage(res);
        } else if (counter < limit - 1) {
          this.recursiveInsert(counter + 1, limit);
        } else {
          this.spinnerOn = false;
          const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
            (r) => {
              console.log(r);
              su.unsubscribe();

              const ds = this.datasetService.closeDataset({ dataset: this.session.selectedDataset }).subscribe(
                (res) => {
                  console.log(res);
                  ds.unsubscribe();
                }
              );
            }
          );
          this.displayMessage(res);
          const s = this.elementsService.getElements().subscribe(
            (res: any) => {
              if (!!res && res.length > 0) {
                ChemElements.length = 0;
                Isotopes.length = 0;
                for (let r of res) {
                  if (!!r.isotope) {
                    Isotopes.push(r.element);
                  } else {
                    ChemElements.push(r.element);
                  }
                }
              }
              s.unsubscribe();
            }            
          );
        }
      }
    );

  }

  private displayMessage(res: any): void {
    let params: ModalParams = {};
    if (!!res.status && res.status === 'success') {
      params = {
        headerText: 'Success',
        bodyText: 'Selected records has been successfully added to the database. Press the CLOSE button to exit this dialog and go back to the start of the procedure'
      }
    } else if (!!res.status && res.status === 'error') {
      params = {
        headerText: 'Error',
        bodyText: res.message
      }
    } else {
      params = {
        headerText: 'Error',
        bodyText: 'Unexpected error'
      }
    }
    let ref = this.modalService.open(AlertComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      () => {
        ref.close();
        this.router.navigate(['main-data-processing']);
      }
    );
  }
}

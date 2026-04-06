import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { StoreService } from 'src/app/services/common/store.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { Dataset } from 'src/app/models/dataset';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploaderComponent } from 'src/app/shared/modals/file-uploader/file-uploader.component';
import { ModalParams, CONFIRM } from 'src/app/shared/modals/modal-params';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { SelectBoxComponent } from 'src/app/shared/modals/select-box/select-box.component';
import { environment } from 'src/environments/environment';
import { DatasetModalComponent } from '../dataset-modal/dataset-modal.component';

@Component({
  selector: 'app-list-file',
  templateUrl: './list-file.component.html',
  styleUrls: ['./list-file.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ListFileComponent implements OnInit {
  public datasets = null;
  public spinnerOn = false;
  public selected = '';
  public serviceUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;

  constructor(private router: Router,
    private datasetService: DatasetService,
    private modalService: NgbModal,
    public storeService: StoreService) { }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session) {
      this.router.navigate(['main-data-processing']);
    } else {
      if (!!session.selectedFile) {
        this.selected = session.selectedFile;
      }
    }
    this.loadFileList();
  }

  private loadFileList(): void {
    this.spinnerOn = true;
    let s = this.datasetService.getDatasetList().subscribe(
      (data) => {
        if (typeof data === 'string') {
          s.unsubscribe();
          this.spinnerOn = false;
          alert(data);
          return;
        }
        this.datasets = data;
        s.unsubscribe();
        this.spinnerOn = false;
      }
    );
  }

  public showInfo(dataset: Dataset): void {
    // let listInfo = new Array<DataListItem>();
    // listInfo.push({ key: 'fileName', value: dataset.fileName });
    // listInfo.push({ key: 'keywords', value: dataset.keywords });
    // listInfo.push({ key: 'link', value: dataset.ref });
    // listInfo.push({ key: 'authors', value: dataset.authors });
    // listInfo.push({ key: 'year', value: '' + dataset.year });
    // let params: ModalParams = {
    //   headerText: 'Dataset info',
    //   list: listInfo
    // };
    // let ref = this.modalService.open(AlertComponent, { centered: true });
    // ref.componentInstance.params = params;
    // ref.componentInstance.emitter.subscribe(() => ref.close());

    let ref = this.modalService.open(DatasetModalComponent, { centered: true, size: 'lg' });
    ref.componentInstance.params = dataset;
    ref.componentInstance.emitter.subscribe(() => ref.close());
  }

  public deleteDataset(dataset: Dataset): void {
    let params: ModalParams = {
      headerText: 'Confirm request',
      bodyText: 'Want you permanently delete this dataset?'
    }

    let ref = this.modalService.open(ConfirmComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        if (response === CONFIRM) {
          this.delete(dataset);
        }
      }
    );
  }

  public delete(dataset: Dataset): void {
    const r = this.datasetService.deleteDataset("" + dataset.id).subscribe(
      (res) => {
        console.log(res);
        r.unsubscribe();
        this.loadFileList();
      }
    );
  }

  public uploadFile(): void {
    let ref = this.modalService.open(FileUploaderComponent, { centered: true, size: 'xl' });
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        if (response === CONFIRM) {
          this.loadFileList();
        }
      }
    );
  }

  public externalSites(): void {
    let ref = this.modalService.open(SelectBoxComponent, { centered: true });
    let choices = [{ text: 'GEOROC', value: 1, color: 'blue' }];
    ref.componentInstance.params = { bodyText: 'Available external sites:', choices: choices };
    ref.componentInstance.emitter.subscribe(
      (response: number) => {
        ref.close();
        // console.log('response: ' + response);
        switch (response) {
          case 1:
            this.router.navigate(['georoc']);
            break;
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      });
  }

  public download(file: string) {
    let s = this.datasetService.download(file).subscribe(
      () => s.unsubscribe()
    );
  }

  public processFile(dataset: Dataset): void {
    if (!!this.selected && this.selected === dataset.fileName) {
      this.selected = '';
    } else {
      this.selected = dataset.fileName;
    }
    let session = this.storeService.get(DATA_GATHERING);
    session.selectedFile = this.selected;
    session.selectedDataset = dataset;
    this.storeService.push({ key: DATA_GATHERING, data: session });
    // console.log(session);
  }

  public goNext(): void {
    if (this.selected.length > 0) {
      if (this.selected.toLowerCase().endsWith('.xlsx') || this.selected.toLowerCase().endsWith('.xls'))
        this.router.navigate(['file-process']);
      else
        this.router.navigate(['file-csv-process']);
    }
  }

  public goPrevious(): void {
    this.router.navigate(['main-data-processing']);
  }

}

import { Component, OnInit, AfterViewInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CONFIRM, CANCEL } from '../modal-params';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { environment } from 'src/environments/environment';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CardAuthorsDialogComponent } from 'src/app/db-querying/card-dialogs/card-authors-dialog/card-authors-dialog.component';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY, RESET_FILTER, initQueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { UploaderService } from 'src/app/services/rest/uploader.service';
import { ThesauriComponent } from '../thesauri/thesauri.component';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit, AfterViewInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('uploader') uploader: any;
  @ViewChild('hiddeninput') hiddenInput: any;
  @ViewChild('metauploader') metauploader: any;
  @ViewChild('hiddenmetainput') hiddenMetaInput: any;
  public actionUrl = '';
  public dataSetRef = '';
  public authors = '';
  public keywords = '';
  public thesauri = '';
  public thKeywords = new Array<string>();
  public uploadedFile = '';
  public selectedFile: any;
  public inProgress = false;
  public year = '';
  public progress = 0;
  public metadata = '';
  public thesauriKeys = new Array<string>();

  constructor(private datasetService: DatasetService, private modalService: NgbModal,
    private storeService: StoreService, private uploaderService: UploaderService) {
    this.actionUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;
  }

  ngOnInit(): void {
    this.authors = '';
  }

  ngAfterViewInit(): void {
  }

  public authorDialog(): void {
    this.storeService.push({ key: FILTER_KEY, data: initQueryFilter() });
    let ref = this.modalService.open(CardAuthorsDialogComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        let queryFilter = this.storeService.get(FILTER_KEY);
        if (this.authors.length > 0)
          this.authors += '; ';
        for (let key of queryFilter.authors.authors) {
          this.authors += key + '; ';
        }
        this.authors = this.authors.trim();
        this.authors = this.authors.substring(0, this.authors.length - 1);
        // this.emitter.emit(true);
        this.storeService.clean(FILTER_KEY);
      }
      ref.close()
    });
  }

  public thesauriModal(): void {
    let ref = this.modalService.open(ThesauriComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: any) => {
      if (result.status === CONFIRM) {
        console.log(result);
        let ks = Object.keys(result.selected); 
        for (let k of ks) {
          if (k !== 'uuid' && result.selected[k] && result.selected[k].length > 0) {
            this.thesauri += '\"' + result.selected[k] + '\" ';
          }
        }       
      }
      ref.close()
    });
  }

  public cancel(): void {
    console.log(this.authors);
    console.log(this.uploadedFile);
    this.emitter.emit(CANCEL);
  }

  public setFile(event: any): void {
    // console.log(event);
    this.uploadedFile = event.target.files[0].name;
    this.selectedFile = event.target.files[0];
  }


  public setMetadata(event: any): void {
    console.log(event);
    let s = this.uploaderService.onFileSelected(event).subscribe(
      (res: any) => {
        // console.log(res);
        this.metadata = res;
        s.unsubscribe();
      }
    );
  }

  public confirm(): void {
    if (this.uploadedFile.length > 0) {
      this.progress = 0;
      const s = this.datasetService.upload(this.selectedFile).subscribe(
        event => {
          this.inProgress = true;
          if (event.type === HttpEventType.UploadProgress) {
            let total = !!event.total ? event.total : 100
            this.progress = Math.round(100 * event.loaded / total);
          } else if (event instanceof HttpResponse) {
            s.unsubscribe();
            if (isNaN(parseInt(this.year))) {
              this.year = '' + (new Date()).getFullYear();
            }
            let payload = {
              ref: this.dataSetRef,
              authors: this.authors,
              file: this.uploadedFile,
              year: this.year,
              keywords: this.keywords + ' ' + this.thesauri,
              metadata: this.metadata
            }
            const r = this.datasetService.insertDataset(payload).subscribe(
              (res) => {
                r.unsubscribe();
                this.emitter.emit(CONFIRM);
              }
            );
          }
        }
      );
    }
  }

  public fireClick(): void {
    this.hiddenInput.nativeElement.click();
  }

  public fireMetaClick(): void {
    this.hiddenMetaInput.nativeElement.click();
  }

  public onFormSubmit() {
    this.emitter.emit(CONFIRM);
  }

}

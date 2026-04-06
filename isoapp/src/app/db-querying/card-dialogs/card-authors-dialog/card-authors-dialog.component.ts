import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { distinct, deleteByValue } from 'src/app/shared/tools';
import { AuthorService } from 'src/app/services/rest/author.service';
import { Author } from 'src/app/models/author';
import { CACHE_AUTH } from 'src/app/shared/const';

@Component({
  selector: 'app-card-authors-dialog',
  templateUrl: './card-authors-dialog.component.html',
  styleUrls: ['./card-authors-dialog.component.scss']
})
export class CardAuthorsDialogComponent implements OnInit {
  public author = '';
  public surname = '';
  public name = '';
  public authors = new Array<string>();
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('authlist') authlist: ElementRef | undefined;
  private insertFlag = true;

  constructor(private renderer: Renderer2,
    private storeService: StoreService,
    private authorService: AuthorService) { }

  ngOnInit(): void {
    this.authors = new Array<string>();
    this.queryFilter = this.storeService.get(FILTER_KEY);
    if (!!this.queryFilter) {
      for (let a of this.queryFilter.authors.authors) {
        this.authors.push(a);
      }
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public addAuthor(): void {
    if (this.surname.length === 0 || this.name.length === 0)
      return;
    this.author = this.surname + ',' + this.name;
    if (this.author.length > 0) {
      this.authors.push(this.author);
      this.authors = distinct(this.authors);
      if (this.insertFlag === true)
        this.authorService.insertAuthor({ id: -1, surname: this.surname, name: this.name }).subscribe(
          (res) => {
            // console.log(res);
            this.storeService.clean(CACHE_AUTH);
            const s = this.authorService.getAuthors().subscribe(
              (result: any) => {
                // console.log(result);
                this.storeService.push({ key: CACHE_AUTH, data: result });
              }
            );
          });
      this.surname = '';
      this.name = '';
    }
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    filter.authors.authors = this.authors;
    this.storeService.push({ key: FILTER_KEY, data: filter });
    this.emitter.emit(CONFIRM);
  }

  public deleteFromList(author: string): void {
    this.authors = deleteByValue(this.authors, author);
  }

  public getAuthors() {
    if (this.surname.indexOf(',') > 0) {
      this.insertFlag = false;
      let x = this.surname.split(',');
      if (x.length === 2) {
        this.surname = x[0];
        this.name = x[1].trim();
        return;
      }
    }
    if (this.surname.length > 2) {
      let s = this.authorService.getAuthors(this.surname).subscribe(
        (res: any) => {
          Array.from(this.authlist?.nativeElement.children).forEach(child => {
            this.renderer.removeChild(this.authlist?.nativeElement, child);
          });
          if (res.length <= 0) {
            this.insertFlag = true;
          }
          for (let r of res) {
            const option = this.renderer.createElement('option');
            option.setAttribute('value', r.surname + ', ' + r.name);
            this.renderer.appendChild(this.authlist?.nativeElement, option);
          }
          // s.unsubscribe();
        }
      );
    }
  }
}

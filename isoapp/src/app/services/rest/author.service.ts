import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Author } from 'src/app/models/author';
import { HttpClient } from '@angular/common/http';
import { StoreService } from '../common/store.service';
import { CACHE_AUTH } from 'src/app/shared/const';

@Injectable({
  providedIn: 'root'
})
export class AuthorService extends Rest {
  constructor(private http: HttpClient, private storeService: StoreService) { super(); }

  public insertAuthor(author: Author): Observable<any> {
    return this.http.post(this.serviceUrl + 'insert-author', author).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public getAuthors(surname?: string, name?: string): Observable<any> {
    if (!!this.storeService.get(CACHE_AUTH))
      return this.getAuthorsFromCache(surname, name);
    return this.getAuthorsFromRemote(surname, name);
    // let endpoint = this.serviceUrl + 'get-authors';
    // if (!!surname || !!name) {
    //   endpoint += '?';
    // }
    // if (!!surname)
    //   if (endpoint.endsWith('?'))
    //     endpoint += 'surname=' + surname;
    //   else
    //     endpoint += '&surname=' + surname;
    // if (!!name) {
    //   if (endpoint.endsWith('?'))
    //     endpoint += 'name=' + name;
    //   else
    //     endpoint += '&name=' + name;
    // }

    // return this.http.get(endpoint).pipe(map(
    //   (res: any) => {
    //     let authors = new Array<Author>();
    //     if (!!res) {
    //       for (let r of res) {
    //         authors.push(r);
    //       }
    //     }
    //     return authors;
    //   }
    // ),
    //   catchError(this.handleError)
    // );
  }

  public getAuthorsFromCache(surname?: string, name?: string): Observable<any> {
    console.log('cache');
    let authList = this.storeService.get(CACHE_AUTH);
    let outList = new Array<any>();
    if (!!surname && !name) {
      for (let a of authList) {
        if (a.surname.toLowerCase().indexOf(surname.toLowerCase()) >= 0) {
          outList.push(a);
        }
      }
    }
    else if (!surname && !!name) {
      for (let a of authList) {
        if (a.name.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
          outList.push(a);
        }
      }
    } else if (!!surname && !!name) {
      for (let a of authList) {
        if (a.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
          && a.surname.toLowerCase().indeOf(surname.toLowerCase())) {
          outList.push(a);
        }
      }
    }
    return of(outList);
  }

  public getAuthorsFromRemote(surname?: string, name?: string): Observable<any> {
    let endpoint = this.serviceUrl + 'get-authors';
    if (!!surname || !!name) {
      endpoint += '?';
    }
    if (!!surname)
      if (endpoint.endsWith('?'))
        endpoint += 'surname=' + surname;
      else
        endpoint += '&surname=' + surname;
    if (!!name) {
      if (endpoint.endsWith('?'))
        endpoint += 'name=' + name;
      else
        endpoint += '&name=' + name;
    }

    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        let authors = new Array<Author>();
        if (!!res) {
          for (let r of res) {
            authors.push(r);
          }
        }
        return authors;
      }
    ),
      catchError(this.handleError)
    );
  }
}

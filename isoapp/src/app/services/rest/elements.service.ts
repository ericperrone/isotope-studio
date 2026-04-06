import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Element } from 'src/app/models/element';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ElementsService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public getElements(): Observable<any> {
    let endpoint = this.serviceUrl + 'get-elements';
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        let authors = new Array<Element>();
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

  public insertElement(element: string, isotope: boolean, group?: string): Observable<any> {
    let payload = {};
    if (!!group) {
      payload = {
        element: element,
        isotope: isotope,
        group: group
      }
    } else {
      payload = {
        element: element,
        isotope: isotope
      }
    }
    return this.http.post(this.serviceUrl + 'insert-element', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }
}

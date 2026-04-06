import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Rest } from './rest';
import { Observable, catchError, map } from 'rxjs';
import { Reservoir } from 'src/app/models/reservoir';

@Injectable({
  providedIn: 'root'
})
export class ReservoirService extends Rest {

  constructor(private http: HttpClient) {
    super();
   }

  public getReservoirList(): Observable<any> {
    let endpoint = this.serviceUrl + 'get-reservoir-list';
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        // console.log(res);
        let list = new Array<string>();
        if (!!res) {
          list.push('');
          for (let r of res.data) {
            list.push(r);
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }
  
  public getReservoirByName(filter?: string): Observable<any> {
    let endpoint = this.serviceUrl + 'get-reservoir';
    if (!!filter) {
      endpoint += '?filter=' + filter;
    }
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        let list = new Array<Reservoir>();
        if (!!res && !!res.status && res.status === 'success') {
          for (let r of res.list) {
            list.push({
              id: r.id,
              name: r.reservoir,
              element: r.element,
              value: r.value,
              um: r.um,
              reference: r.reference,
              source: r.source,
              error: r.error,
              errorType: r.errorType
            });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }
  
}

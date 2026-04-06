import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rest } from './rest';
import { catchError, map, Observable, of } from 'rxjs';
import { Thesauri } from 'src/app/models/thesauri';


@Injectable({
  providedIn: 'root'
})
export class ThesauriService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public list(): Observable<any> {
    let endpoint = this.serviceUrl + 'get-thesauri-list';
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        let list = new Array<Thesauri>();
        if (!!res) {
          for (let r of res) {
            list.push({ id: r.id, key: r.key, src: r.src });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getThesaurus(id: number): Observable<any> {
    let endpoint = this.serviceUrl + 'get-thesauri?id=' + id;
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        return res.content;
      }
    ),
      catchError(this.handleError)
    );
  }
}

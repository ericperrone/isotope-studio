import { Injectable } from '@angular/core';
import { Rest, corsOptions } from './rest';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ChemComponent, Sample, SampleElement } from 'src/app/models/sample';
import { QueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { StoreService, UserInfo } from '../common/store.service';

export interface QueryInfoBody {
  authors?: any;
  keywords?: any;
  reference?: any;
  polygon?: any;
  year?: any;
  matrix?: any;
}

export interface SampleAttributeItem {
  id: number;
  name: string;
  value?: number;
  um?: string;
  technique?: string;
  uncertainty?: string;
  uncertaintyType?: string;
  refstd?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SampleService extends Rest {

  constructor(private http: HttpClient, private storeService: StoreService) { super(); }

  public getSampleAttribute(id: number, name: string): Observable<any> {
    let qs = this.serviceUrl + 'query-sample-attribute?id=' + id + '&name=' + encodeURIComponent(name);
    return this.http.get(qs).pipe(map(
      (res: any) => {
        console.log(res);
        if (!!res) {
          return (
            { id: res.sampleId, name: res.name, value: res.nvalue, um: res.um, technique: res.technique, 
              uncertainty: res.uncertainty, uncertaintyType: res.uncertaintyType, refstd: res.refstd }
          );
        } else {
          return (
            { id: 0, name: '' }
          );
        }
      }
    ),
      catchError(this.handleError)
    );
  }


  public getSamplesById(ids: Array<number>): Observable<any> {
    let params = '';
    for (let id of ids) {
      params += id + ',';
    }
    params = params.substring(0, params.length - 2);
    return this.http.get(this.serviceUrl + 'query-samples-by-id?ids=' + params).pipe(map(
      (res: any) => {
        let samples = new Array<Sample>();
        if (!!res) {
          for (let r of res) {
            let sample = { id: r.id, fields: new Array<SampleElement>(), components: new Array<ChemComponent> };
            for (let c of r.components) {
              let chem = { component: c.component, value: '' + c.value, isIsotope: c.isIsotope };
              sample.components.push(chem);
            }
          }
        }
        return samples;
      }
    ),
      catchError(this.handleError)
    );
  }

  public insertFullData(fullData: any): Observable<any> {
    let payload = {
      data: fullData
    }

    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      const options = {
        'headers': headers
      };
      return this.http.post(this.serviceUrl + 'insert-fulldata', payload, options).pipe(
        map((res: any) => { return of(res) }), catchError(this.handleError)
      );
    }

    return this.http.post(this.serviceUrl + 'insert-fulldata', payload);
  }

  public insertSample(sampleList: Array<Sample>): Observable<any> {
    let payload = {
      samples: sampleList
    }

    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      const options = {
        'headers': headers
      };
      return this.http.post(this.serviceUrl + 'insert-sample', payload, options).pipe(map(
        (res: any) => {
          if (res.status && res.status === 'success') {
            return res;
          }
        }
      ),
        catchError(this.handleError)
      );
    }
    return this.http.post(this.serviceUrl + 'insert-sample', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  private buildQueryString(filter: QueryFilter): string {
    let url = '';
    if (filter.ref.ref.length > 0) {
      url += '&ref=' + filter.ref.ref;
    }
    if (filter.keywords.keywords.length > 0) {
      let keys = '';
      for (let k of filter.keywords.keywords) {
        keys += k + ' ';
      }
      url += "&meta=" + keys.trimEnd();
    }
    if (filter.authors.authors.length > 0) {
      let auth = '';
      for (let a of filter.authors.authors) {
        auth += a + ';';
      }
      url += "&auth=" + auth.substring(0, auth.length - 1);
    }
    if (!!filter.geo) {
      url += "&x0=" + filter.geo.geo.topLongitude + "&x1=" + filter.geo.geo.bottomLongitude
        + "&y0=" + filter.geo.geo.topLatitude + "&y1=" + filter.geo.geo.bottomLatitude;
    }
    return url;
  }

  public mainQueryTable(filter: QueryFilter): Observable<any> {
    // let url = this.serviceUrl + 'get-samples?1=1';
    // url += this.buildQueryString(filter);
    // return this.http.get(url);
    let url = this.serviceUrl + 'query-info';
    let body: QueryInfoBody = {};
    if (filter.authors && filter.authors.authors.length > 0) {
      body.authors = { operator: filter.authors.connector, authors: filter.authors.authors };
    }
    if (filter.keywords && filter.keywords.keywords.length > 0) {
      let keys = '';
      for (let k of filter.keywords.keywords) {
        keys += k + ' ';
      }
      body.keywords = { operator: filter.keywords.connector, keywords: keys };
    }
    if (filter.ref && filter.ref.ref.length > 0) {
      body.reference = { operator: filter.ref.connector, reference: filter.ref.ref };
    }
    if (filter.geo && filter.geo.geo) {
      body.polygon = {
        operator: filter.geo.connector,
        topLat: filter.geo.geo.topLatitude, topLon: filter.geo.geo.topLongitude,
        bottomLat: filter.geo.geo.bottomLatitude, bottomLon: filter.geo.geo.bottomLongitude
      };
    }
    if (filter.year && filter.year.year) {
      body.year = {
        operator: filter.year.connector,
        year: filter.year.year
      };
    }
    if (filter.matrix && filter.matrix.matrix) {
      body.matrix = {
        operator: filter.matrix.connector,
        matrix: filter.matrix.matrix
      }
    }

    return this.http.post(url, body).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public mainQuery(filter: QueryFilter): Observable<any> {
    let url = this.serviceUrl + 'query?1=1';
    url += this.buildQueryString(filter);
    return this.http.get(url);
  }
}

import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Dataset, DatasetCache, DatesetFullLink } from 'src/app/models/dataset';
import { CACHE_LINKS, CACHE_YEARS } from 'src/app/shared/const';
import { StoreService } from '../common/store.service';

@Injectable({
  providedIn: 'root'
})
export class DatasetService extends Rest {

  constructor(private http: HttpClient,
    private storeService: StoreService) {
    super();
  }

  public getYears(year?: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-years').pipe(map(
      (res: any) => {
        let years = new Array<string>();
        if (!!res) {
          for (let r of res) {
            years.push(r);
          }
        }
        this.storeService.clean(CACHE_YEARS);
        this.storeService.push({ key: CACHE_YEARS, data: years });
        return years;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getLinks(link?: string): Observable<any> {
    return this.getLinksFromRemote();
  }

  public getLinksFromRemote(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-links').pipe(map(
      (res: any) => {
        let links = new Array<string>();
        if (!!res) {
          // console.log(res);
          for (let r of res) {
            links.push(r);
          }
        }
        this.storeService.clean(CACHE_LINKS);
        this.storeService.push({ key: CACHE_LINKS, data: links });
        return links;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getLinksFromCache(link?: string): Observable<any> {
    // console.log('CACHE');
    let linkList = this.storeService.get(CACHE_LINKS);
    let outList = new Array<any>();
    if (!!link) {
      for (let a of linkList) {
        if (a.toLowerCase().indexOf(link.toLowerCase()) >= 0) {
          outList.push(a);
        }
      }
    }
    return of(outList);
  }

  public getDatasetList(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-available-dataset-list').pipe(map(
      (res: any) => {
        let datasetList = new Array<Dataset>();
        if (!!res) {
          // console.log(res);
          for (let r of res) {
            let d: Dataset = {
              id: r.id,
              ref: r.link,
              authors: r.authors,
              keywords: r.keywords,
              fileName: r.fileName,
              processed: r.processed,
              year: r.year,
              metadata: r.metadata
            }
            datasetList.push(d);
          }
        }
        return datasetList;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getDatasetBySample(id: string): Observable<any> {
    let endPoint = this.serviceUrl + 'get-dataset-by-sample?id=' + id;
    return this.http.get(endPoint).pipe(map(
      (res: any) => {
        if (!!res) {
          console.log(res);
          return {
            authors: res.authors,
            id: res.id,
            keywords: res.keywords,
            ref: res.link,
            metadata: res.metadata,
            year: res.year,
            fileName: res.fileName,
            processed: res.processed
          };
        }
        return undefined;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getCache(datasetId: number): Observable<any> {
    let endPoint = this.serviceUrl + 'getCache?datasetid=' + datasetId;
    return this.http.get(endPoint).pipe(
      map(
        (res: any) => {
          if (!!res) {
            return res.data;
          }
        }),
      catchError(this.handleError)
    );
  }

  public pushCache(data: Array<DatasetCache>): Observable<any> {
    let endPoint = this.serviceUrl + 'pushCache';
    let payload = { cache: data };
    return this.http.post(endPoint, payload);
  }

  public getLinksFull(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-full-references').pipe(map(
      (res: any) => {
        let datasetList = new Array<DatesetFullLink>();
        if (!!res) {
          // console.log(res);
          if (res.status && res.status.toLowerCase() == 'success') {
            let data = JSON.parse(res.data);
            for (let r of data) {
              if (r.link && r.link.length > 0)
                datasetList.push({ ref: r.link, metadata: r.metadata });
            }
          }
        }
        return datasetList;
      }
    ),
      catchError(this.handleError)
    );
  }

  public insertDataset(data: any): Observable<any> {
    let payload = {
      dataset: data
    };
    return this.http.post(this.serviceUrl + 'insert-dataset', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return data;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public updateDataset(data: any): Observable<any> {
    let payload = {
      dataset: data
    };
    return this.http.put(this.serviceUrl + 'update-dataset', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return data;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public deleteDataset(id: string): Observable<any> {
    return this.http.delete(this.serviceUrl + 'delete-dataset/' + id).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public download(file: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-file-link/' + file);
  }

  public closeDataset(data: any): Observable<any> {
    data.processed = false;
    // let payload = {
    //   dataset: data
    // };
    return this.http.post(this.serviceUrl + 'close-dataset', data).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return data;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', this.serviceUrl + 'upload', formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

}

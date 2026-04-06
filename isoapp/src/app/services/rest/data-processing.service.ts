import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataProcessingService extends Rest {

  constructor(private http: HttpClient) {
    super();
  }

  public getFileList(): Observable<any> {
    return this.http.get(this.serviceUrl + 'contentdir').pipe(map(
      (res: any) => {
        let files = new Array<string>();
        if (!!res) {
          for (let r of res) {
            files.push(r);
          }
        }
        return files;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getContentCsv(file: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-content-csv?fileName=' + file).pipe(map(
      (res: any) => {
        let content = new Array<string>();
        if (!!res) {
          for (let r of res) {
            content.push(r);
          }
        }
        return content;
      }
    ),
      catchError(this.handleError)
    );
  }

  public setSeparator(file: string, separator: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'set-separator?fileName=' + file + '&separator=' + separator).pipe(map(
      (res: any) => {
        let content = new Array<string>();
        if (!!res) {
          for (let r of res) {
            content.push(r);
          }
        }
        return content;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getSheets(file: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'process-file?fileName=' + file).pipe(map(
      (res: any) => {
        let key = ''
        let sheets = new Array<string>();
        if (!!res) {
          key = res.key;
          for (let r of res.sheets) {
            sheets.push(r);
          }
        }
        return { _key: key, _sheets: sheets };
      }
    ),
      catchError(this.handleError)
    );
  }

  public getContentXlsx(sheet: string, key: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-content-xls?sheet=' + sheet + '&key=' + key).pipe(map(
      (res: any) => {
        console.log(res);
        let sheets = new Array<Array<string>>();
        if (!!res) {
          for (let r of res) {
            sheets.push(r);
          }
        }
        return sheets;
      }
    ),
      catchError(this.handleError)
    );
  }

  public releaseContent(key: string): Observable<any> {
    return this.http.delete(this.serviceUrl + 'close-contentdir?key=' + key).pipe(map(
      (res: any) => {
        console.log(res);
      }
    ));
  }

}

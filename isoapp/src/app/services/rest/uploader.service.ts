import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploaderService extends Rest {
  fileName = '';

  constructor(private http: HttpClient) { super(); }

  public onFileSelected(event: any): Observable<any> {
    const file: File = event.target.files[0];
    // if (file) {
    this.fileName = file.name;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.serviceUrl + 'metadataup', formData).pipe(map(
      (res: any) => {
        console.log(res);
        return res.meta;
      }
    ),
      catchError(this.handleError)
    );
    // let s = upload$.subscribe(
    //   (res: any) => {
    //     console.log(res);
    //     s.unsubscribe();
    //     return res.meta;
    //   }
    // );
    // }
  }
}

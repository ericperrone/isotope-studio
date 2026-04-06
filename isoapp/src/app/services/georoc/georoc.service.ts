import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthorName } from 'src/app/models/author';

export const GEOROC_URL = 'https://api-test.georoc.eu/api/v1/';
@Injectable({
  providedIn: 'root'
})
export class GeorocService {
  private GEOROC_KEY_NAME: string = 'DIGIS-API-ACCESSKEY';
  private GEOROC_KEY_VALUE: string = 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==';
  constructor(private http: HttpClient) { }

  public getSampleFullData(sampleId: number): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/fulldata/' + sampleId;
    return this.http.get(endpoint, { headers: { 'DIGIS-API-ACCESSKEY' : 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==' } }).pipe(map(
      (res: any) => {
        console.log(res);
        return res;
      }
    ),
      catchError(this.handleError)
    );    
  }

  public getSampleByPolygon(polygon: Array<Array<number>>): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/samples?polygon=['
    for (let a of polygon) {
      endpoint += '[' + a[0] + ',' + a[1] + '],'; 
    }
    endpoint = endpoint.substring(0, endpoint.length - 1);
    endpoint += ']';
    return this.getSamples(endpoint);
  }

  public getSamplesByLocation(location: string): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/samples?location1=eq:' + location;
    return this.getSamples(endpoint);
  }

  public getSamplesByAuthor(lastName: string, firstName: string): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/samples?lastname=eq:' + lastName + '&firstname=eq:' + firstName;
    return this.getSamples(endpoint);
  }

  private getSamples(endpoint: string): Observable<any> {
    return this.http.get(endpoint, { headers: { 'DIGIS-API-ACCESSKEY' : 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==' } }).pipe(map(
      (res: any) => {
        let data = new Array<number>();
        if (!!res) {
          for (let r of res.data) {
            data.push(r.sampleID);
          }
        }
        return data;
      }
    ),
      catchError(this.handleError)
    );    
  }

  public getAuthorList(): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/authors';
    return this.http.get(endpoint, { headers: { 'DIGIS-API-ACCESSKEY' : 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==' } }).pipe(map(
      (res: any) => {
        let authors = new Array<AuthorName>();
        if (!!res) {
          for (let r of res.data) {
            authors.push({ personId: r.personID, firstName: r.personFirstName, lastName: r.personLastName });
          }
        }
        return authors;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getLocations1List(): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/locations/l1';
    return this.http.get(endpoint, { headers: { 'DIGIS-API-ACCESSKEY' : 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==' } }).pipe(map(
      (res: any) => {
        let locations = new Array<string>();
        if (!!res) {
          for (let r of res.data) {
            locations.push(r.name);
          }
        }
        return locations;
      }
    ),
      catchError(this.handleError)
    );   
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return of('Error code: ' + error.status + ' Error detail: ' + error.error);
  }
}

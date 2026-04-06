import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

export interface MixingPlot {
  xPoint: number;
  yPoint: number;
  xs: Array<MixingModelPayload>;
  ys: Array<MixingModelPayload>;
}

export interface MixingModelPayload {
  endMemberName: string;
  elementName: string;
  elementValue: string;
  concentration: string;
  concentrationValue: string;
}

export interface MixingModelMember {
  member: string;
  element: string;
  concentration: number;
  concentration2?: number;
}

export interface MixingModelServicePayloadItem {
  increment: number;
  members: Array<MixingModelMember>;
}

@Injectable({
  providedIn: 'root'
})
export class GeoModelsService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public mixingModel(data: Array<MixingModelPayload>, increment?: number): Observable<any> {
    let payload = { data: new Array<MixingModelServicePayloadItem>() };

    let payloadItem: MixingModelServicePayloadItem = {
      increment: !!increment ? increment : 0.01,
      members: new Array<MixingModelMember>()
    };

    for (let p of data) {
      let member: MixingModelMember = {
        element: p.elementName,
        member: p.endMemberName,
        concentration: parseFloat(p.elementValue),
        concentration2: p.concentrationValue.length > 0 ? parseFloat(p.concentrationValue) : undefined
      };
      payloadItem.members.push(member);
    }

    payload.data.push(payloadItem);

    return this.http.post(this.serviceUrl + 'mixing-model', payload).pipe(map(
      (res: any) => {
        return res;
      }
    ),
      catchError(this.handleError)
    );
  }

  public mixingPlot(payload: MixingPlot): Observable<any> {
    return this.http.post(this.serviceUrl + 'mixing-plot', payload).pipe(map(
      (res: any) => {
        console.log(res);
        return res;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getNorms(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-normalization').pipe(map(
      (res: any) => {
        return res;
      }
    ), catchError(this.handleError));
  }

  public getConversionTable(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-measure-unit').pipe(map(
      (res: any) => {
        return res;
      }
    ), catchError(this.handleError));   
  }

  public getUncertaintyType(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-uncertainty-type').pipe(map(
      (res: any) => {
        return res;
      }
    ), catchError(this.handleError));   
  }

  public checkUm(s: string, ums: Array<string>): string {
    let iums = [...ums];
    let is = s.toLowerCase().trim();
    for(let um of iums) {
      if (um.toLowerCase().trim() === is) {
        return um;
      }
    }
    return s;
  }
}





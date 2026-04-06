import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Rest } from './rest';
import { Matrix } from 'src/app/models/sample';

@Injectable({
  providedIn: 'root'
})
export class MatrixService  extends Rest {

  constructor(private http: HttpClient) {
    super();
   }

  public getMatrices(): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix';
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        // console.log(res);
        let list = new Array<Matrix>();
        if (!!res) {
          for (let r of res) {
            list.push({ matrix: r.matrix, nodeId: r.nodeId, parentNodeId: !!r.parentNodeId ? r.parentNodeId : undefined });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getRoots(): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix/roots';
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        console.log(res);
        let list = new Array<Matrix>();
        if (!!res) {
          for (let r of res) {
            list.push({ matrix: r.matrix, nodeId: r.nodeId, parentNodeId: !!r.parentNodeId ? r.parentNodeId : undefined });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getChildren(nodeId: number): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix/children?nodeid=' + nodeId;
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        console.log(res);
        let list = new Array<Matrix>();
        if (!!res) {
          for (let r of res) {
            list.push({ matrix: r.matrix, nodeId: r.nodeId, parentNodeId: !!r.parentNodeId ? r.parentNodeId : undefined });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getNode(nodeId: number): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix/node?nodeid=' + nodeId;
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        console.log(res);
        if (!!res) {
          return { matrix: res.matrix, nodeId: res.nodeId, parentNodeId: !!res.parentNodeId ? res.parentNodeId : undefined };
        }
        return null;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getAncestor(nodeId: number): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix/ancestor?nodeid=' + nodeId;
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        console.log(res);
        let list = new Array<Matrix>();
        if (!!res) {
          for (let r of res) {
            list.push({ matrix: r.matrix, nodeId: r.nodeId, parentNodeId: !!r.parentNodeId ? r.parentNodeId : undefined });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getTree(nodeId: number): Observable<any> {
    let endpoint = this.serviceUrl + 'matrix/tree?nodeid=' + nodeId;
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        // console.log(res);
        let list = new Array<Matrix>();
        if (!!res) {
          for (let r of res) {
            list.push({ matrix: r.matrix, nodeId: r.nodeId, parentNodeId: !!r.parentNodeId ? r.parentNodeId : undefined });
          }
        }
        return list;
      }
    ),
      catchError(this.handleError)
    );
  }
}

import { Injectable } from '@angular/core';
import { StoreService, UserInfo } from '../common/store.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Rest } from './rest';
import { Observable, catchError, map } from 'rxjs';
import { Administrator } from 'src/app/models/administrator';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends Rest {
  constructor(private http: HttpClient, private storeService: StoreService) { super(); }

  public enable(account: string, enable: boolean): Observable<any> {
    const payload = {
      account: account
    };

    let options = {};
    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      options = {
        'headers': headers
      };
    }

    if (!!enable)
      return this.http.post(this.serviceUrl + 'enable', payload, options).pipe(map(
        (res: any) => {
          console.log(res);
          return res;
        }
      ),
        catchError(this.handleError)
      );
    else
      return this.http.post(this.serviceUrl + 'disable', payload, options).pipe(map(
        (res: any) => {
          console.log(res);
          return res;
        }
      ),
        catchError(this.handleError)
      );
  }

  public insert(admin: Administrator): Observable<any> {
    const payload = {
      data: { account: admin.account, password: admin.password, email: admin.email, id: 0, active: true }
    };

    let options = {};
    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      options = {
        'headers': headers
      };
    }

    return this.http.post(this.serviceUrl + 'insertAdministrator', payload, options).pipe(map(
      (res: any) => {
        console.log(res);
        if (res.status && res.status === 'success') {
          return res.adminisrator;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public login(user: string, password: string): Observable<any> {
    const payload = {
      data: { account: user, password: password }
    };

    return this.http.post(this.serviceUrl + 'login', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          this.storeService.setCurrentUser({ username: user, key: res.key });
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public generateAccessKey(partner: string): Observable<any> {
    let options = {};
    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      options = {
        'headers': headers
      };
    }
    return this.http.post(this.serviceUrl + 'genkey', { partner: partner }, options).pipe(map(
      (res: any) => {
        console.log(res);
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public changePassword(user: string, oldPassword: string, password: string): Observable<any> {
    const payload = {
      account: user,
      oldpassword: oldPassword,
      password: password
    };

    let options = {};
    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      options = {
        'headers': headers
      };
    }

    return this.http.post(this.serviceUrl + 'changePassword', payload, options).pipe(map(
      (res: any) => {
        console.log(res);
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public getAdministrators(account?: string) {
    let url = this.serviceUrl + 'getAdministrators';
    if (!!account) url += '/' + account;

    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      const options = {
        'headers': headers
      };

      return this.http.get(url, options).pipe(map(
        (res: any) => {
          let admins = new Array<Administrator>();
          for (let a of res.list) {
            admins.push({ id: a.list, account: a.account, active: a.active, email: a.email });
          }
          return admins;
        }
      ),
        catchError(this.handleError)
      );
    }
    return this.http.get(url).pipe(map(
      (res: any) => {
        return res;
      }
    ),
      catchError(this.handleError)
    );
  }
}

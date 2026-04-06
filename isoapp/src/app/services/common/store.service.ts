import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventGeneratorService } from './event-generator.service';

export const CURRENT_USER = '_CURRENT_USER_';
export const STORE_ALERT = '_STORE_ALERT_';

export interface UserInfo {
  username: string;
  key?: string;
}

export interface storeParam {
  key: string,
  data: any
}

export interface storeType {
  [key: string] : any
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private store: storeType = [];
  constructor() { }

  public push(something: storeParam, eventGenerator?: EventGeneratorService): void {
    this.store[something.key] = something.data; 
    if (!!eventGenerator) {
      eventGenerator.emit({key: STORE_ALERT, content: something.key});
    }
  }

  public get(key: string): any {
    return this.store[key];
  }

  public clean(key: string, eventGenerator?: EventGeneratorService): void {
    delete(this.store[key]);
    if (!!eventGenerator) {
      eventGenerator.emit({key: STORE_ALERT, content: key});
    }
  }

  public deleteCurrentUser(): void {
    delete(this.store[CURRENT_USER]);
  }

  public setCurrentUser(currentUser: UserInfo): void {
    this.store[CURRENT_USER] = currentUser;
  }

  public getCurrentUser(): UserInfo {
    return this.store[CURRENT_USER];
  }
  
  public onKey(key: string): Observable<any> | undefined {
    return of(this.store[key]);
  }
 
}

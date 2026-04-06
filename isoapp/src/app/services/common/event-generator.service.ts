import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Event {
  key: string,
  content?: any
}

@Injectable({
  providedIn: 'root'
})
export class EventGeneratorService {
  private eventBus: Subject<Event> = new Subject<Event>();

  constructor() {
    this.eventBus = new Subject<Event>();
  }

  public emit(event: Event): void {
    this.eventBus?.next(event);
  }

  public on(key: string): Observable<Event> {
    return this.eventBus.pipe(filter(e => e.key === key));
  }
}


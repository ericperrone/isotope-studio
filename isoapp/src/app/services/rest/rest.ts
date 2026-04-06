import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

export const corsOptions = {
  origin: '*',
  methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

export class Rest {
    protected serviceUrl = '';
 
    constructor() { 
        this.serviceUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;
    }

    public handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // return throwError(() => new Error('Error code: ' + error.status + ' Error detail: ' + error.error));
        return of ({ 'status': 'error', 'errorCode': error.status , 'errorDetail': error.error });
      }
}
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';

@Injectable({
  providedIn: 'root'
})
export class AlertServiceService {

  constructor(private modalService: NgbModal) { 

  }

  public alert(title: string, message: string, callback?: any): void {
       let params: ModalParams = {}
        params = {
          headerText: title,
          bodyText: message
        }
        let ref = this.modalService.open(AlertComponent, { centered: true });
        ref.componentInstance.params = params;
        ref.componentInstance.emitter.subscribe(
          () => {
            ref.close();
            if (!!callback)
              callback();
          }
        );
  }
}

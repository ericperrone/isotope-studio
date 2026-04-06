import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams, CONFIRM, CANCEL } from '../modal-params';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    this.emitter.emit(CONFIRM);
  }
}

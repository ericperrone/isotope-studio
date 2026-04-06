import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams } from '../modal-params';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  public close() {
    this.emitter.emit('close');
  }
}

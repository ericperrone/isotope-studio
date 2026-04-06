import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams, ExclusiveChoice, CONFIRM, CANCEL } from '../modal-params';


@Component({
  selector: 'app-select-box',
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.scss']
})
export class SelectBoxComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    if (!this.params || !this.params.choices) {
      return;
    }
  }

  public setStyle(c: ExclusiveChoice): string {
    let style = 'cursor: pointer;';
    if (!!c && !!c.color) {
      style += "color:" + c.color + " !important";
    }
    return style;
  }

  public emit(value: number) {
    this.emitter.emit(value);
  }

}

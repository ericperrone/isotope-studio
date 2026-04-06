import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams } from '../modal-params';

export const CLOSE = 'CLOSE';
export const PLOT = 'PLOT';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit {
  public xPoint: number = 0;
  public yPoint: number = 0;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @Input() params: ModalParams | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public close() {
    this.emitter.emit({ cmd: CLOSE });
  }

  public plot() {
    this.emitter.emit({ cmd: PLOT, xPoint: this.xPoint, yPoint: this.yPoint });
  }
}

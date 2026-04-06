import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-csv-separator',
  templateUrl: './select-csv-separator.component.html',
  styleUrls: ['./select-csv-separator.component.scss']
})
export class SelectCsvSeparatorComponent implements OnInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public close() {
    this.emitter.emit('close');
  }

  public emit(cmd: string) {
    this.emitter.emit(cmd);
  }

}

import { Component, OnInit, Output, EventEmitter } from '@angular/core';

export const AND = 'AND';
export const OR = 'OR';

@Component({
  selector: 'app-query-connector',
  templateUrl: './query-connector.component.html',
  styleUrls: ['./query-connector.component.scss']
})
export class QueryConnectorComponent implements OnInit {
  public _AND = AND;
  public _OR = OR;
  public connector = AND;
  @Output() queryConnector = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

}

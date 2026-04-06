import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import { ScaleLine } from 'ol/control';

@Component({
  selector: 'app-geo-scale-line',
  templateUrl: './geo-scale-line.component.html',
  styleUrls: ['./geo-scale-line.component.scss']
})
export class GeoScaleLineComponent implements OnInit, AfterViewInit {
  @Input() map: Map | undefined;
  private control: ScaleLine | undefined;
  @ViewChild('geoscaleline') scaleline: any;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!!this.map) {
      this.control = new ScaleLine({
        target: this.scaleline.nativeElement,
        units: 'metric'
      });
      this.map.addControl(this.control);
    }
  }
}

import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { CoordinateFormatterService } from 'src/app/services/common/coordinate-formatter.service';
import Map from 'ol/Map';
import ControlMousePosition from 'ol/control/MousePosition';
import { CoordinateFormat } from 'ol/coordinate';

@Component({
  selector: 'app-geo-mouse-position',
  templateUrl: './geo-mouse-position.component.html',
  styleUrls: ['./geo-mouse-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoMousePositionComponent implements OnInit, AfterViewInit {
  @Input() map: Map | undefined;
  private control: ControlMousePosition | undefined;
  @ViewChild('geomouseposition') mouseposition: any;

  constructor(private formatterService: CoordinateFormatterService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!!this.map) {
      let formatter: CoordinateFormat = (coordinates: Array<number> | undefined) => this.formatterService.numberCoordinates(
        coordinates, 4, undefined);

      this.control = new ControlMousePosition({
        className: 'mouseposition-control',
        coordinateFormat: formatter,
        target: this.mouseposition.nativeElement
      });
      this.map.addControl(this.control);
    }
  }
}

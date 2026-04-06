import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import { OverviewMap, defaults as defaultControls } from 'ol/control.js';
import { Draw } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import { createBox } from 'ol/interaction/Draw';
import { CANCEL, CONFIRM } from '../../modals/modal-params';
import { Collection, Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { DecimalPipe } from '@angular/common';
import { epsg3857to4326, GeoGoordinates } from 'src/app/shared/tools';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { AND } from 'src/app/db-querying/common/query-connector/query-connector.component';

export interface GeoParams {
  view?: {
    center: Array<number>;
    zoom: number;
    projection: string;
  };
  window?: {
    onlyMap: boolean;
  }
}

@Component({
  selector: 'app-geo',
  templateUrl: './geo.component.html',
  styleUrls: ['./geo.component.scss']
})
export class GeoComponent implements OnInit, AfterViewInit {
  public map: Map | undefined;
  public coordinates = new Array<Array<number>>();
  public topLat = '';
  public topLong = '';
  public bottomLat = '';
  public bottomLong = '';
  private sourceOSM = new OSM();
  private sourceVector = new VectorSource({ wrapX: false });
  // private sourceWMS = new O
  private draw = new Draw({ type: 'Circle' });
  private collection = new Collection<Feature<Geometry>>();
  @ViewChild('extent') extent: any;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @Input() params: GeoParams | undefined;
  public onlyMap: boolean = false;
  public drawEnd = false;

  constructor(private decimalPipe: DecimalPipe,
    private storeService: StoreService) { }

  ngOnInit(): void {
    const overviewMapControl = new OverviewMap({
      layers: [
        new TileLayer({
          source: this.sourceOSM,
        }),
      ],
    });

    let defaultView: View = new View({
      center: [0, 0],
      zoom: 0,
      projection: 'EPSG:3857',
      // projection: 'EPSG:4326',
    });

    let currentView: View = defaultView;

    if (!!this.params) {
      if (!!this.params.view) {
        currentView = new View({
          center: [this.params.view.center[0], this.params.view.center[1]],
          zoom: this.params.view.zoom,
          projection: this.params.view.projection
        })
      }
      if (!!this.params.window) {
        this.onlyMap = this.params.window.onlyMap;
      }
    }

    setTimeout(() => {
      this.map = new Map({
        controls: defaultControls().extend([overviewMapControl]),
        // view: new View({
        //   center: [0, 0],
        //   zoom: 0,
        //   projection: 'EPSG:3857',
        //   // projection: 'EPSG:4326',
        // }),
        view: currentView,
        layers: [
          new TileLayer({
            source: this.sourceOSM,
          }),
          new VectorLayer({
            source: this.sourceVector,
          })
        ],
        target: 'ol-map'
      });
      this.initDraw();
    }, 500);
  }

  private initDraw(): void {
    this.draw = new Draw(
      {
        source: this.sourceVector,
        type: 'Circle',
        geometryFunction: createBox(),
        features: this.collection
      }
    );

    this.draw.on('drawstart', (e: any) => {
      // this.collection.getLength;
      // let feature = this.collection.item(this.collection.getLength() - 1);
      // this.sourceVector.removeFeature(feature);
      // this.collection.pop();
      this.resetSelection();
    });

    this.draw.addEventListener('drawend', (event) => {
      console.log(event.target.sketchCoords_);
      this.coordinates = event.target.sketchCoords_;
      this.remapCoordinates();
    });

    this.map?.addInteraction(this.draw);
    this.drawEnd = true;
  }

  ngAfterViewInit(): void {
  }

  private remapCoordinates() {
    let c4326 = epsg3857to4326(this.coordinates[0][1], this.coordinates[0][0]);
    this.coordinates[0][1] = c4326.latitude;
    this.coordinates[0][0] = c4326.longitude;

    c4326 = epsg3857to4326(this.coordinates[1][1], this.coordinates[1][0]);
    this.coordinates[1][1] = c4326.latitude;
    this.coordinates[1][0] = c4326.longitude;

    this.manageInverseRectangle();

    let fractionDigits = 4;
    const digitsInfo = `1.${fractionDigits}-${fractionDigits}`;
    this.topLat = '' + this.decimalPipe.transform(this.coordinates[0][1], digitsInfo);
    this.topLong = '' + this.decimalPipe.transform(this.coordinates[0][0], digitsInfo);
    this.bottomLat = '' + this.decimalPipe.transform(this.coordinates[1][1], digitsInfo);
    this.bottomLong = '' + this.decimalPipe.transform(this.coordinates[1][0], digitsInfo);
  }

  private manageInverseRectangle() {
    let topLat = this.coordinates[0][1];
    let topLon = this.coordinates[0][0];
    let botLat = this.coordinates[1][1];
    let botLon = this.coordinates[1][0];

    if (botLat * topLat > 0) {
      if (botLat - topLat > 0) {
        this.coordinates[0][1] = botLat
        this.coordinates[0][0] = botLon;
        this.coordinates[1][1] = topLat;
        this.coordinates[1][0] = topLon;
      }
    } else if (botLon * topLon > 0) {
      if (botLon - topLon > 0) {
        this.coordinates[0][1] = botLat
        this.coordinates[0][0] = botLon;
        this.coordinates[1][1] = topLat;
        this.coordinates[1][0] = topLon;
      }
    } else {
      if (botLon - topLon < 0) {
        this.coordinates[0][1] = botLat
        this.coordinates[0][0] = botLon;
        this.coordinates[1][1] = topLat;
        this.coordinates[1][0] = topLon;
      }
    }
  }

  private resetSelection(): void {
    this.collection.getLength;
    let feature = this.collection.item(this.collection.getLength() - 1);
    this.sourceVector.removeFeature(feature);
    this.collection.pop();
    this.coordinates.length = 0;
  }

  public cancel() {
    this.resetSelection();
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    if (!filter.geo) {
      filter.geo = {
        connector: AND,
        geo: {
          topLatitude: this.coordinates[0][1],
          topLongitude: this.coordinates[0][0],
          bottomLatitude: this.coordinates[1][1],
          bottomLongitude: this.coordinates[1][0]
        }
      }
    } else {
      filter.geo.geo = {
        topLatitude: this.coordinates[0][1],
        topLongitude: this.coordinates[0][0],
        bottomLatitude: this.coordinates[1][1],
        bottomLongitude: this.coordinates[1][0]
      }
    };
    this.storeService.push({ key: FILTER_KEY, data: filter });
    this.emitter.emit(CONFIRM);
  }
}


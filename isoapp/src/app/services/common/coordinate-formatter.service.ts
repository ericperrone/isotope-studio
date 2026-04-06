import { Injectable } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { epsg3857to4326, GeoGoordinates } from 'src/app/shared/tools';

@Injectable({
  providedIn: 'root'
})
export class CoordinateFormatterService {

  constructor(private decimalPipe: DecimalPipe) { }

  numberCoordinates(
    coordinates?: number[],
    fractionDigits: number = 0,
    template?: string,
  ): string {
    if (!coordinates) {
      return '';
    }
    
    template = template || 'Lat. {y}  :  Long. {x}';

    let x = coordinates[0];
    let  y = coordinates[1];

    let c4326 = epsg3857to4326(y, x);

    x = c4326.longitude;
    y = c4326.latitude;

    const digitsInfo = `1.${fractionDigits}-${fractionDigits}`;
    const sX = this.decimalPipe.transform(x, digitsInfo);
    const sY = this.decimalPipe.transform(y, digitsInfo);
    return template.replace('{x}', '' + sX).replace('{y}', '' + sY);
  }

}

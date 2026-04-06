import { Component, Input, OnInit } from '@angular/core';
import { ElementsService } from '../services/rest/elements.service';
import { ChemElements, Isotopes } from 'src/app/shared/const';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(private elementsService: ElementsService) {}
  
  ngOnInit(): void {
    const s = this.elementsService.getElements().subscribe(
      (res: any) => {
        if (!!res && res.length > 0) {
          ChemElements.length = 0;
          Isotopes.length = 0;
          for (let r of res) {
            if (!!r.isotope) {
              Isotopes.push(r.element);
            } else {
              ChemElements.push(r.element);
            }
          }
        }
        s.unsubscribe();
      }
      
    );
  }
}

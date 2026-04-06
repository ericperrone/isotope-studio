import { Component, OnInit } from '@angular/core';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';

export const ON = '_ON_';
export const OFF = '_OFF_';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  public spinnerOn = false;

  constructor(private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.eventGeneratorService.on('spinner').subscribe( 
      (e) => {
        if (e.content === ON) {
          this.spinnerOn = true;
        } else {
          this.spinnerOn = false;
        }
      }
    );
  }

}

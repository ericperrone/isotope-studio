import { Component, ElementRef, OnInit, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/common/store.service';


@Component({
  selector: 'app-georoc',
  templateUrl: './georoc.component.html',
  styleUrls: ['./georoc.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class GeorocComponent implements OnInit, OnDestroy {
  public active = 0;
  public disabled = false;

  constructor(private storeService: StoreService,
    private router: Router) { }

  ngOnInit(): void {
    if (!this.storeService.getCurrentUser()) {
      this.disabled = true;
    }
  }

  ngOnDestroy(): void {

  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

}



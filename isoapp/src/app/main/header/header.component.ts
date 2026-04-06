import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { StoreService } from 'src/app/services/common/store.service';

export const CLOSE_ALL_MODALS = '_CLOSE_ALL_MODALS_';
export const LOGOUT = '_LOGOUT_';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() public initialStatus: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;
  public slideLeft: boolean = false;
  public slideRight: boolean = false;
  public transition: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;

  constructor(private router: Router,
    public storeService: StoreService,
    private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    if (!!this.initialStatus) {
      this.transition = this.initialStatus;
    } else {
      this.transition = 'sideOff';
    }
  }

  public gotoDataProcessing() {
    this.eventGeneratorService.emit({ key: CLOSE_ALL_MODALS });
    setTimeout(() => this.router.navigate(['main-data-processing']), 100);
    
  }

  public gotoDbQueries() {
    this.eventGeneratorService.emit({ key: CLOSE_ALL_MODALS });
    setTimeout(() => this.router.navigate(['main-db-querying']), 100);
  }

  public gotoTest() {
    this.eventGeneratorService.emit({ key: CLOSE_ALL_MODALS });
    this.router.navigate(['test']);
  }

  public gotoLogin() {
    this.eventGeneratorService.emit({ key: CLOSE_ALL_MODALS });
    this.router.navigate(['login']);
  }

  public gotoHome() {
    this.eventGeneratorService.emit({ key: CLOSE_ALL_MODALS });
    this.router.navigate(['main']);
  }

  public toggleSidebar(): void {
    if (this.transition === 'sideOff') {
      this.transition = 'transitionRight';
      setTimeout(() => {
        this.transition = 'sideOn';
      }, 1000);
    } else if (this.transition === 'sideOn') {
      this.transition = 'transitionLeft';
      setTimeout(() => {
        this.transition = 'sideOff';
      }, 1000);      
    }
  }

  public logout() {
    this.storeService.deleteCurrentUser();
    this.eventGeneratorService.emit({ key: LOGOUT });
  }
}





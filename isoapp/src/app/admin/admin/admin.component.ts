import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/rest/admin.service';
import { Administrator } from 'src/app/models/administrator';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';
import { LOGOUT } from 'src/app/main/header/header.component';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CONFIRM, DataListItem, ModalParams } from 'src/app/shared/modals/modal-params';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { NewAdministratorComponent } from '../new-administrator/new-administrator.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  public logged = false;
  public partner = "";
  public accessKey = "";
  public admins: Array<Administrator> = new Array<Administrator>();
  private sub: Subscription | undefined;

  constructor(private adminService: AdminService,
    private eventGeneratorService: EventGeneratorService,
    private storeService: StoreService,
    private modalService: NgbModal,
    private router: Router) { }

  ngOnInit(): void {
    if (this.storeService.getCurrentUser()) {
      this.logged = true;
      this.loadAdministrators();
    } else {
      this.router.navigate(['main']);
    }

    this.sub = this.eventGeneratorService.on(LOGOUT).subscribe(
      () => {
        this.router.navigate(['main']);
      }
    );

  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private loadAdministrators(): void {
    let s = this.adminService.getAdministrators().subscribe(
      (res: any) => {
        this.admins = res;
        console.log(this.admins);
        s.unsubscribe();
      }
    );
  }

  public generateAccessKey(): void {
    let s = this.adminService.generateAccessKey(this.partner).subscribe(
      (res: any) => {
        console.log(res);
        if (res.status == 'success') {
          this.accessKey = res.key;
        }
        s.unsubscribe();
      }
    );
  }

  public addAdministrator(): void {
    let ref = this.modalService.open(NewAdministratorComponent, { centered: true });
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        if (response === CONFIRM) {
          ref.close();
          this.loadAdministrators();
        } else {
          ref.close();
        }
      });
  }

  public changePassword(a: Administrator): void {
    let ref = this.modalService.open(ChangePasswordComponent, { centered: true });
    ref.componentInstance.account = a.account;
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        console.log(response);
        ref.close();
      }
    );
  }

  public disable(a: Administrator): void {
    this.adminService.enable(a.account, false).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.loadAdministrators();
        }
      }
    );
  }

  public enable(a: Administrator): void {
    this.adminService.enable(a.account, true).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.loadAdministrators();
        }
      }
    );
  }

  public showInfo(a: Administrator): void {
    let listInfo = new Array<DataListItem>();
    listInfo.push({ key: 'account', value: a.account });
    listInfo.push({ key: 'email', value: a.email });
    listInfo.push({ key: 'active', value: '' + a.active });

    let params: ModalParams = {
      headerText: 'Administrator info',
      list: listInfo
    };
    let ref = this.modalService.open(AlertComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(() => ref.close());
  }

}

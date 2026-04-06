import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from 'src/app/services/common/store.service';
import { AdminService } from 'src/app/services/rest/admin.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';
import { KeyboardManager } from 'src/app/shared/keyboardmanager';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private keyManager = new KeyboardManager();
  public username = '';
  public password = '';
  private sub: Subscription | undefined;

  constructor(private modalService: NgbModal,
    private storeService: StoreService,
    private router: Router,
    private adminService: AdminService) { }

  ngOnInit(): void {
    this.sub = this.keyManager.listen().subscribe(
      (e: any) => {
        if (this.username.length * this.password.length > 0 && e === 'Enter') {
          this.login();
        }
      }
    );

    if (!!this.storeService.getCurrentUser()) {
      this.router.navigate(['admin']);
    }
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  public login(): void {
    let s = this.adminService.login(this.username, this.password).subscribe(
      (res: any) => {
        if (!!res.status && res.status === 'error') {
          this.displayErrorMessage(res);
        } else {
          this.router.navigate(['admin']);
        }
      }
    );
  }

  private displayErrorMessage(res: any) {
    let params: ModalParams = {}
    params = {
      headerText: 'Error',
      bodyText: res.errorDetail.message
    }
    let ref = this.modalService.open(AlertComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      () => {
        ref.close();
      }
    );
  }

}

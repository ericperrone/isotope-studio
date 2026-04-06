import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from 'src/app/services/rest/admin.service';
import { CANCEL, CONFIRM } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-new-administrator',
  templateUrl: './new-administrator.component.html',
  styleUrls: ['./new-administrator.component.scss']
})
export class NewAdministratorComponent implements OnInit {
  public account = '';
  public email = '';
  public password1 = '';
  public password2 = '';
  public error = false;
  public m1 = 'Please, insert account name';
  public m2 = 'Please, insert email';
  public m3 = 'Please, insert password';
  public m4 = 'Please, retype the new password';
  public m5 = 'New password has not been correctly retyped';
  public message = '';
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
  }

  public cancel(): void {
    this.emitter.emit(CANCEL);
  }

  public confirm(): void {
    if (this.account.length === 0) {
      this.message = this.m1;
      this.error = true;
    } else if  (this.email.length === 0) {
      this.message = this.m2;
      this.error = true;
    } else if (this.password1.length === 0) {
      this.message = this.m3;
      this.error = true;
    } else if (this.password1 !== this.password2) {
      this.message = this.m5;
      this.error = true;
    } else {
      this.error = false;
      let s = this.adminService.insert({id: 0, account: this.account, email: this.email, password: this.password1, active: true}).subscribe(
        (res: any) => {
          console.log(res);
          if (res.status === 'success')
            this.emitter.emit(CONFIRM);
          else {
            this.message = res.errorDetail.message;
            this.error = true;
          }
        }
      );
    }
  }

}

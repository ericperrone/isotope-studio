import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from 'src/app/services/rest/admin.service';
import { CANCEL, CONFIRM } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public oldpassword = '';
  public password1 = '';
  public password2 = '';
  public error = false;
  public m1 = 'New password has not been correctly retyped';
  public m2 = 'Please, insert old password';
  public m3 = 'Please, insert new password';
  public m4 = 'Please, retype the new password';
  public m5 = 'The new password is the same as the old one';
  public message = '';
  @Input() account: string | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
  }

  public cancel(): void {
    this.emitter.emit(CANCEL);
  }

  public confirm(): void {
    
    if (this.oldpassword.length === 0) {
      this.message = this.m2;
      this.error = true;
    }
    else if (this.password1.length === 0) {
      this.message = this.m3;
      this.error = true;
    }
    else if (this.password2.length === 0) {
      this.message = this.m4;
      this.error = true;
    } else if (this.password1 !== this.password2) {
      this.message = this.m1;
      this.error = true;
    } else if (this.password1 === this.oldpassword) {
      this.message = this.m5;
      this.error = true;
    }
    else {
      this.error = false;
      this.adminService.changePassword('' + this.account, this.oldpassword, this.password1).subscribe(
        (res: any) => {
          console.log(res);
          if(res.status === 'error') {
            if (!!res.errorDetail && !! res.errorDetail.message)
              this.message = res.errorDetail.message;
            else 
              this.message = "Server error";
            this.error = true;
            return;
          }
          this.emitter.emit(CONFIRM);
        }
      );
    }
  }

}

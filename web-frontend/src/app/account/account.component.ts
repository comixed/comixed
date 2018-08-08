import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic/comic.service';
import {AlertService} from '../alert.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  username;
  password = '';
  password_check = '';
  password_error = '';

  constructor(
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) {}

  ngOnInit() {
    this.username = this.comic_service.getUsername();
  }

  passesPasswordValidation(): boolean {
    if ((this.password.length > 8) && (this.password === this.password_check)) {
      this.password_error = '';
      return true;
    } else {
      this.password_error = 'Passwords do not match.';
      return false;
    }
  }

  updateUsername(): void {
    this.comic_service.change_username(this.username).subscribe(
      (response: Response) => {
        this.password_error = '';
        this.alert_service.show_info_message(`Your username has been updated to ${this.username}...`);
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to update your username...', error);
      }
    );
  }

  updatePassword(): void {
    this.comic_service.change_password(this.password).subscribe(
      (response: Response) => {
        this.password_error = '';
        this.alert_service.show_info_message('Your password has been updated...');
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to update your password...', error);
      }
    );
  }
}

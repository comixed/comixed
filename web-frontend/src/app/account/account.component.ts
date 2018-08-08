import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic/comic.service';
import {ErrorService} from '../error.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  username;
  password = '';
  password_check = '';
  message = '';
  has_error = false;
  password_error = '';

  constructor(
    private comic_service: ComicService,
    private error_service: ErrorService,
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
        this.message = 'Username updated...';
        this.has_error = false;
      },
      (error: Error) => {
        console.log('ERROR:', error.message);
        this.message = 'Failed to update username...';
        this.has_error = true;
      }
    );
  }

  updatePassword(): void {
    this.comic_service.change_password(this.password).subscribe(
      (response: Response) => {
        this.password_error = '';
        this.message = 'Password updated...';
        this.has_error = false;
      },
      (error: Error) => {
        console.log('ERROR:', error.message);
        this.message = 'Failed to update password...';
        this.has_error = true;
      }
    );
  }
}

import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic/comic.service';
import {ErrorsService} from '../errors.service';

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
    private comicService: ComicService,
    private errorsService: ErrorsService,
  ) {}

  ngOnInit() {
    this.username = this.comicService.getUsername();
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

  }

  updatePassword(): void {
    this.comicService.change_password(this.password).subscribe(
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

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

  constructor(
    private comicService: ComicService,
    private errorsService: ErrorsService,
  ) {}

  ngOnInit() {
    this.username = this.comicService.getUsername();
  }

  passesPasswordValidation(): boolean {
    if ((this.password.length > 8) && (this.password === this.password_check)) {
      this.message = 'Passwords match...';
      return true;
    } else {
      this.message = 'Passwords do not match.';
      return false;
    }
  }

  updateUsernameAndPassword(): void {
    this.comicService.updateUsernameAndPassword(this.username, this.password).subscribe(
      (response: Response) => {
        this.message = 'Username and password updated...';
      },
      (error: Error) => {
        console.log('ERROR:', error.message);
        this.errorsService.fireErrorMessage('Failed to update username and password');
      }
    );
  }
}

import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic/comic.service';
import {ErrorsService} from '../errors.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  private username;
  private password = '';
  private password_check = '';
  private message = '';

  constructor(
    private comicService: ComicService,
    private errorsService: ErrorsService,
  ) {}

  ngOnInit() {
    this.username = this.comicService.getUsername();
  }

  passesPasswordValidation(): boolean {
    return (this.password.length > 8) && (this.password === this.password_check);
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
